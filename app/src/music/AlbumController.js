(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.controller('AlbumController', [
        '$scope', '$routeParams', '$route', '$q', '$sce', 'user', 'albums', 'audios',
        function ($scope, $routeParams, $route, $q, $sce, user, albums, audios) {
            var albumID = $routeParams.albumId || 0;

            console.log('album.controller', arguments);

            $scope.setUser(user);
            $scope.setAlbums(albums);
            $scope.setAudios(audios);
            $scope.setCurrentAlbum(albumID);
        }
    ]);

})(angular);
