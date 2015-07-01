(function (angular) {
    'use strict';

    var module = angular.module('music');

    module.controller('AlbumController', [
        '$scope', '$routeParams', 'user', 'albums', 'audios', 'audioIDS',
        function ($scope, $routeParams, user, albums, audios, audioIDS) {
            var albumID = $routeParams.albumId || 0;

            //_.each(audios, function (files, album) {
            //    audios[album] = audios[album].map(function (audio) {
            //        audio.added = audioIDS.indexOf(audio.id) !== -1;
            //
            //        console.log(audio.id, 'audio.added', audio.added);
            //        return audio;
            //    });
            //});

            $scope.setUser(user);
            $scope.setAlbums(albums);
            $scope.setAudios(audios);
            $scope.setCurrentAlbum(albumID);
        }
    ]);

})(angular);
