'use strict'
const Generator = require('yeoman-generator')
const _ = require('lodash')

_.mixin({ pascalCase: _.flow(_.camelCase, _.upperFirst) })

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('tag', { type: String, required: false })
    this.option('js')
  }

  async prompting () {
    if (!('tag' in this.options)) {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'tag',
          message: '(component-name)'
        },
        {
          type: 'confirm',
          name: 'js',
          message: 'include *.behavior.js file?',
          default: false
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
      title: _.startCase(this.answers.tag),
      behavior: this.options.js || this.answers.js
    }

    const extensions = ['less', 'library.js', 'stories.js', 'twig']

    if (this.options.js || this.answers.js) {
      extensions.push('behavior.js')
    }

    extensions.forEach(ext => {
      this.fs.copyTpl(
        this.templatePath(`component.${ext}`),
        this.destinationPath(`${props.tag}/${props.tag}.${ext}`),
        props
      )
    })
  }
}
