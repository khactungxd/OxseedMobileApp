window.DocumentDetailView = Backbone.View.extend({
  document: new DocumentDetailModel(),

  events: {
    "click #document-back": "backClicked"
  },


  initialize: function() {
    this.listenTo(this.document, "sync", this.onPageShown);
    this.listenTo(this.document, "error", processError);
  },

  render: function() {
    this.template = _.template(Template.get("document"));
//    $(this.el).html(this.template());
  },

  loadContentPage : function(){
    this.document.fetch();
  },

  onPageShown: function(model){
    this.showDocumentDetail(model.toJSON());
  },

  showDocumentDetail: function(documnent) {
    $(this.el).html(this.template({document: documnent[0]}));
    $(this.el).trigger('create');
    $.mobile.loading("hide");
  },

  backClicked: function() {
    window.history.back();
  }
})