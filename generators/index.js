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

    // add option for style format. pass "false" to disable style generation. defaults to LESS
    this.options.style = opts.css == 'false' ? null : opts.css || 'less'
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
        style: this.options.style || null,
        description: `A ${this.options.component} component`
      }
      return
    }

    console.log('start prompting')
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
          { message: 'Block', value: 'block' },
          { message: 'Content', value: 'content' },
          { message: 'Entity', value: 'entity' },
          { message: 'Field', value: 'field' },
          { message: 'Form', value: 'form' },
          { message: 'Global', value: 'global' },
          { message: 'Media', value: 'media' },
          { message: 'Nav', value: 'nav' },
          { message: 'Node', value: 'node' },
          { message: 'Page', value: 'page' },
          { message: 'Paragraph', value: 'paragraph' },
          { message: 'Region', value: 'region' },
          { message: 'View', value: 'view' },
          { message: 'Widget', value: 'widget' },
          { message: '-none-', value: '' }
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
                { message: 'Array', value: 'array' },
                { message: 'Boolean', value: 'boolean' },
                { message: 'Number', value: 'number' },
                { message: 'Object', value: 'object' },
                { message: 'String', value: 'string' },
                // @TODO: "Reference" type -- would trigger adding child component code to stories, but the literal field type is still a string
                { message: 'Slot', value: 'slot' }
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
        name: 'style',
        type: 'select',
        message: 'Style format',
        choices: [
          { message: 'LESS', value: 'less' },
          { message: 'CSS', value: 'css' },
          { message: '-none-', value: false }
        ]
      }
    ])

    // Merge the remaining answers into this.answers
    Object.assign(this.answers, remainingAnswers)
  }

  writing () {
    this.answers.group =
      this.answers.group == '-none-' ? null : this.answers.group

    this.answers.style =
      this.answers.style == '-none-' ? null : this.answers.style

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

    // @TODO: add default values for slots in storybook?
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

    // imports
    const imports = [
      ...(this.answers.style ? [`${tag}.${this.answers.style}`] : []),
      ...(this.answers.js ? [`${tag}.behavior.js`] : [])
    ]

    // exports is an object that has keys for the css and js paths
    const exports = {
      ...(this.answers.style && {
      style: this.answers.style === 'css'
        ? `${tag}.${this.answers.style}`
        : `../../dist/${tag}.css`
      }),
      ...(this.answers.js && { script: `../../dist/${tag}.js` })
    }

    const props = {
      fields: fields,
      required: requiredFields,
      slots: slots,
      args: args,
      cssClasses: cssClasses,
      description: inflection.humanize(this.answers.description),
      forEach: group ? group.toLowerCase() : 'el',
      group: group,
      label: label,
      name: name,
      project: pkg ? pkg.name : 'PROJECT',
      displays: [name],
      tag: tag,
      imports: imports,
      exports: exports,
      title: group ? `${group}/${titleized}` : titleized
    }

    const templates = [
      'component.yml',
      'twig',
      'stories.js',
      this.answers.style || this.answers.js ? 'library.js' : null,
      this.answers.style ? this.answers.style : null,
      this.answers.js ? 'behavior.js' : null
    ].filter(Boolean)

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
