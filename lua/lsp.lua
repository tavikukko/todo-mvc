local template = require "resty.template"
template.render(ngx.var.pathtoluapage .. ".html")
