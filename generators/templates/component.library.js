<% if (style) { -%>
import './<%= tag _%>.<%= style _%>'
<%_ } -%>
<% if (behavior) { -%>
import './<%= tag _%>.behavior.js'
<%_ } -%>
