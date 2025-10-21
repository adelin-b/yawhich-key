Feature: Window Management and Global Shortcuts
  As a macOS user
  I want yawhich-key to respond to global shortcuts and manage its window display
  So that I can access keybinding helpers from any application without disrupting my workflow

  Background:
    Given yawhich-key is running in the background
    And the application window is initially hidden
    And global shortcuts are registered with the system

  Scenario: Trigger global which-key with Option+Ctrl+Space
    Given I am using any macOS application
    When I press "Option+Ctrl+Space"
    Then the yawhich-key window should appear at the bottom of the screen
    And the window should span the full width of the screen
    And the window should display the core keymap
    And the window should automatically resize to fit the content
    And the previous application window information should be captured for focus restoration

  Scenario: Trigger major mode which-key with Option+Ctrl+Comma
    Given I am using a supported application like "Terminal"
    When I press "Option+Ctrl+,"
    Then the yawhich-key window should appear at the bottom of the screen
    And the window should display app-specific keymaps for the current application
    And the window should show a "Major Mode" indicator with the application name
    And the previous application window information should be captured

  Scenario: Window positioning and sizing
    Given the yawhich-key window is triggered
    When the window appears
    Then it should be positioned at the bottom of the screen with full width
    And the height should be dynamically calculated based on the number of keymap items
    And the window should have no decorations (borderless)
    And the window should be transparent with overlay styling
    And the window should always appear on top of other windows

  Scenario: Window auto-hiding on focus loss
    Given the yawhich-key window is visible
    When I click outside the window or focus another application
    Then the window should automatically hide
    And focus should be restored to the previously active application window
    And the window state should be reset

  Scenario: Multiple monitor support
    Given I have multiple monitors
    When I trigger yawhich-key from any monitor
    Then the window should appear on the monitor where the cursor is located
    And the window should span the full width of that monitor
    And positioning calculations should account for the monitor's scale factor

  Scenario: Performance optimization for window display
    Given yawhich-key is triggered
    When the window is being shown
    Then the window size should be calculated before showing to prevent flicker
    And keymap loading should be optimized with caching
    And the total display time should be under 100ms for optimal user experience
    And performance metrics should be logged for monitoring

  Scenario: Window focus management
    Given the yawhich-key window is visible
    When the window is shown
    Then the window should automatically receive keyboard focus
    And keyboard events should be properly captured
    And the escape key should close the window
    And focus should be restored to the original application when closing

  Scenario: Handling window display errors
    Given the yawhich-key window is triggered
    When there is an error loading keymaps
    Then an error dialog should be displayed in the window
    And the error message should be clearly shown to the user
    And an "Edit Config" button should be provided
    And a "Close" button should be available to dismiss the error

  Scenario: Window state synchronization
    Given multiple rapid keymap triggers occur
    When shortcuts are pressed in quick succession
    Then only one window instance should be displayed
    And race conditions should be prevented with sequence counters
    And the most recent trigger should take precedence
    And stale operations should be ignored