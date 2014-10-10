window.DocumentDetailView = Backbone.View.extend({
  document: new DocumentDetailModel(),

  events: {
    "click #document-back": "backClicked"
  },


  initialize: function() {
    this.listenTo(this.document, "sync", this.onPageShown);
  },

  render: function() {
    this.template = _.template(Template.get("document"));
//    $(this.el).html(this.template());
  },

  loadContentPage : function(){
    this.document.fetch();
  },

  onPageShown: function(model){
    this.showDocumentDetail(model.toJSON());
  },

  showDocumentDetail: function(documnent) {
    $(this.el).html(this.template({document: documnent[0]}));
    $(this.el).trigger('create');
    $.mobile.loading("hide");
  },

  backClicked: function() {
    window.history.back();
  },

  //Helper Draw Segment When Use Touch
  drawSegment: function (event){
    // Phoney Data
    var segments = [[45,45,10,10],[95,45,10,10],[145,45,10,10],[45,95,10,10],[95,95,10,10],[145,95,10,10]]
    var distanceMax = 0;
    // ==

    var found = false;
    for(var i = 0; i < segments.length; i++){
      var distance = 0;
      //if touch in segment
      var width = segments[i][2];
      var height = segments[i][3];
      var disx = segments[i][0]+width;
      var disy = segments[i][1]+height;
      if(event.xImageTouch >= segments[i][0] && event.xImageTouch <= disx && event.yImageTouch >= segments[i][1] && event.yImageTouch <= disy){
        found = true;
        var xDraw = Math.floor((parseFloat(segments[i][0])*parseFloat(event.scale))+parseFloat(event.xOImage));
        var yDraw = Math.floor((parseFloat(segments[i][1])*parseFloat(event.scale))+parseFloat(event.yOImage));
        $("#segment-selected").css({width:width*event.scale+'px', height:height*event.scale+'px', top:yDraw+'px', left:xDraw+"px", border: "3px solid red", display:"block"});
      }
      else{// find segment near touch
        // calculator distance both touch and segment
        if(event.xImageTouch < segments[i][0]){
          // LEFT
          if(event.yImageTouch < segments[i][1]){
            // conner left top
            var distanceX = segments[i][0] - event.xImageTouch;
            var distanceY = segments[i][1] - event.yImageTouch;
            distance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
            if(segments[i][4]==undefined) segments[i].push(distance);
            else segments[i][4] = distance;
          }else{
            if( event.yImageTouch < disy){
              // left
              distance = segments[i][0] - event.xImageTouch;
              if(segments[i][4]==undefined) segments[i].push(distance);
              else segments[i][4] = distance;
            }else{
              // conner left bottom
              var distanceX = segments[i][0] - event.xImageTouch;
              var distanceY = event.yImageTouch - disy;
              distance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
              if(segments[i][4]==undefined) segments[i].push(distance);
              else segments[i][4] = distance;
            }
          }
        }else{
          if(event.xImageTouch < disx){
            // TOP OR BOTTOM
            if(event.yImageTouch < segments[i][1]){
              // top
              distance = segments[i][1] - event.yImageTouch;
              if(segments[i][4]==undefined) segments[i].push(distance);
              else segments[i][4] = distance;
            }else {
              // bottom
              distance = event.yImageTouch - disy;
              if(segments[i][4]==undefined) segments[i].push(distance);
              else segments[i][4] = distance;
            }
          }else{
            // RIGHT
            if(event.yImageTouch < segments[i][1]){
              // conner top right
              var distanceX = event.xImageTouch - disx;
              var distanceY = segments[i][1] - event.yImageTouch;
              distance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
              if(segments[i][4]==undefined) segments[i].push(distance);
              else segments[i][4] = distance;
            }else{
              if(event.yImageTouch < disy){
                // right
                distance = event.xImageTouch - disx;
                if(segments[i][4]==undefined) segments[i].push(distance);
                else segments[i][4] = distance;
              }else{
                // conner right bottom
                var distanceX = event.xImageTouch - disx;
                var distanceY = event.yImageTouch - disy;
                distance = Math.sqrt(distanceX*distanceX+distanceY*distanceY);
                if(segments[i][4]==undefined) segments[i].push(distance);
                else segments[i][4] = distance;
              }
            }
          }
        }
      }
    }
  //  found segment and draw with distance < distanceMax
    if(!found){
      var distanceMin = 0;
      var segment = [];
      for(var j = 0; j < segments.length; j++){
        if(j==0) distanceMin = segments[j][4];
        if(segments[j][4] <= distanceMin) {
          distanceMin = segments[j][4];
          segment = segments[j];
        }
      }
      if(distanceMin <= distanceMax*event.scale){
        // Draw
        var width = segment[2]*event.scale;
        var height = segment[3]*event.scale;
        var xDraw = Math.floor((parseFloat(segment[0])*parseFloat(event.scale))+parseFloat(event.xOImage));
        var yDraw = Math.floor((parseFloat(segment[1])*parseFloat(event.scale))+parseFloat(event.yOImage));
        $("#segment-selected").css({width:width+'px', height:height+'px', top:yDraw+'px', left:xDraw+"px", border: "3px solid red", display:"block"});
      }else{
        $("#segment-selected").css({display: "none"});
      }
    }
  }
})