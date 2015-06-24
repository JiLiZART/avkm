(function (angular) {
    "use strict";

    angular
        .module('music')
        .controller('MusicController', [
            'musicService', '$sce', '$timeout', '$q',
            MusicController
        ]);

    /**
     * Main Controller for the Angular Material Starter App
     * @constructor
     */
    function MusicController(musicService, $sce, $timeout, $q) {
        var self = this;

        this.isGuest = true;
        this.username = '';
        this.menuOpened = false;

        var morphEl = document.getElementById('morph-shape'),
            s = Snap(morphEl.querySelector('svg')),
            path = s.select('path'),
            initialPath = path.attr('d'),
            pathOpen = morphEl.getAttribute('data-morph-open'),
            isAnimating = false;

        this.menuToggle = function () {

            if (self.menuOpened) {
                setTimeout(function () {
                    // reset path
                    path.attr('d', initialPath);
                    isAnimating = false;
                }, 300);
            } else {
                path.animate({'path': pathOpen}, 400, mina.easeinout, function () {
                    isAnimating = false;
                });
            }

            self.menuOpened = !self.menuOpened;
        };

        this.menuClose = function () {
            self.menuOpened = false;
        };

        musicService.auth()
            .then(function () {
                self.username = musicService.userFullName();
                self.isGuest = musicService.isGuest();
                loadAll();
            });

        this.login = function () {
            musicService.login().then(function (session) {
                self.username = musicService.userFullName();
                self.isGuest = musicService.isGuest();
                loadAll();
            });
        };

        this.logout = function () {
            musicService.logout().then(function (data) {
                window.location.reload();
            });
        };

        this.audios = {};
        this.albums = {};
        this.wall = [];
        this.recommendations = {};

        this.currentAlbumID = null;
        this.currentSource = [];
        this.currentAudios = [];
        this.currentAudio = null;
        this.currentPosition = null;
        this.currentState = null;

        this.onPlayerReady = function (API) {
            self.playerAPI = API;
        };

        this.onPlayerComplete = function () {
            self.isCompleted = true;

            self.currentPosition++;

            if (self.currentPosition >= self.currentAudios.length) {
                self.currentPosition = 0;
            }

            self.playByPosition(self.currentPosition);
        };

        this.playByPosition = function (index) {
            if (self.currentPosition === index) {
                switch (self.playerAPI.currentState) {
                    case 'play':
                        self.playerAPI.pause();
                        break;
                    case 'stop':
                        self.playerAPI.play();
                        break;
                    case 'pause':
                        self.playerAPI.play();
                        break;
                }

                self.currentState = self.playerAPI.currentState;
            } else {
                self.playerAPI.stop();
                self.currentPosition = index;
                self.currentSource = [self.currentAudios[index]];
                self.currentAudio = self.currentAudios[index];
                $timeout(function() {
                    self.playerAPI.play();
                    self.currentState = self.playerAPI.currentState;
                }.bind(self), 100);
            }
        };

        this.playGroup = function (audios, albumID, $event) {
            self.setCurrentAlbum(albumID);
            self.setCurrentAudios(audios);
            self.currentPosition = null;
            self.playByPosition(0);
        };

        this.getAlbumName = function (id) {
            return self.albums[id];
        };

        this.setCurrentAlbum = function (id) {
            self.currentAlbumID = id;
        };

        this.setCurrentAudios = function (audios) {
            self.currentAudios = audios.map(function (audio) {
                return {
                    title: audio.title,
                    artist: audio.artist,
                    url: audio.url,
                    genre: audio.genre,
                    album: self.albums[audio.album_id],
                    time: audio.time,
                    src: $sce.trustAsResourceUrl(audio.url),
                    type: "audio/mpeg"
                };
            });

            return self.currentAudios;
        };

        function loadAll() {
            return $q.all([
                musicService.loadUserAlbums(),
                musicService.loadUserAudio(),
                musicService.loadWallAudio(),
                musicService.loadRecommendations()
            ]).then(function (results) {
                self.albums = sortObject(results[0]);
                self.audios = results[1];
                self.wall = results[2];
                self.recommendations = results[3];

                self.setCurrentAlbum(0);
                self.setCurrentAudios(self.audios[0]);
            });
        }

        function sortObject(object) {
            return Object.keys(object).sort().reduce(function (result, key) {
                result[key] = object[key];
                return result;
            }, {});
        }
    }

})(angular);
