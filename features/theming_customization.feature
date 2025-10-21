Feature: Theming and Customization
  As a yawhich-key user
  I want to customize the appearance and behavior of the interface
  So that yawhich-key fits seamlessly into my personal workflow and aesthetic preferences

  Background:
    Given yawhich-key is installed and running
    And the configuration directory exists at "~/.config/yawhich-key"

  Scenario: Default theme and appearance
    Given no custom theme is configured
    When yawhich-key is displayed
    Then the default dark theme should be applied
    And the interface should have a dark background with good contrast
    And text should be clearly readable
    And the color scheme should be professional and easy on the eyes

  Scenario: Loading custom themes
    Given a custom theme file exists at "~/.config/yawhich-key/themes/custom-dark.css"
    And the settings.yaml contains:
      """
      theme: "custom-dark"
      """
    When yawhich-key starts
    Then the custom theme should be loaded and applied
    And the CSS variables should override the default styling
    And the theme should be consistently applied across all UI components

  Scenario: Custom theme CSS structure
    Given I create a custom theme with:
      """
      :root {
        --bg-color: rgba(26, 26, 26, 0.95);
        --text-color: #e0e0e0;
        --accent-color: #ff0044;
        --border-color: rgba(255, 255, 255, 0.1);
        --item-bg: rgba(40, 40, 40, 0.8);
        --item-hover: rgba(60, 60, 60, 0.9);
      }
      """
    When the theme is applied
    Then all interface elements should use the custom color variables
    And the background should be the specified color
    And text should use the custom text color
    And interactive elements should use the accent color

  Scenario: Animation settings control
    Given the settings.yaml contains:
      """
      animations: false
      """
    When yawhich-key is displayed
    Then all Framer Motion animations should be disabled
    And transitions should be instantaneous
    And the interface should still be fully functional
    And performance should be optimized for minimal motion

  Scenario: Enabling animations
    Given the settings.yaml contains:
      """
      animations: true
      """
    When yawhich-key is displayed
    Then smooth animations should be enabled for all transitions
    And window entrance should have a slide-up animation
    And keymap items should have staggered entrance animations
    And the experience should feel polished and responsive

  Scenario: Category-based visual styling
    Given keymaps with different categories are loaded
    When the interface is displayed
    Then apps category should have a blue gradient background with 🚀 icon
    And files category should have a light blue gradient with 📁 icon
    And git category should have an orange gradient with 🔀 icon
    And system category should have a gray gradient with ⚙️ icon
    And window category should have a purple gradient with 🪟 icon
    And media category should have a pink gradient with 🎵 icon

  Scenario: Dynamic category recognition
    Given keymap entries with various names
    When the interface processes the keymaps
    Then entries containing "app", "terminal", "browser" should get app styling
    And entries containing "file", "save", "open" should get file styling
    And entries containing "git" should get git styling
    And entries containing "window", "focus", "fullscreen" should get window styling
    And the categorization should be automatic and intelligent

  Scenario: Responsive layout and sizing
    Given different screen sizes and resolutions
    When yawhich-key is displayed
    Then the window should adapt to the screen width
    And keymap items should arrange in appropriate columns
    And minimum item widths should be respected
    And the layout should remain usable on smaller screens
    And high-DPI displays should be properly supported

  Scenario: Visual feedback for interactions
    Given the yawhich-key interface is displayed
    When I hover over keymap items
    Then items should provide visual feedback (hover state)
    And the cursor should indicate interactivity
    And the feedback should be immediate and clear
    And the styling should be consistent across all interactive elements

  Scenario: Search interface styling
    Given I enter search mode
    When the search interface is displayed
    Then the search input should be clearly styled and focused
    And the search icon should be prominently displayed
    And the clear button should be accessible and styled
    And search results should be visually distinct from normal navigation
    And the placeholder text should be helpful and styled appropriately

  Scenario: Breadcrumb and navigation styling
    Given I am navigating through nested keymaps
    When breadcrumbs and navigation elements are displayed
    Then the breadcrumb should be clearly readable with appropriate separators
    And the back button should be visually prominent and accessible
    And the key sequence display should be styled distinctly from breadcrumbs
    And navigation elements should follow the overall theme

  Scenario: Major mode visual indicators
    Given I am in major mode for an application
    When the interface is displayed
    Then the major mode indicator should be prominently styled
    And it should be clearly distinguishable from regular keymaps
    And the application name should be formatted and displayed clearly
    And the indicator should integrate well with the overall theme

  Scenario: Hydra mode visual styling
    Given Hydra mode is active
    When the interface is displayed
    Then the Hydra indicator should be visually prominent
    And it should use appropriate iconography (🔒)
    And the styling should clearly indicate the persistent state
    And the visual treatment should be consistent with the theme

  Scenario: Error state styling
    Given a configuration error occurs
    When the error interface is displayed
    Then the error message should be clearly styled and readable
    And error states should use appropriate colors (red/warning tones)
    And action buttons should be clearly styled and accessible
    And the error interface should follow the overall theme guidelines

  Scenario: Accessibility considerations
    Given the interface is displayed with any theme
    When considering accessibility requirements
    Then color contrast should meet WCAG guidelines
    And text should be readable at various sizes
    And interactive elements should have sufficient size targets
    And the design should work with screen readers
    And keyboard navigation should be visually clear

  Scenario: Theme file organization
    Given multiple theme files exist
    When organizing themes
    Then themes should be stored in "~/.config/yawhich-key/themes/"
    And theme files should use the .css extension
    And theme names should be referenced in settings without the extension
    And the theme loading should be case-sensitive

  Scenario: Theme loading error handling
    Given a theme is specified in settings but the file doesn't exist
    When yawhich-key attempts to load the theme
    Then it should fall back to the default theme gracefully
    And an error should be logged for debugging
    And the user experience should not be disrupted
    And the interface should remain fully functional

  Scenario: Performance with custom themes
    Given complex custom themes with many CSS rules
    When the theme is applied
    Then the performance should remain optimal
    And theme application should not cause layout delays
    And the interface should remain responsive
    And memory usage should be reasonable

  Scenario: Theme hot-reloading during development
    Given a custom theme is loaded
    When the theme file is modified
    Then the changes should be detectable
    And the theme should be reloaded automatically when possible
    And developers should be able to iterate on themes efficiently
    And the development experience should be smooth