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
  // parameters: {
  //   controls: { exclude: [<%- args.map(arg => `'${arg}'`).join(', ') _%>] },
  //   layout: 'fullscreen',
  // },
  // decorators: [story => `<div>${story()}</div>`]
}

<% displays.forEach(display => { -%>
export const <%= display %> = {
  name: '<%= label _%>',
  render: args => Template(args),
  args: {
<% fields.forEach(obj => { -%>
    <%= obj.name _%>: <%- obj.value _%>,
<% }) -%>
    // children: Array(3).fill().map(child => ComponentName.render(ComponentName.args))
  }
}
<% }) -%>