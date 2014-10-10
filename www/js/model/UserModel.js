window.UserModel = Backbone.Model.extend({

  localStorage: new Backbone.LocalStorage('user'),

  defaults: function () {
    return {
      username: "",
      password: "",
      isAuth: false
    }
  },

  login: function (username, password) {
    var userModel = this;
    var dataPost = {
      grant_type: "password",
      password: password,
      username: username
    }
    $.ajax({
      type: "POST",
      url: AUTHENTICATION + "/oxseed/cs/login",
      data: dataPost,
      success: function (body, status, xhr) {
        console.log(xhr);
        if (xhr.status == 200) {
          userModel.set(body);
          userModel.set("username", username);
          userModel.set("password", password);
          userModel.set("isAuth", true);
        }
        userModel.save();
      },
      error: function (e) {
        //interpret error
        userModel.save();
//        navigatorWithBackButton();
      }
    });

  },

  getUserByLoginToken: function () {
    var userModel = this;
    $.ajax({
      type: "POST",
      url: AUTHENTICATION + "/cs/services?SERVICE_NAME=com.oxseed.openid.spec.RemoteOpenIdService&SERVICE_METHOD=getUserByLoginToken&TOKEN=" + this.get("token") + "&0=" + this.get("username"),
      success: function (body, status, xhr) {
        if (body.indexOf("ErrorResponse") < 0) {
          userModel.set("informationUser", body);
        }
        userModel.save();
      }
    });
  },

  getUserRoleID: function (cb) {
    var userModel = this;
    $.ajax({
      type: "GET",
      url: AUTHENTICATION + "/cs/services?SERVICE_NAME=com.oxseed.configserver.corporate.service.MandantService&SERVICE_METHOD=getUsersRoleIds&TOKEN=" + this.get("token") + "&0=" + this.get("username") + "&1=wackler",
      success: function (body, status, xhr) {
        if (body.indexOf("ErrorResponse") < 0) {
          userModel.set("informationUser", body);
        }
        userModel.save();
      }
    });
  },

  hasPermission: function () {

  },

  isAuth: function () {
    return this.get("isAuth");
  },

  getAuthorization : function(){
    return this.get("token_type") + " " + this.get("access_token");
  },

  changePassword: function (password, cb) {
    var thisModel = this;
    var dataRequest = {
      oldpw: thisModel.get("password"),
      newpw: password
    }
    console.log("DATA REQUEST", thisModel.get("token_type") + " " + thisModel.get("access_token"));
    $.ajax({
      type: "POST",
      url: AUTHENTICATION + "/oxseed/cs/password/" + thisModel.get("username"),
      headers: {
        "Authorization": thisModel.get("token_type") + " " + thisModel.get("access_token")
      },
      data: dataRequest,
      success: function (body, status, xhr) {
        if (xhr.status == 200) {
          thisModel.set("password", password);
          thisModel.save();
        }
        cb(xhr.status);
      }
    });
  }
});

var userModel = new UserModel({id: 0});