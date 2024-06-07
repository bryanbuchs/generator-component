# generator-component

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

1. `yo component` and follow the prompts.
2. `yo component componentname` to prefill the name prompt
3. `yo component groupname-componentname` to prefill the name and group prompts
4. `yo component --js` to prefill "y" in the "Include *.behavior.js file?"

### Output

Running the generator will create a directory with a series of boilerplate files:

1. `components/{component-name}/{component-name}.less`
2. `components/{component-name}/{component-name}.library.js`
3. `components/{component-name}/{component-name}.stories.js`
4. `components/{component-name}/{component-name}.twig`
5. `components/{component-name}/{component-name}.behavior.js` (if specified)
6. `components/{component-name}/{component-name}.yml`
