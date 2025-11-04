# generator-component

Generates Drupal Single Directory Component (SDC) boilerplate with integrated Storybook stories. A lightweight, interactive CLI tool that replaces the Yeoman-based generator.

## Features

- 🎯 **Interactive Prompts** - Guided component generation without CLI arguments
- 📦 **Complete Scaffolding** - Creates all necessary SDC and Storybook files
- 🎨 **Flexible Styling** - Choose between LESS, CSS, or no stylesheet
- 🧩 **Smart Field Types** - String, boolean, number, object, array, and slot support
- ⚡ **Zero Yeoman Overhead** - Lightweight, fast, and simple
- 📚 **Storybook Ready** - Generated stories include field documentation and examples

## Requirements

- Node.js 14+
- A Drupal project with SDC support (Drupal 10.1+) or a theme using SDC conventions

## Installation

### Global (Recommended)

Install globally to use `generator-component` from any project:

```bash
npm install -g @bryanbuchs/generator-component
```

### Local (Project-specific)

```bash
npm install --save-dev @bryanbuchs/generator-component
npx generator-component
```

## Usage

From your theme directory, run:

```bash
generator-component
```

This launches an interactive prompt that guides you through component creation. Components are generated in `components/{component-tag}/`.

## Interactive Prompts

### 1. Component Name

The base name of your component (e.g., `card`, `button`, `hero-banner`)

- Spaces and punctuation are normalized to kebab-case
- Used to generate the component tag and CSS classes

### 2. Component Group

Organize components in Storybook stories (optional). Choose from:

- **Block** - Block-level components
- **Content** - Content-related components
- **Entity** - Entity-based components
- **Field** - Field formatters
- **Form** - Form-related components
- **Global** - Global/layout components
- **Media** - Media components
- **Nav** - Navigation components
- **Node** - Node-type components
- **Page** - Page-level components
- **Paragraph** - Paragraph-type components
- **Region** - Region components
- **View** - View-based components
- **Widget** - Widget components
- **-none-** - Skip grouping

The group combines with the component name to create the final tag:

- `component-name: card` + `group: entity` → tag: `entity-card`

### 3. Component Description

A brief description used in generated files as documentation.

### 4. Field Definitions

Define component fields/properties:

#### Field Types

- **String** - Text value. Example: `title`, `label`, `heading`
- **Boolean** - True/false flag. Auto-detected for names starting with `is` or `has`
- **Number** - Numeric value. Example: `count`, `width`, `priority`
- **Array** - Collection of items. Use plural names like `items`, `cards`, `people`
- **Object** - Structured data. Example: `metadata`, `config`, `settings`
- **Slot** - Twig block for nested content. Example: `content`, `body`, `footer`

#### Field Requirements

Mark fields as required to:

- Enforce validation in component.yml
- Generate Storybook controls
- Document in component metadata

#### Field Examples

```
Field: title (string, required)
Field: subtitle (string, optional)
Field: isActive (boolean - auto-detected)
Field: items (array)
Field: content (slot - not required)
```

Leave field name blank to finish adding fields.

### 5. Behavior.js File

Include JavaScript for component interactions/initialization. Generates:

- `{tag}.behavior.js` - JavaScript source
- Entry in `{tag}.library.js` for Drupal

### 6. Style Format

Choose stylesheet format or skip:

- **LESS** - LESS preprocessor (compiles to CSS)
- **CSS** - Plain CSS
- **-none-** - No stylesheet (framework-provided styles)

## Generated Files

Each component generates a directory with:

```
components/{component-tag}/
├── {tag}.component.yml       # Drupal SDC metadata (required)
├── {tag}.twig               # Component template
├── {tag}.stories.js         # Storybook configuration
├── {tag}.library.js         # Drupal library registry (if CSS/JS)
├── {tag}.less or .css       # Stylesheet (optional)
└── {tag}.behavior.js        # JavaScript behavior (optional)
```

### File Details

#### component.yml

Drupal SDC metadata defining:

- Component display name and description
- Field schema and validation
- Props configuration for Twig rendering
- Required vs optional fields

#### .twig

Twig template for rendering the component:

- Receives variables from parent templates
- Includes CSS classes
- Renders fields with appropriate syntax (loops for arrays, conditionals for slots)
- Ready for Drupal integration

#### .stories.js

Storybook configuration:

- Component display in Storybook hierarchy
- Example story with default args
- Field documentation in controls
- Ready for visual testing and documentation

#### .library.js

Drupal library declaration:

- Registers CSS and JS for inclusion
- Proper asset paths for dist/ build output
- Required when styles or behavior.js are included

#### .less / .css

Style file (optional):

- Placeholder for component-specific styles
- Uses BEM naming convention based on component tag
- Ready for preprocessing (LESS) or direct usage (CSS)

#### .behavior.js

JavaScript file (optional):

- Drupal-style behavior attachment
- Receives component selector from {tag} CSS class
- Use for event listeners, initialization, etc.

## Component Naming

The generator automatically transforms component names through several steps:

### Example: `featured-product-card` in `entity` group

