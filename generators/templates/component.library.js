// imports will be compiled to `../dist/components/<%= tag %>/`
import './<%= tag _%>.less'
<% if (behavior) { -%>
import './<%= tag _%>.behavior.js'
<%_ } -%>
