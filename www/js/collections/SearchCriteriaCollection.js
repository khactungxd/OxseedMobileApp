var SearchCriteriaCollection = Backbone.Collection.extend({

  model : SearchCriteriaModel,

  url : HOSTNAME+"/cs/services"

//  getSavedSearchFormService : function(){
//    var thisCollection = this;
//    $.ajax({
//      method : "GET",
//      url : HOSTNAME+"/saved",
//      success : function(body, status, xhr){
//        var result = [];
//        if(!body["ErrorResponse"]){
//          result = body;
//        }
//        thisCollection.add(result);
//      }
//    })
//  }

});