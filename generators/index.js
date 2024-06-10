import Generator from 'yeoman-generator'
// import { capitalCase, kebabCase, pascalCase, sentenceCase } from 'change-case'

import inflection from 'inflection'

import Enquirer from 'enquirer'
const { prompt } = Enquirer

export default class GeneratorTwigComponent extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // set defaults to pass to prompting()
    this.args.group = 0
    this.args.component = null

    if (this.args.length) {
      const input = this.args[0].split('-')

      switch (input.length) {
        case 2:
          this.args.group = input[0]
          this.args.component = input[1]
          break

        case 1:
          this.args.component = input[0]
          break
      }
    }

    this.log(`Creating a new component: ${this.args.component}`)
    this.log(`Group: ${this.args.group}`)
  }

  async prompting () {
    this.answers = await prompt([
      {
        type: 'input',
        name: 'component',
        message: 'Name of component ["card"]',
        default: this.args.component
      },
      {
        type: 'select',
        name: 'group',
        message: 'Storybook group ["entity"]',
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
        initial: this.args.group
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description of component ["A card component"]'
      },
      {
        type: 'list',
        name: 'fields',
        message: 'Story arguments ["title, cards, theme"]'
      },
      // {
      //   type: 'list',
      //   name: 'stories',
      //   message:
      //     'names of stories, comma-separated ["default, secondary"]'
      // },
      {
        type: 'toggle',
        name: 'js',
        message: 'Include *.behavior.js file?',
        default: this.options.js ? true : false
      },
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
      }
    ])
  }

  writing () {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    // => "List Items", "Button", "Page Title"
    const component = inflection.titleize(this.answers.component)

    // => "Paragraph", "Element", null
    const group = this.answers.group
      ? inflection.camelize(this.answers.group)
      : null

    // => "paragraph-list-items", "element-button", "page-title"
    let tag = group
      ? `${inflection.dasherize(group)}-${inflection.dasherize(component)}`
      : inflection.dasherize(component)
    tag = tag.toLowerCase()

    // => "ParagraphListItems", "ElementButton", "PageTitle"
    const name = group
      ? group + inflection.camelize(component)
      : inflection.camelize(component)

    const label = inflection.titleize(component)

    // if (!this.answers.stories.length) {
    //   this.answers.stories.push(name)
    // }

    // => ['paragraph', 'paragraph-list-items']
    const classes = [tag]
    if (group) {
      classes.unshift(group.toLowerCase())
    }

    const fieldnames = this.answers.fields.map(fieldname => {
      fieldname = fieldname.toLowerCase()

      let obj = {
        isPlural: inflection.pluralize(fieldname) === fieldname,
        singular: inflection.singularize(fieldname)
      }

      return {
        ...obj,
        fieldname: fieldname,
        value: obj.isPlural
          ? '[' +
            Array(3).fill(`'${obj.singular.toUpperCase()}'`).join(', ') +
            ']'
          : `'${obj.singular.toUpperCase()}'`
      }
    })

    const props = {
      fieldnames: fieldnames,
      fields: this.answers.fields,
      behavior: this.answers.js || false,
      classes: classes,
      decorator: this.answers.decorator,
      description: inflection.humanize(this.answers.description),
      forEach: group ? group.toLowerCase() : 'el',
      group: group,
      label: label,
      name: name,
      project: pkg ? pkg.name : 'PROJECT',
      paddings: !this.answers.removePaddings,
      displays: [name],
      tag: tag,
      title: group ? `${group}/${component}` : component
    }

    const templates = ['less', 'library.js', 'stories.js', 'twig', 'yml']

    if (this.answers.js) {
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
