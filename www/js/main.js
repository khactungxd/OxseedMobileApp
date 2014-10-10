var appScreenStack = appScreenStack || [];
var lngApp = window.localStorage.getItem("lng") || "de";
var AppRouter = Backbone.Router.extend({

  //=========================== BACKBONE ROUTER INIT ===================
  initialize: function () {
    console.log("init Backbone router")
    this.firstPage = true;
    this.reverse = false;
    // Handle back button throughout the application
    $(document.body).on('click', '.back', function (event) {
      event.preventDefault();
      navigatorWithBackButton();
    });
  },

  // ========================== DEFINE ROUTER ==============================
  routes: {
    "": "archive",
    "login": "login",
    "search": "search",
    "processlist": "processlist",
    "setting": "setting",
    "document": "document",
    "logout": "logout"
  },

  //============================ URL AUTHENTICATE =======================
  execute: function (callback, args) {
    userModel.fetch({async: false});
    var route = this.routes[Backbone.history.fragment];
    if (userModel.isAuth() && route != "login") {
      callback.apply(this, args);
    } else if (userModel.isAuth() && route == "login") {
      location.hash = "";
    } else if (!userModel.isAuth() && route == "login") {
      callback.apply(this, args);
    } else {
      location.hash = "#login";
    }
  },

  // ===================== START ROUTER ==============================
  login: function () {
    this.changePage(new LoginView());
  },

  logout: function () {
    userModel.destroy({
      success: function (model) {
        console.log(userModel.toJSON());
        userModel.clear().set(model.defaults)
        location.hash = "#login";
      },
      error: function () {
        location.hash = "#";
      }
    });
  },

  search: function () {
    this.changePage(new SeachView());
  },

  archive: function () {
    this.changePage(new ArchiveView());
  },

  processlist: function (urlParams) {
    var processListView = new ProcessListView();
    processListView["params"] = urlParams;
    this.changePage(processListView);
  },

  setting: function () {
    this.changePage(new SettingView());
  },

  document: function () {
    this.changePage(new DocumentDetailView());
  },

  //=========================== JQUERY MOBILE CHANGE PAGE ==================================
  changePage: function (page) {

    var transition = $.mobile.defaultPageTransition;
    if (this.reverse) {
      removePage([appScreenStack[appScreenStack.length - 1]]);
      appScreenStack.pop();
      var transition = $.mobile.defaultPageTransition;
    } else {
      if (appScreenStack.length > 0 && page.attributes && page.attributes.level && checkScreenLevel(page.attributes.level)) {
        removePage(appScreenStack);
        appScreenStack = [];
      }
      $(page.el).attr('data-role', 'page');
      page.render();
      $('body').append($(page.el));
      page.loadContentPage();
      appScreenStack.push(page.id);
    }

    // We don't want to slide the first page
    if (this.firstPage) {
      transition = "none";
      this.firstPage = false;
    }
    $.mobile.changePage($("#" + page.id), {changeHash: false, transition: transition, reverse: this.reverse});
    this.reverse = false;
  }
});

$(document).ready(function () {
  $('body').append("<div class='ui-loader-background'> </div>");
  if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
    document.addEventListener("deviceready", function () {
      document.addEventListener("backbutton", function () {
        navigatorWithBackButton();
      }, false);
      onDeviceReady();
    }, false);
  } else {
    onDeviceReady();
  }
});

function onDeviceReady() {
  var templates = ["login", "search", "archive", "processlist", "setting", "placeholder", "document"];
  $.mobile.loading("show");
  Template.loadTemplates(templates, function () {
    $.ajax({
      method : "GET",
      url : HOSTNAME+"/oxseed/cs/translations",
      dataType : "json",
      success : function(body, status, xhr){
        window.localStorage.setItem("oxseed_translations",JSON.stringify(body));
        initLanguage();
        $.mobile.loading("hide");
        appRouter = new AppRouter();
        Backbone.history.start();
      }
    })
  })
}

function initLanguage() {
  $(document).on("pagebeforecreate", 'body', function (event, ui) {
    changeLanguage();
  })
}

function changeLanguage(){
  var stringValue = "";
  var translations = JSON.parse(window.localStorage.getItem("oxseed_translations"));
  var arrElement = $("[data-i18n]");
  for(var i = 0;i<arrElement.length;i++){
    stringValue = $(arrElement[i]).attr("data-i18n");
    var objectLanguage = translations.filter(isBigEnough);
    if(objectLanguage.length > 0){
      $(arrElement[i]).text(objectLanguage[0][lngApp]["stringValue"]);
    }
  }
  function isBigEnough(obj){
    return obj["name"]["stringValue"] == stringValue;
  }
}

function navigatorWithBackButton() {
  if (appScreenStack.length == 1) {
    var r = confirm("Are you want exit OxseedApp!");
    if (r == true) {
      navigator.app.exitApp();
    }
  } else {
    appRouter.reverse = true;
    if ("archive" == appScreenStack[appScreenStack.length - 2 ].split("-").shift()) {
      location.hash = "";
    } else {
      location.hash = appScreenStack[appScreenStack.length - 2 ].split("-").shift();
    }
  }
}

function removePage(appStackScreen) {
  $(document).one("pageshow", function (event, ui) {
    for (var i = 0; i < appStackScreen.length; i++) {
      $("#" + appStackScreen[i]).remove();
    }
  });
}

function checkScreenLevel(level) {
  var sameLevel = false;
  if (level.toString() == "1") {
    sameLevel = true;
  }
  return sameLevel;
}

function processError(model, response, options){
  if(response.status == 401){
    alert("Your account logged by different device");
    userModel.destroy({success : function(){location.href = "";}});
  }
}