(function (ng) {
    'use strict';

    var resolveUser = function(musicService, $location) {
        musicService.getUser().catch(function () {
            $location.path('/login');
        });
    };

    var loginResolve = function (musicService, $location) {
        musicService.getUser().then(function () {
            $location.path('/');
        });
    };

    ng.module('app', ['music', 'vk', 'ngRoute'])
        .config(['$routeProvider', '$locationProvider',
            function ($routeProvider, $locationProvider) {
                var albumResolve = {
                    user: resolveUser,
                    albums: function (musicService) {
                        return musicService.getUser().then(function () {
                            return musicService.getAlbums();
                        });
                    },
                    audios: function (musicService) {
                        return musicService.getUser().then(function () {
                            return musicService.getAudios();
                        });
                    }
                };

                $routeProvider
                    .when('/', {
                        templateUrl: 'views/album.html',
                        controller: 'AlbumController',
                        controllerAs: 'album',
                        resolve: albumResolve
                    })
                    .when('/login', {
                        templateUrl: 'views/login.html',
                        controller: 'LoginController',
                        controllerAs: 'auth',
                        resolve: loginResolve
                    })
                    .when('/album/:albumId', {
                        templateUrl: 'views/album.html',
                        controller: 'AlbumController',
                        controllerAs: 'album',
                        resolve: albumResolve
                    })
                    .otherwise({
                        redirectTo: '/login'
                    });

                // configure html5 to get links working on jsfiddle
                $locationProvider.hashPrefix('!');
            }
        ]).run(['musicService', '$location', resolveUser]);
})(angular);
