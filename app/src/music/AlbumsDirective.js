(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.directive('musicAlbums', [
        function () {
            return {
                restrict: 'E',
                templateUrl: 'views/music-albums.html',
                link: function (scope, elem, attr, musicBar) {
                    elem.addClass('music-albums');
                }
            };
        }
    ]);

})(angular);
