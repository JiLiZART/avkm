(function (module) {
    'use strict';

    module.controller('LoginController', [
        '$scope', '$location', 'musicService',
        LoginController
    ]);

    function LoginController($scope, $location, musicService) {
        $scope.login = function () {
            musicService.login().then(function () {
                $location.path('/album/0');
            });
        };
    }

})(angular.module('app'));
