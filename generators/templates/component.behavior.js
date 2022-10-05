/**
* <%= name %>
* <%= description %>
*/
Drupal.behaviors.<%= name %> = {
  attach: function (context, settings) {
    const elements = once('<%= name _%>', '.<%= tag _%>', context)
    elements.forEach(el => {
      // el.classList.add('js')
    })
  }
}
