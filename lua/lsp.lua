local template = require "resty.template"

local f=io.open(ngx.var.template_root .. "/" .. ngx.var.pathtoluapage .. ".html","r")
if f~=nil then
  io.close(f)
  template.render(ngx.var.pathtoluapage .. ".html")
else
  ngx.say("page not found")
end
