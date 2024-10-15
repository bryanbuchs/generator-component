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
    <%_ } -%>
  }<% if (decorator) { -%>,<%_ } %>
<% if (decorator) { -%>
  decorators: [story => `<div>${story()}</div>`]
<%_ } -%>
}

<% displays.forEach(display => { -%>
export const <%= display %> = {
  name: '<%= label _%>',
  render: args => Template(args),
  args: {
<% fieldnames.forEach(obj => { -%>
    <%= obj.fieldname _%>: <%- obj.value _%>,
<% }) -%>
    // child: ComponentName.render(ComponentName.args)
  }
}
<% }) -%>