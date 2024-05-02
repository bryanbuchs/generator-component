/**
 * <%= title %>
 * <%= description %>
 */

import Template from './<%= tag _%>.twig'
import './<%= tag _%>.library.js'

// import another component to use as a child
// import { ComponentName } from '../component-name/component-name.stories.js'

export default {
  title: '<%= title _%>'<% if (removePaddings || decorator) { -%>,<%_ } %>
  parameters: {
    // controls: { disable: true },
<% if (removePaddings) { -%>
    layout: 'fullscreen',
    paddings: { disable: true }
    <%_ } -%>
  }<% if (decorator) { -%>,<%_ } %>
<% if (decorator) { -%>
  decorators: [(story) => `<div>${story()}</div>`]
<%_ } -%>
}

<% stories.forEach(function(story) { -%>
export const <%= story %> = {
  name: '<%= label _%>',
  render: (args) => Template(args),
  args: {
<% args.forEach(function(arg) { -%>
    <%= arg _%>: '<%= arg.toUpperCase() _%>',
<% }) -%>
    // child: ComponentName.render(ComponentName.args)
  }
}
<% }) -%>