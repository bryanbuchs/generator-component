import Generator from 'yeoman-generator'
import { capitalCase, kebabCase, pascalCase, sentenceCase } from 'change-case'

import Enquirer from 'enquirer'
const { prompt, List } = Enquirer

// const { List } = require('enquirer');

export default class GeneratorTwigComponent extends Generator {
  async prompting () {
    this.answers = await prompt([
      {
        type: 'input',
        name: 'tag',
        message: 'Name of component ["card"]'
      },
      {
        type: 'autocomplete',
        limit: 1,
        name: 'group',
        message: 'Component type',
        choices: [
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
          ''
        ],
        default: 0
      },
      {
        type: 'input',
        name: 'description'
      },
      {
        type: 'input',
        name: 'args',
        message:
          'names of component argument keys, comma-separated ["name, rows, theme"]'
      },
      {
        type: 'input',
        name: 'stories',
        message:
          'names of additional stories, comma-separated ["Default, Secondary"]'
      },
      {
        type: 'toggle',
        name: 'paddings',
        message: 'Remove Paddings?',
        default: false
      },
      {
        type: 'toggle',
        name: 'decorator',
        message: 'Add Decorator?',
        default: false
      },
      {
        type: 'toggle',
        name: 'js',
        message: 'Include *.behavior.js file?',
        default: false
      }
    ])
  }

  writing () {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    // => "List Items", "Button", "Page Title"
    const str = this.answers.tag.replaceAll('-', ' ')

    const group = this.answers.group !== '(None)' ? this.answers.group : null

    // => "paragraph-list-items", "button", "page-title"
    const tag = group
      ? `${group.toLowerCase()}-${kebabCase(this.answers.tag)}`
      : kebabCase(this.answers.tag)

    // => "ParagraphListItems", "Button", "PageTitle"
    const name = group ? pascalCase(group) + pascalCase(str) : pascalCase(str)

    const args = this.answers.args ? [...this.answers.args.split(',')].map(arg=>arg.trim()) : []

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
      args: args,
      stories: this.answers.stories
        ? this.answers.stories.split(',').map(name => {
            return {
              name: pascalCase(name.trim()),
              label: capitalCase(name.trim())
            }
          })
        : [{
          name: name.trim(),
          label: str.trim()
        }],
      decorator: this.answers.decorator ? null : '// ',
      paddings: this.answers.paddings ? '// ' : null,
      project: pkg ? pkg.name : 'PROJECT_NAME'
    }

    const templates = ['less', 'library.js', 'stories.js', 'twig']

    if (this.options.js || this.answers.js) {
      templates.push('behavior.js')
    }

    this.destinationRoot(`components/${props.tag}`)

    templates.forEach(ext => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}.${ext}`),
        props
      )
    })
  }
}
