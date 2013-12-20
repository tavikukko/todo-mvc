local todo = {}
 
function todo.init(red, wb, cjson)
    -- create initial json to push to client, incuded all todos
    -- array of todos
    local todos = {}
    todos["action"] = "init"
 
    -- get all todo ids from index
    local alltodos, err = red:sort("todos", "by", "todo:*->id", "get", "todo:*->id", "get", "todo:*->title", "get", "todo:*->completed")
 
    -- create array from the returned list
    index = 1
    for key,value in pairs(alltodos) do 
        if index == 1 then
            todo = {}
            todo["action"] = "create"
            todo["id"] = tonumber(value)
            index = index + 1
        elseif index == 2 then
            todo["title"] = value
            index = index + 1
        elseif 3 == 3 then
            todo["completed"] = tonumber(value)
            table.insert(todos, todo)
            index = 1
        end
    end
 
    -- encode array to json and send to client
    local bytes, err = wb:send_text(cjson.encode(todos))
    if not bytes then
        ngx.log(ngx.ERR, "failed to send text: ", err)
        return ngx.exit(444)
    end
end
 
function todo.register(red, jsontodo)
    
    local register = {}
    -- set values to array
    register["action"] = "register"
 
    local username = jsontodo.username
 
    local userid, err = red:get("username:" .. username .. ":id")
 
    if userid == ngx.null then
 
        local password = jsontodo.password
        local password2 = jsontodo.password2
 
        if password ~= password2 then
            register["status"] = "fail"
            register["message"] = "passwords do not match"
            -- encode array and publish to message quque
            red:publish("messages", cjson.encode(register))
        else
            local userid = red:incr("global:nextuserId")
            red:set("username:" .. username .. ":id", userid)
            red:set("uid:" .. userid .. ":username", username)
            red:set("uid:" .. userid .. ":password", password)
            local authsecret = math.random()
 
            red:set("uid:" .. userid .. ":auth", authsecret)
            red:set("auth:" .. authsecret, userid)
            red:sadd("global:users", userid)
 
            local register = {}
            -- set values to array
            register["action"] = "register"
            register["status"] = "success"
            register["message"] = "registration success, now you can log in"
            -- encode array and publish to message quque
            red:publish("messages", cjson.encode(register))
        end
    else
        register["status"] = "fail"
        register["message"] = "userid taken, choose anotherone!"
        -- encode array and publish to message quque
        red:publish("messages", cjson.encode(register))
 
    end
end
 
function todo.login(red, jsontodo)
 
    local login = {}
    -- set values to array
    login["action"] = "login"
 
    -- parse usrname & password from json
    local username = jsontodo.username
    local password = jsontodo.password
 
    -- check username & password are not empty
    if #username > 0 and #password > 0 then
        -- get username from redis
        local userid, err = red:get("username:" .. username .. ":id") 
        -- check that userid exist
        if userid ~= ngx.null then
            -- get password for the userid
            local realpassword, err = red:get("uid:" .. userid .. ":password")
            -- check that realpassword exist
            if realpassword ~= ngx.null then
                -- check that password is correct
                if password == realpassword then
                    -- get authsecred
                    local authsecret, err = red:get("uid:" .. userid .. ":auth")
                    login["status"] = "success"
                    login["message"] = "authsecret: " .. authsecret
                    login["username"] = username
                    login["secret"] = authsecret
                    -- send success message to client
                    red:publish("messages", cjson.encode(login))
                else
                    -- password did not match
                    login["status"] = "fail"
                    login["message"] = "password incorrect"
                    red:publish("messages", cjson.encode(login))   
                end
            else
                -- password  not found
                login["status"] = "fail"
                login["message"] = "no password found"
                red:publish("messages", cjson.encode(login))   
            end
        else
            -- userid not found
            login["status"] = "fail"
            login["message"] = "no userid found"
            red:publish("messages", cjson.encode(login))
 
        end
    else
        login["status"] = "fail"
        login["message"] = "missing username or password"
        red:publish("messages", cjson.encode(login))
    end
end
 
