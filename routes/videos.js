var express = require('express');
var router = express.Router();
var redis = require('redis');

var google = require('googleapis');
// var googleAuth = require('google-auth-library');
// var oauthConfig = require('../oauthConfig');
var service = google.youtube('v3');
var drive = google.drive('v3');

var googleAuthWrapper = require('../routes/googleauthwrapper');
var got = require('got');

var gddirect = require('gddirecturl');
const uuidv1 = require('uuid/v1');

function getAuth(req) {
  return googleAuthWrapper.getAuth(req);
}

function getAccessTokenAsync(req) {
  return googleAuthWrapper.getAccessTokenAsync(req);
}


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/upload', async function (req, res, next) {
  try {
    var result = await uploadVideo(req.body.fileid, getAuth(req));
    //res.send('uploaded : ' + result);
    res.redirect('/videos/progress/' + result);

  } catch (error) {
    res.send('error occurred -- ' + error);
  }
});

router.get('/progress', async function (req, res, next) {
  res.render("progress", {
    runCollection: runCollection
  });
});


router.get('/progress/:runId', async function (req, res, next) {
  var runInfo = runCollection[req.params.runId];
  res.render("progress", {
    runId: req.params.runId
  });
});

router.get('/progressInfo/:runId', async function (req, res, next) {
  var runInfo = runCollection[req.params.runId];
  if (runInfo) {
    res.send(runInfo);
  } else {
    res.status(404).send('Not found');
  }
});

router.post('/setCurrentMedia', async function (req, res, next) {

  var fileId = req.body.fileid;
  try {
    await setRedisValue('CURRENT_MEDIA_ID', fileId);

    res.render("setCurrentMedia");

    // res.send('Set as current media. Use /getCurrentMedia or /getCurrentMediaStream to access the current media');
  } catch (error) {
    console.log(JSON.stringify(error));
    res.send('An error occurred... ' + JSON.stringify(error));
  }
})

router.get('/getCurrentMedia', async function (req, res, next) {
  try {
    var fileId = await getRedisValue('CURRENT_MEDIA_ID');
    var objToReturn = {
      fileId
    }
    try {
      var o = await gddirect.getMediaLink(fileId);
      objToReturn.o = o;
    } catch (error) {
      objToReturn.error = error;
    }
    res.render("getCurrentMedia", {
      data: objToReturn
    });
  } catch (error) {
    console.log('Unable to get current media id');
    res.send('error');
  }
});

