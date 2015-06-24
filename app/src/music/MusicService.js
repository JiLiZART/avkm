(function (angular, window) {
    'use strict';

    angular.module('music')
        .service('musicService', ['$q', 'VKAPI', MusicService]);

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

    var GENRES = {
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
    };

    /**
     * @constructor
     */
    function MusicService($q, VKAPI) {
        var artists = {};
        var albums = {};
        var recommendations = [];
        var audios = {
            0: []
        };

        function getGenre(id) {
            return GENRES[id];
        }

        function getAlbum(id) {
            return albums[id];
        }

        function addAlbum(album) {
            albums[album.id] = album.title;
        }

        function addRecommendation(audio) {
            recommendations.push(transformAudio(audio));
        }

        function addAudio(audio) {
            if (audio.album_id) {
                audios[audio.album_id] = audios[audio.album_id] || [];
                audios[audio.album_id].push(transformAudio(audio));
            }

            audios[0].push(transformAudio(audio));
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
            return attachment.type === "audio";
        }

        function transformAudio(audio) {
            audio.time = toMinutes(audio.duration);
            audio.genre = getGenre(audio.genre_id);
            audio.album = getAlbum(audio.album_id);
            return audio;
        }

        var methods = {
            init: function () {
                return VKAPI.inject();
            },

            auth: function () {
                return methods.init()
                    .then(function () {
                        return VKAPI.getLoginStatus();
                    });
            },

            userFullName: function () {
                return VKAPI.getUserFullName();
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

            getArtists: function () {
                return artists;
            },

            getAlbums: function () {
                return albums;
            },

            getAudios: function () {
                return audios;
            },

            getRecommendations: function () {
                return recommendations;
            },

            loadUserAlbums: function () {
                var params = {
                    owner_id: VKAPI.getUser().id,
                    count: 100
                };

                return VKAPI.api('audio.getAlbums', params).then(function (data) {
                    data.items.forEach(function (album) {
                        addAlbum(album);
                    });

                    addAlbum({
                        id: 0,
                        title: 'Все'
                    });

                    return methods.getAlbums();
                });
            },

            loadUserAudio: function (albumID) {
                var params = {
                    owner_id: VKAPI.getUser().id
                };

                if (typeof albumID !== 'undefined') {
                    params.album_id = albumID;
                }

                return VKAPI.api('audio.get', params).then(function (data) {
                    data.items.forEach(function (audio) {
                        addAudio(audio);
                    });

                    return methods.getAudios();
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
                    data.items.forEach(function (audio) {
                        addRecommendation(audio);
                    });

                    return methods.getRecommendations();
                });
            },

            loadWallAudio: function () {
                return VKAPI.api('wall.get', {
                    owner_id: VKAPI.getUser().id
                }).then(function (data) {

                    if (data.items) {
                        data.items.map(fromWallPost).forEach(function(wallAudios) {
                            wallAudios.forEach(function(audio) {
                                addArtist(audio);
                            });
                        });
                    }

                    return methods.getArtists();
                });
            }
        };

        return methods;
    }

})(angular, window);
