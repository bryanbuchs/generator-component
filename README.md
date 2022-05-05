# generator-twig-component

Install:

`npm i -g git@github.com:bryanbuchs/generator-twig-component.git`

Run:

`yo twig-component {component-name}` or `yo twig-component` and follow the prompts.

Options:

JS: `yo twig-component {component-name} --js` to include a `*.behavior.js` file in your component, or enter "Y" at the prompt

Running the generator will create a folder of `{component-name}` with a series of boilerplate files:

1. `{component-name}.less`
2. `{component-name}.library.js`
3. `{component-name}.stories.js`
4. `{component-name}.twig`
5. `{component-name}.behavior.js` (optional)

