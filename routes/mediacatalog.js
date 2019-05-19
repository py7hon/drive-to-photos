var express = require('express');
var router = express.Router();


var cats = [{
    "title": "Top 100",
    "category_id": "top100",
    "order": 1
}, {
    "title": "4k Collection",
    "category_id": "4kcollection",
    "order": 2
}, {
    "title": "Bollywood",
    "category_id": "bollywood",
    "order": 3
}];



/* GET ca listing. */
router.get('/', async function (req, res, next) {
    res.send(cats);
});

router.get('/:categoryId', async function (req, res, next) {
    //todo: read from db
    var toReturn = null;
    switch (req.params.categoryId) {
        case "top100":
            toReturn = [{
                title: "The Dark Knight",
                description: "With the help of allies Lt. Jim Gordon (Gary Oldman) and DA Harvey Dent (Aaron Eckhart), Batman (Christian Bale) has been able to keep a tight lid on crime in Gotham City. But when a vile young criminal calling himself the Joker (Heath Ledger) suddenly throws the town into chaos, the caped Crusader ",
                thumbnailLink: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
                media_sources: [{
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/0B7ZVRik5qHMfRTFrQkc5OE9SeDA",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }, {
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1IZFIiE6300eJIQPz0lHXB1NdC98qkOR5",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }]
            }, {
                title: "The Dark Knight Rises",
                description: "It has been eight years since Batman (Christian Bale), in collusion with Commissioner Gordon (Gary Oldman), vanished into the night. Assuming responsibility for the death of Harvey Dent, Batman sacrificed everything for what he and Gordon hoped would be the greater good. However, the arrival of a cu",
                thumbnailLink: "https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_.jpg",
                media_sources: [{
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1XLo1w7M7QWQKoNmNywfBcfQ2tiCcyymG",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }, {
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1IZFIiE6300eJIQPz0lHXB1NdC98qkOR5",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }]
            }];
            break;
        case "4kcollection":
            toReturn = [{
                title: "The Dark Knight",
                description: "With the help of allies Lt. Jim Gordon (Gary Oldman) and DA Harvey Dent (Aaron Eckhart), Batman (Christian Bale) has been able to keep a tight lid on crime in Gotham City. But when a vile young criminal calling himself the Joker (Heath Ledger) suddenly throws the town into chaos, the caped Crusader ",
                thumbnailLink: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
                media_sources: [{
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1tQI5uN9xR1j4sCy75xYhNHTCyiGCdR-Q",
                    mediaQuality: "HDR4k",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }, {
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1IZFIiE6300eJIQPz0lHXB1NdC98qkOR5",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }]
            }, {
                title: "The Dark Knight Rises",
                description: "It has been eight years since Batman (Christian Bale), in collusion with Commissioner Gordon (Gary Oldman), vanished into the night. Assuming responsibility for the death of Harvey Dent, Batman sacrificed everything for what he and Gordon hoped would be the greater good. However, the arrival of a cu",
                thumbnailLink: "https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_.jpg",
                media_sources: [{
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "HDR4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1tQI5uN9xR1j4sCy75xYhNHTCyiGCdR-Q",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }, {
                    mimeType: "mkv",
                    mediaSource: "googleDrive",
                    mediaQuality: "4k",
                    downloadLink: "http://apighost.herokuapp.com/api/gddirectstreamurl/1IZFIiE6300eJIQPz0lHXB1NdC98qkOR5",
                    videoMediaMetadata: {
                        width: 1920,
                        height: 1080,
                        durationMillis: 2638367
                    }
                }]
            }];
            break;
        default:
            toReturn = "invalid category";
            break;
    }
    res.send(toReturn);
});


module.exports = router;
