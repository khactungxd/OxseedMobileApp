var SettingView = AbstractView.extend({

  id : "setting-screen",

  additionalEvents : {
    "click #save-new-password" : "clkSaveNewPassword",
    "click .setting-status-popup button" : "clkClosePopup",
    "change .setting-language input[type=radio][name=language]" : "clkSelectLanguage"
  },

  initialize: function () {
    var thisScreen = this;
    this.constructor.__super__.initialize.apply(this);
  },

  render: function () {
    $(this.el).html(this.template());
    this.appBody = _.template(Template.get("setting"));
    this.setHeader({back : true,title: "setting"});
    this.setBodyWithHtml(this.appBody());
  },

  loadContentPage : function(){
    var thisScreen = this;
    $(document).one("pagebeforeshow", function(){
      thisScreen.effectForCollapsible();
      thisScreen.$el.find(".setting-language h3 a").attr("data-i18n","Language");
      thisScreen.$el.find(".setting-change-password h3 a").attr("data-i18n","password_left");
      changeLanguage();
      $('.setting-language input[type=radio][value='+lngApp+']').prev().toggleClass("ui-radio-off ui-radio-on");
    });
  },

  clkSelectLanguage : function(event){
    lngApp = $(event.currentTarget).attr("value");
    window.localStorage.setItem("lng",lngApp);
    changeLanguage();
  },

  clkSaveNewPassword : function(event){
    var thisScreen = this;
    event.preventDefault();
    var newPW = $("#new-password").val();
    var cfPW = $("#confirm-password").val();
    if(newPW != cfPW){
      $(".change-ps-status").text("Password and confirm password not equal").show("fast");
    } else {
      $.mobile.loading("show");
      userModel.changePassword(newPW,function(statusCode){
        $.mobile.loading("hide");
        if(statusCode == 200){
          $(".setting-status-popup p").text("Change password success ...!");
          $(".setting-status-popup").popup("open");
          $("#changePasswordForm").trigger("reset");
        } else {
          $(".setting-status-popup p").text("Change password error ...! ");
          $(".setting-status-popup").popup("open");
        }
      });
    }
  },

  clkClosePopup : function(){
    $(".setting-status-popup").popup("close");
  }

});