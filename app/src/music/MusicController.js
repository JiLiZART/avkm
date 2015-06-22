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
        this.items = [];
        this.menuOpened = false;

        var morphEl = document.getElementById('morph-shape'),
            s = Snap(morphEl.querySelector('svg')),
            path = s.select('path'),
            initialPath = path.attr('d'),
            pathOpen = morphEl.getAttribute('data-morph-open'),
            isAnimating = false;

        this.menuToggle = function() {

            if (self.menuOpened) {
                setTimeout( function() {
                    // reset path
                    path.attr( 'd', initialPath );
                    isAnimating = false;
                }, 300 );
            } else {
                path.animate( { 'path' : pathOpen }, 400, mina.easeinout, function() { isAnimating = false; } );
            }

            self.menuOpened = ! self.menuOpened;
        };

        this.menuClose = function() {
            self.menuOpened = false;
        };

        musicService.auth()
            .then(function () {
                self.username = musicService.userFullName();
                self.isGuest = musicService.isGuest();
                loadFromAll();
            });

        this.login = function () {
            musicService.login().then(function (session) {
                self.username = musicService.userFullName();
                self.isGuest = musicService.isGuest();
                loadFromAll();
            });
        };

        this.logout = function () {
            musicService.logout().then(function(data) {
                window.location.reload();
            });
        };

        this.audios = [];
        this.audiosName = null;
        this.currentSource = [];
        this.currentAudio = null;
        this.currentPosition = null;
        this.currentState = null;

        this.onPlayerReady = function (PlayerAPI) {
            self.playerAPI = PlayerAPI;
        };

        this.onPlayerComplete = function() {
            self.isCompleted = true;

            self.currentPosition++;

            if (self.currentPosition >= self.audios.length) {
                self.currentPosition = 0;
            }

            self.playByPosition(self.currentPosition);
        };

        this.playByPosition = function(index) {
            self.playerAPI.stop();
            self.currentPosition = index;
            self.currentSource = [self.audios[index]];
            self.currentAudio = self.audios[index];
            $timeout(self.playerAPI.play.bind(self.playerAPI), 100);
        };

        this.playAudio = function () {
            this.playByPosition(self.currentPosition);
        };

        this.playGroup = function (audios, name, $event) {
            self.currentPosition = 0;
            self.audiosName = name;
            self.audios = audios.map(function(audio) {
                return {
                    title: audio.title,
                    artist: audio.artist,
                    url: audio.url,
                    genre: audio.genre,
                    time: audio.time,
                    src: $sce.trustAsResourceUrl(audio.url),
                    type: "audio/mpeg"
                };
            });

            this.playByPosition(self.currentPosition);
        };

        function loadFromAll() {
            musicService.loadFromAll().then(function() {
                self.items = musicService.getArtists();
            });
        }
    }

})(angular);
