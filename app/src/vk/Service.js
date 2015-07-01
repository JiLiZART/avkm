(function (window, angular, _) {
    'use strict';

    var APP_ID = '4966083';
    var API_VERSION = '5.34';
    var MAX_COUNT = 6000;

    angular.module('vk')
        .service('VKAPI', ['$q', VKService]);

    function VKService($q) {
        var defer = $q.defer();
        var versionOptions = {
            v: API_VERSION
        };
        var session;
        var user;

        window.vkAsyncInit = function () {
            VK.init({apiId: APP_ID});

            methods.access = VK.access;
            methods.apiCall = VK.Api.call; //_.debounce(VK.Api.call, 300);

            defer.resolve();
        };

        var methods = {
            access: null,

            getSession: function () {
                return session;
            },

            getUser: function () {
                return user;
            },

            getUserFullName: function () {
                return user.first_name + ' ' + user.last_name;
            },

            loadUser: function () {
                return methods.api('users.get', {
                    user_ids: session.mid
                }).then(function (data) {
                    user = data[0];
                    return user;
                });
            },

            getLoginStatus: function () {
                return $q(function (resolve, reject) {
                    VK.Auth.getLoginStatus(function (data) {
                        session = data.session;

                        if (session) {
                            methods.loadUser().then(function () {
                                resolve(user);
                            });
                        } else {
                            reject(data.error);
                        }
                    });
                });
            },

            isGuest: function () {
                return typeof user === 'undefined';
            },

            login: function (access) {
                return $q(function (resolve, reject) {
                    VK.Auth.login(function (data) {
                        if (data.status === "connected") {
                            session = data.session;
                            methods.loadUser().then(function () {
                                resolve(data.session);
                            });
                        } else {
                            reject(data.error);
                        }
                    }, access);
                });
            },

            logout: function () {
                return $q(function (resolve, reject) {
                    VK.Auth.logout(function (data) {
                        resolve(data);
                    });
                });
            },

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

            inject: function () {
                setTimeout(function () {
                    var el = document.createElement("script");
                    el.type = "text/javascript";
                    el.src = "//vk.com/js/api/openapi.js";
                    el.async = true;
                    document.getElementById("vk_api_transport").appendChild(el);
                }, 0);

                return defer.promise;
            }
        };

        methods.inject();

        return methods;
    }

})(window, angular, _);
