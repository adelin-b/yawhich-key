// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Emitter, Manager, State, Window, LogicalPosition, LogicalSize};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};

#[cfg(target_os = "macos")]
use cocoa::base::{id, nil};
#[cfg(target_os = "macos")]
use objc::runtime::Class;
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
#[cfg(target_os = "macos")]
use std::ffi::CStr;

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
    #[serde(default)]
    theme: Option<String>,
}

fn default_animations() -> bool {
    true
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            animations: true,
            theme: None,
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

    // Validate for key conflicts
    let validation = validate_keymaps(&config.keymaps);
    if !validation.valid {
        let error_messages: Vec<String> = validation.errors.iter()
            .map(|e| format!("{}: {}", e.error_type, e.message))
            .collect();
        eprintln!("[WARN] Config validation errors in {:?}:", path);
        for msg in &error_messages {
            eprintln!("  - {}", msg);
        }
    }

    Ok(config.keymaps)
}

fn validate_keymaps(keymaps: &HashMap<String, KeymapValue>) -> ValidationResult {
    let mut errors = Vec::new();

    validate_keymaps_recursive(keymaps, &Vec::new(), &mut errors);

    ValidationResult {
        valid: errors.is_empty(),
        errors,
    }
}

fn validate_keymaps_recursive(
    keymaps: &HashMap<String, KeymapValue>,
    path: &Vec<String>,
    errors: &mut Vec<ValidationError>
) {
    // Check for duplicate key bindings at this level
    let mut key_chars: HashMap<char, Vec<String>> = HashMap::new();

    for (key, value) in keymaps {
        let display_key = key.trim_start_matches('+');
        let first_char = display_key.chars().next().unwrap_or(' ').to_lowercase().next().unwrap();

        key_chars.entry(first_char)
            .or_insert_with(Vec::new)
            .push(key.clone());

        // Recursively validate nested keymaps
        if let KeymapValue::Nested(nested) = value {
            let mut new_path = path.clone();
            new_path.push(key.clone());
            validate_keymaps_recursive(nested, &new_path, errors);
        }
    }

    // Report conflicts
    for (char, keys) in key_chars {
        if keys.len() > 1 {
            let path_str = if path.is_empty() {
                "root".to_string()
            } else {
                path.join(" → ")
            };

            errors.push(ValidationError {
                error_type: "Key Conflict".to_string(),
                message: format!(
                    "Multiple keys start with '{}' at {}: {}",
                    char,
                    path_str,
                    keys.join(", ")
                ),
                line: None,
            });
        }
    }
}

