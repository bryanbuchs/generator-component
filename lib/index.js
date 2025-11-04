/**
 * Drupal SDC + Storybook Component Generator
 * 
 * This is a standalone CLI tool that generates Drupal Single Directory Component (SDC)
 * boilerplate files with integrated Storybook stories. It replaces the Yeoman-based
 * generator with a lightweight, zero-dependency CLI that uses interactive prompts.
 * 
 * The tool:
 * 1. Prompts the user for component metadata (name, group, description)
 * 2. Guides them through field/slot definitions with configurable types
 * 3. Generates template files (YAML, Twig, Stories, Styles, JavaScript)
 * 4. Saves all files to components/{component-name}/
 * 
 * Architecture:
 * - prompting(): Collects user input through interactive CLI prompts
 * - writing(): Transforms answers into component props and renders templates
 * - generateComponent(): Main entry point combining both phases
 * 
 * Dependencies:
 * - enquirer: Interactive CLI prompts
 * - inflection: String transformations (pluralize, singularize, camelize, etc.)
 * - ejs: Template rendering engine
 * - Node.js native fs/path modules
 */

import Enquirer from 'enquirer'
import inflection from 'inflection'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import ejs from 'ejs'

const { prompt } = Enquirer

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Phase 1: User Input Collection
 * 
 * Presents interactive prompts to gather component configuration:
 * 1. Component name (e.g., "card", "button")
 * 2. Component group for Storybook organization (e.g., "Block", "Entity")
 * 3. Description for documentation
 * 4. Field definitions (name, type, required flag)
 * 5. Behavior.js inclusion option
 * 6. Style format selection (LESS, CSS, or none)
 * 
 * @async
 * @returns {Promise<Object>} Answers object containing:
 *   - component: string - The component name
 *   - group: string - The Storybook group (or empty for no group)
 *   - description: string - Component description
 *   - fields: Array<Object> - Array of field definitions
 *   - js: boolean - Include behavior.js file
 *   - style: string|null - Style format ('less', 'css', or null for none)
 */
async function prompting () {
  console.log('\n📦 Drupal SDC + Storybook Component Generator\n')

  // Prompt for component name and group first
  const answers = await prompt([
    {
      type: 'input',
      name: 'component',
      message: 'Name of component',
      default: 'card'
    },
    {
      type: 'select',
      name: 'group',
      message: 'Group',
      choices: [
        { message: 'Block', value: 'block' },
        { message: 'Content', value: 'content' },
        { message: 'Entity', value: 'entity' },
        { message: 'Field', value: 'field' },
        { message: 'Form', value: 'form' },
        { message: 'Global', value: 'global' },
        { message: 'Media', value: 'media' },
        { message: 'Nav', value: 'nav' },
        { message: 'Node', value: 'node' },
        { message: 'Page', value: 'page' },
        { message: 'Paragraph', value: 'paragraph' },
        { message: 'Region', value: 'region' },
        { message: 'View', value: 'view' },
        { message: 'Widget', value: 'widget' },
        { message: '-none-', value: '' }
      ]
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description of component',
      default: 'A component'
    }
  ])

  /**
   * Collect field definitions
   * 
   * Supports multiple field types:
   * - string: Simple text value
   * - boolean: True/false flag (auto-detected for names starting with "is" or "has")
   * - number: Numeric value
   * - array: Collection of items (useful for pluralized names like "cards")
   * - object: Structured data
   * - slot: Twig block for nested content
   * 
   * Each field can be marked as required, which affects:
   * - Validation in component YAML
   * - Storybook story configuration
   * - Component documentation
   */
  answers.fields = []
  while (true) {
    const { fieldName } = await prompt({
      type: 'input',
      name: 'fieldName',
      message: 'Field Name (press enter to skip)'
    })

    if (!fieldName) break

    // Auto-detect boolean type for names starting with "is" or "has"
    const fieldType =
      fieldName.startsWith('is') || fieldName.startsWith('has')
        ? 'boolean'
        : (await prompt({
            type: 'select',
            name: 'fieldType',
            message: `Field Type for "${fieldName}"`,
            choices: [
              { message: 'Array', value: 'array' },
              { message: 'Boolean', value: 'boolean' },
              { message: 'Number', value: 'number' },
              { message: 'Object', value: 'object' },
              { message: 'String', value: 'string' },
              { message: 'Slot', value: 'slot' }
            ]
          })).fieldType

    // Slots don't require a required flag (always optional for rendering flexibility)
    let fieldRequired = false
    if (fieldType !== 'slot') {
      const response = await prompt({
        type: 'toggle',
        name: 'fieldRequired',
        message: `Required?`,
        default: false
      })
      fieldRequired = response.fieldRequired
    }

    answers.fields.push({
      name: fieldName,
      type: fieldType,
      required: fieldRequired
    })
  }

  /**
   * Final configuration prompts
   * 
   * Determines optional file generation:
   * - behavior.js: JavaScript for component interactions/initialization
   * - style format: CSS preprocessor or plain CSS (or skip for framework-provided styles)
   */
  const remainingAnswers = await prompt([
    {
      type: 'toggle',
      name: 'js',
      message: 'Include *.behavior.js file?',
      default: false
    },
    {
      name: 'style',
      type: 'select',
      message: 'Style format',
      choices: [
        { message: 'LESS', value: 'less' },
        { message: 'CSS', value: 'css' },
        { message: '-none-', value: false }
      ]
    }
  ])

  // Merge the remaining answers
  Object.assign(answers, remainingAnswers)

  return answers
}

