import DrupalAttribute from 'drupal-attribute'

// include this component's CSS, JS, and HTML
import './<%= tag %>.library.js'
import Template from './<%= tag %>.twig'

export default {
  title: '<%= title %>',
  parameters: {}
}

const Component = ({ label, ...args }) => {
  return Template({ label, ...args })
}

export const Primary = Component.bind({})
Primary.args = {
  label: '<%= name %>',
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
  plugin_id: 'some_plugin_id',
  title_prefix: '',
  title_suffix: '',
  content: 'Lorem ipsum dolor sit amet.',
  configuration: {
    provider: 'some_module_name'
  }
}
