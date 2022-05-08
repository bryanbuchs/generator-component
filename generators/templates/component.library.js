// imports will be compiled to `../dist/components/<%= tag %>/`
import './<%= tag %>.less'
<% if (behavior) { -%>
import './<%= tag %>.behavior.js'
<%_ } _%>
