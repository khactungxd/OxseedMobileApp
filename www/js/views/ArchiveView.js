window.ArchiveView = AbstractView.extend({
  treeModel: new FolderTreeModel(),
  processList: new ProcessListModel(),

  id: "archive-screen",

  attributes: {
    'level': 1
  },

  additionalEvents: {
    "click #archive-refresh": "clkRefreshFolderTree",
    "click #folder-tree li a": "clkChooseProcess"
  },

  initialize: function () {
    this.constructor.__super__.initialize.apply(this);
    this.appBody = _.template(Template.get("archive"));
    var thisScreen = this;
    this.listenTo(this.treeModel, "sync", this.onPageShown);
    this.listenTo(this.treeModel, "error", processError);
    $(document).on("click", "#archive-screen .open-app-popup-menu", this.clkOpenMenu);
  },

  // RETURN A STATIC HTML PAGE
  render: function () {
    $(this.el).html(this.template());
    this.setHeader({title: "Archive", menu: [
      {href: "#search", text: "Search"},
      {href: "#setting", text: "Setting"},
      {href: "#logout", text: "Logout"}
    ]});
//    this.setFooterWithHtml('<h1 class="ui-title"></h1>' +
//      '<span class="ui-btn-left ui-corner-all ui-icon-refresh ui-btn-icon-notext" id="archive-refresh"></span>');
    this.setFooterWithHtml('<a style="margin: 5px 50px;" href="#" data-role="button" data-icon="refresh" id="archive-refresh">Refresh</a>');
  },

  loadContentPage: function () {
    var thisScreen = this;
    $(document).one("pagecontainershow", function () {
      thisScreen.clkRefreshFolderTree();
    })
  },

  onPageShown: function (model) {
    var thisScreen = this;
    thisScreen.showFolderTree(model.toJSON());
  },

  clkRefreshFolderTree: function () {
    $.mobile.loading('show');

    // get folder tree from services
    this.treeModel.fetch({
      reset: true,
      beforeSend: function (xhr) {
//        xhr.setRequestHeader('X-SOLERA-AUTH-TOKEN', "f11cc6b0cfda7676915dea229a0d4a65e3b1573700ca85a9aacd6e0b0615edbd");
        xhr.setRequestHeader('Authorization', userModel.getAuthorization());
      }
    });
  },

  showFolderTree: function (folderTree) {
    this.setBodyWithHtml(this.appBody(folderTree));
    $.mobile.loading("hide");
    this.effectForCollapsible();
  },

// --------------------------------------------   Process event click view--------------------------------
  clkChooseProcess: function (e) {
    var parameter = {
      action: "PROCESS",
      mandant: "wackler",
      wt: "oxseed_json",
      paths: e.currentTarget.attributes["my-path"].value
    };
    location.hash = "#processlist?" + $.param(parameter);
  },

  switchToProcesslistPage: function () {
    location.hash = "#processlist";
  },

  clkOpenMenu: function () {
    $("#archive-screen .app-popup-menu").popup("open", { transition: "pop" });
  }

});
