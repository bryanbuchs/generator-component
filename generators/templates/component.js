Drupal.behaviors.<%= name %> = {
  attach: function (context, settings) {
    const elements = once('<%= name %>', '.<%= tag %>')
    elements.forEach(el => {
      el.classList.add('js')
    })
  },
  detach: function (context, settings) {
    Array.from(context.querySelectorAll('.<%= tag %>')).forEach(el => {
      el.classList.remove('js')
    })
  }
}
