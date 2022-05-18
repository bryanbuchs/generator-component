const Generator = require('yeoman-generator')
const { pascalCase } = require('pascal-case')
const { titleCase } = require('title-case')
const converter = require('number-to-words')

module.exports = class GeneratorTwigComponent extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.argument('count', { type: Number, required: false, default: 0 })
    this.option('js')
    this.option('todo')
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
          type: 'input',
          name: 'stories',
          message:
            'names of additional stories, comma-separated [First, Second]'
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
      this.answers.stories = ''

      this.log('count', this.options.count)
      if (this.options.count !== 0) {
        this.answers.stories = Array.from(Array(this.options.count).keys())
          .map(i => {
            return converter.toWords(i + 1)
          })
          .join(',')
        this.log(this.answers.stories)
      }
    }
  }

  writing () {
    const str = this.answers.tag.replaceAll('-', ' ')
    const props = {
      tag: this.answers.tag,
      name: pascalCase(str),
      title: titleCase(str),
      behavior: this.answers.js || false,
      stories: this.answers.stories.split(',').map(name => {
        return {
          name: pascalCase(name.trim()),
          title: titleCase(name.trim())
        }
      })
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