function todo.logout(red, jsontodo)
 
    local logout = {}
 
    local authcookie = jsontodo.auth
 
    -- get username from redis
    local userid, err = red:get("auth:" .. authcookie)
    -- check that userid exist
    if userid ~= ngx.null then
        local authsecret = red:get("uid:" .. userid .. ":auth")
        if authsecret ~= ngx.null then
            if authsecret == authcookie then
                logout["action"] = "logout" 
                logout["status"] = "success"
                logout["message"] = "logout done"
                local newauthsecret = math.random()
                red:set("uid:" .. userid .. ":auth", newauthsecret)
                red:set("auth:" .. newauthsecret, userid)
                red:del("auth:" .. authsecret)
 
                red:publish("messages", cjson.encode(logout))
            else
                logout["action"] = "logout" 
                logout["status"] = "fail"
                logout["message"] = "auth secret ei mätsää"
                red:publish("messages", cjson.encode(logout))
            end
        else
            logout["action"] = "logout" 
            logout["status"] = "fail"
            logout["message"] = "authsecret oli nul"
            red:publish("messages", cjson.encode(logout))
        end
    else
        logout["action"] = "logout" 
        logout["status"] = "fail"
        logout["message"] = "useridtä oli nul"
        red:publish("messages", cjson.encode(logout))
    end   
end
 
function todo.toggleAll(red, jsontodo, data)
    local isChecked = jsontodo.isChecked
    if isChecked == true then
        todocompleted = "1"
    else
        todocompleted = "0"
    end
    local alltodos, err = red:sort("todos", "by", "todo:*->id")
    for key,value in pairs(alltodos) do 
        uniqId = "todo:" .. value
        local updatetodo, err = red:hmset(uniqId, "completed", todocompleted)
    end
    red:publish("messages", data)
end
 
function todo.destroyCompleted(red, data)
    -- get all todoid's
    local alltodos, err = red:smembers("todos")
    -- loop todoid's and remove completed
    for key,value in pairs(alltodos) do 
        uniqId = "todo:" .. value
        local todo, err = red:hmget(uniqId, "id", "title", "completed")
        completed = tonumber(todo[3])
        if completed == 1 then
            local deleteid, err = red:del(uniqId)
            local removetodo, err = red:srem("todos", value)
        end
    end
    -- send data to client
    red:publish("messages", data)
end
 
function todo.update(red, jsontodo, data)
    -- get todo id and title from json
    todoid = jsontodo.id
    todotitle = jsontodo.title
    -- generate todoid
    uniqId = "todo:" .. todoid
    -- update todo
    local updatetodo, err = red:hset(uniqId, "title", todotitle)
    -- send data to client
    red:publish("messages", data)
end
 
function todo.toggle(red, jsontodo, data)
    -- get todoid from json
    todoid = jsontodo.id
    -- convert true to 1 and false to 0
    if jsontodo.completed == true then
        todocompleted = "1"
    else
        todocompleted = "0"
    end
    -- generate todoid
    uniqId = "todo:" .. todoid
    -- update todo completed value
    local toggletodo, err = red:hset(uniqId, "completed", todocompleted)
    -- send data to client
    red:publish("messages", data)
end
 
function todo.destroy(red, jsontodo, data)
    -- get todo id from json
    todoid = jsontodo.id
    -- generate todoid
    uniqId = "todo:" .. todoid
    -- delete todoid
    local deletetodo, err = red:del(uniqId)
    -- remove todoid
    local removetodo, err = red:srem("todos", todoid)
    -- send data to client
    red:publish("messages", data)
end
 
function todo.create(red, jsontodo, cjson)
    -- get new id
    newtodoid = red:incr("todo:ids")
    -- get todo data from json
    todotitle = jsontodo.title
    todocompleted = jsontodo.completed
    -- generate id
    uniqId = "todo:" .. newtodoid
    -- create todo to redis
    local createtodo, err = red:hmset(uniqId, "id", newtodoid, "title", todotitle, "completed", todocompleted)
    -- add todoid to todos
    local addtodoid, err = red:sadd("todos", newtodoid)
    -- get created todo
    local newtodo, err = red:hmget(uniqId, "id", "title", "completed")
    -- create new todo array
    local todo = {}
    -- set values to array
    todo["action"] = "create"
    todo["id"] = tonumber(newtodo[1])
    todo["title"] = newtodo[2]
    todo["completed"] = tonumber(newtodo[3])
    -- encode array and publish to message quque
    red:publish("messages", cjson.encode(todo))
end
 
return todo
