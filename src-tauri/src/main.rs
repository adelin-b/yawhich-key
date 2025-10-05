// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Emitter, Manager, State, Window, LogicalPosition, LogicalSize};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};

#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
#[serde(untagged)]
enum KeymapValue {
    Command(String),
    Nested(HashMap<String, KeymapValue>),
}

#[derive(Debug, serde::Deserialize)]
struct LayerConfig {
    name: String,
    #[serde(default)]
    window_class: Vec<String>,
    keymaps: HashMap<String, KeymapValue>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct AppSettings {
    #[serde(default = "default_animations")]
    animations: bool,
}

fn default_animations() -> bool {
    true
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            animations: true,
        }
    }
}

#[derive(Debug, serde::Serialize)]
struct ValidationError {
    error_type: String,
    message: String,
    line: Option<usize>,
}

#[derive(Debug, serde::Serialize)]
struct ValidationResult {
    valid: bool,
    errors: Vec<ValidationError>,
}

struct AppState {
    config_dir: PathBuf,
}

fn get_config_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    let config_home = std::env::var("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| home.join(".config"));
    config_home.join("yawhich-key")
}

#[tauri::command]
fn load_keymaps(state: State<AppState>) -> Result<HashMap<String, KeymapValue>, String> {
    let core_layer = state.config_dir.join("layers/core.yaml");

    if !core_layer.exists() {
        // Fallback to old location
        let old_location = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap()
            .join("layers/core.yaml");

        if old_location.exists() {
            return load_yaml_keymaps(&old_location);
        }

        return Err("No keymap configuration found".to_string());
    }

    load_yaml_keymaps(&core_layer)
}

fn load_yaml_keymaps(path: &PathBuf) -> Result<HashMap<String, KeymapValue>, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read keymap file: {}", e))?;

    let config: LayerConfig = serde_yaml::from_str(&content)
        .map_err(|e| format!("Failed to parse YAML: {}", e))?;

    Ok(config.keymaps)
}

#[tauri::command]
fn load_settings(state: State<AppState>) -> Result<AppSettings, String> {
    let settings_file = state.config_dir.join("settings.yaml");

    if !settings_file.exists() {
        // Return default settings if file doesn't exist
        return Ok(AppSettings::default());
    }

    let content = fs::read_to_string(&settings_file)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    let settings: AppSettings = serde_yaml::from_str(&content)
        .map_err(|e| format!("Failed to parse settings YAML: {}", e))?;

    Ok(settings)
}

#[tauri::command]
async fn execute_command(command: String, window: Window) -> Result<(), String> {
    // Hide window first
    window.hide().map_err(|e| e.to_string())?;

    // Execute command in shell
    #[cfg(target_os = "macos")]
    {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .spawn()
            .map_err(|e| format!("Failed to execute command: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .spawn()
            .map_err(|e| format!("Failed to execute command: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .arg("/C")
            .arg(&command)
            .spawn()
            .map_err(|e| format!("Failed to execute command: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn reposition_window(window: Window) -> Result<(), String> {
    if let Ok(monitor) = window.current_monitor() {
        if let Some(monitor) = monitor {
            let size = monitor.size();
            let scale_factor = monitor.scale_factor();

            if let Ok(window_size) = window.outer_size() {
                let window_height = window_size.height as f64 / scale_factor;

                let screen_height = size.height as f64 / scale_factor;

                // Full screen width at bottom
                window
                    .set_position(tauri::Position::Logical(LogicalPosition {
                        x: 0.0,
                        y: screen_height - window_height,
                    }))
                    .map_err(|e| e.to_string())?;
            }
        }
    }
    Ok(())
}

fn show_which_key(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        // Only emit event - let React handle show/focus sequence
        let _ = window.emit("show-which-key", ());
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let config_dir = get_config_dir();

            // Create config directory if it doesn't exist
            if !config_dir.exists() {
                fs::create_dir_all(&config_dir)
                    .expect("Failed to create config directory");
            }

            app.manage(AppState { config_dir });

            // Position window at bottom of screen with full width
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(monitor) = window.current_monitor() {
                    if let Some(monitor) = monitor {
                        let size = monitor.size();
                        let scale_factor = monitor.scale_factor();
                        let window_height = 300.0;

                        // Account for scale factor to get actual screen dimensions
                        let screen_width = size.width as f64 / scale_factor;
                        let screen_height = size.height as f64 / scale_factor;

                        // Set window to full screen width at bottom
                        let _ = window.set_size(LogicalSize::new(screen_width, window_height));

                        let _ = window.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                            x: 0.0,
                            y: screen_height - window_height,
                        }));

                        // Ensure window has focus so keyboard events work
                        let _ = window.set_focus();
                    }
                }
            }

            // Register global shortcuts (Option+Ctrl+Space)
            let shortcut = Shortcut::new(Some(Modifiers::ALT | Modifiers::CONTROL), Code::Space);

            app.global_shortcut()
                .on_shortcut(shortcut, move |app, _shortcut, _event| {
                    show_which_key(app);
                })
                .expect("Failed to register global shortcut");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_keymaps, load_settings, execute_command, reposition_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
