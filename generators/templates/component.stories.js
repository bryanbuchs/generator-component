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

export const Default = Component.bind({})
Default.args = {
  label: '<%= title %>',
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
  title_prefix: '',
  title_suffix: '',
}
<% variants.forEach(function(i) { %>
<% const delta = i + 1 -%>
export const Secondary<%= delta %> = Component.bind({})
Secondary<%= delta %>.args = {
  ...Default.args,
  label: '<%= title %><%= delta %>',
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
}
<% }) %>