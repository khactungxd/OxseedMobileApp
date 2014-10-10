window.ProcessListView = AbstractView.extend({

  id: "processlist-screen",

  attributes: {

  },

  processList: new ProcessListModel(),
  documentDetail: new DocumentDetailModel(),

  events: {
    "click .xCheckbox": "cbClicked",
    "click .btn-processHeader": "eyeBtnClicked",
    "click .processHeader": "toggleProcess",
//    "click #processlist-back": "backClicked",
    "click #process-select-all": "processSelect",
    "click #process-collapse-all": "processCollapse",
    "click #process-expand-all": "processExpand",
    "click #process-sorting": "processSorting",
    "click .documentDetails": "showDetailDocument"
  },

  initialize: function () {
    this.constructor.__super__.initialize.apply(this);
    this.processList.on("sync", this.showProcessList, this);
    this.checkbox_being_clicked = false;
    this.eye_btn_clicked = false;
  },

  render: function () {
    $(this.el).html(this.template());
    this.setHeaderWithHtml('<div><h1 class="ui-title" role="heading" aria-level="1">Processes</h1>' +
      '<a data-role="button" data-icon="back" class="ui-btn-left back">Back</a></div>' +
      '<div style="text-align:center;background:#fff">' +
      '<button class="navButton" id="process-select-all" data-type="0">Select All</button>' +
      '<button class="navButton" id="process-collapse-all" style="width:28% !important;">Collapse All</button>' +
      '<button class="navButton" id="process-expand-all">Expand All</button>' +
      '<button class="navButton" style="width:20% !important;" id="process-sorting">Sorting</button></div>');
    this.setFooterWithHtml('<div style="text-align:center;background:#fff">' +
      '<button class="navButton">Forward</button>' +
      '<button class="navButton">Return</button>' +
      '<button class="navButton">Join</button></div>');
    this.appBody = _.template(Template.get("processlist"));
  },

  loadContentPage: function () {
    var thisScreen = this;
    $(document).one("pagecontainershow", function () {
      thisScreen.refreshProcessList();
    })
  },

  refreshProcessList: function () {
    var thisScreen = this;
    $.mobile.loading('show');
    this.processList.fetch({
      data: thisScreen.params,
//      headers: {"X-SOLERA-AUTH-TOKEN": "f11cc6b0cfda7676915dea229a0d4a65e3b1573700ca85a9aacd6e0b0615edbd"
      headers: {"Authorization": userModel.getAuthorization()}
    });
  },

  showProcessList: function (model, process) {
    //===== fix object process response   ======
    var arrAvailableFieldsOfDocuments = process.responseHeader.availableFields;
    var arrListProcesses = process.response.processes;
    var arrListProcessOfDocuments = [];
    if (arrListProcesses.length > 0) {
      for (var j = 0; j < arrListProcesses.length; j++) {
        var processOb = {};
        processOb.id = arrListProcesses[j].process_id;
        var listObAllDocumentPerProcess = [];
        var listValuesOfAllDocumentPerProcess = arrListProcesses[j].docs.docs;
        for (var k = 0; k < listValuesOfAllDocumentPerProcess.length; k++) {
          var documentOb = {};
          for (var m = 0; m < listValuesOfAllDocumentPerProcess[k].length; m++) {
            for (var i = 0; i < arrAvailableFieldsOfDocuments.length; i++) {
              if (i == m) {
                if (listValuesOfAllDocumentPerProcess[k][m] != null) documentOb[arrAvailableFieldsOfDocuments[i]] = listValuesOfAllDocumentPerProcess[k][m][0];
                else documentOb[arrAvailableFieldsOfDocuments[i]] = "";

              }
            }

          }
          listObAllDocumentPerProcess.push(documentOb);
        }
        processOb.docs = listObAllDocumentPerProcess;
        arrListProcessOfDocuments.push(processOb);
      }
      this.arrListProcessOfDocumetns = arrListProcessOfDocuments;
      this.setBodyWithHtml(this.appBody({processes: arrListProcessOfDocuments}));
      $.mobile.loading("hide");
    } else {
      this.setBodyWithHtml("<span> No process found</span>");
      $.mobile.loading("hide");
    }

  },

  backClicked: function () {
    window.history.back();
  },

  cbClicked: function (event) {
    this.checkbox_being_clicked = true;
    var thisScreen = this;
    setTimeout(function () {
      thisScreen.checkbox_being_clicked = false;
    }, 300);
    if ($('.xCheckbox:checked').length != $('.xCheckbox').length) {
      //switch button text to Select all
      $('#process-select-all').attr('data-type', "0");
      $('#process-select-all').html("Select All");
    } else {
      // switch button text to Unselect all
      $('#process-select-all').attr('data-type', "1");
      $('#process-select-all').html("Unselect All");
    }
  },

  eyeBtnClicked: function (event) {
    this.eye_btn_clicked = true;
    var thisScreen = this;
    setTimeout(function () {
      thisScreen.eye_btn_clicked = false;
    }, 300);
    var e = $(event.currentTarget);
    event.preventDefault();
    $("#popup-action-process").popup("open", { transition: "pop" });
  },

  toggleProcess: function (event) {
    if (this.checkbox_being_clicked) return;
    if (this.eye_btn_clicked) return;
    var e = $(event.currentTarget);
    var processId = e.attr('processId');

    if (e.attr('expand') == 1) {
      e.attr('expand', 0);
      $('.processDocuments[processId=' + processId + ']').hide('slow');
    } else {
      e.attr('expand', 1);
      $('.processDocuments[processId=' + processId + ']').show('slow');
    }

  },

  processSelect: function (event) {
    if ($(event.currentTarget).attr('data-type') == "0") {
      console.log("in if click");
      $(".xCheckbox").prop('checked', true);
      $(event.currentTarget).attr('data-type', "1");
      $(event.currentTarget).html("Unselect All");

    } else {
      console.log("in else click");
      $(".xCheckbox").prop('checked', false);
      $(event.currentTarget).attr('data-type', "0");
      $(event.currentTarget).html("Select All");
    }
  },

  processCollapse: function () {
    $(".processHeader").attr('expand', 0);
    $('.processDocuments').show("slow");
  },
  processExpand: function () {
    $(".processHeader").attr('expand', 1);
    $('.processDocuments').hide("slow");
  },
  processSorting: function () {
    alert("sorting");
  },

  showDetailDocument: function (event) {
    var thisScreen = this;
    var element = $(event.currentTarget);
    var processId = element.attr("process-id");
    var docuemntId = element.attr("document-id");
    var listProcess = this.arrListProcessOfDocumetns;
    var documentSelected;
    for (var i = 0; i < listProcess.length; i++) {
      if (listProcess[i].id == processId) {
        for (var j = 0; j < listProcess[i].docs.length; j++) {
          if (listProcess[i].docs[j].document_id_str == docuemntId) {
            documentSelected = listProcess[i].docs[j];
          }
        }
      }
    }
    this.documentDetail.destroy({success: function () {
      console.log("destroy");
//      thisScreen.documentDetail.clear();
      thisScreen.documentDetail.set(documentSelected);
      thisScreen.documentDetail.save(documentSelected);
      location.hash = "#document";
    }});

  }
})