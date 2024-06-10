/**
 * <%= title %>
 * <%= description %>
 */

import Template from './<%= tag _%>.twig'
import './<%= tag _%>.library.js'

// import another component to use as a child
// import { ComponentName } from '../component-name/component-name.stories.js'

export default {
  title: '<%= title _%>',
  parameters: {
    // controls: { exclude: [<%- fields.map(field => `'${field}'`).join(', ') _%>] },
<% if (!paddings) { -%>
    layout: 'fullscreen',
    paddings: { disable: true }
    <%_ } -%>
  }<% if (decorator) { -%>,<%_ } %>
<% if (decorator) { -%>
  decorators: [story => `<div>${story()}</div>`]
<%_ } -%>
}

<% stories.forEach(function(story) { -%>
export const <%= story %> = {
  name: '<%= label _%>',
  render: args => Template(args),
  args: {
<% fields.forEach(function(field) { -%>
    <%= field _%>: <% if (field.endsWith('s')) { _%> ['<%= field.slice(0, -1).toUpperCase() %>', '<%= field.slice(0, -1).toUpperCase() %>'] <%_ } else { _%> '<%= field.toUpperCase() _%>' <%_ } _%>,
<% }) -%>
    // child: ComponentName.render(ComponentName.args)
  }
}
<% }) -%>