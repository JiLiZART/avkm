(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.controller('AlbumController', [
        '$scope', '$routeParams', 'musicService', 'ALBUM', 'user', 'albums', 'audios',
        function ($scope, $routeParams, musicService, ALBUM, user, albums, audios) {
            console.log('AlbumController');
            var albumID = $routeParams.albumId || 0;

            var promise = musicService.getAudios();

            switch (albumID) {
                case ALBUM.RECOMEND:
                    promise.then(function () {
                        return musicService.getRecommendations();
                    });
                    break;
                case ALBUM.WALL:
                    promise.then(function () {
                        return musicService.getWall();
                    });
                    break;
                case ALBUM.POPULAR:
                    promise.then(function () {
                        return musicService.getPopular();
                    });
                    break;
            }

            promise.then(function () {
                console.log('albums', albums);
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
