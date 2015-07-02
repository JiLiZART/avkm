(function (angular, window) {
    'use strict';

    angular.module('music')
        .constant('GENRES', {
            1: 'Rock',
            2: 'Pop',
            3: 'Rap & Hip-Hop',
            4: 'Easy Listening',
            5: 'Dance & House',
            6: 'Instrumental',
            7: 'Metal',
            21: 'Alternative',
            8: 'Dubstep',
            9: 'Jazz & Blues',
            10: 'Drum & Bass',
            11: 'Trance',
            12: 'Chanson',
            13: 'Ethnic',
            14: 'Acoustic & Vocal',
            15: 'Reggae',
            16: 'Classical',
            17: 'Indie Pop',
            19: 'Speech',
            22: 'Electropop & Disco',
            18: 'Other'
        })
        .constant('ALBUM', {
            ALL: 0,
            RECOMEND: 1,
            WALL: 2,
            POPULAR: 3
        })
        .factory('musicService', ['$q', 'VKAPI', 'GENRES', 'ALBUM', MusicService]);

    /**
     * @constructor
     */
    function MusicService($q, VKAPI, GENRES, ALBUM) {
        var defaultAlbums = {
                0: 'Все',
                1: 'Рекомендации',
                2: 'Стена',
                3: 'Популярное'
            },
            user,
            all = {},
            audiosIDS = [],
            albums = [],
            artists = {},
            recommendations = [],
            audios = [],
            wall = [],
            popular = [];

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        function toMinutes(time) {
            var minutes = "0" + Math.floor(time / 60);
            var seconds = "0" + (time - minutes * 60);
            return minutes.substr(-2) + ":" + seconds.substr(-2);
        }

        function getGenre(id) {
            return GENRES[id];
        }

        function getAlbum(id) {
            return id ? albums[id] : '';
        }

        function addAlbum(album) {
            albums[album.id] = album.title;
        }

        function pushToAll(album, audio) {
            all[album] = all[album] || [];
            all[album].push(transformAudio(audio));
        }

        function addPopular(audio) {
            pushToAll(ALBUM.POPULAR, audio);
            popular.push(transformAudio(audio));
        }

        function addWallAudio(audio) {
            pushToAll(ALBUM.WALL, audio);
            wall.push(transformAudio(audio));
        }

        function addRecommendation(audio) {
            pushToAll(ALBUM.RECOMEND, audio);
            recommendations.push(transformAudio(audio));
        }

        function addAudio(audio) {
            audio.album_id && pushToAll(audio.album_id, audio);

            pushToAll(ALBUM.ALL, audio);

            audiosIDS.push(audio.id);
            audios.push(transformAudio(audio));
        }

        function addArtist(audio) {
            var key = toTitleCase(audio.artist.trim().toLowerCase());

            artists[key] = artists[key] || [];
            artists[key].push(transformAudio(audio));
        }

        function fromWallPost(wallPost) {
            var audios = [];

            if (Array.isArray(wallPost.attachments) && wallPost.attachments.length) {
                audios = audios.concat(fromAttachments(wallPost.attachments));
            }

            if (Array.isArray(wallPost.copy_history) && wallPost.copy_history.length &&
                Array.isArray(wallPost.copy_history[0].attachments) && wallPost.copy_history[0].attachments.length
            ) {
                audios = audios.concat(fromAttachments(wallPost.copy_history[0].attachments));
            }

            return audios;
        }

        function fromAttachments(attachments) {
            if (attachments && attachments.length) {
                return attachments.filter(isAttachmentAudio).map(fromAttachment);
            }

            return [];
        }

        function fromAttachment(attachment) {
            var audio = attachment.audio;

            audio.time = toMinutes(audio.duration);
            audio.genre = getGenre(audio.genre_id);

            return audio;
        }

        function isAttachmentAudio(attachment) {
            return attachment.type === 'audio';
        }

        function transformAudio(audio) {
            audio.time = toMinutes(audio.duration);
            audio.genre = getGenre(audio.genre_id);
            audio.album = getAlbum(audio.album_id);
            return audio;
        }

        function sortObject(object) {
            return Object.keys(object).sort().reduce(function (result, key) {
                result[key] = object[key];
                return result;
            }, {});
        }

        var methods = {
            init: function () {
                return VKAPI.inject();
            },

            isGuest: function () {
                return VKAPI.isGuest();
            },

            login: function () {
                return VKAPI.login(VKAPI.access.AUDIO);
            },

            logout: function () {
                return VKAPI.logout();
            },

            getUser: function () {
                return $q(function (resolve, reject) {
                    var resolveUser = function () {
                        user = VKAPI.getUser();
                        resolve(user);
                    };

                    if (user) {
                        resolve(user);
                    } else {
                        methods.init()
                            .then(function () {
                                if (VKAPI.getUser()) {
                                    resolveUser();
                                } else {
                                    VKAPI.getLoginStatus().then(resolveUser);
                                }
                            });
                    }
                });
            },

            getUserName: function () {
                return VKAPI.getUserFullName();
            },

            getArtists: function () {
                return $q(function (resolve, reject) {
                    resolve(artists);
                });
            },

            getIDS: function () {
                return $q(function (resolve, reject) {
                    resolve(audiosIDS);
                });
            },

            getAlbums: function () {
                return $q(function (resolve, reject) {
                    var items = albums;

                    if (items && items.length) {
                        resolve(items);
                    } else {
                        methods.loadAlbums().then(function () {
                            albums = sortObject(angular.extend(albums, defaultAlbums));
                            resolve(albums);
                        }, reject);
                    }
                });
            },

            loadAlbums: function () {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    count: 100
                };

                return VKAPI.api('audio.getAlbums', params).then(function (data) {
                    return data.items.forEach(addAlbum);
                });
            },

            getAll: function () {
                return $q(function (resolve, reject) {
                    resolve(all);
                });
            },

            getPopular: function () {
                return $q(function (resolve, reject) {
                    var items = popular;

                    if (items && items.length) {
                        resolve(items);
                    } else {
                        methods.loadPopular().then(function () {
                            resolve(popular);
                        }, reject);
                    }
                });
            },

            loadPopular: function () {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    count: 1000
                };

                return VKAPI.api('audio.getPopular', params).then(function (data) {
                    return data.forEach(addPopular);
                });
            },

            getWall: function () {
                return $q(function (resolve, reject) {
                    var items = wall;

                    if (items && items.length) {
                        resolve(items);
                    } else {
                        methods.loadWall().then(function () {
                            resolve(wall);
                        }, reject);
                    }
                });
            },

            loadWall: function () {
                return VKAPI.api('wall.get', {
                    owner_id: VKAPI.getUser().id
                }).then(function (data) {
                    return data.items && data.items.map(fromWallPost).forEach(function (wallAudios) {
                            wallAudios.forEach(addWallAudio);
                        });
                });
            },

            getAudios: function () {
                return $q(function (resolve, reject) {
                    var items = audios;

                    if (items && items.length) {
                        resolve(items);
                    } else {
                        methods.loadAudios().then(function () {
                            resolve(audios);
                        }, reject);
                    }
                });
            },

            loadAudios: function (albumID) {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    count: 6000
                };

                if (typeof albumID !== 'undefined') {
                    params.album_id = albumID;
                }

                return VKAPI.api('audio.get', params).then(function (data) {
                    return data.items.forEach(addAudio);
                });
            },

            getRecommendations: function () {
                return $q(function (resolve, reject) {
                    if (recommendations.length) {
                        resolve(recommendations);
                    } else {
                        methods.loadRecommendations().then(function () {
                            resolve(recommendations);
                        }, reject);
                    }
                });
            },

            loadRecommendations: function (shuffle) {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    count: 1000
                };

                if (typeof shuffle !== 'undefined') {
                    params.shuffle = shuffle;
                }

                return VKAPI.api('audio.getRecommendations', params).then(function (data) {
                    return data.items.forEach(addRecommendation);
                });
            },

            addAudio: function (id) {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    audio_id: id
                };

                return VKAPI.api('audio.add', params).then(function (data) {
                    return data;
                });
            }
        };

        return methods;
    }

})(angular, window);
