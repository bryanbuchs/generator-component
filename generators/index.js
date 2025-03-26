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
  }

  async prompting () {
    // Prompt for component name and group first
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
        message: 'Group ["entity"]',
        choices: [
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
          'widget',
          '',
        ],
        initial: this.args.group
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description of component ["A card component"]'
      }
    ])

    // Prompt for fields as a group (name and type)
    this.answers.fields = []
    while (true) {
      const { fieldName } = await prompt({
        type: 'input',
        name: 'fieldName',
        message: 'Field Name:'
      })

      if (!fieldName) break

      const { fieldType } = await prompt({
        type: 'select',
        name: 'fieldType',
        message: `Field Type":`,
        choices: ['string', 'number', 'boolean', 'array', 'object', 'slot']
      })

      let fieldRequired = false
      if (fieldType !== 'slot') {
        const response = await prompt({
          type: 'toggle',
          name: 'fieldRequired',
          message: `Required?`,
          default: false
        })
        fieldRequired = response.fieldRequired
      }

      this.answers.fields.push({ name: fieldName, type: fieldType, required: fieldRequired })
    }

    // Prompt for the remaining questions
    const remainingAnswers = await prompt([
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

    // Merge the remaining answers into this.answers
    Object.assign(this.answers, remainingAnswers)
  }

  writing () {
    const pkg = this.fs.readJSON(`${this.contextRoot}/package.json`)

    // Separate fields into `fields` and `slots`
    const fields = this.answers.fields
      .filter(field => field.type !== 'slot')
      .map(field => {
        const singular = inflection.singularize(field.name)
        const plural = inflection.pluralize(field.name)

        let value
        switch (field.type) {
          case 'array':
            value = Array(3).fill(`'${singular.toUpperCase()}'`)
            value = `[${value.join(', ')}]`
            break
          case 'boolean':
            value = true
            break
          case 'string':
            value = `'${field.name.toUpperCase()}'`
            break
          case 'object':
            value = `{ key: 'value' }`
            break
          case 'number':
            value = 3
            break
          default:
            value = `null`
        }

        return {
          ...field,
          label: inflection.titleize(field.name),
          singular: field.type === 'array' ? singular : undefined,
          plural: field.type === 'array' ? plural : undefined,
          value: value
        }
      })


    const requiredFields = this.answers.fields
      .filter(field => field.required)
      .map(field => field.name)


    // @TODO: add default values for slots?
    const slots = this.answers.fields
      .filter(field => field.type === 'slot')
      .map(slot => ({
        name: slot.name,
        label: inflection.titleize(slot.name)
      }))

    // replace all punctuation in the string `component` with spaces, then remove any double-spaces
    // "page-title" => "page title"
    const spaced = this.answers.component
      .replace(/[^\w\s]|_/g, ' ')
      .replace(/\s+/g, ' ')

    // => "Paragraph", "Element", null
    const group = this.answers.group
      ? inflection.camelize(this.answers.group)
      : null

    // replace all spaces with underscores
    // "page title" => "page_title"
    const underscored = spaced.replace(/\s/g, '_')

    // replace all underscores with dashes
    // "page_title" => "page-title"
    const dasherized = inflection.dasherize(underscored)

    // titleize the string
    // "page title" => "Page Title"
    const titleized = inflection.titleize(spaced)

    // camelize the string
    // "page_title" => "PageTitle"
    const camelized = inflection.camelize(underscored)

    // => "paragraph-list-items", "element-button", "page-title"
    let tag = group
      ? `${inflection.dasherize(group)}-${dasherized}`
      : dasherized
    tag = tag.toLowerCase()

    // => "ParagraphListItems", "ElementButton", "PageTitle"
    const name = group ? group + camelized : camelized

    const label = titleized

    // => ['paragraph', 'paragraph-list-items']
    const cssClasses = [tag]
    if (group) {
      cssClasses.unshift(group.toLowerCase())
    }

    const args = [...fields.map(field => field.name), ...slots.map(slot => slot.name)];

    const props = {
      fields: fields,
      required: requiredFields,
      slots: slots,
      args: args,
      behavior: this.answers.js || false,
      cssClasses: cssClasses,
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
      title: group ? `${group}/${titleized}` : titleized
    }

    const templates = [
      'less',
      'library.js',
      'stories.js',
      'twig',
      'component.yml'
    ]

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
