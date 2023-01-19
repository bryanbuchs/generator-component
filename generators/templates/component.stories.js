/**
* <%= name %>
* <%= description %>
*/

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
  decorators: [story => `<div class="max-width:1200px">${story()}</div>`]
<% } -%>
}


// import sub-components
// ---------------------

// import SubTemplate from '../component/component.twig'
// import { Default as SubStory } from '../component/component.stories.js'
// const SubComponent = () => {
//   return SubTemplate({
//     ...SubStory.args
//   })
// }

const Component = ({ label, ...args }) => {
  return Template({ label, ...args })
}

<% if (behavior) { -%>
<% stories.forEach(function(obj) { %>
export const <%= obj.name %> = Component.bind()
<%= obj.name %>.args = {
  label: '<%= obj.label _%>',
  attributes: new DrupalAttribute(),
}
<% }) -%>
<% } else { %>
// <%= label _%>
export const Default = Component.bind()
Default.args = {
  label: '<%= label _%>',
  attributes: new DrupalAttribute(),
}
<%_ } -%>