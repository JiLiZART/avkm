(function (window, angular, _) {
    /* global VK */
    'use strict';

    angular.module('vk')
        .constant('API_VERSION', '5.35')
        .factory('VKAPI', ['$q', '$window', 'API_VERSION', 'APP_ID', VKService]);

    var APPENDED = false;

    function appendScript() {
        if (APPENDED === false) {
            var el = document.createElement("script");
            el.type = "text/javascript";
            el.src = "//vk.com/js/api/openapi.js";
            el.async = true;
            document.getElementById("vk_api_transport").appendChild(el);
        }

        APPENDED = true;
    }

    function VKService($q, $window, API_VERSION, APP_ID) {
        var defer = $q.defer();
        var versionOptions = {
            v: API_VERSION
        };
        var SESSION;
        var INJECTED = false;
        var USER;

        $window.vkAsyncInit = function () {
            VK.init({apiId: APP_ID});

            methods.access = VK.access;
            methods.apiCall = VK.Api.call; //_.debounce(VK.Api.call, 300);

            setTimeout(function () {
                INJECTED = true;
                defer.resolve(INJECTED);
            }, 0);
        };

        var methods = {
            access: null,
            session: SESSION,

            /**
             * @returns {Promise}
             */
            getUser: function () {
                return $q(function (resolve, reject) {
                    if (USER) {
                        resolve(USER);
                    } else {
                        reject(false);
                    }
                });
            },

            user: function() {
                return USER;
            },

            userFullName: function () {
                return USER.first_name + ' ' + USER.last_name;
            },

            /**
             * @returns {Promise}
             */
            apiUsersGetCurrent: function () {
                return methods.api('users.get', {
                    user_ids: SESSION.mid
                }).then(function (data) {
                    USER = data[0];
                    return USER;
                });
            },

            /**
             * @returns {Promise}
             */
            apiUsersGet: function(ids) {
                return methods.api('users.get', {
                    user_ids: ids
                });
            },

            /**
             * @returns {Promise}
             */
            getLoginStatus: function () {
                return $q(function (resolve, reject) {
                    VK.Auth.getLoginStatus(function (data) {
                        SESSION = data.session;

                        if (SESSION !== null && data.status !== 'not_authorized') {
                            methods.apiUsersGetCurrent().then(function () {
                                resolve(USER);
                            }, reject);
                        } else {
                            reject(data);
                        }
                    });
                });
            },

            /**
             * @returns {Boolean}
             */
            isGuest: function () {
                return typeof USER === 'undefined';
            },

            /**
             * @param {Number} access code
             * @returns {Promise}
             */
            login: function (access) {
                return $q(function (resolve, reject) {
                    VK.Auth.login(function (data) {
                        if (data.status === "connected") {
                            SESSION = data.session;
                            methods.apiUsersGetCurrent().then(function () {
                                resolve(data.session);
                            });
                        } else {
                            reject(data.error);
                        }
                    }, access);
                });
            },

            /**
             * @returns {Promise}
             */
            logout: function () {
                return $q(function (resolve, reject) {
                    VK.Auth.logout(function (data) {
                        resolve(data);
                    });
                });
            },

            /**
             * @returns {Promise}
             */
            api: function (method, settings) {
                var params = angular.extend(versionOptions, {
                    offset: 0
                    //count: MAX_COUNT
                }, settings);

                /**
                 * Inject 'next' function to paginate
                 * @param res
                 * @returns {*}
                 */
                function injectNext(res) {
                    var count = res.count,
                        len = res.items && res.items.length,
                        nextOffset;

                    if (count && len && (params.offset + len < count)) {
                        nextOffset = params.offset + len;

                        if (nextOffset) {
                            params.offset = nextOffset;
                            res.next = apiCall.bind(null, method, params);
                        }
                    }

                    return res;
                }

                function apiCall(method, params) {
                    return $q(function (resolve, reject) {
                        methods.apiCall(method, params, function (data) {
                            if (data.response) {
                                resolve(data.response);
                            } else {
                                console.error(method + ':' + data.error.error_msg, params);
                                reject(data.error);
                            }
                        });
                    });
                }

                return apiCall(method, params);
            },

            /**
             * @returns {Promise}
             */
            inject: function () {
                setTimeout(function () {
                    appendScript();
                }, 0);

                return defer.promise;
            }
        };

        return methods;
    }

})(window, angular, _);
