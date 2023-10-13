# generator-drupal-twig-component

Generates a component directory for use with Storybook + Twig/Drupal

## Requirements

Requires Yeoman

`npm install -g yo`

## Install

`npm i -g @bryanbuchs/generator-component`

Or, to simplify the `yo` command to `component`:

`npm i -g generator-component@npm:@bryanbuchs/generator-component` 

## Run

Run the generator from the theme directory, files will be scaffolded into `components/{component-name}`:

`yo component {component-name}` for defaults or `yo component` and follow the prompts.

### Options

#### Drupal Behaviors

`yo component {component-name} --js` to include a `*.behavior.js` file in your component (or respond "Y" at the prompt)

### Output

Running the generator will create a directory with a series of boilerplate files:

1. `components/{component-name}/{component-name}.less`
2. `components/{component-name}/{component-name}.library.js`
3. `components/{component-name}/{component-name}.stories.js`
4. `components/{component-name}/{component-name}.twig`
5. `components/{component-name}/{component-name}.behavior.js` (optional)
