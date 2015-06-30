(function (module) {
    'use strict';

    module.controller('LoginController', [
        '$scope', 'musicService', '$sce', '$timeout', '$q',
        LoginController
    ]);

    function LoginController($scope, musicService) {
        this.login = function () {
            musicService.login();
        };
    }

})(angular.module('app'));
