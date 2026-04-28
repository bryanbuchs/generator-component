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
 * - @inquirer/prompts: Interactive CLI prompts
 * - inflection: String transformations (pluralize, singularize, camelize, etc.)
 * - ejs: Template rendering engine
 * - Node.js native fs/path modules
 */

import { input, select, checkbox, confirm } from "@inquirer/prompts";
import inflection from "inflection";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Phase 1: User Input Collection
 *
 * Presents interactive prompts to gather component configuration:
 * 1. Component name (e.g., "card", "button")
 * 2. Component group for Storybook organization (e.g., "Block", "Entity")
 * 3. Description for documentation
 * 4. Field definitions (name, type, required flag)
 * 5. Whether to include a CSS file
 * 6. Whether to include a JS behavior file
 * 7. Compile selection (which assets, if any, are processed by Vite/PostCSS)
 *
 * @async
 * @returns {Promise<Object>} Answers object containing:
 *   - component: string - The component name
 *   - group: string - The Storybook group (or empty for no group)
 *   - description: string - Component description
 *   - fields: Array<Object> - Array of field definitions
 *   - style: boolean - whether to include a CSS file
 *   - js: boolean - whether to include a JS behavior file
 *   - compile: Array<string> - subset of ['css', 'js']
 */
async function prompting() {
  console.log("\n📦 Drupal SDC + Storybook Component Generator\n");

  const answers = {};

  answers.component = await input({
    message: "Name of component",
    default: "card",
  });

  answers.group = await select({
    message: "Group",
    choices: [
      { name: "Block", value: "block" },
      { name: "Content", value: "content" },
      { name: "Entity", value: "entity" },
      { name: "Field", value: "field" },
      { name: "Form", value: "form" },
      { name: "Global", value: "global" },
      { name: "Media", value: "media" },
      { name: "Nav", value: "nav" },
      { name: "Node", value: "node" },
      { name: "Page", value: "page" },
      { name: "Paragraph", value: "paragraph" },
      { name: "Region", value: "region" },
      { name: "View", value: "view" },
      { name: "Widget", value: "widget" },
      { name: "-none-", value: "" },
    ],
  });

  answers.description = await input({
    message: "Description of component",
    default: "A component",
  });

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
  answers.fields = [];
  while (true) {
    const fieldName = await input({
      message: "Field Name (press enter to skip)",
    });

    if (!fieldName) break;

    // Auto-detect boolean type for names starting with "is" or "has"
    const fieldType =
      fieldName.startsWith("is") || fieldName.startsWith("has")
        ? "boolean"
        : await select({
            message: `Field Type for "${fieldName}"`,
            choices: [
              { name: "String", value: "string" },
              { name: "Slot", value: "slot" },
              { name: "Array", value: "array" },
              { name: "Boolean", value: "boolean" },
              { name: "Number", value: "number" },
              { name: "Object", value: "object" },
            ],
          });

    // Slots don't require a required flag (always optional for rendering flexibility)
    const fieldRequired =
      fieldType === "slot" ? false : await confirm({ message: "Required?", default: false });

    answers.fields.push({
      name: fieldName,
      type: fieldType,
      required: fieldRequired,
    });
  }

  /**
   * Final configuration prompts
   *
   * Determines optional file generation:
   * - Styles: include a CSS file or skip
   * - Scripts: include a behavior.js file or skip
   * - Compile: which of the included assets should be built by Vite/PostCSS into dist/
   */
  const assets = await checkbox({
    message: "Assets",
    choices: [
      { name: "css", value: "css", checked: true },
      { name: "js", value: "js", checked: true },
    ],
  });
  answers.style = assets.includes("css");
  answers.js = assets.includes("js");

  const compileChoices = [
    answers.style && { name: "css", value: "css" },
    answers.js && { name: "js", value: "js" },
  ].filter(Boolean);

  answers.compile = compileChoices.length
    ? await checkbox({ message: "Compile?", choices: compileChoices })
    : [];

  return answers;
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
 * - {tag}.library.js: Vite entry point - generated only when at least one asset is compiled
 * - {tag}.css: Style file (optional)
 * - {tag}.behavior.js: JavaScript interactions (optional)
 *
 * @async
 * @param {Object} answers - User input from prompting phase
 * @returns {Promise<void>}
 */
async function writing(answers) {
  answers.group = answers.group || null;

  // Read package.json from current working directory to populate project name
  let pkg = {};
  try {
    const pkgContent = readFileSync(resolve(process.cwd(), "package.json"), "utf8");
    pkg = JSON.parse(pkgContent);
  } catch (e) {
    pkg = { name: "PROJECT" };
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
    .filter((field) => field.type !== "slot")
    .map((field) => {
      const singular = inflection.singularize(field.name);
      const plural = inflection.pluralize(field.name);

      let value;
      switch (field.type) {
        case "array":
          value = Array(3).fill(`'${singular.toUpperCase()}'`);
          value = `[${value.join(", ")}]`;
          break;
        case "boolean":
          value = true;
          break;
        case "string":
          value = `'${field.name.toUpperCase()}'`;
          break;
        case "object":
          value = `{ key: 'value' }`;
          break;
        case "number":
          value = 3;
          break;
        default:
          value = `null`;
      }

      return {
        ...field,
        label: inflection.titleize(field.name),
        singular: field.type === "array" ? singular : undefined,
        plural: field.type === "array" ? plural : undefined,
        value: value,
      };
    });

  // Extract required field names for component.yml
  const requiredFields = answers.fields
    .filter((field) => field.required)
    .map((field) => field.name);

  // Process slots separately (Twig blocks for nested content)
  const slots = answers.fields
    .filter((field) => field.type === "slot")
    .map((slot) => ({
      name: slot.name,
      label: inflection.titleize(slot.name),
    }));

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
  const spaced = answers.component.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " ");

  const group = answers.group ? inflection.camelize(answers.group) : null;

  const underscored = spaced.replace(/\s/g, "_");
  const dasherized = inflection.dasherize(underscored);
  const titleized = inflection.titleize(spaced);
  const camelized = inflection.camelize(underscored);

  // Combine group and component for final tag
  let tag = group ? `${inflection.dasherize(group)}-${dasherized}` : dasherized;
  tag = tag.toLowerCase();

  const name = group ? group + camelized : camelized;
  const label = titleized;

  // CSS classes include both group and component-specific classes
  const cssClasses = [tag];
  if (group) {
    cssClasses.unshift(group.toLowerCase());
  }

  // Arguments for Storybook stories (fields + slots)
  const args = [...fields.map((field) => field.name), ...slots.map((slot) => slot.name)];

  const hasStyles = Boolean(answers.style);
  const hasScripts = Boolean(answers.js);
  const compileStyles = hasStyles && answers.compile?.includes("css");
  const compileScripts = hasScripts && answers.compile?.includes("js");
  const hasLibrary = compileStyles || compileScripts;

  // Source files compiled into library.js (the Vite entry point)
  const imports = [
    ...(compileStyles ? [`${tag}.css`] : []),
    ...(compileScripts ? [`${tag}.behavior.js`] : []),
  ];

  // Files Storybook imports directly (compiled assets reach Storybook via library.js)
  const storyImports = [
    ...(hasLibrary ? [`${tag}.library.js`] : []),
    ...(hasStyles && !compileStyles ? [`${tag}.css`] : []),
    ...(hasScripts && !compileScripts ? [`${tag}.behavior.js`] : []),
  ];

  // Drupal library overrides: dist paths for compiled assets, source paths otherwise
  const exports = {
    ...(hasStyles && {
      style: compileStyles ? `../../dist/${tag}.css` : `${tag}.css`,
    }),
    ...(hasScripts && {
      script: compileScripts ? `../../dist/${tag}.js` : `${tag}.behavior.js`,
    }),
  };

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
    forEach: group ? group.toLowerCase() : "el",
    group: group,
    label: label,
    name: name,
    project: pkg ? pkg.name : "PROJECT",
    displays: [name],
    tag: tag,
    imports: imports,
    storyImports: storyImports,
    exports: exports,
    compiled: { css: compileStyles, js: compileScripts },
    title: group ? `${group}/${titleized}` : titleized,
  };

  /**
   * Determine which templates to render
   *
   * component.yml, twig, and stories.js are always generated.
   * library.js is generated only when at least one asset is compiled (it's the Vite entry).
   * The CSS and behavior.js source files are generated whenever the user opted in.
   */
  const templates = [
    "component.yml",
    "twig",
    "stories.js",
    hasLibrary ? "library.js" : null,
    hasStyles ? "css" : null,
    hasScripts ? "behavior.js" : null,
  ].filter(Boolean);

  // Create component directory
  const componentDir = resolve(process.cwd(), `components/${props.tag}`);

  // Check if component directory already exists
  if (existsSync(componentDir)) {
    const shouldClear = await confirm({
      message: `Component directory "${props.tag}" already exists. Clear existing files?`,
      default: false,
    });

    if (shouldClear) {
      rmSync(componentDir, { recursive: true, force: true });
    } else {
      console.log("Operation cancelled.");
      return;
    }
  }

  mkdirSync(componentDir, { recursive: true });

  // Render and write each template
  const templateDir = resolve(__dirname, "../templates");

  for (const ext of templates) {
    const templatePath = resolve(templateDir, `component.${ext}`);
    const rendered = ejs.render(readFileSync(templatePath, "utf8"), props);
    const outputPath = resolve(componentDir, `${props.tag}.${ext}`);
    writeFileSync(outputPath, rendered);
    console.log(`✓ Created ${props.tag}.${ext}`);
  }

  console.log(`\n✨ Component "${props.tag}" created successfully!\n`);
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
export async function generateComponent() {
  const answers = await prompting();
  await writing(answers);
}
