/*global jQuery, Handlebars */
	'use strict';

	var Utils = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		},
		createCookie: function (name, value, days) {
		    var expires;

		    if (days) {
		        var date = new Date();
		        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		        expires = "; expires=" + date.toGMTString();
		    } else {
		        expires = "";
		    }
		    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
		},
		readCookie: function (name) {
		    var nameEQ = escape(name) + "=";
		    var ca = document.cookie.split(';');
		    for (var i = 0; i < ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		        if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
		    }
		    return null;
		},
		eraseCookie: function (name) {
		    this.createCookie(name, "", -1);
		}
	};

	var App = {
		init: function () {

			FastClick.attach(document.body);
			
			this.ws = new WebSocket('ws://127.0.0.1:88/s');
			
			this.ws.onmessage = function (e) {

				var obj = JSON.parse(e.data);

				switch (obj.action)
				{
					case 'init':
					App.todos.length = 0;

					$.each(obj, function (i, val) {
						if(val.id !== undefined)
							App.todos.push({
								id: val.id,
								title: val.title,
								completed: val.completed
							});				
					});
					break;
					case 'create':
					App.todos.push({
						id: obj.id,
						title: obj.title,
						completed: obj.completed
					});
					break;
					case 'register':
						alert(obj.message);
					break;
					case 'login':
						if(obj.status === 'success')
						{
							$('#currentuser').text(obj.username);
							Utils.createCookie('todo_user', obj.username, 1);
							Utils.createCookie('todo_auth', obj.secret, 1);
						}
						else
						{
							alert(obj.message);
						}				
					break;
					case 'logout':
						if(obj.status === 'success')
						{
							Utils.eraseCookie('todo_user');
							Utils.eraseCookie('todo_auth');
							$('#currentuser').text('');
						}
						else
						{
							alert(obj.message);
						}
					break;
					case 'update':
					$.each(App.todos, function (i, val) {
						if (val.id === obj.id) {
							val.title = obj.title;
							return false;
						}
					});
					break;
					case 'destroy':
					$.each(App.todos, function (i, val) {
						if (val.id === obj.id) {
							App.todos.splice(i, 1);
							return false;
						}
					});
					break;
					case 'toggle':
					$.each(App.todos, function (i, val) {
						if (val.id === obj.id) {
							val.completed = obj.completed;
							return false;
						}
					});
					break;
					case 'toggleAll':
					$.each(App.todos, function (i, val) {
						val.completed = obj.isChecked;
					});
					break;
					case 'destroyCompleted':
					var todos = App.todos;
					var l = todos.length;

					while (l--) {
						if (todos[l].completed)
							todos.splice(l, 1);
					}
					break;
				}
				App.render();

			};
			this.ENTER_KEY = 13;
			this.todos = Utils.store('todos-jquery');
			this.submit = true;
			this.cacheElements();
			this.bindEvents();
			this.filter = null;
			this.render();
		},
		cacheElements: function () {
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.$todoApp = $('#todoapp');
			this.$header = this.$todoApp.find('#header');
			this.$main = this.$todoApp.find('#main');
			this.$footer = this.$todoApp.find('#footer');
			this.$info = $('#info');
			this.$newuser = this.$info.find('#newuser');
			this.$newpassword = this.$info.find('#newpassword');
			this.$newpassword2 = this.$info.find('#newpassword2');
			this.$loginuser = this.$info.find('#loginuser');
			this.$loginpassword = this.$info.find('#loginpassword');
			this.$currentuser = this.$info.find('#currentuser');
			this.$newTodo = this.$header.find('#new-todo');
			this.$toggleAll = this.$main.find('#toggle-all');
			this.$todoList = this.$main.find('#todo-list');
			this.$count = this.$footer.find('#todo-count');
			this.$clearBtn = this.$footer.find('#clear-completed');
		},
		bindEvents: function () {
			var list = this.$todoList;
			this.$newTodo.on('keyup', this.create);
			this.$toggleAll.on('change', this.toggleAll);
			this.$footer.on('click', '#clear-completed', this.destroyCompleted);
			this.$footer.on('click', '#filter-completed', this.filterCompleted);
			this.$footer.on('click', '#filter-active', this.filterActive);
			this.$footer.on('click', '#filter-all', this.filterAll);
			this.$info.on('click', '#register', this.register);
			this.$info.on('click', '#login', this.login);
			this.$info.on('click', '#logout', this.logout);
			list.on('change', '.toggle', this.toggle);
			list.on('dblclick', 'label', this.edit);
			list.on('keypress', '.edit', this.blurOnEnter);
			list.on('blur', '.edit', this.update);
			list.on('click', '.destroy', this.destroy);
		},
		render: function () {
			this.$todoList.html(this.todoTemplate(
				$.grep(this.todos, function( n, i ) {
					if (App.filter == false)
  						return ( n.completed == false );
  					else if (App.filter == true)
  						return ( n.completed == true );
  					else return true;
				})
			));
			this.$main.toggle(!!this.todos.length);
			this.$toggleAll.prop('checked', !this.activeTodoCount());
			this.renderFooter();
			Utils.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.activeTodoCount();
			var footer = {
				activeTodoCount: activeTodoCount,
				activeTodoWord: Utils.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				allClass: App.filter === null ? 'selected' : '',
				activeClass: App.filter === 0 ? 'selected' : '',
				completedClass: App.filter === 1 ? 'selected' : ''
			};

			this.$footer.toggle(!!todoCount);
			this.$footer.html(this.footerTemplate(footer));
		},
		activeTodoCount: function () {
			var count = 0;

			$.each(this.todos, function (i, val) {
				if (!val.completed) {
					count++;
				}
			});

			return count;
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding todo in the todos array
		getTodo: function (elem, callback) {
			var id = $(elem).closest('li').data('id');
			$.each(this.todos, function (i, val) {
				if (val.id === id) {
					callback.apply(App, arguments);
					return false;
				}
			});
		},
		edit: function () {
			var $input = $(this).closest('li').addClass('editing').find('.edit');
			var val = $input.val();

			$input.val(val).focus();
		},
		blurOnEnter: function (e) {
			if (e.which === App.ENTER_KEY) {
				e.target.blur();
			}
		},
		// these function are modified for websocket support
		toggleAll: function () {
			var isChecked = $(this).prop('checked');
			
			//create message to send
			var todo = new Object();
			todo.action = "toggleAll";
			todo.isChecked = isChecked;
	        //send to server
	        App.ws.send(JSON.stringify(todo));
	    },
	    destroyCompleted: function () {
			//create message to send
			var todo = new Object();
			todo.action = "destroyCompleted";
            //send to server
            App.ws.send(JSON.stringify(todo));
        },
	    filterCompleted: function () {
	    	App.setFilter(1);
        },
	    filterActive: function () {
	    	App.setFilter(0);
        },
	    filterAll: function () {
	    	App.setFilter(null);
        },
		setFilter: function (filter) {
	    	App.filter = filter;
	    	App.render();
        },
	    register: function () {
			//create message to send
			var register = new Object();
			register.action = "register";
			register.username = App.$info.find('#newuser').val();
			register.password = App.$info.find('#password').val();
			register.password2 = App.$info.find('#password2').val();
			//send to server
			App.ws.send(JSON.stringify(register));
        },
	    login: function () {
			//create message to send
			var login = new Object();
			login.action = "login";
			login.username = App.$info.find('#loginuser').val();
			login.password = App.$info.find('#loginpassword').val();
			//send to server
			App.ws.send(JSON.stringify(login));
        },
	    logout: function () {
			//create message to send
			var logout = new Object();
			logout.action = "logout";
			logout.auth = Utils.readCookie('todo_auth');
			//send to server
			App.ws.send(JSON.stringify(logout));
        },
        create: function (e) {
        	var $input = $(this);
        	var title = $.trim($input.val());

        	if (e.which !== App.ENTER_KEY || !title) {
        		return;
        	}
        	else if (!App.submit) {
				App.submit = true;
				return;
        	}

        	$input.val('');

			//create message to send
			var todo = new Object();
			todo.action = "create";
			todo.title = title;
			todo.completed = 0;
			//send to server
			App.ws.send(JSON.stringify(todo));
		},
		toggle: function () {
			App.getTodo(this, function (i, val) { 
				//create message to send
				var todo = new Object();
				todo.action = "toggle";
				todo.id = val.id;
				todo.completed = !val.completed;
				//send to server
				App.ws.send(JSON.stringify(todo));
			});
		},
		update: function () {
			var title = $.trim($(this).removeClass('editing').val());

			App.getTodo(this, function (i, val) {
				//create message to send
				var todo = new Object();
				todo.action = "update";
				todo.id = val.id;
				todo.title = title;
				//send to server
				App.ws.send(JSON.stringify(todo));
			});
		},
		destroy: function () {
			App.getTodo(this, function (i, val) {
		        //create message to send
		        var todo = new Object();
		        todo.action = "destroy";
		        todo.id = val.id;
		        //send to server
		        App.ws.send(JSON.stringify(todo));
		    });
		}
	};

	App.init();
