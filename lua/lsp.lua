local template = require "resty.template"
template.render(string.gsub(ngx.var.uri, "/dynamic/", "", 1) .. ".html")
