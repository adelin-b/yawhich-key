Feature: Command Execution and Toggle Functionality
  As a yawhich-key user
  I want to execute shell commands and manage toggle states
  So that I can automate tasks and control system settings efficiently

  Background:
    Given yawhich-key is running with a loaded configuration
    And the user interface is accessible

  Scenario: Basic command execution
    Given a keymap entry with a simple command:
      """
      +apps:
        +terminal: open -a "Terminal"
      """
    When I trigger the keymap and press "a" then "t"
    Then the yawhich-key window should hide immediately
    And the command "open -a \"Terminal\"" should be executed in the shell
    And the Terminal application should launch
    And focus should be restored to the previous application

  Scenario: Command execution with environment variable resolution
    Given a keymap entry with environment variables:
      """
      +files:
        +edit-config: $EDITOR ~/.bashrc
      """
    And the $EDITOR environment variable is set to "vim"
    When I execute the command through yawhich-key
    Then the command should be resolved to "vim ~/.bashrc"
    And the resolved command should be executed
    And the editor should open with the specified file

  Scenario: Default application placeholder resolution
    Given a keymap entry with default app placeholders:
      """
      +apps:
        +browser: open -a "<default:browser>"
        +editor: open -a "<default:editor>"
        +terminal: open -a "<default:terminal>"
      """
    When I execute these commands
    Then "<default:browser>" should resolve to the system default browser
    And "<default:editor>" should resolve to the default text editor
    And "<default:terminal>" should resolve to the preferred terminal application
    And the resolved application names should be properly quoted if they contain spaces

  Scenario: Toggle command execution - WiFi toggle example
    Given a toggle configuration:
      """
      +toggles:
        +wifi:
          states:
            - label: "Enable WiFi"
              command: "networksetup -setairportpower en0 on"
            - label: "Disable WiFi"
              command: "networksetup -setairportpower en0 off"
          persist: true
      """
    When I execute the toggle for the first time
    Then the current state should be determined (starting at index 0)
    And the next state command should be executed
    And the state index should be incremented and stored
    And the label of the executed state should be returned

  Scenario: Toggle state cycling
    Given a toggle with 3 states:
      """
      states:
        - label: "State 1"
          command: "echo state1"
        - label: "State 2"
          command: "echo state2"
        - label: "State 3"
          command: "echo state3"
      """
    When I execute the toggle multiple times
    Then the first execution should trigger "State 1"
    And the second execution should trigger "State 2"
    And the third execution should trigger "State 3"
    And the fourth execution should cycle back to "State 1"
    And the state should be tracked consistently across executions

  Scenario: Toggle state persistence
    Given a toggle with persist: true
    And the toggle has been executed twice (current state index: 2)
    When yawhich-key is restarted
    Then the toggle state should be restored to index 2
    And the next execution should continue from the correct state
    And the state should be maintained across application sessions

  Scenario: Complex shell command execution
    Given a keymap entry with a complex shell command:
      """
      +system:
        +backup: tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/Documents
      """
    When I execute this command
    Then the shell command should be executed with proper argument parsing
    And special characters should be handled correctly
    And the backup file should be created with a timestamp
    And command output should be handled appropriately

  Scenario: AppleScript command execution
    Given a keymap entry with AppleScript:
      """
      +files:
        +save: osascript -e 'tell application "System Events" to keystroke "s" using command down'
      """
    When I execute this command
    Then the AppleScript should be executed via osascript
    And the Cmd+S keystroke should be sent to the active application
    And the command should work regardless of the focused application

  Scenario: Command execution error handling
    Given a keymap entry with an invalid command:
      """
      +test:
        +invalid: /nonexistent/command --invalid-arg
      """
    When I attempt to execute this command
    Then the command execution should fail gracefully
    And an error should be logged for debugging
    And the user interface should remain responsive
    And the yawhich-key window should still close properly

  Scenario: Quoted command arguments
    Given a keymap entry with quoted arguments:
      """
      +files:
        +open-folder: open "~/Documents/My Folder"
      """
    When I execute this command
    Then the quoted path should be handled correctly
    And spaces in the path should not cause command parsing issues
    And the folder should be opened successfully

  Scenario: Command execution timing and performance
    Given various types of commands are configured
    When commands are executed through yawhich-key
    Then the window should hide immediately upon command selection
    And command execution should not block the user interface
    And commands should be spawned as separate processes
    And the system should remain responsive during command execution

  Scenario: Multi-line and piped commands
    Given a keymap entry with a complex piped command:
      """
      +system:
        +process-list: ps aux | grep -i chrome | head -10
      """
    When I execute this command
    Then the entire pipeline should be executed as a single shell command
    And all pipe operations should work correctly
    And the output should be handled appropriately

  Scenario: Command execution with working directory
    Given a command that depends on the current working directory
    When the command is executed through yawhich-key
    Then the command should execute from the user's home directory by default
    And relative paths should be resolved correctly
    And the working directory should be consistent across executions

  Scenario: Background command execution
    Given a keymap entry for a long-running command:
      """
      +system:
        +monitor: top -l 0
      """
    When I execute this command
    Then the command should start in the background
    And yawhich-key should remain responsive
    And the window should close immediately
    And the command should continue running independently