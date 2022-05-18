/**
* <%= name %>
* DESCRIPTION
*/
Drupal.behaviors.<%= name %> = {
  attach: function (context, settings) {
    const elements = once('<%= name _%>', '.<%= tag _%>', context)
    elements.forEach(el => {
      // el.classList.add('js')
    })
  }
  // detach: function (context, settings) {
  //   Array.from(context.querySelectorAll('.<%= tag _%>')).forEach(el => {
  //     el.classList.remove('js')
  //   })
  // }
}
