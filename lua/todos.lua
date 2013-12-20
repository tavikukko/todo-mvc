local server = require "resty.websocket.server"
local cjson = require "cjson"
local redis = require "resty.redis"
local todo = require "todo"
 
-- start websockets
local wb, err = server:new{
timeout = 100,
max_payload_len = 65535
}
 
if not wb then
    ngx.log(ngx.ERR, "failed to new websocket: ", err)
    return ngx.exit(444)
end
 
-- start redis clients
local red = redis:new()
local sub = redis:new()
 
-- connect to redis
local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "failed to connect redis: ", err)
    return
end
 
-- connect to redis
local ok, err = sub:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "failed to connect redis: ", err)
    return
end
 
sub:set_timeout(1)
 
-- subscribe to "messages"
local res, err = sub:subscribe("messages")
if not res then
    ngx.log(ngx.ERR, "failed to subscribe redis: ", err)
    return
end
 
-- send all todo items to client
todo.init(red, wb, cjson)
 
while true do
    local data, typ, err = wb:recv_frame()
    if wb.fatal then
        ngx.log(ngx.ERR, "failed to receive frame: ", err)
        return ngx.exit(444)
    end
    if not data then
        local bytes, err = wb:send_ping()
        if not bytes then
            ngx.log(ngx.ERR, "failed to send ping: ", err)
            return ngx.exit(444)
        end
    elseif typ == "pong" then
        ngx.log(ngx.INFO, "client ponged: ", err)
    elseif typ == "close" then break
    elseif typ == "text"  then
        -- decode json sent from the client
        jsontodo = cjson.decode(data)
        -- get the action from the json
        action = jsontodo.action
 
        if action == "create" then
            -- create new todo    
            todo.create(red, jsontodo, cjson)
        end
 
        if action == "destroy" then
            -- delete todo
            todo.destroy(red, jsontodo, data)
        end 
 
        if action == "toggle" then
            -- toggle todo completed status
            todo.toggle(red, jsontodo, data)
        end
 
        if action == "update" then
            -- update todo title
            todo.update(red, jsontodo, data)            
        end   
 
        if action == "destroyCompleted" then
            -- delete all completed todos  
            todo.destroyCompleted(red, data)
        end  
 
        if action == "toggleAll" then
            -- change completed value to all todos            
            todo.toggleAll(red, jsontodo, data)
        end
 
        if action == "register" then
            -- register new user
            todo.register(red, jsontodo)
        end
 
        if action == "login" then
            -- login
            todo.login(red, jsontodo)
        end 
 
        if action == "logout" then
            -- logout
            todo.logout(red, jsontodo)
        end 
 
    end
    -- read the reaply from the message
    res, err = sub:read_reply()
    if not res then
        --ngx.log(ngx.ERR, "no data from redis: ", err)
    else
        -- send the reaply to client
        local bytes, err = wb:send_text(res[3])
        if not bytes then
            ngx.log(ngx.ERR, "failed to send text: ", err)
            return ngx.exit(444)
        end
    end
end
wb:send_close()
