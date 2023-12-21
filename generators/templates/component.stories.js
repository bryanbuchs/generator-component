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

<% stories.forEach(function(story) { %>
// <%= story.name %>
export const <%= story.name %> = {
  name: '<%= story.label _%>',
  render: Component,
  args: {
    label: '<%= story.label _%>',
<% args.forEach(function(arg) { -%>
    <%= arg _%>: 'VALUE',
<% }) -%>
    attributes: new DrupalAttribute()
  }
}
<% }) -%>