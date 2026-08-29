use std::io::Read;

use tauri_plugin_dialog::DialogExt;
use tauri_plugin_dialog::FilePath;
use tauri_plugin_shell::ShellExt;

/// Descarga un audio desde la API local usando un diálogo nativo de guardado.
/// Todo ocurre en Rust: sin CORS, sin fetch del WebView y sin dependencia del
/// scope del plugin fs.
#[tauri::command]
async fn download_audio(
    app: tauri::AppHandle,
    url: String,
    filename: String,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let Some(file_path) = app
            .dialog()
            .file()
            .set_file_name(&filename)
            .add_filter("Audio MP3", &["mp3"])
            .blocking_save_file()
        else {
            return Ok("cancelado".to_string());
        };

        let save_path = match file_path {
            FilePath::Path(path) => path,
            FilePath::Url(_) => return Err("La ruta de destino no es válida".to_string()),
        };

        let response = ureq::get(url.as_str())
            .call()
            .map_err(|err| format!("No se pudo descargar el audio: {err}"))?;
        let mut bytes: Vec<u8> = Vec::new();
        response
            .into_reader()
            .read_to_end(&mut bytes)
            .map_err(|err| format!("Error de red: {err}"))?;
        std::fs::write(&save_path, &bytes)
            .map_err(|err| format!("No se pudo guardar el archivo: {err}"))?;

        Ok(save_path.display().to_string())
    })
    .await
    .map_err(|err| err.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![download_audio])
        .setup(|app| {
            app.shell()
                .sidecar("audio-backend")
                .expect("No se encontró el servidor local empaquetado")
                .spawn()
                .expect("No se pudo iniciar el servidor local");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Audio Processor");
}
