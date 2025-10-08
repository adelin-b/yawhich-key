# Theme System

yawhich-key now supports custom themes! You can easily customize the appearance of your which-key menu using CSS.

## Quick Start

1. **Choose a theme** from the available options
2. **Edit your settings file** at `~/.config/yawhich-key/settings.yaml`:

```yaml
theme: nord  # Replace with your preferred theme
```

3. **Restart yawhich-key** to see the changes

## Available Themes

### Dark Themes

- **nord** - Cool, arctic-inspired color palette
  ![Nord Preview](./docs/themes/nord.png)

- **gruvbox** - Warm, retro groove colors
  ![Gruvbox Preview](./docs/themes/gruvbox.png)

- **catppuccin** - Pastel, soothing purple tones
  ![Catppuccin Preview](./docs/themes/catppuccin.png)

- **tokyo-night** - Vibrant, neon-inspired blues
  ![Tokyo Night Preview](./docs/themes/tokyo-night.png)

- **dracula** - Classic purple and pink dark theme
  ![Dracula Preview](./docs/themes/dracula.png)

### Light Themes

- **light** - Clean, minimal light theme
  ![Light Preview](./docs/themes/light.png)

## Creating Custom Themes

### 1. Create a theme file

Create a new CSS file in `~/.config/yawhich-key/themes/`, for example `my-theme.css`:

```css
/* My Awesome Theme */
:root {
  --color-primary: #your-color;
  --color-bg: #your-bg-color;
  --color-text: #your-text-color;
  /* ... override more variables as needed */
}
```

### 2. Available CSS Variables

The theme system exposes comprehensive CSS variables for full customization:

#### Core Colors

```css
--color-primary          /* Main accent color */
--color-primary-dark     /* Darker variant */
--color-primary-light    /* Light/transparent variant */
--color-primary-glow     /* Glow effect color */
```

#### Backgrounds

```css
--color-bg              /* Main background */
--color-bg-overlay      /* Semi-transparent overlay */
--color-bg-transparent  /* Fully transparent */
```

#### Text

```css
--color-text           /* Primary text */
--color-text-secondary /* Secondary text (90% opacity) */
--color-text-muted     /* Muted text (70% opacity) */
--color-text-dim       /* Dim text (40% opacity) */
--color-text-faint     /* Very faint text (30% opacity) */
```

#### Borders

```css
--color-border        /* Default border */
--color-border-hover  /* Border on hover */
--color-border-focus  /* Border when focused */
```

#### Special Colors

```css
--color-accent-yellow  /* Hydra mode indicator */
--color-error         /* Error messages */
--color-hover-bg      /* Hover background */
--color-active-bg     /* Active/pressed background */
```

#### Effects

```css
--shadow-primary      /* Primary drop shadow */
--shadow-glow        /* Glow effect for keys */
--shadow-search      /* Search box shadow */
--gradient-overlay   /* Background gradient */
```

#### Spacing & Layout

```css
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl
--radius-sm, --radius-md, --radius-lg
--font-size-xs, --font-size-sm, --font-size-base, --font-size-md, --font-size-lg, --font-size-xl
```

### 3. Use your theme

Add to `~/.config/yawhich-key/settings.yaml`:

```yaml
theme: my-theme  # Name without .css extension
```

## Theme Development Tips

1. **Start from an existing theme** - Copy one of the built-in themes as a starting point

2. **Test contrast** - Ensure text is readable against backgrounds:
   ```bash
   # Use a contrast checker for accessibility
   # Aim for WCAG AA compliance (4.5:1 ratio)
   ```

3. **Match your system** - Create themes that match your terminal, editor, or desktop environment

4. **Use semantic colors** - Keep related colors in the same family for visual harmony

5. **Test in different states** - Check hover states, search mode, nested menus, and error messages

## Advanced Customization

### Full CSS Override

You can override any CSS property, not just variables:

```css
/* Advanced: Override specific components */
.keymap-item {
  /* Custom item styling */
}

.search-container {
  /* Custom search box */
}
```

### Dynamic Theming

Themes are loaded at runtime, so you can:
- Switch themes without rebuilding
- Share themes with the community
- Maintain multiple themes for different moods

### Gradients & Special Effects

```css
:root {
  --gradient-overlay: linear-gradient(
    to bottom,
    rgba(your-color, 1.0),
    rgba(your-color, 0.0)
  );

  --shadow-glow: 0 0 20px rgba(your-color, 0.5);
}
```

## Troubleshooting

### Theme not loading

1. Check the file exists: `ls ~/.config/yawhich-key/themes/`
2. Verify the filename matches (case-sensitive, no .css in settings.yaml)
3. Check console for errors: Look for theme loading errors on startup

### Colors look wrong

- Ensure you're using proper CSS color format (hex, rgba, etc.)
- Check variable names match exactly (they're case-sensitive)
- Some variables require rgba() format with transparency

### Default theme returns

- Remove or comment out the `theme:` line in settings.yaml
- Or set `theme: ""` for default

## Community Themes

Share your themes by:
1. Creating a theme file
2. Testing it thoroughly
3. Opening a pull request to the yawhich-key repository
4. Including screenshots!

## Examples

Check out the built-in themes in `~/.config/yawhich-key/themes/` for complete examples.

Each theme file is fully commented and can serve as a template for your own creations.

---

**Pro tip**: Use a tool like [Coolors](https://coolors.co) or [Adobe Color](https://color.adobe.com) to generate harmonious color palettes for your themes!
