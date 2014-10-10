window.UIFactoryModel = Backbone.Model.extend({
//  localStorage: new Backbone.LocalStorage('my-ui'),
  defaults: function () {
    return {
      "data-theme" : 'a'
    }
  },

  getBackHtml : function(){
    var backHtml = '<a data-icon="back" class="back ui-btn-left" data-i18n="Back"></a>';
    return backHtml;
  },

  getTitleHtml : function(screen){
    var titleHtml = '<h1 class="ui-title" role="heading" aria-level="1" data-i18n="'+screen+'"></h1>';
    return titleHtml;
  },

  getMenuHtml : function(){
    var menuHtml = '<a class="ui-btn-right open-app-popup-menu" data-icon="grid">Menu</a>';
    return menuHtml;
  },

  gnrtPopup : function(menu){
    var liEls = '';
    for(var i = 0 ; i < menu.length ; i++){
      liEls += '<li><a href="'+menu[i]['href']+'">'+menu[i]['text']+'</a></li>';
    }
    var popupEls = '<div data-role="popup" data-dismissible="false" class="app-popup-menu">'+
      '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>'+
      '<div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true" style="min-width:210px;">' + liEls + '</ul></div></div>';
    return popupEls;
  },

  gnrtButton : function(button){
    return '<button>'+button["text"]+'</button>';
  }

});

var uiFactoryModel = new UIFactoryModel();

