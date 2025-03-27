import Generator from 'yeoman-generator'
import inflection from 'inflection'
import Enquirer from 'enquirer'

const { prompt } = Enquirer

export default class GeneratorSDC extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // Parse command-line arguments
    const [groupComponent] = args || []
    if (groupComponent) {
      const [group, component] = groupComponent.split('-')
      this.options.group = group
      this.options.component = component
    }

    if (opts.fields) {
      this.options.fields = opts.fields.split(',').map(field => {
        const isBoolean = field.startsWith('is') || field.startsWith('has')
        const name = isBoolean ? field.replace(/^(is|has)/, '') : field
        return {
          name: name.toLowerCase(),
          type: isBoolean
            ? 'boolean'
            : field.endsWith('s')
            ? 'array'
            : 'string',
          required: true
        }
      })
    }

    if (opts.slots) {
      // Ensure fields array exists
      this.options.fields = this.options.fields || []
      // Append slots to fields array
      this.options.fields.push(
        ...opts.slots.split(',').map(slot => ({
          name: slot,
          type: 'slot'
        }))
      )
    }

    this.options.js = !!opts.js
  }

  async prompting () {
    if (this.options.component && this.options.group) {
      // Skip prompts if arguments are provided
      this.answers = {
        component: this.options.component,
        group: this.options.group,
        fields: this.options.fields || [],
        slots: [], // Slots are now part of fields
        js: this.options.js,
        removePaddings: false,
        decorator: false,
        description: `A ${this.options.component} component`
      }
      return
    }

    // Prompt for component name and group first
    this.answers = await prompt([
      {
        type: 'input',
        name: 'component',
        message: 'Name of component ["card"]'
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
          ''
        ]
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

      const fieldType =
        fieldName.startsWith('is') || fieldName.startsWith('has')
          ? 'boolean'
          : await prompt({
              type: 'select',
              name: 'fieldType',
              message: `Field Type:`,
              choices: [
                'array',
                'boolean',
                'number',
                'object',
                'slot',
                'string'
              ]
            }).then(response => response.fieldType)

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

      this.answers.fields.push({
        name: fieldName,
        type: fieldType,
        required: fieldRequired
      })
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

    const args = [
      ...fields.map(field => field.name),
      ...slots.map(slot => slot.name)
    ]

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
