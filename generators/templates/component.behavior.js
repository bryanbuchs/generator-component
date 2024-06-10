/**
 * <%= title %>
 * <%= description %>
 */

Drupal.behaviors.<%= name %> = {
  attach: function (context) {
    const elements = once('<%= name _%>', '.<%= tag _%>', context)
    elements.forEach(<%= forEach %> => {
      // ...
    })
  }
}
