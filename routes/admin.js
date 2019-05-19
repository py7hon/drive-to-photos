var express = require('express');
var router = express.Router();
var googledrivewrapper = require('../routes/googledrivewrapper');
var imdbscrapper = require('imdb-scrapper')
/* GET home page. */
router.get('/crawlmedia', function (req, res, next) {
    res.render("crawlmedia");
});

router.get('/importmediacatalog', async function (req, res, next) {
    res.render("importmediacatalog", {

    });
    //Show import media catalog page only

});

router.get('/FilesToProcess', async function (req, res, next) {
    //List all the files in json format to process by excluding processed folder
    var filesToProcess = await googledrivewrapper.listToBeProcessedMediaFiles(req);
    res.send(filesToProcess);
});


router.get('/imdbinfo', async function (req, res, next) {
    var mediaTitle = req.query.mediaTitle.replace(/[^0-9a-z ]/gi, '');  //try to normamlize the string
    // mediaTitle='thor'
    var results = await imdbscrapper.simpleSearch(mediaTitle);
    results.d = results.d && results.d.filter(x => x.q === "feature");
    res.send(results, null, 4);
});

router.get('/imdbtitle/:id', async function (req, res, next) {
    var id = req.params.id;
    // var mediaTitle = req.query.mediaTitle;
    // mediaTitle='thor'
    var results = await imdbscrapper.getFull(id);
    res.send(results, null, 4);
})

router.post('/persistMedia', function (req, res, next) {

})


router.post('/addFileToBeProcessedDrive', async function (req, res, next) {
    var fileId = req.body.fileId;
    var result = await googledrivewrapper.addFileToBeProcessedFolder(fileId, req);
    res.send({success: true});
})



module.exports = router;
