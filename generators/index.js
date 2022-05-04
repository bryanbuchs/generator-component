'use strict'
const Generator = require('yeoman-generator')
const _ = require('lodash')

_.mixin({ pascalCase: _.flow(_.camelCase, _.upperFirst) })

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
  }

  async prompting () {
    if (!('tag' in this.options)) {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'tag',
          message: '(component-name)'
        }
      ])
    } else {
      this.answers = this.options
    }
  }

  writing () {
    const props = {
      tag: this.answers.tag,
      name: _.pascalCase(this.answers.tag),
      title: _.startCase(this.answers.tag)
    }

    const extensions = ['js', 'less', 'library.js', 'stories.js', 'twig']

    extensions.forEach(ext => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}/${props.tag}.${ext}`),
        props
      )
    })
  }
}
