// =========================== DEPENDENCIES ==============================
var express = require('express');
var http = require('http');
var request = require("request");
var path = require('path');
var fs = require('fs-extra');

// ===================== EXPRESS APP CONFIGURATION ==============================
var app = express();
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-SOLERA-AUTH-TOKEN,Auth');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});
app.set('port', process.env.PORT || 8888);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// ============================== ROUTES  ================================
//var prefix="https://wackler.oxseed.com";
var prefix = "https://wackler-int.oxseed.com";

app.post('/oxseed/cs/:type', function (req, res) {
  var url_auth = "https://wackler-int.oxseed.com" + req.url;
//  var user = { "username": "thinh_ng",
//    "password": "oxseed", "access_token":
//      "3739cbf5-0c2f-4b54-aa37-f4e709dbe39e", "refresh_token":
//      "d943e98e-ee80-434b-9bfa-76ffa2a67886", "expire_in": 28800000,
//    "client_id": "wackler", "provider": "oxseed", "user_id": "thinh_ng",
//    "token_type": "Bearer", "id": "9bde4f74-eb0b-787f-896f-129ab94fb6f7"}
//  res.send(200, user);
  request({
    method: "POST",
    url: url_auth,
    json: req.body
  }, function (error, response, body) {
    if (!error) {
      res.send(response.statusCode, body);
    } else {
      res.send(404, {"message": "url isn't valid"});
    }
  });
});

app.post('/oxseed/cs/password/:username', function (req, res) {
  var url_auth = "https://wackler-int.oxseed.com" + req.url;
  request({
    method: "POST",
    headers: {
      "Authorization": req.headers["auth"]
    },
    url: url_auth,
    json: req.body
  }, function (error, response, body) {
    if (!error) {
      res.send(response.statusCode, body);
    } else {
      res.send(404, {"message": "url isn't valid"});
    }
  });
});

app.get("/oxseed/index/:stag/oxseedQuery", function (req, res) {
  request({
    method: "GET",
    url: prefix + req.url,
    headers: {
//      "X-SOLERA-AUTH-TOKEN" : req.headers["x-solera-auth-token"]
      "Authorization": req.headers["auth"]
    }
  }, function (error, response, body) {
    var ss = response.statusCode;
    res.send(ss, body);
  })
});

app.get("/cs/services", function (req, res) {
  request({
    method: "GET",
    url: "https://wackler-int.oxseed.com" + req.url
  }, function (error, response, body) {
    res.send(body);
  })
});

app.post("/cs/services", function (req, res) {
  request.post("https://wackler-int.oxseed.com" + req.url,function (err, response, body) {
    res.send(body);
  }).form(req.body);
});

app.get("/oxseed/cs/translations", function (req, res) {
  request({
    method: "GET",
    url: "https://wackler-int.oxseed.com" + req.url
  }, function (error, response, body) {
//    res.send(body);
    res.send(require("../language.json"));
  })
});

// =========================== START EXPRESS ==============================
http.createServer(app).listen(app.get('port'), function () {
  console.log("server listening on port " + app.get('port'));
});
