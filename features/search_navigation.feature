Feature: Search and Navigation Capabilities
  As a yawhich-key user
  I want to search through keymaps and navigate hierarchical structures efficiently
  So that I can quickly find and execute the commands I need

  Background:
    Given yawhich-key is running with a loaded keymap configuration
    And the user interface is displayed

  Scenario: Entering search mode
    Given the yawhich-key window is visible
    When I press "/"
    Then search mode should be activated
    And a search input field should appear
    And the search input should automatically receive focus
    And a search icon should be displayed
    And placeholder text should indicate "Search keymaps... (Esc to exit)"

  Scenario: Fuzzy search functionality
    Given I am in search mode
    And the keymap contains:
      """
      +apps:
        +browser: open -a "Safari"
        +terminal: open -a "Terminal"
      +files:
        +browser-downloads: open ~/Downloads
      """
    When I type "brow" in the search field
    Then both "browser" and "browser-downloads" should appear in results
    And the search should match partial strings
    And results should be highlighted appropriately

  Scenario: Multi-word search
    Given I am in search mode
    And the keymap contains nested structures with various descriptions
    When I type "git status" in the search field
    Then entries containing both "git" and "status" should be shown
    And the search should work across multiple words
    And word order should not matter for matching
    And each word must be found somewhere in the key or path

  Scenario: Search result display with paths
    Given a nested keymap structure:
      """
      +git:
        +branch:
          +new: git checkout -b new-branch
        +status: git status
      +files:
        +git-config: vim ~/.gitconfig
      """
    When I search for "git"
    Then all matching items should be displayed in a flattened view
    And each result should show its full path (e.g., "git → branch")
    And the immediate key should be prominently displayed
    And the hierarchical context should be clear

  Scenario: Search result interaction
    Given I have search results displayed
    When I click on a search result
    Then the search should be executed by navigating through the full path
    And all intermediate navigation steps should be performed automatically
    And the final command should be executed
    And the search mode should be exited

  Scenario: Exiting search mode
    Given I am in search mode
    When I press "Escape"
    Then search mode should be deactivated
    And the search input field should disappear
    And the normal keymap view should be restored
    And keyboard focus should return to the main interface

  Scenario: Search input clearing
    Given I am in search mode with text entered
    When I click the clear button (✕)
    Then the search query should be cleared
    And all items should be displayed again
    And the search input should remain focused

  Scenario: Hierarchical navigation with keyboard
    Given a nested keymap:
      """
      +apps:
        +development:
          +editor: code
          +terminal: kitty
        +browser: safari
      """
    When I navigate to "apps" then "development"
    Then I should see the "development" submenu
    And the breadcrumb should show "apps / development"
    And the back button should be available
    And pressing backspace should go back one level

  Scenario: Breadcrumb navigation
    Given I am navigating through nested keymaps
    When I reach a deep level like "apps → development → tools"
    Then the breadcrumb should display the full path
    And each breadcrumb segment should be separated clearly
    And the current location should be highlighted
    And navigation context should be maintained

  Scenario: Back navigation functionality
    Given I am in a nested keymap level
    When I press the back button or "Backspace"
    Then I should navigate to the previous level
    And the keymap display should update to show the parent level
    And if I'm at the root level, the back action should close the window
    And the navigation should be smooth and responsive

  Scenario: Key sequence display
    Given I am navigating through nested keymaps
    When I am at path "apps → development"
    Then a key sequence indicator should show "apps → development"
    And the sequence should be visually distinct from the breadcrumb
    And the sequence should update as I navigate deeper
    And the sequence should disappear when I return to the root

  Scenario: Category-based visual organization
    Given keymaps with different categories:
      """
      +apps: [various app launchers]
      +files: [file operations]
      +git: [version control]
      +system: [system controls]
      """
    When the keymaps are displayed
    Then each category should have appropriate icons (🚀 for apps, 📁 for files, etc.)
    And each category should have distinct background colors
    And the visual coding should be consistent
    And the categories should be easily distinguishable

  Scenario: Nested keymap indicators
    Given keymaps with both commands and nested structures
    When viewing a keymap level
    Then nested keymaps should show a "›" indicator
    And command entries should not have indicators
    And toggle entries should be visually distinct
    And the distinction should be clear to users

  Scenario: Search performance with large keymaps
    Given a large keymap configuration with hundreds of entries
    When I perform searches
    Then search results should appear quickly (under 100ms)
    And the interface should remain responsive
    And search filtering should be efficient
    And no performance degradation should be noticeable

  Scenario: Empty search results
    Given I am in search mode
    When I search for a term that doesn't match any keymaps
    Then an appropriate "no results" message should be displayed
    And the search interface should remain functional
    And I should be able to modify my search or exit search mode
    And the experience should be user-friendly

  Scenario: Search highlighting and visual feedback
    Given I am searching for "terminal"
    When results are displayed
    Then matching text should be highlighted in the results
    And the highlighting should make it clear why each result matched
    And the visual emphasis should aid in quickly identifying relevant results
    And the highlighting should be accessible and clear

  Scenario: Navigation state preservation
    Given I am navigating through nested keymaps
    When the yawhich-key window is closed and reopened
    Then I should start at the root level
    And navigation state should be reset
    And no previous navigation context should be retained
    And the interface should be in a clean initial state

  Scenario: Keyboard-only navigation
    Given the yawhich-key window is open
    When I use only keyboard input
    Then I should be able to navigate all keymap levels
    And search should be fully accessible via keyboard
    And all functionality should work without mouse interaction
    And keyboard shortcuts should be intuitive and consistent