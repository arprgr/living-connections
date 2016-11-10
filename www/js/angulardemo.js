// angulardemo.js

define([ "jquery" ], function($) {

  $("body")
    .append($("<p>").text("1 + 2 = {{ 1 + 2 }}"))
    .append($("<div>").attr("ng-controller", "MyController").text("Hello {{greetMe}}"));

  return function() {
    angular.module("myApp", [])
      .controller("MyController", [ "$scope", function($scope) {
        $scope.greetMe = "World";
      } ]);
    angular.bootstrap(document, [ "myApp" ]);
  }
});
