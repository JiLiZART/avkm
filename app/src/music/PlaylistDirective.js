(function (module) {
    'use strict';

    module.directive('musicPlaylist', [
        function () {
            return {
                restrict: 'E',
                templateUrl: 'views/music-playlist.html',
                link: function (scope, elem, attr, musicBar) {
                    elem.addClass('music-playlist');
                }
            };
        }
    ]);

})(angular.module('music'));