/**
 * Phase 2: Component Generation
 * 
 * Transforms user answers into a component file structure:
 * 1. Normalizes component/group names for consistent naming
 * 2. Calculates derived values (tag, CSS classes, display names)
 * 3. Processes field definitions into Storybook-ready format
 * 4. Renders all templates with computed context
 * 5. Writes files to disk
 * 
 * Naming Convention Examples:
 * - Input: component="card", group="entity" → tag="entity-card", name="EntityCard"
 * - Input: component="featured-item", group="" → tag="featured-item", name="FeaturedItem"
 * - Input: component="page-title-large", group="page" → tag="page-page-title-large", name="PagePageTitleLarge"
 * 
 * Generated Files:
 * - {tag}.component.yml: Drupal SDC metadata (required)
 * - {tag}.twig: Component template with field rendering
 * - {tag}.stories.js: Storybook configuration and example stories
 * - {tag}.library.js: Required by Drupal for CSS/JS registration (if needed)
 * - {tag}.(less|css): Style file (optional)
 * - {tag}.behavior.js: JavaScript interactions (optional)
 * 
 * @async
 * @param {Object} answers - User input from prompting phase
 * @returns {Promise<void>}
 */
async function writing (answers) {
  answers.group = answers.group === '-none-' ? null : answers.group
  answers.style = answers.style === '-none-' ? null : answers.style

  // Read package.json from current working directory to populate project name
  let pkg = {}
  try {
    const pkgContent = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
    pkg = JSON.parse(pkgContent)
  } catch (e) {
    pkg = { name: 'PROJECT' }
  }

  /**
   * Separate and enrich fields for template rendering
   * 
   * Non-slot fields get processed to include:
   * - label: Human-readable field name
   * - singular/plural: For array fields (e.g., "card" from "cards")
   * - value: Example value for Storybook args
   */
  const fields = answers.fields
    .filter(field => field.type !== 'slot')
    .map(field => {
      const singular = inflection.singularize(field.name)
      const plural = inflection.pluralize(field.name)

      let value
      switch (field.type) {
        case 'array':
          value = Array(3).fill(`'${singular.toUpperCase()}'`)
          value = `[${value.join(', ')}]`
          break
        case 'boolean':
          value = true
          break
        case 'string':
          value = `'${field.name.toUpperCase()}'`
          break
        case 'object':
          value = `{ key: 'value' }`
          break
        case 'number':
          value = 3
          break
        default:
          value = `null`
      }

      return {
        ...field,
        label: inflection.titleize(field.name),
        singular: field.type === 'array' ? singular : undefined,
        plural: field.type === 'array' ? plural : undefined,
        value: value
      }
    })

  // Extract required field names for component.yml
  const requiredFields = answers.fields
    .filter(field => field.required)
    .map(field => field.name)

  // Process slots separately (Twig blocks for nested content)
  const slots = answers.fields
    .filter(field => field.type === 'slot')
    .map(slot => ({
      name: slot.name,
      label: inflection.titleize(slot.name)
    }))

  /**
   * Name transformation pipeline
   * 
   * Converts component name through several transformations:
   * 1. Replace punctuation with spaces: "page-title" → "page title"
   * 2. Remove group prefix: not applicable here, but kept for clarity
   * 3. Replace spaces with underscores: "page title" → "page_title"
   * 4. Underscore to dash: "page_title" → "page-title"
   * 5. Titleize: "page-title" → "Page Title"
   * 6. Camelize for class names: "page_title" → "PageTitle"
   * 
   * Results in multiple forms used throughout the component:
   * - tag: kebab-case for CSS, file names, Drupal hooks
   * - name: PascalCase for JavaScript/Storybook
   * - label: Title Case for display
   * - cssClasses: Array of class names
   */
  const spaced = answers.component
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')

  const group = answers.group
    ? inflection.camelize(answers.group)
    : null

  const underscored = spaced.replace(/\s/g, '_')
  const dasherized = inflection.dasherize(underscored)
  const titleized = inflection.titleize(spaced)
  const camelized = inflection.camelize(underscored)

  // Combine group and component for final tag
  let tag = group
    ? `${inflection.dasherize(group)}-${dasherized}`
    : dasherized
  tag = tag.toLowerCase()

  const name = group ? group + camelized : camelized
  const label = titleized

  // CSS classes include both group and component-specific classes
  const cssClasses = [tag]
  if (group) {
    cssClasses.unshift(group.toLowerCase())
  }

  // Arguments for Storybook stories (fields + slots)
  const args = [
    ...fields.map(field => field.name),
    ...slots.map(slot => slot.name)
  ]

  // Import paths for library.js file
  const imports = [
    ...(answers.style ? [`${tag}.${answers.style}`] : []),
    ...(answers.js ? [`${tag}.behavior.js`] : [])
  ]

  // Export configuration for Drupal library system
  const exports = {
    ...(answers.style && {
      style: answers.style === 'css'
        ? `${tag}.${answers.style}`
        : `../../dist/${tag}.css`
    }),
    ...(answers.js && { script: `../../dist/${tag}.js` })
  }

  /**
   * Build complete context object for template rendering
   * 
   * This object is passed to every template via EJS, providing
   * all necessary data for generating component files.
   */
  const props = {
    fields: fields,
    required: requiredFields,
    slots: slots,
    args: args,
    cssClasses: cssClasses,
    description: inflection.humanize(answers.description),
    forEach: group ? group.toLowerCase() : 'el',
    group: group,
    label: label,
    name: name,
    project: pkg ? pkg.name : 'PROJECT',
    displays: [name],
    tag: tag,
    imports: imports,
    exports: exports,
    title: group ? `${group}/${titleized}` : titleized
  }

  /**
   * Determine which templates to render
   * 
   * Component.yml, Twig, and Stories are always generated.
   * Library.js is generated if styles or JS are included.
   * Styles and behavior.js are optional based on user input.
   */
  const templates = [
    'component.yml',
    'twig',
    'stories.js',
    answers.style || answers.js ? 'library.js' : null,
    answers.style ? answers.style : null,
    answers.js ? 'behavior.js' : null
  ].filter(Boolean)

  // Create component directory
  const componentDir = resolve(process.cwd(), `components/${props.tag}`)
  mkdirSync(componentDir, { recursive: true })

  // Render and write each template
  const templateDir = resolve(__dirname, '../templates')

  for (const ext of templates) {
    const templatePath = resolve(templateDir, `component.${ext}`)
    const rendered = ejs.render(readFileSync(templatePath, 'utf8'), props)
    const outputPath = resolve(componentDir, `${props.tag}.${ext}`)
    writeFileSync(outputPath, rendered)
    console.log(`✓ Created ${props.tag}.${ext}`)
  }

  console.log(`\n✨ Component "${props.tag}" created successfully!\n`)
}

/**
 * Main Entry Point
 * 
 * Orchestrates the complete component generation workflow:
 * 1. Collects user input via interactive prompts
 * 2. Transforms answers into file-ready component metadata
 * 3. Renders and writes template files
 * 
 * Error handling is delegated to the CLI wrapper (bin/cli.js)
 * 
 * @async
 * @throws {Error} Any errors during prompting or file writing
 * @returns {Promise<void>}
 */
export async function generateComponent () {
  const answers = await prompting()
  await writing(answers)
}
