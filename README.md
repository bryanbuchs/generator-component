# generator-component

Generates a Drupal single directory component and Storybook stories

## Requirements

Requires Yeoman

`npm install -g yo`

## Install

`npm i -g @bryanbuchs/generator-component`

Or, to simplify the `yo` command to `component`:

`npm i -g generator-component@npm:@bryanbuchs/generator-component`

## Run

Run the generator from the theme directory, files will be scaffolded into `components/{component-name}`:

`yo component` and follow the prompts.

### Prompts

* `name` - The base name of the component ("Video")
* `group` - The name of the storybook group for the component ("Media")

The `group` and `name` values will be combined to create the `component-name` ("MediaVideo", "media-video")

* `description` - Optional; added as a comment in the story and behavior files
* `fields` - An areay of fieldnames for the component. Choose a field type for each, and indicate if it is required.
* `js` - Boolean choice to add a behavior.js file to the component + library
* `style` - Select what format (if any) stylesheets are in (`less`, `css`, or none)

### CLI argument and options 

`yo component group-name --fields=field1,field2 --slots=slot1,slot2 --js`

#### `--fields`:

* If a fieldname is plural ("cards", "people"), it will be treated as an array
* If a fieldname begins with "is" or "has" it will be treated as a boolean

### Output

Running the generator will create a directory with a series of boilerplate files:

1. `components/{component-name}/{component-name}.component.yml`
2. `components/{component-name}/{component-name}.stories.js`
3. `components/{component-name}/{component-name}.twig`
4. `components/{component-name}/{component-name}.library.js`
5. `components/{component-name}/{component-name}.(css|less)`
6. `components/{component-name}/{component-name}.behavior.js`
