/**
 * <%= title %>
 * <%= description %>
 */

Drupal.behaviors.<%= name %> = {
  attach: function (context, settings) {
    const elements = once('<%= name _%>', '.<%= tag _%>', context)
    elements.forEach((<%= forEach _%>) => {
      // do stuff
    })
  }
}
