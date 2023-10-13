import Generator from 'yeoman-generator'
import { pascalCase } from 'pascal-case'
import { titleCase } from 'title-case'
import converter from 'number-to-words'

export default class GeneratorTwigComponent extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.argument('count', { type: Number, required: false, default: 0 })
    this.option('js', { type: Boolean, default: false })
    this.option('padding', { type: Boolean, default: false })
    this.option('decorator', { type: Boolean, default: false })
    this.option('group', { type: String, required: false, default: '(None)' })
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
          name: 'description'
        },
        {
          type: 'list',
          name: 'group',
          message: 'Storybook group [type/component-name]',
          choices: [
            '(None)',
            'Block',
            'Content',
            'Field',
            'Media',
            'Menu',
            'Node',
            'Page',
            'Paragraph',
            'Region',
            'View',
            'Widget',
            'OTHER'
          ],
          default: 0
        },
        {
          type: 'input',
          name: 'stories',
          message:
            'names of additional stories, comma-separated [FirstOne, SecondOne]'
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
              name: 'Add decorator',
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
      this.answers.stories = null
      this.answers.parameters = []
      if (this.options.padding) {
        this.answers.parameters.push('paddings')
      }
      if (this.options.decorator) {
        this.answers.parameters.push('decorator')
      }
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
      description: this.answers.description,
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
