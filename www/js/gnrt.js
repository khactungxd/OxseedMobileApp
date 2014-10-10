Template = {

  templates: {},

  loadTemplates: function (templates, callback) {
    var self = this;
    var loadTemplate = function (index) {
      var template = templates[index];
      var url = "templates/" + template + ".html";
      $.ajax({
        method: "GET",
        url : url,
        async : false,
        dataType: 'html',
        success : function(body){
          self.templates[template] = body;
          index++;
          if (index < templates.length) {
            loadTemplate(index);
          } else {
            callback();
          }
        }
      });
    }
    loadTemplate(0);
  },

  get : function(template){
    return this.templates[template];
  }

}
