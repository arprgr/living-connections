// error.js

define([ "jquery" ], function($) {

  var MEDIA_ERROR_BROWSER_INCAPABLE = "mediaErrorBrowserIncapable";
  var STARTUP_ERROR_TIMEOUT = "startupErrorTimeout";

  var codes = {
    MEDIA_ERROR_BROWSER_INCAPABLE: MEDIA_ERROR_BROWSER_INCAPABLE,
    STARTUP_ERROR_TIMEOUT: STARTUP_ERROR_TIMEOUT
  }

  var renderers = {};

  function registerRenderer(code, renderer) {
    renderers[code] = renderer;
  }

  registerRenderer(MEDIA_ERROR_BROWSER_INCAPABLE, function(error) {
    return "" + 
      "<p>" +
        "Sorry, the browser you are using is not capable of playing and recording videos." +
      "</p>" +
      "<p>" +
        "For more information, see " +
        "<a href=\"/error/" + MEDIA_ERROR_BROWSER_INCAPABLE + ".html\">this page.</a>" +
      "</p>";
  });

  registerRenderer(STARTUP_ERROR_TIMEOUT, function(error) {
    return "" + 
      "<p>" +
        "There seems to be a problem connecting.  Please check your Internet connection and " +
        "refresh the page to continue." +
      "</p>";
  });

  function defaultRenderer(error) {
    return "" + 
      "<p>" +
        "Something unexpected happened." +
      "</p>" +
      "<p>" +
        "To report this error to Living Connections, please " +
        "<a href=\"/error/placebo.html\">click here.</a>"
      "</p>";
  }

  function render(error) {
    var renderer = renderers[error.message] || defaultRenderer;
    return renderer(error);
  }

  //
  // The module.
  //
  return {
    codes: codes,
    render: render
  }
});
