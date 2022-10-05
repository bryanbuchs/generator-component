const Generator = require('yeoman-generator')
const { pascalCase } = require('pascal-case')
const { titleCase } = require('title-case')
const converter = require('number-to-words')

module.exports = class GeneratorTwigComponent extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.argument('count', { type: Number, required: false, default: 0 })
    this.option('js', { type: Boolean, default: false })
  }

  async prompting () {
    if (!('tag' in this.options)) {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'tag',
          message: 'name of component [component-name]'
        },
        {
          type: 'list',
          name: 'group',
          message: 'Storybook grouping',
          choices: [
            '(None)',
            'Block',
            'Field',
            'Media',
            'Menu',
            'Node',
            'Page',
            'Paragraph',
            'Region',
            'Widget',
            'OTHER'
          ],
          default: 0
        },
        {
          type: 'input',
          name: 'stories',
          message:
            'names of additional stories, comma-separated [First, Second]'
        },
        {
          type: 'checkbox',
          name: 'parameters',
          message: 'Storybook options',
          choices: [
            {
              name: 'Remove paddings',
              value: 'paddings',
              short: 'no-paddings'
            },
            {
              name: 'Add content wrapper',
              value: 'decorator',
              short: 'add-wrapper'
            }
          ]
        },
        {
          type: 'confirm',
          name: 'js',
          message: 'Include *.behavior.js file?',
          default: false
        }
      ])
    } else {
      this.answers = this.options
      this.answers.stories = ''
      if (this.options.count !== 0) {
        this.answers.stories = Array.from(Array(this.options.count).keys())
          .map(i => {
            return converter.toWords(i + 1)
          })
          .join(',')
      }
    }
  }

  writing () {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    const str = this.answers.tag.replaceAll('-', ' ')

    this.answers.group =
      this.answers.group !== '(None)' ? this.answers.group : null

    const props = {
      tag: this.answers.tag,
      name: pascalCase(str),
      label: titleCase(str),
      behavior: this.answers.js || false,
      group: this.answers.group ? this.answers.group.toLowerCase() : false,
      title: this.answers.group
        ? `${this.answers.group}/${titleCase(str)}`
        : titleCase(str),
      stories: this.answers.stories
        ? this.answers.stories.split(',').map(name => {
          return {
            name: pascalCase(name.trim()),
            label: titleCase(name.trim())
          }
        })
        : [],
      parameters: this.answers.parameters || null,
      project: pkg ? pkg.name : 'PROJECT'
    }

    console.log(this.answers.parameters)

    const extensions = ['less', 'library.js', 'stories.js', 'twig']

    if (this.options.js || this.answers.js) {
      extensions.push('behavior.js')
    }

    this.destinationRoot(`components/${props.tag}`)

    extensions.forEach(ext => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}.${ext}`),
        props
      )
    })
  }
}
