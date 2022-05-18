const Generator = require('yeoman-generator')
const { pascalCase } = require('pascal-case')
const { titleCase } = require('title-case')

module.exports = class GeneratorTwigComponent extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.argument('variants', { type: Number, required: false })
    this.option('js')
    this.option('todo')
  }

  async prompting () {
    if (!('tag' in this.options)) {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'tag',
          message: '(component-name)'
        },
        {
          type: 'number',
          name: 'variants',
          message: 'Generate story variants?',
          default: 0
        },
        {
          type: 'confirm',
          name: 'js',
          message: 'Include *.behavior.js file?',
          default: false
        },
        {
          type: 'confirm',
          name: 'todo',
          message: 'Include TODO.md file?',
          default: false
        }
      ])
    } else {
      this.answers = this.options
    }
  }

  writing () {
    const str = this.answers.tag.replace('-', ' ')
    const props = {
      tag: this.answers.tag,
      name: pascalCase(str),
      title: titleCase(str),
      behavior: this.answers.js || false,
      variants: this.answers.variants
        ? Array.from(Array(this.answers.variants).keys())
        : []
    }

    const extensions = ['less', 'library.js', 'stories.js', 'twig']

    if (this.options.js || this.answers.js) {
      extensions.push('behavior.js')
    }

    this.destinationRoot(props.tag)

    extensions.forEach(ext => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}.${ext}`),
        props
      )
    })

    this.fs.copyTpl(
      this.templatePath('TODO.md'),
      this.destinationPath('TODO.md'),
      props
    )
  }
}
