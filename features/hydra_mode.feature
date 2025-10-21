Feature: Hydra Mode and Special Interactions
  As a yawhich-key user
  I want to keep the menu open after executing commands for rapid command chaining
  So that I can perform multiple related actions without repeatedly triggering yawhich-key

  Background:
    Given yawhich-key is running with a loaded configuration
    And the user interface is accessible

  Scenario: Activating Hydra mode
    Given the yawhich-key window is visible
    When I press "H"
    Then Hydra mode should be activated
    And a "🔒 HYDRA" indicator should appear in the interface
    And the help text should indicate Hydra mode is active
    And the mode should be visually distinguished from normal mode

  Scenario: Deactivating Hydra mode
    Given Hydra mode is currently active
    When I press "H" again
    Then Hydra mode should be deactivated
    And the Hydra indicator should disappear
    And the interface should return to normal mode behavior
    And the help text should update accordingly

  Scenario: Command execution in Hydra mode
    Given Hydra mode is active
    And I have a keymap with commands:
      """
      +git:
        +status: git status
        +add: git add .
        +commit: git commit -m "update"
      """
    When I navigate to "git" and execute "status"
    Then the git status command should be executed
    And the yawhich-key window should remain open
    And I should be returned to the root keymap level
    And I should be able to immediately execute another command

  Scenario: Nested navigation in Hydra mode
    Given Hydra mode is active
    And I navigate to a nested keymap level
    When I execute a command at that level
    Then the command should be executed
    And the menu should remain open
    And I should be returned to the root level (not the nested level)
    And the navigation should reset for the next command

  Scenario: Toggle commands in Hydra mode
    Given Hydra mode is active
    And I have a toggle configuration:
      """
      +toggles:
        +wifi:
          states:
            - label: "Enable WiFi"
              command: "networksetup -setairportpower en0 on"
            - label: "Disable WiFi"
              command: "networksetup -setairportpower en0 off"
      """
    When I execute the WiFi toggle
    Then the toggle command should be executed
    And the window should remain open in Hydra mode
    And I should be able to immediately toggle again or execute other commands
    And the toggle state should be properly tracked

  Scenario: Exiting yawhich-key from Hydra mode
    Given Hydra mode is active
    When I press "Escape" or click outside the window
    Then the yawhich-key window should close
    And Hydra mode should be deactivated for the next session
    And focus should be restored to the previous application
    And the mode should not persist after closing

  Scenario: Visual indicators in Hydra mode
    Given Hydra mode is active
    When the interface is displayed
    Then a clear visual indicator should show Hydra mode is active
    And the indicator should be prominently placed
    And the help text should mention Hydra mode functionality
    And the visual design should clearly distinguish this state

  Scenario: Help text updates in Hydra mode
    Given the yawhich-key window is open
    When I toggle between normal mode and Hydra mode
    Then the help text should update appropriately
    And in normal mode it should show: "Press / to search • H to toggle Hydra mode"
    And in Hydra mode it should show: "Press / to search • H to toggle Hydra mode 🔒 HYDRA"
    And the instructions should be clear and helpful

  Scenario: Hydra mode persistence within session
    Given I activate Hydra mode
    And execute several commands
    When I close and reopen yawhich-key within the same session
    Then Hydra mode should remain active
    And the setting should persist for the current application session
    And the indicator should still be shown
    And behavior should remain consistent

  Scenario: Hydra mode reset on application restart
    Given Hydra mode is active
    When yawhich-key is restarted
    Then Hydra mode should be reset to inactive
    And the next trigger should open in normal mode
    And no persistent state should be maintained across restarts
    And the user should need to re-activate if desired

  Scenario: Search functionality in Hydra mode
    Given Hydra mode is active
    When I enter search mode by pressing "/"
    Then search should work normally
    And executing commands from search results should keep the window open
    And I should return to the root level after command execution
    And Hydra mode should remain active throughout

  Scenario: Back navigation in Hydra mode
    Given Hydra mode is active
    And I am navigating through nested keymaps
    When I use back navigation (Backspace)
    Then navigation should work normally
    And Hydra mode should remain active
    And the window should stay open during navigation
    And only command execution should reset to root

  Scenario: Major mode interaction with Hydra mode
    Given I am in major mode for a specific application
    And I activate Hydra mode
    When I execute commands in the app-specific context
    Then Hydra mode should work within the major mode context
    And the major mode indicator should remain visible
    And commands should be app-specific
    And the window should remain open after command execution

  Scenario: Performance considerations in Hydra mode
    Given Hydra mode is active
    When executing multiple commands in succession
    Then each command execution should be as fast as normal mode
    And window repositioning should be efficient
    And there should be no performance degradation
    And the user experience should remain smooth

  Scenario: Error handling in Hydra mode
    Given Hydra mode is active
    When a command execution fails
    Then the error should be handled gracefully
    And the window should remain open
    And Hydra mode should stay active
    And the user should be able to continue with other commands

  Scenario: Focus management in Hydra mode
    Given Hydra mode is active
    And I execute a command that opens another application
    When the command completes
    Then yawhich-key should regain focus automatically
    And the window should remain visible and interactive
    And I should be able to immediately execute the next command
    And focus management should be seamless

  Scenario: Accessibility in Hydra mode
    Given Hydra mode is active
    When using keyboard-only navigation
    Then all functionality should remain accessible via keyboard
    And the Hydra mode indicator should be screen-reader accessible
    And keyboard shortcuts should work consistently
    And the mode should not interfere with accessibility features

  Scenario: Command chaining workflow
    Given Hydra mode is active
    And I need to perform a series of git operations
    When I execute commands in sequence: git status → git add → git commit
    Then each command should execute immediately
    And I should return to the root after each command
    And the workflow should be smooth and efficient
    And I should be able to complete the entire sequence without retriggering yawhich-key