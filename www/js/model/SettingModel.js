window.SettingModel = Backbone.Model.extend({

  localStorage: new Backbone.LocalStorage('setting'),

  defaults: function () {
    return {

    }
  }
});
