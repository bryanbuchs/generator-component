# generator-drupal-twig-component

Generates a component directory for use with Storybook + Twig/Drupal

## Requirements
Requires Yeoman

`npm install -g yo`

## Install
`npm i -g git@github.com:bryanbuchs/generator-drupal-twig-component.git`

(@TODO: publish to NPM)

## Run
`yo drupal-twig-component {component-name}` for defaults or `yo drupal-twig-component` and follow the prompts.

### Options

#### Drupal Behaviors
`yo drupal-twig-component {component-name} --js` to include a `*.behavior.js` file in your component, or enter "Y" at the prompt

### Output
Running the generator will create a directory with a series of boilerplate files:

1. `{component-name}/{component-name}.less`
2. `{component-name}/{component-name}.library.js`
3. `{component-name}/{component-name}.stories.js`
4. `{component-name}/{component-name}.twig`
5. `{component-name}/{component-name}.behavior.js` (optional)
