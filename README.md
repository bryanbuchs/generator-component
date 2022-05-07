# generator-twig-component

## Requirements
Requires Yeoman

`npm install -g yo`

## Install
`npm i -g git@github.com:bryanbuchs/generator-twig-component.git`

(@TODO: publish to NPM)

## Run
`yo twig-component {component-name}` or `yo twig-component` and follow the prompts.

### Options

#### Variants
`yo twig-component {component-name} {n}` to generate `n` story variants beyond the default export, or enter the count at the prompt

#### Drupal Behaviors
`yo twig-component {component-name} --js` to include a `*.behavior.js` file in your component, or enter "Y" at the prompt

### Output
Running the generator will create a directory with a series of boilerplate files:

1. `{component-name}/{component-name}.less`
2. `{component-name}/{component-name}.library.js`
3. `{component-name}/{component-name}.stories.js`
4. `{component-name}/{component-name}.twig`
5. `{component-name}/{component-name}.behavior.js` (optional)
