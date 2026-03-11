# Copilot Instructions for `generator-component`

## Build, test, and lint commands

This repository currently has **no npm `scripts`** for build, lint, or automated tests (`package.json` has no `scripts` block).

Use these commands from project docs/code:

```bash
npm install
```

```bash
npm link
```

```bash
generator-component
```

You can also run directly without linking:

```bash
node ./bin/cli.js
```

Single-test workflow (manual smoke test from README): create a throwaway project, run `generator-component` once, then confirm files are generated under `components/<tag>/` and match selected options (style and/or behavior).

## High-level architecture

- `bin/cli.js` is a thin executable wrapper: it imports `generateComponent()` from `lib/index.js`, runs it, and exits non-zero on error.
- `lib/index.js` is the core engine with two phases:
  - `prompting()` collects interactive answers via Enquirer.
  - `writing()` transforms answers into derived component metadata (`tag`, `name`, `title`, `cssClasses`, field defaults, library overrides) and writes files.
- `writing()` renders EJS templates from `templates/component.*` and writes output files into `components/<tag>/`.
- The generator reads `package.json` from the **current working directory** (where the command is run), not from this package, to populate project/library metadata in generated YAML.
- Template selection is conditional:
  - Always: `component.yml`, `twig`, `stories.js`
  - Optional: `library.js` (only if style or JS enabled), style template (`less`/`css`), `behavior.js`

## Key repository conventions

- Module format is Node ESM (`"type": "module"`); use `import`/`export` with explicit `.js` extensions in local imports.
- This CLI is interactive-only. CLI argument flags removed in v6 (`--fields`, `--slots`, `--js`, `--css` no longer supported).
- Naming pipeline in `lib/index.js` is central and shared across generated artifacts:
  - normalize user input -> `dasherized` tag
  - prepend selected group to tag when present
  - derive PascalCase story/export names and Storybook title from the same source
- Field handling is split intentionally:
  - non-slot fields become `props.properties` and Storybook `args`
  - slot fields are emitted only in `slots` and Twig `{% block %}` sections
  - `required` is only tracked for non-slot fields
- Boolean field type is auto-selected when field name starts with `is` or `has`.
- Generated library wiring is opinionated:
  - `.stories.js` always imports `./<tag>.library.js`
  - `.library.js` imports selected style/behavior files
  - `component.component.yml` emits `libraryOverrides` paths using `tag.css` for CSS or `../../dist/<tag>.css` for LESS output, and `../../dist/<tag>.js` for behavior JS.
- Generated output location is always relative to where the command is executed: `./components/<tag>/`.
- Drupal usage in docs follows SDC namespace includes: `THEMENAME:component-tag` (not the older `@group/...` style).