fn load_layer_configs(layers_dir: &PathBuf) -> Result<Vec<LayerConfig>, String> {
    let mut configs = Vec::new();

    if !layers_dir.exists() {
        return Ok(configs);
    }

    let entries = fs::read_dir(layers_dir)
        .map_err(|e| format!("Failed to read layers directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.extension().and_then(|s| s.to_str()) == Some("yaml") {
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read layer file {:?}: {}", path, e))?;

            let config: LayerConfig = serde_yaml::from_str(&content)
                .map_err(|e| format!("Failed to parse YAML in {:?}: {}", path, e))?;

            configs.push(config);
        }
    }

    Ok(configs)
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
fn load_theme(state: State<AppState>, theme_name: String) -> Result<String, String> {
    // Try to load theme from config directory
    let theme_file = state.config_dir.join(format!("themes/{}.css", theme_name));

    if !theme_file.exists() {
        return Err(format!("Theme '{}' not found", theme_name));
    }

    let content = fs::read_to_string(&theme_file)
        .map_err(|e| format!("Failed to read theme file: {}", e))?;

    Ok(content)
}

#[cfg(target_os = "macos")]
#[derive(Debug, Clone, serde::Serialize)]
struct WindowInfo {
    bundle_id: String,
    window_id: i32,
    window_title: Option<String>,
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn get_focused_app() -> Result<String, String> {
    unsafe {
        let workspace_class = Class::get("NSWorkspace").ok_or("NSWorkspace class not found")?;
        let workspace: id = msg_send![workspace_class, sharedWorkspace];
        let app: id = msg_send![workspace, frontmostApplication];

        if app == nil {
            return Err("No frontmost application".to_string());
        }

        let bundle_id: id = msg_send![app, bundleIdentifier];
        if bundle_id == nil {
            return Err("No bundle identifier".to_string());
        }

        let c_str: *const i8 = msg_send![bundle_id, UTF8String];
        let str = std::ffi::CStr::from_ptr(c_str)
            .to_string_lossy()
            .into_owned();

        Ok(str)
    }
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn get_focused_window() -> Result<WindowInfo, String> {
    let bundle_id = get_focused_app()?;

    // Try to get window title using AppleScript (simple and reliable)
    let script = format!(
        r#"tell application id "{}" to get name of front window"#,
        bundle_id
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .ok();

    let window_title = output
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8(o.stdout).ok()
            } else {
                None
            }
        })
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());

    Ok(WindowInfo {
        bundle_id,
        window_id: if window_title.is_some() { 0 } else { -1 },
        window_title,
    })
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn get_focused_app() -> Result<String, String> {
    Err("Not supported on this platform".to_string())
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn focus_window(bundle_id: String, window_id: i32, window_title: Option<String>) -> Result<(), String> {
    // Use AppleScript to activate the application and optionally the specific window
    // yawhich-key is independent - uses only native macOS APIs

    let script = if window_id >= 0 && window_title.is_some() {
        let title = window_title.unwrap();
        // Try to focus specific window by title
        format!(
            r#"tell application id "{}"
    activate
    set frontmost to true
    try
        set index of window "{}" to 1
    end try
end tell"#,
            bundle_id,
            title.replace("\"", "\\\"")
        )
    } else {
        // Fallback: just activate the app
        format!(
            r#"tell application id "{}" to activate"#,
            bundle_id
        )
    };

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        // Don't fail on window-specific errors, the app is still activated
        eprintln!("AppleScript warning: {}", error);
    }

    Ok(())
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn focus_window(bundle_id: String, window_id: i32, window_title: Option<String>) -> Result<(), String> {
    Err("Not supported on this platform".to_string())
}

#[tauri::command]
fn load_major_mode_keymaps(state: State<AppState>, app_bundle_id: String) -> Result<HashMap<String, KeymapValue>, String> {
    let layers_dir = state.config_dir.join("layers");
    let configs = load_layer_configs(&layers_dir)?;

    // Find matching layer by window_class (bundle ID)
    for config in configs {
        if config.window_class.contains(&app_bundle_id) {
            return Ok(config.keymaps);
        }
    }

    Err(format!("No major mode keymap found for app: {}", app_bundle_id))
}

#[tauri::command]
fn create_major_mode_template(state: State<AppState>, app_bundle_id: String, app_name: String) -> Result<(), String> {
    let layers_dir = state.config_dir.join("layers");

    // Create layers directory if it doesn't exist
    if !layers_dir.exists() {
        fs::create_dir_all(&layers_dir)
            .map_err(|e| format!("Failed to create layers directory: {}", e))?;
    }

    let template_path = layers_dir.join(format!("{}.yaml", app_name));

    // Don't overwrite if file already exists
    if template_path.exists() {
        return Ok(());
    }

    let template = format!(
r#"name: {}.yaml

# This layer is active when {} is focused
window_class:
  - {}

keymaps:
  +file:
    +save: osascript -e 'tell application "System Events" to keystroke "s" using command down'
    +new: osascript -e 'tell application "System Events" to keystroke "n" using command down'
    +open: osascript -e 'tell application "System Events" to keystroke "o" using command down'
  +edit:
    +copy: osascript -e 'tell application "System Events" to keystroke "c" using command down'
    +paste: osascript -e 'tell application "System Events" to keystroke "v" using command down'
    +undo: osascript -e 'tell application "System Events" to keystroke "z" using command down'
  +view:
    +fullscreen: osascript -e 'tell application "System Events" to keystroke "f" using {{command down, control down}}'
"#,
        app_name,
        app_name.chars().next().unwrap().to_uppercase().to_string() + &app_name[1..],
        app_bundle_id
    );

    fs::write(&template_path, template)
        .map_err(|e| format!("Failed to write template file: {}", e))?;

    Ok(())
}

#[cfg(target_os = "macos")]
fn get_default_app(app_type: &str) -> Option<String> {
    unsafe {
        let workspace_class = Class::get("NSWorkspace")?;
        let workspace: id = msg_send![workspace_class, sharedWorkspace];

        match app_type {
            "browser" => {
                // Get default browser via URLForApplicationToOpenURL
                let url_class = Class::get("NSURL")?;
                let url_string_class = Class::get("NSString")?;
                let http_str: id = msg_send![url_string_class, stringWithUTF8String: "http://example.com\0".as_ptr()];
                let url: id = msg_send![url_class, URLWithString: http_str];

                if url != nil {
                    let bundle_url: id = msg_send![workspace, URLForApplicationToOpenURL: url];
                    if bundle_url != nil {
                        let path: id = msg_send![bundle_url, path];
                        if path != nil {
                            let c_str: *const i8 = msg_send![path, UTF8String];
                            let path_str = CStr::from_ptr(c_str).to_string_lossy().into_owned();
                            eprintln!("[DEBUG] Browser path: {}", path_str);
                            // Extract app name from path (e.g., "/Applications/Google Chrome.app" -> "Google Chrome")
                            if let Some(app_name) = path_str.split('/').last() {
                                let name = app_name.trim_end_matches(".app").to_string();
                                eprintln!("[DEBUG] Browser app name: {}", name);
                                return Some(name);
                            }
                        }
                    }
                }
                Some("Safari".to_string())
            },
            "terminal" => {
                // Check for common terminals in order of preference
                let terminals = vec![
                    "Alacritty", "iTerm", "Kitty", "WezTerm",
                    "Hyper", "Terminal"
                ];

                for terminal in terminals {
                    let app_name_class = Class::get("NSString")?;
                    let app_name: id = msg_send![app_name_class, stringWithUTF8String: format!("{}\0", terminal).as_ptr()];
                    let app_url: id = msg_send![workspace, URLForApplicationWithBundleIdentifier: app_name];

                    if app_url != nil {
                        return Some(terminal.to_string());
                    }
                }

                Some("Terminal".to_string())
            },
            "editor" => {
                // Get default editor for .txt files
                let url_class = Class::get("NSURL")?;
                let url_string_class = Class::get("NSString")?;
                let file_str: id = msg_send![url_string_class, stringWithUTF8String: "file:///tmp/test.txt\0".as_ptr()];
                let url: id = msg_send![url_class, URLWithString: file_str];

                if url != nil {
                    let bundle_url: id = msg_send![workspace, URLForApplicationToOpenURL: url];
                    if bundle_url != nil {
                        let path: id = msg_send![bundle_url, path];
                        if path != nil {
                            let c_str: *const i8 = msg_send![path, UTF8String];
                            let path_str = CStr::from_ptr(c_str).to_string_lossy().into_owned();
                            if let Some(app_name) = path_str.split('/').last() {
                                return Some(app_name.trim_end_matches(".app").to_string());
                            }
                        }
                    }
                }
                Some("TextEdit".to_string())
            },
            _ => None
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn get_default_app(_app_type: &str) -> Option<String> {
    None
}

fn resolve_default_apps(command: &str) -> String {
    let mut resolved = command.to_string();

    // Replace <default:browser>, <default:terminal>, <default:editor>
    if resolved.contains("<default:") {
        let patterns = vec!["browser", "terminal", "editor"];

        for pattern in patterns {
            let placeholder = format!("<default:{}>", pattern);
            if resolved.contains(&placeholder) {
                if let Some(app_name) = get_default_app(pattern) {
                    // Quote the app name if it contains spaces
                    let quoted_name = if app_name.contains(' ') {
                        format!("\"{}\"", app_name)
                    } else {
                        app_name
                    };
                    resolved = resolved.replace(&placeholder, &quoted_name);
                }
            }
        }
    }

    resolved
}

#[tauri::command]
async fn execute_command(command: String, window: Window) -> Result<(), String> {
    // Hide window first
    window.hide().map_err(|e| e.to_string())?;

    // Resolve default app placeholders
    let resolved_command = resolve_default_apps(&command);

    // Execute command in shell
    #[cfg(target_os = "macos")]
    {
        Command::new("sh")
            .arg("-c")
            .arg(&resolved_command)
            .spawn()
            .map_err(|e| format!("Failed to execute command: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("sh")
            .arg("-c")
            .arg(&resolved_command)
            .spawn()
            .map_err(|e| format!("Failed to execute command: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .arg("/C")
            .arg(&resolved_command)
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

fn show_which_key(app: &AppHandle, major_mode: bool) {
    if let Some(window) = app.get_webview_window("main") {
        if major_mode {
            // Get focused window info BEFORE showing window
            match get_focused_window() {
                Ok(window_info) => {
                    let _ = window.emit("show-major-mode", window_info);
                }
                Err(e) => {
                    eprintln!("Failed to get focused window: {}", e);
                }
            }
        } else {
            // Global mode - emit window info for focus restoration
            match get_focused_window() {
                Ok(window_info) => {
                    let _ = window.emit("show-which-key", window_info);
                }
                Err(e) => {
                    eprintln!("Failed to get focused window: {}", e);
                    let _ = window.emit("show-which-key", ());
                }
            }
        }
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

            // Register global shortcuts

            // Option+Ctrl+Space - global which-key
            let global_shortcut = Shortcut::new(Some(Modifiers::ALT | Modifiers::CONTROL), Code::Space);
            app.global_shortcut()
                .on_shortcut(global_shortcut, move |app, _shortcut, _event| {
                    show_which_key(app, false);
                })
                .expect("Failed to register global shortcut");

            // Option+Ctrl+, - major mode (app-specific)
            let major_mode_shortcut = Shortcut::new(Some(Modifiers::ALT | Modifiers::CONTROL), Code::Comma);
            app.global_shortcut()
                .on_shortcut(major_mode_shortcut, move |app, _shortcut, _event| {
                    show_which_key(app, true);
                })
                .expect("Failed to register major mode shortcut");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_keymaps,
            load_settings,
            load_theme,
            execute_command,
            reposition_window,
            get_focused_app,
            get_focused_window,
            focus_window,
            load_major_mode_keymaps,
            create_major_mode_template
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
