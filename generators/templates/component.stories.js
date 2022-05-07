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
  label: '<%= title %>',
  content: 'Lorem ipsum dolor sit amet.',
  attributes: new DrupalAttribute(),
}
<% variants.forEach(function(i) { %>
<% const delta = i + 1 -%>
export const Secondary<%= delta %> = Component.bind({})
Secondary<%= delta %>.args = {
  label: '<%= title %> <%= delta %>',
  attributes: new DrupalAttribute()
}
<% }) %>