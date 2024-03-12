import Generator from 'yeoman-generator'
import { capitalCase, kebabCase, pascalCase, sentenceCase } from 'change-case'

import Enquirer from 'enquirer'
const { prompt } = Enquirer

export default class GeneratorTwigComponent extends Generator {
  async prompting() {
    this.answers = await prompt([
      {
        type: 'input',
        name: 'component',
        message: 'Name of component ["card"]'
      },
      {
        type: 'autocomplete',
        limit: 1,
        name: 'group',
        message: 'group ["entity"]',
        choices: [
          '',
          'block',
          'content',
          'entity',
          'field',
          'form',
          'global',
          'media',
          'nav',
          'node',
          'page',
          'paragraph',
          'region',
          'view',
          'widget'
        ],
        default: 0
      },
      {
        type: 'input',
        name: 'description'
      },
      {
        type: 'list',
        name: 'args',
        message: 'arguments ["name, rows, theme"]'
      },
      // {
      //   type: 'list',
      //   name: 'stories',
      //   message:
      //     'names of stories, comma-separated ["default, secondary"]'
      // },
      {
        type: 'toggle',
        name: 'removePaddings',
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

  writing() {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    // => "List Items", "Button", "Page Title"
    const component = capitalCase(this.answers.component)

    // => "Paragraph", "Element", null
    const group = this.answers.group ? pascalCase(this.answers.group) : null

    // => "paragraph-list-items", "element-button", "page-title"
    const tag = group
      ? `${kebabCase(group)}-${kebabCase(component)}`
      : kebabCase(component)

    // => "ParagraphListItems", "ElementButton", "PageTitle"
    const name = group ? group + pascalCase(component) : pascalCase(component)

    const label = capitalCase(component)

    // if (!this.answers.stories.length) {
    //   this.answers.stories.push(name)
    // }

    // => ['paragraph', 'paragraph-list-items']
    const classes = [tag]
    if (group) {
      classes.unshift(group.toLowerCase())
    }

    const props = {
      args: this.answers.args,
      behavior: this.answers.js || false,
      classes: classes,
      decorator: this.answers.decorator,
      description: sentenceCase(this.answers.description),
      forEach: group ? group.toLowerCase() : 'el',
      group: group,
      label: label,
      name: name,
      project: pkg ? pkg.name : 'PROJECT',
      removePaddings: this.answers.removePaddings,
      stories: [name],
      tag: tag,
      title: group ? `${group}/${component}` : component
    }

    const templates = ['less', 'library.js', 'stories.js', 'twig', 'yml']

    if (this.answers.js) {
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
