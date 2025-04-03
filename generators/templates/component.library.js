<% for (const [key, value] of Object.entries(imports)) { -%>
import './<%= value %>'; // <%= key %>
<%_ } -%>