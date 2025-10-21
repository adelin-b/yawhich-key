Feature: macOS Integration and Platform-Specific Features
  As a macOS user
  I want yawhich-key to integrate seamlessly with macOS system features and APIs
  So that it feels like a native application and leverages platform capabilities

  Background:
    Given yawhich-key is running on macOS
    And the application has necessary permissions and entitlements

  Scenario: Bundle ID detection using NSWorkspace
    Given various applications are running on the system
    When yawhich-key needs to detect the focused application
    Then it should use NSWorkspace.sharedWorkspace to get the frontmost application
    And the bundle identifier should be extracted accurately
    And common applications should be properly identified (com.apple.Terminal, com.google.Chrome, etc.)
    And the detection should work reliably across different macOS versions

  Scenario: Window title extraction using AppleScript
    Given an application has multiple windows open
    When yawhich-key captures window information
    Then it should use AppleScript to get the front window title
    And the window title should be extracted accurately
    And applications without windows should be handled gracefully
    And AppleScript permissions should be requested if needed

  Scenario: Focus restoration using AppleScript
    Given I am using Safari with a window titled "GitHub - yawhich-key"
    And I trigger yawhich-key
    When I close yawhich-key or execute a command
    Then AppleScript should be used to restore focus to Safari
    And the specific window should be activated by title
    And focus restoration should work even with special characters in titles
    And the operation should be fast and reliable

  Scenario: Default application detection via Launch Services
    Given system default applications are configured
    When yawhich-key resolves placeholders like "<default:browser>"
    Then it should use NSWorkspace URLForApplicationToOpenURL for browsers
    And it should detect the default application for specific file types
    And common defaults should be resolved (Safari, Chrome, Terminal, TextEdit)
    And the detection should respect user preferences set in System Preferences

  Scenario: Terminal application preference detection
    Given various terminal applications are installed
    When yawhich-key resolves "<default:terminal>"
    Then it should check for terminals in order of preference:
      - Alacritty
      - iTerm
      - Kitty
      - WezTerm
      - Hyper
      - Terminal (built-in)
    And it should return the first available terminal application
    And the detection should be based on application availability

  Scenario: Global shortcut registration
    Given yawhich-key starts up
    When registering global shortcuts
    Then Option+Ctrl+Space should be registered for global mode
    And Option+Ctrl+, (comma) should be registered for major mode
    And the shortcuts should work system-wide regardless of focused application
    And conflicts with existing shortcuts should be handled appropriately
    And the registration should use the tauri-plugin-global-shortcut

  Scenario: System permissions and privacy
    Given yawhich-key needs to access system features
    When the application starts
    Then it should request accessibility permissions if needed
    And AppleScript execution permissions should be handled
    And the application should provide clear guidance for permission setup
    And permission status should be checked gracefully

  Scenario: macOS window management
    Given yawhich-key creates its overlay window
    When the window is displayed
    Then it should use native macOS window properties:
      - transparent: true for overlay effect
      - alwaysOnTop: true for prominence
      - skipTaskbar: true to avoid dock/switcher
      - decorations: false for borderless appearance
    And the window should integrate properly with Mission Control
    And it should respect macOS display scaling factors

  Scenario: Multi-monitor support on macOS
    Given a multi-monitor macOS setup
    When yawhich-key is triggered
    Then it should appear on the monitor containing the cursor
    And it should properly handle different monitor resolutions and scaling
    And it should work correctly with mixed Retina/non-Retina displays
    And the window positioning should account for menu bar and dock

  Scenario: Application lifecycle integration
    Given yawhich-key is running as a menu bar application
    When interacting with macOS system events
    Then it should handle system sleep/wake cycles gracefully
    And it should survive user switching
    And it should handle display configuration changes
    And it should integrate properly with macOS application lifecycle

  Scenario: Native macOS notifications
    Given yawhich-key encounters errors or important events
    When notifications need to be displayed
    Then it should use native macOS notification system
    And notifications should respect user's notification preferences
    And they should integrate with Notification Center
    And the notifications should be appropriately timed and relevant

  Scenario: Sandboxing and security compliance
    Given macOS security requirements
    When yawhich-key operates
    Then it should comply with macOS sandboxing where applicable
    And it should request only necessary permissions
    And it should handle security restrictions gracefully
    And it should follow macOS security best practices

  Scenario: AppleScript command execution
    Given keymap entries contain AppleScript commands
    When these commands are executed
    Then they should be run via osascript command
    And special characters should be properly escaped
    And AppleScript errors should be handled gracefully
    And the execution should not block the user interface

  Scenario: System Events integration for keyboard simulation
    Given keymaps that simulate keyboard shortcuts
    When commands like keystroke simulation are executed
    Then they should use System Events AppleScript
    And key combinations should be properly formatted
    And modifier keys should be handled correctly
    And the simulation should work across different applications

  Scenario: Bundle application detection and launching
    Given keymap commands that launch applications
    When resolving application names to bundle paths
    Then the system should find applications in standard locations:
      - /Applications/
      - /System/Applications/
      - ~/Applications/
    And application names with spaces should be handled correctly
    And version-specific applications should be detected appropriately

  Scenario: macOS version compatibility
    Given different macOS versions from the supported range
    When yawhich-key operates
    Then it should work correctly on macOS 10.15 (Catalina) and later
    And API usage should be compatible across supported versions
    And deprecated APIs should be avoided
    And version-specific features should be handled appropriately

  Scenario: Performance optimization for macOS
    Given yawhich-key runs on macOS
    When performing system operations
    Then NSWorkspace calls should be cached when appropriate
    And AppleScript execution should be optimized
    And system resource usage should be minimal
    And the application should have low memory footprint

  Scenario: Integration with macOS accessibility features
    Given users with accessibility needs
    When yawhich-key is used
    Then it should work properly with VoiceOver
    And it should support Switch Control
    And it should be compatible with Zoom accessibility feature
    And keyboard navigation should be fully accessible

  Scenario: Dark mode and system appearance integration
    Given macOS system appearance settings
    When yawhich-key is displayed
    Then it should respect the system dark/light mode preference
    And the default theme should adapt to system appearance
    And theme switching should be seamless
    And the appearance should be consistent with system expectations

  Scenario: Dock and menu bar integration
    Given yawhich-key runs as a background application
    When managing its presence
    Then it should not appear in the Dock by default (skipTaskbar: true)
    And it should handle menu bar integration if configured
    And it should manage its visibility appropriately
    And it should integrate with macOS application switcher correctly