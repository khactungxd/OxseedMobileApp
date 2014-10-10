$(document).bind("mobileinit", function () {
  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.selectmenu.prototype.options.nativeMenu = false;
  $.mobile.loader.prototype.options.text = "loading";
  $.mobile.defaultPageTransition = "slide";

  // Remove page from DOM when it's being replaced
  $(document).bind("pageshow", function(event, ui){
    if($(ui.prevPage).attr("id") == "login-screen")
      $(ui.prevPage).remove();
  });

  $(document).bind("pagebeforeshow", 'div[data-role="page"]', function(event, ui){
    $('div[data-role="page"]').trigger("create");
  })
});