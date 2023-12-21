/**
 * <%= title %>
 * <%= description %>
 */

import DrupalAttribute from 'drupal-attribute'

import Component from './<%= tag _%>.twig'
import './<%= tag _%>.library.js'

export default {
  title: '<%= title _%>',
  parameters: {
    <%= paddings _%>paddings: { disable: true }
  },
  <%= decorator _%>decorators: [(story) => `<div style="max-width:1200px">${story()}</div>`]
}
<%_ if (stories.length) { -%>
<% stories.forEach(function(obj) { %>
// <%= obj.name %>
export const <%= obj.name %> = {
  name: '<%= obj.label _%>',
  render: Component,
  args: {
    label: '<%= obj.label _%>',
    attributes: new DrupalAttribute()
  }
}
<% }) -%>
<%_ } else { %>
export const <%= name %> = {
  render: Component,
  args: {
    label: '<%= label _%>',
    attributes: new DrupalAttribute()
  }
}
<%_ } -%>