(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.controller('AlbumController', [
        '$scope', '$routeParams', 'user', 'albums', 'audios',
        function ($scope, $routeParams, user, albums, audios) {
            var albumID = $routeParams.albumId || 0;

            $scope.setUser(user);
            $scope.setAlbums(albums);
            $scope.setAudios(audios);
            $scope.setCurrentAlbum(albumID);
        }
    ]);

})(angular);
