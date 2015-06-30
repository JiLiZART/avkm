(function (module) {
    'use strict';

    module.controller('AppController', [
        '$rootScope', '$scope', 'musicService', '$sce', '$timeout',
        AppController
    ]);

    /**
     * @constructor
     */
    function AppController($rootScope, $scope, musicService, $sce, $timeout, $q) {
        var self = this;

        self.currentUser = null;
        self.userName = null;
        self.isAuthorized = null;
        self.title = '';

        self.albumID = null;
        self.playlist = [];
        self.position = null;
        self.state = null;
        self.repeat = false;

        $rootScope.$on('playerReady', function ($event, API) {
            self.playerAPI = API;
            $scope.playByPosition(0);
        });

        $rootScope.$on('playerComplete', function ($event) {
            if (self.repeat) {
                $scope.playRepeat();
            } else {
                $scope.playNext();
            }
        });

        $scope.setTitle = function (title) {
            self.title = ' | ' + title;
        };

        $scope.setUser = function (user) {
            self.currentUser = user;
            self.userName = musicService.getUserName();
            $scope.isGuest = musicService.isGuest();
            $scope.isAuthorized = !musicService.isGuest();
        };

        $scope.getUserName = function () {
            return self.userName;
        };

        $scope.setAlbums = function (albums) {
            self.albums = albums;
        };

        $scope.setAudios = function (audios) {
            self.audios = audios;
        };

        $scope.getAlbum = function (id) {
            return self.albums[id];
        };

        $scope.setCurrentAlbum = function (albumID) {
            self.albumID = albumID;
            $scope.setPlaylistByAlbum(albumID);
        };

        $scope.setPlaylist = function (audios) {
            self.position = null;
            self.playlist = audios.map(function (audio) {
                return {
                    title: audio.title,
                    artist: audio.artist,
                    url: audio.url,
                    genre: audio.genre,
                    album: self.albums[audio.album_id],
                    time: audio.time,
                    src: $sce.trustAsResourceUrl(audio.url),
                    type: 'audio/mpeg'
                };
            });
        };

        $scope.setPlaylistByAlbum = function (albumID) {
            return $scope.setPlaylist(self.audios[albumID]);
        };

        $scope.logout = function () {
            musicService.logout().then(function (data) {
                window.location.reload();
            });
        };

        $scope.login = function () {
            musicService.login().then(function () {

            });
        };

        $scope.repeatToggle = function () {
            self.repeat = !self.repeat;
        };

        $scope.playRepeat = function () {
            $scope.playByPosition(self.position);
        };

        $scope.playNext = function () {
            var nextPos = self.position + 1;

            if (nextPos > self.playlist.length) {
                self.position = 0;
                nextPos = 0;
            }

            $scope.playByPosition(nextPos);
        };

        $scope.playPrev = function () {
            var nextPos = self.position - 1;

            if (nextPos < 0) {
                self.position = self.playlist.length;
                nextPos = self.playlist.length;
            }

            $scope.playByPosition(nextPos);
        };

        $scope.playByPosition = function (index) {
            if (self.position === index) {
                switch (self.playerAPI.state) {
                    case 'play':
                        $rootScope.$emit('pause');
                        break;
                    case 'stop':
                        $rootScope.$emit('play');
                        break;
                    case 'pause':
                        $rootScope.$emit('play');
                        break;
                }

                self.state = self.playerAPI.state;
            } else {
                $rootScope.$emit('stop');
                self.position = index;
                $rootScope.$emit('source', self.playlist[index]);

                $timeout(function () {
                    $rootScope.$emit('play');
                    self.state = self.playerAPI.state;
                }.bind(self), 100);
            }

            return self;
        };
    }

})(angular.module('app'));
