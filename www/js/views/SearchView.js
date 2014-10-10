window.SeachView = AbstractView.extend({

  collection: new SearchCriteriaCollection(),
  processModel : new ProcessListModel(),

  id : "search-screen",

  attributes: {
    'level': 1
  },

  urlParams : null,

  //---------------------------- Backbone Init view -------------------------
  initialize: function () {
    this.constructor.__super__.initialize.apply(this);
    this.listenTo(this.collection, "reset", this.addAllSavedSearch);
    this.listenTo(this.collection, "add", this.addOneSavedSearch);
    this.listenTo(this.processModel, "sync", this.showProcessType);
    $(document).on("click", "#search-screen .open-app-popup-menu", this.clkOpenMenu);
  },

  //--------------------------- BackBone Render view -------------------------
  render: function () {
    this.$el.html(this.template());
    this.setHeader({title :"Suche", menu : [
      {"href" : "#",text : "Archive"},
      {href: "#setting", text: "Setting"},
      {"href" : "#logout",text : "Logout"}
    ]});
    this.setFooterWithHtml('<a style="margin: 5px 50px;" href="#" data-role="button" data-icon="search" id="search">Search</a>');
    this.appBody = _.template(Template.get("search"));
    this.setBodyWithHtml(this.appBody());

    // get input component
    this.pi_eingangsdatum_date = this.$("#pi_eingangsdatum_date input");
    this.pi_process_lifecycle_start_date = this.$("#pi_process_lifecycle_start_date input");
    this.pi_process_lifecycle_date = this.$("#pi_process_lifecycle_date input");
    this.auftrag_str = this.$("#auftrag_str");
    this.auftraggeber_str = this.$("#auftraggeber_str");
    this.bescheinigung_date = this.$("#bescheinigung_date input");
    this.email_str = this.$("#email_str");
    this.referenz_str = this.$("#referenz_str");
    return this;
  },

  loadContentPage : function(){
    this.registerListenerForPageShow();
  },

  //--------------------------- BackBone Events ----------------------------
  additionalEvents: {
    "click .choose-type": "clkChooseTypes",
    "click #save-info-search": "clkSaveInfoSearch",
    "click .manager-criteria ul li .btn-item": "clkItemSavedList",
    "click .manager-criteria ul li .btn-add": "clkAddNewItem",
    "click .process-document-types ul li a" : "clkSelectProcessDocumentTypes",
    "click #search" : "clkSearch"
  },

  //--------------------------- CLICK EVENT ----------------------------------------------------

  clkOpenMenu : function(){
    $("#search-screen .app-popup-menu").popup("open", { transition: "pop" });
  },

  clkItemSavedList: function (e) {
    var thisScreen = this;
    e.preventDefault();
    var selectElement = e.target.nodeName.toLowerCase();
    //get a searchCriteriaModel selected form searchCriteriaCollection
    var searchCriteria = this.collection.get(e.currentTarget.attributes.getNamedItem("saved-id").value);
    if (selectElement == "span") {
      searchCriteria.removeSearchCriteria(userModel.get("token"), "wackler", function () {
        thisScreen.getSearchCriteria(thisScreen)
      });
    } else {
      this.$(".manager-criteria input[data-type='search']").val(e.currentTarget.text);
      var documentIndexList = searchCriteria.get("documentIndexList")["documentIndexList"];
      for(var iDocument= 0 ; iDocument < documentIndexList.length; iDocument++){
        if(documentIndexList[iDocument]["id"].toLowerCase() == "bescheinigung_date"){
          $("#"+documentIndexList[iDocument]["id"]+" input").val(thisScreen.convertDateRangeFormDB(documentIndexList[iDocument]["value"]));
        } else {
          $("#"+documentIndexList[iDocument]["id"]).val(documentIndexList[iDocument]["value"]);
        }
      }
      var processIndexList = searchCriteria.get("processIndexList")["processIndexList"];
      for(var iProcess = 0 ; iProcess < processIndexList.length; iProcess++){
        $("#"+processIndexList[iProcess]["id"]+" input").val(thisScreen.convertDateRangeFormDB(processIndexList[iProcess]["value"]));
      }
      this.$(".manager-criteria input[data-type='search']").trigger("change");
      $(".manager-criteria").popup("close", { transition: "pop" });
      $("#search-datetime").show();
      $("#info-search-extension").show();
    }

  },

  clkAddNewItem: function (e) {
    e.preventDefault();
    var thisScreen = this;
    var arrSC = this.collection.toJSON();
    var newCriteriaName = $('.manager-criteria input[data-type="search"]')[0].value;
    for(var i = 0 ; i < arrSC.length ; i++){
      if(arrSC[i]["name"] == newCriteriaName){
        thisScreen.updateSearchCriteria(arrSC[i]);
        break;
      }else {
        if(i == arrSC.length - 1){
          thisScreen.createNewSearchCriteria();
        }
      }
    }
    if(arrSC.length == 0){
      thisScreen.createNewSearchCriteria();
    }
  },

  clkChooseTypes: function (event) {
    event.preventDefault()
    $(".process-document-types").popup("open", { transition: "pop" });
  },

  clkSaveInfoSearch: function (event) {
    event.preventDefault();
    $(".manager-criteria").popup("open", { transition: "pop" });
  },

  clkSelectProcessDocumentTypes : function (event){
    event.preventDefault();
    $(event.currentTarget).toggleClass("ui-checkbox-off ui-checkbox-on");
    if($(event.currentTarget).hasClass("ui-checkbox-on")){
      $("#search-datetime").show();
      $("#info-search-extension").show();
    } else {
      $("#search-datetime").hide();
      $("#info-search-extension").hide();
    }
  },

  clkSearch : function (event){
    event.preventDefault();
    var thisScreen = this;
    var querySearch = "";
    var pi_eingangsdatum_date = "";
    if(this.pi_eingangsdatum_date.val() && this.pi_eingangsdatum_date.val() != ""){
      pi_eingangsdatum_date = thisScreen.convertDateRangeToDB(this.pi_eingangsdatum_date.val()).split(":::");
      querySearch = querySearch + 'pi_eingangsdatum_date:["'+pi_eingangsdatum_date[0]+'" TO '+ (pi_eingangsdatum_date[1] == "*" ? "*]" : '"'+pi_eingangsdatum_date[1]+'"]');
    }
    var pi_process_lifecycle_start_date = "";
    if(this.pi_process_lifecycle_start_date.val() && this.pi_process_lifecycle_start_date.val() != ""){
      pi_process_lifecycle_start_date = thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_start_date.val()).split(":::");
      querySearch = querySearch == "" ?
        'pi_process_lifecycle_start_date:["'+pi_process_lifecycle_start_date[0]+'" TO '+(pi_process_lifecycle_start_date[1] == "*" ? "*]" : '"'+pi_process_lifecycle_start_date[1]+'"]')
        : querySearch + ' AND pi_process_lifecycle_start_date:["'+pi_process_lifecycle_start_date[0]+'" TO '+(pi_process_lifecycle_start_date[1] == "*" ? "*]" : '"'+pi_process_lifecycle_start_date[1]+'"]')
    }

    var pi_process_lifecycle_date = "";
    if(this.pi_process_lifecycle_date.val() && this.pi_process_lifecycle_date.val() != ""){
      pi_process_lifecycle_date = thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_date.val()).split(":::");
      querySearch = querySearch == "" ?
        'pi_process_lifecycle_date:["'+pi_process_lifecycle_date[0]+'" TO '+ (pi_process_lifecycle_date[1] == "*" ? "*]" : '"'+pi_process_lifecycle_date[1]+'"]')
        : querySearch + ' AND pi_process_lifecycle_date:["'+pi_process_lifecycle_date[0]+'" TO '+ (pi_process_lifecycle_date[1] == "*" ? "*]" : '"'+pi_process_lifecycle_date[1]+'"]');
    }

    if(this.auftrag_str.val() && this.auftrag_str.val() != ""){
      querySearch = querySearch == "" ? "auftrag_str:"+ '"'+this.auftrag_str.val()+'"' : querySearch+" AND auftrag_str:"+ '"'+this.auftrag_str.val()+'"';
    }

    if(this.auftraggeber_str.val() && this.auftraggeber_str.val() != ""){
      querySearch = querySearch == "" ? "auftraggeber_str:"+ '"'+this.auftraggeber_str.val()+'"' : querySearch+" AND auftraggeber_str:"+ '"'+this.auftraggeber_str.val()+'"';
    }

    var bescheinigung_date = "";
    if(this.bescheinigung_date.val() && this.bescheinigung_date.val() != ""){
      bescheinigung_date = thisScreen.convertDateRangeToDB(this.bescheinigung_date.val()).split(":::");
      querySearch = querySearch == "" ?
        'bescheinigung_date:["'+bescheinigung_date[0]+'" TO '+ (bescheinigung_date[1] == "*" ? "*" : '"'+bescheinigung_date[1]+'"]')
        : querySearch + ' AND bescheinigung_date:["'+bescheinigung_date[0]+'" TO '+ (bescheinigung_date[1] == "*" ? "*]" : '"'+bescheinigung_date[1]+'"]');
    }

    if(this.email_str.val() && this.email_str.val() != ""){
      querySearch = querySearch == "" ? "email_str:"+ '"'+this.email_str.val()+'"' : querySearch+" AND email_str:"+ '"'+this.email_str.val()+'"';
    }

    if(this.referenz_str.val() && this.referenz_str.val() != ""){
      querySearch = querySearch == "" ? "referenz_str:"+ '"'+this.referenz_str.val()+'"' : querySearch+" AND referenz_str:"+ '"'+this.referenz_str.val()+'"';
    }

    var parameter = {
      action: "PROCESS",
      mandant: "wackler",
      wt: "oxseed_json",
      paths: "/",
      q : querySearch
    }
    location.hash = "#processlist?"+$.param(parameter);
  },

  //--------------------------- Process Model render to View---------------------------------
  addOneSavedSearch: function (savedSearch, collection, listen) {
    var objItemSavedSearch = savedSearch.toJSON();
    var item = '<li><a href="#" saved-id=' + savedSearch.id + ' class="ui-btn btn-item">' + objItemSavedSearch["name"] + '<span style="float: right" class="ui-icon-delete ui-btn-icon-right"></span></a></li>';
    $(".manager-criteria ul").append(item);
  },

  addAllSavedSearch: function (collection) {
    $(".manager-criteria").popup("close", { transition: "pop" });
    $(".manager-criteria ul li .btn-item").remove();
    collection.each(this.addOneSavedSearch, this);
  },

  showProcessType : function(processType){
    var processDocumentType = this.$(".process-document-types ul");
    processDocumentType.empty();
    var arrProcessTypes = processType.toJSON()["processTypes"];
    for(var iProcess = 0; iProcess < arrProcessTypes.length ; iProcess ++){
      var arrDocumentTypes = arrProcessTypes[iProcess]["documentTypes"];
      processDocumentType.append('<li data-role="list-divider" role="heading" class="ui-li-divider ui-bar-b ui-first-child">'+arrProcessTypes[iProcess]["processType"]+'</li>');
      for(var iDocument = 0 ; iDocument < arrDocumentTypes.length ; iDocument++){
        processDocumentType.append('<li><a href="#" class="ui-btn ui-checkbox-on ui-btn-icon-right">'+arrDocumentTypes[iDocument]+'</a></li>').trigger("create");
      }
    }
  },

  //------------------------- get Search Criteria ----------------------------------------
  getSearchCriteria: function (view) {
    view.collection.fetch({
      reset: true,
      data: {
        SERVICE_NAME: "com.oxseed.configserver.activeworkdata.service.ActiveworkdataService",
        SERVICE_METHOD: "getSavedSearches",
        TOKEN: userModel.get("token"),//userModel.toJSON().token,
        0: "wackler"
      }});
  },

  //------------------------ create new search Criteria --------------------------------------
  createNewSearchCriteria : function(){
    var thisScreen = this;
    var dataRequest = {
      0 : JSON.stringify({
        name : $('.manager-criteria input[data-type="search"]')[0].value,
        "publicSave":false,
        "processIndexList" : {
          processIndexList : [
            {id : "pi_eingangsdatum_date", value : thisScreen.convertDateRangeToDB(this.pi_eingangsdatum_date.val())},
            {id : "pi_process_lifecycle_start_date", value : thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_start_date.val())},
            {id : "pi_process_lifecycle_date", value : thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_date.val())}
          ]
        },
        documentIndexList : {
          documentIndexList : [
            {id : "auftrag_str", value:this.auftrag_str.val()},
            {id : "auftraggeber_str", value:this.auftraggeber_str.val()},
            {id : "bescheinigung_date", value:thisScreen.convertDateRangeToDB(this.bescheinigung_date.val())},
            {id : "email_str", value:this.email_str.val()},
            {id : "referenz_str", value:this.referenz_str.val()}
          ]
        },
        "propertyMap":{"documentTypes":{"id":"documentTypes","type":"string","value":"__all__"}}
      }),
      1 :"wackler",
      TOKEN : userModel.get("token"),
      SERVICE_NAME : "com.oxseed.configserver.activeworkdata.service.ActiveworkdataService",
      SERVICE_METHOD : "saveSearch"
    };

    var searchCriteriaModel = new SearchCriteriaModel();
    searchCriteriaModel.addSearchCriteria(dataRequest, function(){
      thisScreen.getSearchCriteria(thisScreen);
    })
  },

  //------------------------ update search criteria -----------------------------------
  updateSearchCriteria : function(searchCriteria){
    var thisScreen = this;
    var searchCriteriaUpdate = searchCriteria;
    searchCriteriaUpdate["processIndexList"]["processIndexList"] = [
      {id : "pi_eingangsdatum_date", value : thisScreen.convertDateRangeToDB(this.pi_eingangsdatum_date.val())},
      {id : "pi_process_lifecycle_start_date", value : thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_start_date.val())},
      {id : "pi_process_lifecycle_date", value : thisScreen.convertDateRangeToDB(this.pi_process_lifecycle_date.val())}
    ];
    searchCriteriaUpdate["documentIndexList"]["documentIndexList"] = [
      {id : "auftrag_str", value:this.auftrag_str.val()},
      {id : "auftraggeber_str", value:this.auftraggeber_str.val()},
      {id : "bescheinigung_date", value:thisScreen.convertDateRangeToDB(this.bescheinigung_date.val())},
      {id : "email_str", value:this.email_str.val()},
      {id : "referenz_str", value:this.referenz_str.val()}
    ];
    var dataRequest = {
      0 : JSON.stringify(searchCriteriaUpdate),
      1 :"wackler",
      TOKEN : userModel.get("token"),
      SERVICE_NAME : "com.oxseed.configserver.activeworkdata.service.ActiveworkdataService",
      SERVICE_METHOD : "saveSearch"
    };

    var searchCriteriaModel = new SearchCriteriaModel();
    searchCriteriaModel.addSearchCriteria(dataRequest, function(){
      thisScreen.getSearchCriteria(thisScreen);
    })
  },

  //------------------------ Call function process Custom component ---------------------------------------
  registerListenerForPageShow: function () {
    var thisScreen = this;
    $(document).one("pagecontainershow", function () {
      if (location.hash == "#search") {
        $.datepicker._defaults.onAfterUpdate = null;
        var datepicker__updateDatepicker = $.datepicker._updateDatepicker;
        $.datepicker._updateDatepicker = function (inst) {
          datepicker__updateDatepicker.call(this, inst);

          var onAfterUpdate = this._get(inst, 'onAfterUpdate');
          if (onAfterUpdate)
            onAfterUpdate.apply((inst.input ? inst.input[0] : null),
              [(inst.input ? inst.input.val() : ''), inst]);
        }
        thisScreen.registerSelectItemInSavedSearch();
        $(".manager-criteria ul").html();
        thisScreen.registerSelectItemInPopupMenu();
        thisScreen.getSearchCriteria(thisScreen);
        thisScreen.processModel.fetch({data :{
          action: "PROCESS_TYPES",
          mandant: "wackler",
          wt: "oxseed_json"
        }, headers : {"Authorization": userModel.getAuthorization()}})
        thisScreen.registerDatePicker("pi_eingangsdatum_date");
        thisScreen.registerDatePicker("pi_process_lifecycle_start_date");
        thisScreen.registerDatePicker("pi_process_lifecycle_date");
        thisScreen.registerDatePicker("bescheinigung_date");
      }
    })

  },

  registerSelectItemInPopupMenu: function () {
    // toggleClass ("ui-checkbox-off" or "ui-checkbox-on") when select type in popup

    $( ".process-document-types" ).bind({
      popupafteropen: function(event, ui) {
        $(".process-document-types").trigger("create");
      }
    });
  },

  registerSelectItemInSavedSearch: function () {
    $(".manager-criteria").bind({
      popupafterclose: function () {
      }
    });
  },

  //----------------------------  Register event for component datepicker --------------------------------------
  registerDatePicker: function (elementID) {
    var cur = -1, prv = -1;
    $('#' + elementID + ' input').attr("readonly", true);
    $('#' + elementID + ' .' + elementID)
      .datepicker({
//          changeMonth: true,
        changeYear: true,
        showButtonPanel: true,

        beforeShowDay: function (date, inst) {
          return [true, ( (date.getTime() >= Math.min(prv, cur) && date.getTime() <= Math.max(prv, cur)) ? 'date-range-selected' : '')];
        },

        onSelect: function (dateText, inst) {
          var d1, d2;

          prv = cur;
          cur = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();
          if (prv == -1 || prv == cur) {
            prv = cur;
            $('#' + elementID + ' input').val(dateText + ' - *');
          } else {
            d1 = $.datepicker.formatDate('dd/mm/yy', new Date(Math.min(prv, cur)), {});
            d2 = $.datepicker.formatDate('dd/mm/yy', new Date(Math.max(prv, cur)), {});
            if (!d2) {
              $('#' + elementID + ' input').val(d1 + ' - *');
            } else {
              $('#' + elementID + ' input').val(d1 + ' - ' + d2);
            }

          }
        },

        onAfterUpdate: function (inst) {
          $('#' + elementID + ' div .ui-datepicker-buttonpane').html('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
            .on('click', function () {
              $('#' + elementID + ' .ui-datepicker').hide();
//              $('#' + elementID + ' .ui-datepicker').css({visibility : "hidden"});
              $(".ui-loader-background").hide();
            });
        }
      }).css({
        top : $(window).height()/2,
        margin:"0px auto"
      });
//      .offset({top : $(window).height()/2,
//        left : $(window).width()/2});
//      .position({
//        top : $(window).height()/2,
//        left : $(window).width()/2,
////        my: "left top",
////        at: "left bottom",
//        of: window
//      });

    this.$('#' + elementID + ' .ui-datepicker').hide();

    this.$('#' + elementID + ' input').focusin(function () {
      $(".hasDatepicker").datepicker('refresh');
      var v = this.value,
        d;

      try {
        if (v.indexOf(' - ') > -1) {
          d = v.split(' - ');

          prv = $.datepicker.parseDate('mm/dd/yy', d[0]).getTime();
          cur = $.datepicker.parseDate('mm/dd/yy', d[1]).getTime();

        } else if (v.length > 0) {
          prv = cur = $.datepicker.parseDate('mm/dd/yy', v).getTime();
        }
      } catch (e) {
        cur = prv = -1;
      }

      if (cur > -1)
        $('#' + elementID + ' .ui-datepicker').datepicker('setDate', new Date(cur));

      var arrDatePicker = $(".ui-datepicker");
      arrDatePicker.each(function (item) {
        $(this).hide();
      });

      $('#' + elementID + ' .ui-datepicker').datepicker('refresh').show();
//      $('#' + elementID + ' .ui-datepicker').datepicker('refresh').css({visibility : "visible"});
      $(".ui-loader-background").show();
    });

  },

  //------------------------------- CONVERT DATE RANGE ----------------------------------------------
  //01/08/2014 - 22/08/2014  ----> 2014-08-06T00:00:00.000Z:::2014-08-08T00:00:00.000Z
  convertDateRangeToDB : function(dataRange){
    if(!dataRange || dataRange == ""){
      return "";
    }
    var arrDateRange = dataRange.split("-");
    var dateRangeStart = arrDateRange[0].split("/");
    var start = new Date(dateRangeStart[2].trim()+"-"+dateRangeStart[1].trim()+"-"+dateRangeStart[0].trim());
    var dateRangeEnd = arrDateRange[1].trim() == "*" ? "*" : arrDateRange[1].split("/");
    var end = dateRangeEnd == "*" ? "*" : new Date(dateRangeEnd[2].trim()+"-"+dateRangeEnd[1].trim()+"-"+dateRangeEnd[0].trim());
    return [start.toJSON(),end=="*"?"*" : end.toJSON()].join(":::");
  },

  //2014-08-06T00:00:00.000Z:::2014-08-08T00:00:00.000Z   ---->    01/08/2014 - 22/08/2014
  convertDateRangeFormDB : function(dataRange){
    if(!dataRange || dataRange == ""){
      return "";
    }
    var arrDateRange = dataRange.split(":::");
    var start = new Date(arrDateRange[0].trim());
    var dateRangeStart = [parseInt(start.getDate()) >=10 ? start.getDate() : "0"+start.getDate(), (parseInt(start.getMonth())+1) >=10 ? (parseInt(start.getMonth())+1) : "0"+(parseInt(start.getMonth())+1), start.getFullYear()].join("/");
    var end = arrDateRange[1].trim() == "*" ? "*" : new Date(arrDateRange[1].trim());
    var dateRangeEnd = end == "*" ? "*" : [parseInt(end.getDate()) >=10 ? end.getDate() : "0"+end.getDate(), (parseInt(end.getMonth())+1) >=10 ? (parseInt(end.getMonth())+1) : "0"+(parseInt(end.getMonth())+1), end.getFullYear()].join("/")
    return [dateRangeStart, dateRangeEnd].join(" - ");
  }
});