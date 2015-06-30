(function (module) {
    'use strict';

    module.directive('musicBar', [
        function () {
            return {
                restrict: 'E',
                templateUrl: 'views/music-bar.html',

                controller: ['$scope', '$rootScope', '$timeout', '$sce', 'musicService',
                    function ($scope, $rootScope, $timeout, $sce, mService) {
                        var self = this;

                        self.state = null;
                        self.playerAPI = null;
                        self.currentAudio = null;
                        self.source = [];

                        this.onPlayerReady = function (API) {
                            self.playerAPI = API;
                            $rootScope.$emit('playerReady', self.playerAPI);
                        };

                        this.onPlayerComplete = function () {
                            $rootScope.$emit('playerComplete', self.playerAPI);
                        };

                        this.onStateUpdate = function (state) {
                            self.state = state;
                            $rootScope.$emit('stateUpdate', state);
                        };

                        $rootScope.$on('source', function($event, source) {
                            self.source = [source];
                            self.currentAudio = source;
                            $scope.setTitle(source.artist + ' - ' + source.title);
                        });

                        $rootScope.$on('play', function() {
                            self.playerAPI.play();
                        });

                        $rootScope.$on('stop', function() {
                            self.playerAPI.stop();
                        });

                        $rootScope.$on('pause', function() {
                            self.playerAPI.pause();
                        });
                    }
                ],

                controllerAs: 'bar',

                link: function (scope, elem, attrs) {
                    elem.addClass('music-bar');
                }
            };
        }
    ]);

})(angular.module('music'));
