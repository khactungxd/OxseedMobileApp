var SearchCriteriaModel = Backbone.Model.extend({

  urlRoot: HOSTNAME,

  url: function () {
    return this.urlRoot + "/delete/saved?id=" + this.id;
  },

  removeSearchCriteria: function (token, mandant, cb) {
//    https://wackler-int.oxseed.com/cs/services?SERVICE_NAME=com.oxseed.configserver.activeworkdata.service.ActiveworkdataService&SERVICE_METHOD=removeSavedSearch&TOKEN=99nfb65d52lhh9172fh1mlgl91&0=6acffb04-a5d2-4ee2-b5f6-83dd87d177b7&1=wackler
    $.ajax({
      method: "GET",
      url : this.urlRoot+"/cs/services?SERVICE_NAME=com.oxseed.configserver.activeworkdata.service.ActiveworkdataService&SERVICE_METHOD=removeSavedSearch&TOKEN="+token+"&0="+this.id+"&1="+mandant,
      success : function(body, status, xhr){
        console.log(body);
        cb();
      }
    })
  },

  addSearchCriteria: function (data, cb) {
    $.ajax({
      "method": "POST",
      "url": this.urlRoot+"/cs/services",
      "data": data,
      success : function(body, status, xhr){
        cb();
      }
    })
  },

  defaults: {
    "configurationState": "",
    "creationTime": 0,
    "documentIndexList": {},
    "editedPaths": [],
    "id": "",
    "name": "",
    "owner": "",
    "processIndexList": {},
    "propertyMap": {},
    "publicSave": false,
    "searchPaths": {},
    "selectedProcessList": {},
    "type": ""
  }
});