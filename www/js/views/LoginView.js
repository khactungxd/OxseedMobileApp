window.LoginView = Backbone.View.extend({

  id : "login-screen",

  attributes: {
    'level': 1
  },

  events: {
    "click #submitButton": "login",
    "click .login-status-popup button" : "clkResetLoginForm"
  },

  initialize: function () {
    this.template = _.template(Template.get("login"));
    this.listenToOnce(userModel, 'sync', this.checkLogin);
  },

  login: function (event) {
    event.preventDefault();
    $.mobile.loading("show");
    userModel.login(this.username.val(), this.password.val());
  },

  render: function () {
    $(this.el).html(this.template());
    this.username = this.$("#username");
    this.password = this.$("#password");
    this.status =  this.$(".login-status-popup");
    this.loginForm =  this.$("#loginForm");
  },

  loadContentPage : function(){},

  checkLogin: function () {
    $.mobile.loading("hide");
    return userModel.isAuth() ? (location.hash = "") : this.status.popup("open");
  },

  clkResetLoginForm : function(){
    this.listenToOnce(userModel, "sync", this.checkLogin);
    this.status.popup("close");
    this.loginForm.trigger("reset");
  }
});