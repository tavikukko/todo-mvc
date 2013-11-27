
var names = ["Task","Task","Task","Task","Task","Task","Task","Task"];

var names = $.map(names,function(value,i) {
    return {'id':i,'name':value};
});

var projects = ["WWW","Intra","Extra","Ylläppito","Takuu"];

var times = ["h","m"];

var times = $.map(times,function(value,i) {
    return {'id':i,'name':value};
});

var projects = $.map(projects,function(value,i) {
    return {'id':i,'name':value};
});
$(function(){
    $inputor = $('#new-todo').atwho({
        at: "+",
        data: "js/data.json",
        tpl: "<li data-value='+${name} #'>${name}</li>",
        callbacks: {
            before_save: function(data) {
                //alert("kko");
                return this.call_default("before_save", data.names);
            },
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "#",
        data: projects,
        tpl: "<li data-value='#${name} @'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "0 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    })
    .atwho({
        at: "1 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "2 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "3 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "4 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "5 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "6 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "7 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "8 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "9 ",
        data: times,
        start_with_space: false,
        tpl: "<li data-value='${atwho-at}${name} +'>${name}</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                value = value.replace(" ","");
                return this.call_default("before_insert", value, li);
            }
        }
    }).atwho({
        at: "@",
        data: names,
        tpl: "<li data-value='@${name}(${id}) '>${name} (${id})</li>",
        callbacks: {
            before_insert: function(value, li){
                //alert("koko");
                App.submit = false;
                return this.call_default("before_insert", value, li);
            }
        }
    });
    $inputor.caret('pos', 47);
    $inputor.focus().atwho('run');
});