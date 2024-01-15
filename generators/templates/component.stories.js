/**
 * <%= title %>
 * <%= description %>
 */

import DrupalAttribute from 'drupal-attribute'

import Template from './<%= tag _%>.twig'
import './<%= tag _%>.library.js'

export default {
  title: '<%= title _%>'<% if (removePaddings || decorator) { -%>,<%_ } %>
<% if (removePaddings) { -%>
  parameters: {
    paddings: { disable: true }
  }<% if (decorator) { -%>,<%_ } %>
<%_ } -%>
<% if (decorator) { -%>
  decorators: [(story) => `<div>${story()}</div>`]
<%_ } -%>
}

<% stories.forEach(function(story) { -%>
export const <%= story %> = {
  name: '<%= label _%>',
  render: Template,
  args: {
<% args.forEach(function(arg) { -%>
    <%= arg _%>: '<%= arg.toUpperCase() _%>',
<% }) -%>
    attributes: new DrupalAttribute()
  }
}
<% }) -%>