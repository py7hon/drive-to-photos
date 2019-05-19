var express = require('express');
var router = express.Router();

var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
const uuidv1 = require('uuid/v1');

const fs = require('fs');

router.get('/process', async function (req, res, next) {
    var childArgs = [
        '--ssl-protocol=any',
        path.join(__dirname, 'openload.js'),
        'https://openload.co/f/QuuTD1Oc0EA'
    ]

    console.log('calling execFile');

    childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        // handle results
        console.log('Exec file completed...' + JSON.stringify({ err: err, output: stdout, stderr: stderr }));
        var c = err;
    })

    res.send('Completed...');

});

router.post('', async function (req, res, next) {
    /*
    {
        "b":"some html content",
        "u":"url of te page"
    }
    */
    var content = req.body;
    var phantomprocessor = '';
    if (content.u.startsWith('https://streamango.com') || content.u.startsWith('https://streamcherry.com')) {
        phantomprocessor = 'phantom-streamango.js';
    }
    else if (content.u.startsWith('https://openload')) {
        phantomprocessor = 'phatonm-openload.js';
    } else {
        res.send('Url is not supported!!!');    //with some different status code maybe
        return;
    }
    var temppath = path.resolve(process.cwd(), 'phantom-temp-' + uuidv1() + '.html');
    console.log(`temp file written to ${temppath}`)
    fs.writeFile(temppath, content.b, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            //file is written process it

            var childArgs = [
                '--ssl-protocol=any',
                path.join(__dirname, phantomprocessor),
                temppath,
                content.u
            ]

            console.log('calling execFile');

            childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
                // handle results
                var output = JSON.stringify({ err: err, output: stdout, stderr: stderr })
                console.log('Exec file completed...' + output);
                var finaloutput = fs.readFileSync(temppath + '.output', 'utf8');
                var c = err;
                console.log(finaloutput)
                var outputtosend = JSON.parse(finaloutput)
                if (content.u.startsWith('https://streamango.com') || content.u.startsWith('https://streamcherry.com')) {
                    //normalizing hte urls
                    for (let ix = 0; ix < outputtosend.length; ix++) { 
                        outputtosend[ix].src.startsWith('//') && (outputtosend[ix].src = 'https://' + outputtosend[ix].src) 
                    }
                }
                res.send(outputtosend);
            })
        }
    });


});

module.exports = router;
