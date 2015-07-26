(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.controller('AlbumController', [
        '$scope', '$routeParams', 'musicService', 'ALBUM', 'user', 'albums', 'audios',
        function ($scope, $routeParams, musicService, ALBUM, user, albums, audios) {
            var albumID = $routeParams.albumId || 0;

            musicService
                .getAudios()
                .then(function () {
                    return musicService.getRecommendations();
                })
                .then(function () {
                    return musicService.getWall();
                })
                .then(function () {
                    return musicService.getPopular();
                })
                .then(function () {
                    $scope.setUser(user);
                    $scope.setAlbums(albums);

                    musicService.getAll().then(function (audios) {
                        $scope.setAudios(audios);
                        $scope.setCurrentAlbum(albumID);
                    });
                });
        }
    ]);

})(angular);