1. Input: `featured-product-card`
2. Normalize: `featured product card`
3. Generate names:
   - **tag**: `entity-featured-product-card` (kebab-case, for CSS/filenames)
   - **name**: `EntityFeaturedProductCard` (PascalCase, for JavaScript/Storybook)
   - **label**: `Featured Product Card` (Title Case, for display)
4. CSS classes: `entity`, `entity-featured-product-card`

### Rules

- Spaces, dashes, and underscores normalize to spaces
- Consecutive spaces collapse to single space
- Group + component creates the final tag (if group selected)
- All names are lowercase in CSS/filenames

## Field Type Examples

### String Field

```
Field: title (string, required)

Generated Twig:
  {{ title }}

Generated Storybook:
  args: { title: 'TITLE' }
```

### Array Field

```
Field: items (array, optional)

Generated Twig:
  {% for item in items %}
    {{ item }}
  {% endfor %}

Generated Storybook:
  args: { items: ['ITEM', 'ITEM', 'ITEM'] }
```

### Slot

```
Field: content (slot)

Generated Twig:
  {% block content %}
    Content slot
  {% endblock %}

Generated Stories:
  No direct arg (passed as HTML block in Storybook)
```

## Customization After Generation

All generated files use standard Drupal/Twig/Storybook conventions and are fully editable:

- **component.yml** - Adjust schema, add schema validation
- **.twig** - Refine markup, add filters, update structure
- **.stories.js** - Add story variations, update documentation
- **.library.js** - Add build assets, CSS preprocessing
- **.less/.css** - Add component-specific styles
- **.behavior.js** - Add component interactivity

## Integration with Drupal

### Setting Up Components

1. Ensure your theme has `components` directory at root
2. Run `generator-component` to create component
3. Add to your theme's `package.json` build process:
   - Compile LESS/CSS if needed
   - Build JS for distribution

### Using Components in Twig

Component is immediately available in Twig templates using the new Drupal SDC namespace syntax:

```twig
{% include 'THEMENAME:entity-featured-product-card' with {
  title: 'Featured Product',
  items: featured_products
} %}
```

#### Component Namespace Syntax

The modern Drupal SDC component syntax uses theme namespaces:

**Pattern**: `THEMENAME:component-tag`

Examples:
- `custom_theme:entity-featured-product-card`
- `my_theme:block-card`
- `my_theme:form-button`

Replace `THEMENAME` with your actual theme name (found in your theme's `.info.yml` file).

#### Understanding the Component Tag

The `component-tag` comes from the generator and follows this pattern:
- If you selected a group + component: `group-name-component-name`
- If no group selected: `component-name`

**Examples**:
- Component: `card`, Group: `entity` → `entity-card`
- Component: `featured-product`, Group: `block` → `block-featured-product`
- Component: `button`, No group → `button`

#### With Block Context

Components can also be referenced in block templates:

```twig
{# In a block template #}
{% include 'THEMENAME:entity-featured-product-card' with {
  title: block.content['#title'],
  items: block.content['#items']
} %}
```

## Integration with Storybook

1. Configure Storybook to include the `components/` directory
2. Run Storybook
3. Generated stories appear in sidebar under component group
4. Use stories for:
   - Component development and testing
   - Visual documentation
   - Interaction testing

## Project Structure

```
generator-component/
├── bin/
│   └── cli.js              # Executable entry point
├── lib/
│   └── index.js            # Core generator logic
├── templates/              # EJS template files
├── package.json            # Dependencies and bin configuration
└── README.md               # This file
```

### Architecture

The generator operates in two phases:

1. **Prompting** (`lib/index.js:prompting()`)

   - Interactive CLI prompts
   - Collects user input
   - Returns answers object

2. **Writing** (`lib/index.js:writing()`)
   - Transforms answers to component metadata
   - Renders EJS templates
   - Writes files to disk

## Dependencies

- **enquirer** - Interactive CLI prompts
- **inflection** - String transformations (pluralize, camelize, etc.)
- **ejs** - Template rendering engine
- **Node.js fs/path** - File system and path utilities

## Development

### Local Setup

```bash
git clone <repo>
cd generator-component
npm install
npm link  # Makes `generator-component` available globally
```

### Testing

```bash
mkdir test-project
cd test-project
npm init -y
generator-component  # Test the interactive flow
```

## Troubleshooting

### Command not found

If `generator-component` is not found after installation:

```bash
# Try npm link (for development)
npm link @bryanbuchs/generator-component

# Or reinstall globally
npm install -g @bryanbuchs/generator-component
```

### Files not creating in correct directory

Ensure you run `generator-component` from a directory where you want the `components/` folder created. It will be created at:

```
./components/{component-tag}/
```

### Template errors

If templates render with undefined values, check:

1. Field names are defined correctly
2. Field types are supported (string, array, boolean, object, number, slot)
3. Component name contains no special characters (they're normalized)

## License

See LICENSE file in repository.

## Contributing

Contributions welcome! Please submit issues and pull requests to the [GitHub repository](https://github.com/bryanbuchs/generator-component).
