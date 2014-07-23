local template = require "resty.template"
local redis = require "resty.redis"

local red = redis:new()

red:set_timeout(1000) -- 1 sec

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.say("failed to connect: ", err)
    return
end

ok, err = red:set("message", "Hello, World")
if not ok then
    ngx.say("failed to set message: ", err)
    return
end

ok, err = red:set("view", "<h1>{{message}}</h1>")
if not ok then
    ngx.say("failed to set view: ", err)
    return
end

ok, err = red:set("layout", "<html><body>{*view*}</body></html>")

if not ok then
    ngx.say("failed to set layout: ", err)
    return
end

local res, err = red:get("message")
if not res then
    ngx.say("failed to get message: ", err)
    return
end

if res == ngx.null then
    ngx.say("message not found.")
    return
end

local res2, err = red:get("view")
if not res2 then
    ngx.say("failed to get view: ", err)
    return
end

if res2 == ngx.null then
    ngx.say("message not found.")
    return
end

local res3, err = red:get("layout")
if not res3 then
    ngx.say("failed to get layout: ", err)
    return
end

if res3 == ngx.null then
    ngx.say("layout not found.")
    return
end


local view = template.new(res2, res3)

view.message  = res
view:render()
