(function(angular) {
    "use strict";

    angular.module('music')
        .run(
        ["$templateCache", function ($templateCache) {
            $templateCache.put("music-templates/music-volume-bar",
                '<div class="horizontalVolumeBar">\
                  <div class="volumeBackground" \
                  ng-click="onClickVolume($event)" \
                  ng-mousedown="onMouseDownVolume()" \
                  ng-mouseup="onMouseUpVolume()" \
                  ng-mousemove="onMouseMoveVolume($event)" \
                  ng-mouseleave="onMouseLeaveVolume()">\
                    <div class="volumeValue"></div>\
                    <div class="volumeClickArea"></div>\
                  </div>\
                </div>');
        }]
    )
        .directive("volumeHorizontalBar",
        ["VG_UTILS", function (VG_UTILS) {
            return {
                restrict: "E",
                require: "^videogular",
                templateUrl: function (elem, attrs) {
                    return attrs.volumeTemplate || 'music-templates/music-volume-bar';
                },
                link: function (scope, elem, attr, API) {
                    var isChangingVolume = false;
                    var volumeBackElem = angular.element(elem[0].getElementsByClassName("volumeBackground"));
                    var volumeValueElem = angular.element(elem[0].getElementsByClassName("volumeValue"));

                    function setVolume(event) {
                        event = VG_UTILS.fixEventOffset(event);
                        var volumeWidth = parseInt(volumeBackElem.prop("offsetWidth"));
                        var value = event.offsetX * 100 / volumeWidth;
                        var volValue = value / 100;

                        API.setVolume(volValue);
                    }

                    scope.onClickVolume = function onClickVolume(event) {
                        setVolume(event);
                    };

                    scope.onMouseDownVolume = function onMouseDownVolume() {
                        isChangingVolume = true;
                    };

                    scope.onMouseUpVolume = function onMouseUpVolume() {
                        isChangingVolume = false;
                    };

                    scope.onMouseLeaveVolume = function onMouseLeaveVolume() {
                        isChangingVolume = false;
                    };

                    scope.onMouseMoveVolume = function onMouseMoveVolume(event) {
                        if (isChangingVolume) {
                            setVolume(event);
                        }
                    };

                    scope.updateVolumeView = function updateVolumeView(value) {
                        value = value * 100;
                        volumeValueElem.css("width", value + "%");
                        volumeValueElem.css("right", (100 - value) + "%");
                    };

                    //Update the volume bar on initialization, then watch for changes
                    scope.updateVolumeView(API.volume);

                    scope.$watch(
                        function () {
                            return API.volume;
                        },
                        function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                scope.updateVolumeView(newVal);
                            }
                        }
                    );
                }
            }
        }]
    );

})(angular);
