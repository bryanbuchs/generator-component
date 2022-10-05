import DrupalAttribute from 'drupal-attribute'

// include this component's CSS, JS, and HTML
import './<%= tag _%>.library.js'
import Template from './<%= tag _%>.twig'

export default {
  title: '<%= title _%>',
  parameters: {
<% if (parameters.includes("paddings")) { -%>
    paddings: { disable: true }
<% } -%>
  },
<% if (parameters.includes("decorator")) { -%>
  decorators: [story => `<div class="skirball-region-content">${story()}</div>`]
<% } -%>
}

const Component = ({ label, ...args }) => {
  return Template({ label, ...args })
}

export const Default = Component.bind({})
Default.args = {
  label: '<%= label _%>',
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
}

<% stories.forEach(function(obj) { %>
export const <%= obj.name %> = Component.bind({})
<%= obj.name %>.args = {
  ...Default.args,
  label: '<%= obj.label _%>',
  attributes: new DrupalAttribute(),
  title_attributes: new DrupalAttribute(),
}
<% }) -%>