Feature: Major Mode (App-Specific) Functionality
  As a yawhich-key user
  I want context-aware keybindings that change based on the currently focused application
  So that I can have specialized shortcuts relevant to each application I use

  Background:
    Given yawhich-key is running with major mode support enabled
    And layer configurations exist for various applications

  Scenario: Triggering major mode for supported application
    Given I am using Terminal (com.apple.Terminal)
    And a kitty.yaml layer exists with window_class: ["com.apple.Terminal"]
    When I press "Option+Ctrl+,"
    Then yawhich-key should detect the focused application as Terminal
    And the Terminal-specific keymap should be loaded
    And the window should display "Major Mode: Terminal" indicator
    And Terminal-specific commands should be available

  Scenario: App-specific keymap loading by bundle ID
    Given the following layer configuration for Kitty terminal:
      """
      name: kitty
      window_class:
        - net.kovidgoyal.kitty
      keymaps:
        +help: xdotool key ctrl+shift+h h
        +search: xdotool key ctrl+shift+h slash
        +insert: xdotool key ctrl+shift+u
      """
    When I focus Kitty terminal and trigger major mode
    Then the bundle ID "net.kovidgoyal.kitty" should be detected
    And the kitty-specific keymaps should be loaded
    And the major mode indicator should show "Major Mode: Kitty"

  Scenario: Multiple bundle ID support for similar applications
    Given a chromium-based.yaml layer with:
      """
      window_class:
        - com.google.Chrome
        - com.vivaldi.Vivaldi
        - com.microsoft.edgemac
      """
    When I use any of these browsers and trigger major mode
    Then the same chromium-based keymap should be loaded
    And browser-specific shortcuts should be available
    And the major mode should work consistently across all supported browsers

  Scenario: Major mode template generation for unsupported apps
    Given I am using an application without a corresponding layer file
    And the application bundle ID is "com.example.MyApp"
    When I trigger major mode
    Then yawhich-key should detect no existing layer for this app
    And a template layer file should be automatically created
    And the template should be named "MyApp.yaml"
    And the template should include the detected bundle ID in window_class
    And the template file should be opened in the default editor

  Scenario: Template structure for new major mode layers
    Given a new application "MyApp" with bundle ID "com.example.MyApp"
    When a template is generated
    Then the template should include:
      """
      name: MyApp.yaml

      # This layer is active when MyApp is focused
      window_class:
        - com.example.MyApp

      keymaps:
        +file:
          +save: osascript -e 'tell application "System Events" to keystroke "s" using command down'
          +new: osascript -e 'tell application "System Events" to keystroke "n" using command down'
          +open: osascript -e 'tell application "System Events" to keystroke "o" using command down'
        +edit:
          +copy: osascript -e 'tell application "System Events" to keystroke "c" using command down'
          +paste: osascript -e 'tell application "System Events" to keystroke "v" using command down'
          +undo: osascript -e 'tell application "System Events" to keystroke "z" using command down'
      """

  Scenario: Major mode window sizing and layout
    Given I trigger major mode for an application
    When the major mode window appears
    Then the window should display the major mode indicator at the top
    And the window height should account for the additional header space
    And the breadcrumb should show the application name
    And the layout should accommodate both the indicator and keymap items

  Scenario: Focus restoration after major mode
    Given I am using Safari with a specific window titled "GitHub - Project"
    And I trigger major mode
    When I execute a command or close the yawhich-key window
    Then focus should be restored to Safari
    And the specific window "GitHub - Project" should be activated
    And the window restoration should work via AppleScript

  Scenario: Major mode error handling
    Given I trigger major mode for an unsupported application
    And template creation fails due to permissions
    When the error occurs
    Then the error should be handled gracefully
    And yawhich-key should not crash
    And appropriate error logging should occur
    And the user should be informed of the issue

  Scenario: Major mode layer validation
    Given a major mode layer file with syntax errors
    When yawhich-key attempts to load the layer
    Then validation errors should be detected
    And the errors should be reported with file context
    And the layer should be skipped if invalid
    And fallback behavior should be provided

  Scenario: Dynamic major mode switching
    Given I have multiple applications open
    When I switch between applications and trigger major mode
    Then the correct layer should be loaded for each application
    And the major mode indicator should update accordingly
    And keymaps should change dynamically based on focus
    And no interference should occur between different app contexts

  Scenario: Major mode with nested keymaps
    Given a major mode layer with nested structure:
      """
      keymaps:
        +git:
          +status: git status
          +commit: git commit
          +branch:
            +list: git branch
            +new: git checkout -b
      """
    When I navigate through the nested structure in major mode
    Then the major mode indicator should remain visible
    And breadcrumb navigation should work within the app context
    And the app-specific nature should be maintained throughout navigation

  Scenario: Major mode performance optimization
    Given major mode is triggered frequently
    When switching between applications
    Then bundle ID detection should be fast and cached
    And layer loading should be optimized
    And window info capture should not cause delays
    And the user experience should remain smooth

  Scenario: Major mode with app dependencies
    Given a layer configuration with dependencies:
      """
      dependencies:
        - command: git
        - install: brew install git
      """
    When the major mode layer is loaded
    Then dependencies should be validated
    And missing dependencies should be reported
    And installation suggestions should be provided
    And the layer should still function for available commands

  Scenario: Major mode configuration updates
    Given a major mode layer is currently loaded
    When the layer configuration file is modified
    Then the changes should be detected
    And the layer should be reloaded on next trigger
    And the new keymaps should be available immediately
    And validation should occur for the updated configuration

  Scenario: Bundle ID extraction and formatting
    Given applications with various bundle ID formats:
      - com.apple.Terminal
      - net.kovidgoyal.kitty
      - org.mozilla.firefox
    When major mode is triggered for each app
    Then the app name should be extracted from the bundle ID correctly
    And the display name should be properly capitalized
    And special characters should be handled appropriately
    And the formatting should be consistent across all apps