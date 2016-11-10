// app.js

function App(props) {
  this.props = props;
}
App.prototype.generateHtml = function() {
  var appProps = this.props;
  // TODO: figure out Express app.render, take on a template engine, such as Pug.
  return '' +
    '<html>\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<link rel="stylesheet" type="text/css" href="' + appProps.stylesheet + '">\n' +
    '<title>' + appProps.title + '</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '<h1>' + appProps.title + '</h1>\n' +
    '</body>\n' +
    '<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>\n' +
    '<script>\n' +
    'var require = {\n' +
    '  baseUrl: "/js",\n' +
    '  paths: {\n' +
    '    "jquery": "jquery-' + appProps.jqueryVersion + '",\n' +
    '    "mocha": "../mocha/mocha",\n' +
    '    "chai": "../chai/chai"\n' +
    '  },\n' +
    '  map: {\n' +
    '    "*": { "jquery": "jquery-private" }, \n' +
    '    "jquery-private": { "jquery": "jquery" } \n' +
    '  },\n' +
    '  deps: [ "' + appProps.main + '" ], \n' +
    '  callback: function(app) { app && app(); } \n' +
    '}\n' +
    '</script>\n' +
    '<script src="js/require.js"></script>\n' +
    '</html>\n'
}

module.exports = App;
