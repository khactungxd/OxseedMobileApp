var AbstractView = Backbone.View.extend({

  initialize: function () {
    this.template = _.template(Template.get("placeholder"));
  },

  originalEvents: {
  },

  additionalEvents: {
  },

  events: function () {
    return _.extend({}, this.originalEvents, this.additionalEvents);
  },

  // =============================== Process Header ==========================
  setHeader: function (options) {
    if(options["back"] && options["back"] == true) {
      $(this.el).find(".app-header").append(uiFactoryModel.getBackHtml());
    }
    if(options["title"] && options["title"] != ""){
      $(this.el).find(".app-header").append(uiFactoryModel.getTitleHtml(options["title"]));
    }
    if(options["menu"] && options["menu"] != {}){
      $(this.el).find(".app-header").append(uiFactoryModel.getMenuHtml());
      this.$el.find(".app-header").append(uiFactoryModel.gnrtPopup(options["menu"]));
    }
    this.$el.find(".app-header").trigger("create");
  },

  setHeaderWithHtml: function (html) {
    $(this.el).find(".app-header").html(html).trigger("create");
  },

  // =============================== Process Body ============================
  setBodyWithHtml: function (html) {
    $(this.el).find(".app-body").html(html).trigger("create");
  },

  // ============================== Process Footer ===========================
  setFooter: function () {
    //-- TODO
    // generate button html or html + underscore
  },

  setFooterWithHtml: function (html) {
    $(this.el).find(".app-footer").html(html).trigger("create");
  },

  effectForCollapsible : function(){
    $("#"+this.id+" [data-role='collapsible']").collapsible({
      collapse: function( event, ui ) {
        $(this).children().next().slideUp(500);
      },
      expand: function( event, ui ) {
        $(this).children().next().hide();
        $(this).children().next().slideDown(500);
      }
    });
  }

});