// error.js

define([ "jquery" ], function($) {

  var MEDIA_ERROR_BROWSER_INCAPABLE = "mediaErrorBrowserIncapable";

  var codes = {
    MEDIA_ERROR_BROWSER_INCAPABLE: MEDIA_ERROR_BROWSER_INCAPABLE
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
        "<a href=\"/error/" + MEDIA_ERROR_BROWSER_INCAPABLE + ".html\">this page.</a>"
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
