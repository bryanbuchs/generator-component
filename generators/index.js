import Generator from 'yeoman-generator'
import converter from 'number-to-words'
import { capitalCase, kebabCase, pascalCase, sentenceCase } from 'change-case'

export default class GeneratorTwigComponent extends Generator {
  constructor(args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.argument('count', { type: Number, required: false, default: 0 }) // the number of additional stories to generate
    this.option('js', { type: Boolean, default: false }) // build a behavior.js file
    this.option('padding', { type: Boolean, default: false }) // set storybook preview paddings on/off
    this.option('decorator', { type: Boolean, default: false }) // wrap the story in a container
    this.option('group', { type: String, required: false, default: '(None)' }) // set a default storybook group
  }

  async prompting() {
    if (!('tag' in this.options)) {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'tag',
          message: 'Name of component ["image", "cards"]'
        },
        {
          type: 'list',
          name: 'group',
          message: 'Component type',
          choices: [
            '(None)',
            'Block',
            'Content',
            'Entity',
            'Field',
            'Global',
            'Media',
            'Nav',
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
          name: 'description'
        },
        {
          type: 'input',
          name: 'stories',
          message:
            'names of additional stories, comma-separated [Default, Secondary]'
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
          .map((i) => {
            return converter.toWords(i + 1)
          })
          .join(',')
      }
    }
  }

  writing() {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    // => "List Items", "Button"m "Page Title"
    const str = this.answers.tag.replaceAll('-', ' ')

    const group = this.answers.group !== '(None)' ? this.answers.group : null

    // => "paragraph-list-items", "button", "page-title"
    const tag = group
      ? `${group.toLowerCase()}-${kebabCase(this.answers.tag)}`
      : kebabCase(this.answers.tag)

    // => "ParagraphListItems", "Button", "PageTitle"
    const name = group ? pascalCase(group) + pascalCase(str) : pascalCase(str)

    const props = {
      tag: tag,
      name: name,
      label: capitalCase(str),
      description: sentenceCase(this.answers.description),
      behavior: this.answers.js || false,
      group: group ? group.toLowerCase() : false,
      title: this.answers.group
        ? `${this.answers.group}/${capitalCase(str)}`
        : capitalCase(str),
      stories: this.answers.stories
        ? this.answers.stories.split(',').map((name) => {
            return {
              name: pascalCase(name.trim()),
              label: capitalCase(name.trim())
            }
          })
        : [],
      decorator: this.answers.parameters.includes('decorator') ? null : '// ',
      paddings: this.answers.parameters.includes('paddings') ? null : '// ',
      project: pkg ? pkg.name : 'PROJECT_NAME'
    }

    const templates = ['less', 'library.js', 'stories.js', 'twig']

    if (this.options.js || this.answers.js) {
      templates.push('behavior.js')
    }

    this.destinationRoot(`components/${props.tag}`)

    templates.forEach((ext) => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}.${ext}`),
        props
      )
    })
  }
}
