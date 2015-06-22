var MusicAlbums = function() {
    this.loadAll = function() {
        browser.get('/#');
    };

    this.count = function() {
        return element.all(by.css('music-albums__item')).count();
    };
};

module.exports = MusicAlbums;

