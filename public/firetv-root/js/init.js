(function(exports) {
    'use strict';

    var settings = {
        Model: PicasaAPIModel,
        PlayerView: PlayerView,
        PlaylistView: PlaylistPlayerView,
        showSearch: false,
        skipLength: 30,
        controlsHideTime: 3000,
        displayButtons: false
    };

    exports.app = new App(settings);
}(window));
