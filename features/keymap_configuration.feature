Feature: Keymap Loading and Configuration System
  As a yawhich-key user
  I want to configure custom keybindings through YAML files
  So that I can personalize my workflow and access my preferred commands

  Background:
    Given yawhich-key is installed and running
    And the configuration directory exists at "~/.config/yawhich-key"

  Scenario: Loading core keymap configuration
    Given a valid core.yaml file exists at "~/.config/yawhich-key/layers/core.yaml"
    When yawhich-key starts up
    Then the core keymap should be loaded successfully
    And all keymap entries should be parsed from the YAML structure
    And nested keymaps should be properly structured
    And command strings should be validated and stored

  Scenario: Core keymap structure validation
    Given a core.yaml file with the following structure:
      """
      name: core.yaml
      keymaps:
        +apps:
          +browser: open -a "Safari"
          +terminal: open -a "Terminal"
        +files:
          +new: touch new_file.txt
      """
    When the keymap is loaded
    Then the "+apps" category should contain nested keymaps
    And the "+browser" command should be "open -a \"Safari\""
    And all keys should be accessible by their first character
    And the keymap hierarchy should be properly maintained

  Scenario: Keymap validation and conflict detection
    Given a keymap file with conflicting key bindings:
      """
      keymaps:
        +apps: nested_keymap
        +applications: different_nested_keymap
      """
    When the keymap is loaded
    Then validation errors should be detected for keys starting with the same character
    And a warning should be logged about the key conflict
    And the keymap should still load but with warnings
    And detailed error information should be provided

  Scenario: Loading settings configuration
    Given a settings.yaml file exists with:
      """
      animations: false
      theme: "custom-dark"
      """
    When yawhich-key loads settings
    Then animations should be disabled
    And the theme should be set to "custom-dark"
    And the custom theme should be loaded if it exists

  Scenario: Default settings fallback
    Given no settings.yaml file exists
    When yawhich-key loads settings
    Then default settings should be applied
    And animations should be enabled by default
    And no custom theme should be loaded

  Scenario: Configuration directory creation
    Given the yawhich-key configuration directory does not exist
    When yawhich-key starts for the first time
    Then the configuration directory should be created at "~/.config/yawhich-key"
    And the layers subdirectory should be created
    And appropriate permissions should be set

  Scenario: Layer configuration loading
    Given multiple layer files exist in the layers directory:
      - core.yaml
      - kitty.yaml
      - chromium-based.yaml
    When yawhich-key loads layer configurations
    Then all .yaml files should be discovered and parsed
    And each layer should maintain its window_class associations
    And dependencies should be tracked for each layer
    And layer names should be properly extracted

  Scenario: Keymap with toggle configurations
    Given a keymap with toggle functionality:
      """
      keymaps:
        +toggles:
          +wifi:
            states:
              - label: "Enable WiFi"
                command: "networksetup -setairportpower en0 on"
              - label: "Disable WiFi"
                command: "networksetup -setairportpower en0 off"
            persist: true
      """
    When the toggle keymap is loaded
    Then the toggle configuration should be properly parsed
    And state cycling should be configured
    And persistence settings should be respected
    And toggle states should be trackable

  Scenario: Configuration error handling
    Given an invalid YAML file with syntax errors
    When yawhich-key attempts to load the configuration
    Then a clear error message should be displayed
    And the specific YAML syntax error should be reported
    And the application should continue running with fallback configuration
    And an option to edit the configuration should be provided

  Scenario: Configuration file watching and reloading
    Given yawhich-key is running with a loaded configuration
    When a configuration file is modified
    Then the changes should be detected
    And the configuration should be reloaded automatically
    And any validation errors in the new configuration should be reported
    And the user interface should reflect the updated keymaps

  Scenario: Fallback configuration loading
    Given the core.yaml file does not exist in the config directory
    When yawhich-key attempts to load keymaps
    Then it should attempt to load from the legacy location in the project directory
    And if found, the legacy configuration should be loaded
    And if no configuration is found, a helpful error message should be displayed
    And instructions for creating a configuration should be provided

  Scenario: Environment variable resolution in configuration
    Given a keymap configuration with environment variables:
      """
      keymaps:
        +apps:
          +editor: $EDITOR ~/.bashrc
          +browser: open -a "<default:browser>"
      """
    When the configuration is loaded and commands are resolved
    Then environment variables should be expanded
    And default app placeholders should be resolved to actual applications
    And the resolved commands should be ready for execution

  Scenario: Configuration backup and recovery
    Given a working configuration exists
    When configuration files are corrupted or deleted
    Then backup configurations should be available
    And recovery mechanisms should be in place
    And template configurations should be easily accessible
    And users should be guided through configuration restoration