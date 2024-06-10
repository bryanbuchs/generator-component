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
2. `yo component name` to prefill the name prompt
3. `yo component group-name` to prefill the name and group prompts (splits on "-")
4. `yo component --js` to prefill "y" in the "Include *.behavior.js file?"

### Prompts

* `name` - The base name of the component ("Video")
* `group` - The name of the storybook group for the component ("Media")

The `group` and `name` values will be combined to create `component-name` ("MediaVideo", "media-video")

* `description` - Optional; added as a comment in the story and behavior files
* `fields` - A list of fieldnames for the component. Added to the story args with default values, output in the twig file, and placeholders in the less file. If a fieldname is plural ("cards", "people"), it will be treated as an array in story/twig
* `js` - Boolean flag to add a behavior.js file to the component + library
* `removePaddings` - Boolean flag to remove paddings from the story parameters
* `decorator` - Boolean flag to wrap the story output in additional markup

### Output

Running the generator will create a directory with a series of boilerplate files:

1. `components/{component-name}/{component-name}.stories.js`
2. `components/{component-name}/{component-name}.twig`
3. `components/{component-name}/{component-name}.library.js`
4. `components/{component-name}/{component-name}.less`
5. `components/{component-name}/{component-name}.behavior.js`
6. `components/{component-name}/{component-name}.yml`