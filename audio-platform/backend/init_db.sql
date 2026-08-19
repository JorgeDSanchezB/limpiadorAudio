-- Tabla principal para archivos de audio
CREATE TABLE IF NOT EXISTS audio_files (
    id              UUID PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    size_bytes      BIGINT NOT NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indice para paginacion por cursor
CREATE INDEX IF NOT EXISTS idx_audio_files_uploaded_at_id
    ON audio_files (uploaded_at DESC, id DESC);