router.post('/setM3U', async function (req, res, next) {
  var fileId = req.body.m3u;
  try {
    await setRedisValue('M3U_CONTENT', fileId);

    res.render("getm3ucontent", {
      m3ucontent: fileId
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    res.send('An error occurred... ' + JSON.stringify(error));
  }
})

router.get('/getM3U', async function (req, res, next) {
  try {
    var fileId = await getRedisValue('M3U_CONTENT');
    res.render("getm3ucontent", {
      m3ucontent: fileId
    });
  } catch (error) {
    console.log('Unable to get m3u content');
    res.send('error' + JSON.stringify(error));
  }
});


router.get('/getCurrentMediaStream', async function (req, res, next) {
  try {
    var fileId = await getRedisValue('CURRENT_MEDIA_ID');
    if (fileId.startsWith('http')) {  //if it's a http link, then it means it's a direct link and not a google drive id
      res.redirect(fileId);
    } else {
      var o = await gddirect.getMediaLink(fileId);
      res.redirect(o.src)
    }
  } catch (error) {
    console.log('Unable to get the current media id');
    res.send('error');
  }
});

function getRedisClient() {
  var redisClient = redis.createClient({
    port: process.env.RedisPort,               // replace with your port
    host: process.env.RedisUrl,        // replace with your hostanme or IP address
    password: process.env.RedisPwd    // replace with your password
  });
  return redisClient;
}

async function getRedisValue(key) {
  var client = getRedisClient();
  return new Promise((resolve, reject) => {
    client.get(key, function (err, value) {
      client.quit();
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}

async function setRedisValue(key, value) {
  var client = getRedisClient();
  return new Promise((resolve, reject) => {
    client.set(key, value, function (err) {
      client.quit();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

var runCollection = {};
// runCollection["hello1"] = { fileId: "file001", fileName: "filename01", progressId: "p21" };
// runCollection["hello2"] = { fileId: "file002", fileName: "filename02", progressId: "pr311" };

// authorize(JSON.parse(content), {
//   'params': { 'part': 'snippet,status' }, 'properties': {
//     'snippet.categoryId': '22',
//     'snippet.defaultLanguage': '',
//     'snippet.description': 'Description of uploaded video.',
//     'snippet.tags[]': '',
//     'snippet.title': 'Test video upload',
//     'status.embeddable': '',
//     'status.license': '',
//     'status.privacyStatus': 'private',
//     'status.publicStatsViewable': ''
//   }, 'mediaFilename': 'sample_video.mp4'
// }, videosInsert);

function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

function createResource(properties) {
  var resource = {};
  var normalizedProps = properties;
  for (var p in properties) {
    var value = properties[p];
    if (p && p.substr(-2, 2) == '[]') {
      var adjustedName = p.replace('[]', '');
      if (value) {
        normalizedProps[adjustedName] = value.split(',');
      }
      delete normalizedProps[p];
    }
  }
  for (var p in normalizedProps) {
    // Leave properties that don't have values out of inserted resource.
    if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
      var propArray = p.split('.');
      var ref = resource;
      for (var pa = 0; pa < propArray.length; pa++) {
        var key = propArray[pa];
        if (pa == propArray.length - 1) {
          ref[key] = normalizedProps[p];
        } else {
          ref = ref[key] = ref[key] || {};
        }
      }
    };
  }
  return resource;
}


async function getGoogleDriveMediaInfo(fileId, oauth2Client) {
  return new Promise((resolve, reject) => {
    drive.files.get({
      auth: oauth2Client,
      'fileId': fileId,
      "fields": "*"
    }, function (err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

async function uploadVideo(fileId, auth) {

  var fileDirectLink = await gddirect.getMediaLink(fileId);
  var fileInfo = await getGoogleDriveMediaInfo(fileId, auth);

  var requestData = {
    'params': { 'part': 'snippet,status' }, 'properties': {
      'snippet.categoryId': '22',
      'snippet.defaultLanguage': '',
      'snippet.description': 'GDriveId: ' + fileId,
      'snippet.tags[]': '',
      'snippet.title': fileInfo.name,
      'status.embeddable': '',
      'status.license': '',
      'status.privacyStatus': 'private',
      'status.publicStatsViewable': ''
    }
  };

  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  //parameters['media'] = { body: fs.createReadStream(requestData['mediaFilename']) };
  var bytesReceived = 0;
  // var timer = setInterval(function () {
  //   console.log('FileId: ' + fileId + ', Progress: ' + bytesReceived);
  // }, 1000);

  var randomGuid = uuidv1();
  var progress = {
    fileName: fileInfo.name,
    fileId: fileId,
    fileSize: fileInfo.size,
    fileUploaded: 0,
    progressId: randomGuid
  };
  runCollection[randomGuid] = progress;


  got.stream(fileDirectLink.src, {
    encoding: null
  }).on('data', function (chunk) {
    progress.fileUploaded += chunk.length;
  }).on('response', function (gotresponseinner) {
    parameters['media'] = { body: gotresponseinner };
    parameters['notifySubscribers'] = false;
    parameters['resource'] = createResource(requestData['properties']);

    service.videos.insert(parameters, function (err, data) {
      clearInterval(timer);
      if (err) {
        reject(err);
        console.log('The API returned an error: ' + err);
      }
      if (data) {
        console.log('The API successfully returned: ');
        console.log('Data returned: ' + data);
        resolve(data);
        // console.log(util.inspect(data, false, null));
      }
      // process.exit();
    });
  });

  //res.redirect('/progress/' + randomGuid);
  return randomGuid;
  //Get Stream
  //Pipe to youtube upload
}




module.exports = router;
