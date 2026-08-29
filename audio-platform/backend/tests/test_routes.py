import asyncio
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

from app.api import routes


class AudioProcessingTests(unittest.TestCase):
    def test_supported_formats_include_podcast_formats(self):
        self.assertTrue({".wav", ".mp3", ".m4a", ".flac"}.issubset(routes.SUPPORTED_EXTENSIONS))

    def test_ffmpeg_path_can_be_configured(self):
        with patch.dict("os.environ", {"FFMPEG_PATH": "C:/tools/ffmpeg.exe"}, clear=False):
            self.assertEqual(routes.find_ffmpeg(), "C:/tools/ffmpeg.exe")

    def test_output_name_is_not_based_on_user_filename(self):
        job_id = "b011c12f-55de-4d69-a1bc-20df967097aa"
        self.assertEqual(Path(f"{job_id}-limpio.mp3").suffix, ".mp3")

    def test_noise_model_is_available(self):
        self.assertTrue((routes.MODEL_DIR / routes.MODEL_FILE).is_file())

    def test_noise_model_dir_resolves_to_backend(self):
        self.assertEqual(routes.find_model_dir(), routes.MODEL_DIR)


class DeleteOperationsTests(unittest.TestCase):
    def setUp(self):
        routes.processed_files.clear()
        routes.ensure_directories()

    def _add_record(self, job_id):
        routes.processed_files.append({
            "id": job_id,
            "original_filename": "episodio.m4a",
            "size_bytes": 100,
            "uploaded_at": "2026-01-01T00:00:00+00:00",
            "status": "completed",
            "download_url": f"/audio/download/{job_id}",
        })

    def test_delete_known_job_removes_record(self):
        self._add_record("abc-123")
        result = asyncio.run(routes.delete_audio("abc-123"))
        self.assertEqual(result, {"deleted": True})
        self.assertEqual([r["id"] for r in routes.processed_files], [])

    def test_delete_unknown_job_raises_404(self):
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(routes.delete_audio("no-existe"))
        self.assertEqual(cm.exception.status_code, 404)

    def test_clear_files_empties_history(self):
        self._add_record("a-1")
        self._add_record("b-2")
        result = asyncio.run(routes.clear_files())
        self.assertEqual(result, {"deleted": True})
        self.assertEqual(routes.processed_files, [])
