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

    function getGenre(id) {
        return GENRES[id];
    }

    /**
     * @constructor
     */
    function MusicService($q, VKAPI) {
        var artists = {};

        function addByArtist(items) {
            items.forEach(function (item) {
                var key = toTitleCase(item.artist.trim().toLowerCase());

                artists[key] = artists[key] || [];
                artists[key].push(transformAudioFile(item));
            });
        }

        function getAudioFromWallPost(wallPost) {
            var audios = [];

            if (Array.isArray(wallPost.attachments) && wallPost.attachments.length) {
                audios = audios.concat(getAudioFromAttachments(wallPost.attachments));
            }

            if (Array.isArray(wallPost.copy_history) && wallPost.copy_history.length &&
                Array.isArray(wallPost.copy_history[0].attachments) && wallPost.copy_history[0].attachments.length
            ) {
                audios = audios.concat(getAudioFromAttachments(wallPost.copy_history[0].attachments));
            }

            return audios;
        }

        function getAudioFromAttachments(attachments) {
            if (attachments && attachments.length) {
                return attachments.filter(isAttachmentAudio).map(getAudioFileFromAttachment);
            }

            return [];
        }

        function isAttachmentAudio(attachment) {
            return attachment.type === "audio";
        }

        function getAudioFileFromAttachment(attachment) {
            var audio = attachment.audio;

            audio.time = toMinutes(audio.duration);
            audio.genre = getGenre(audio.genre_id);

            return audio;
        }

        function transformAudioFile(audio) {
            audio.time = toMinutes(audio.duration);
            audio.genre = getGenre(audio.genre_id);
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

            getArtists: function() {
                return artists;
            },

            loadFromPopular: function () {

            },

            loadFromRecommendations: function () {

            },

            loadFromUser: function () {
                return VKAPI.api('audio.get', {
                    owner_id: VKAPI.getUser().id
                }).then(function (data) {
                    var result = [];

                    if (data.items && data.items.length) {
                        addByArtist(data.items);
                        result = data.items;
                    }

                    return result;
                });
            },

            loadFromWall: function () {
                return VKAPI.api('audio.get', {
                    owner_id: VKAPI.getUser().id,
                    extended: 1
                }).then(function(data) {
                    var result = [];

                    if (data.items && data.items.length) {
                        data.items
                            .map(getAudioFromWallPost)
                            .forEach(function (item) {
                                result = result.concat(item);
                            });

                        addByArtist(result);
                    }

                    return result;
                });
            },

            loadFromAll: function() {
                return $q.all([
                    methods.loadFromWall(),
                    methods.loadFromUser()
                ]).then(function (results) {
                    return [].concat(results[0], results[1]);
                });
            }
        };

        return methods;
    }

})(angular, window);
