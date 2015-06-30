(function (ng) {
    'use strict';

    ng.module('app', ['music', 'vk', 'ngRoute'])
        .config(['$routeProvider', '$locationProvider',
            function ($routeProvider, $locationProvider) {

                var albumResolve = {
                    user: function (musicService) {
                        return musicService.getUser()
                    },
                    albums: function (musicService) {
                        return musicService.getUser().then(function () {
                            return musicService.getAlbums();
                        });
                    },
                    audios: function (musicService) {
                        return musicService.getUser().then(function () {
                            return musicService.getWall();
                        }).then(function () {
                            return musicService.getRecommendations();
                        }).then(function () {
                            return musicService.getPopular();
                        }).then(function () {
                            return musicService.getAudios();
                        }).then(function () {
                            return musicService.getAll();
                        });
                    }
                };

                $routeProvider
                    .when('', {
                        templateUrl: 'views/album.html',
                        controller: 'AlbumController',
                        controllerAs: 'album',
                        resolve: albumResolve
                    })
                    .when('/login', {
                        templateUrl: 'views/login.html',
                        controller: 'LoginController',
                        controllerAs: 'auth'
                    })
                    .when('/album/:albumId', {
                        templateUrl: 'views/album.html',
                        controller: 'AlbumController',
                        controllerAs: 'album',
                        resolve: albumResolve
                    });

                // configure html5 to get links working on jsfiddle
                $locationProvider.html5Mode(true);
            }
        ]).run(['musicService', '$location', function(musicService, $location) {
            musicService.getUser().then(function() {
                $location.path('/album/0');
            }, function() {
                $location.path('/login');
            });
        }]);
})(angular);
