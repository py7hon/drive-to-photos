// Usage: phantomjs openload.js <video_url>
// if that doesn't work try: phantomjs --ssl-protocol=any openload.js <video_url>
var separator = ' | ';
var page = require('webpage').create(),
  system = require('system'),
  id, match;
var fs = require('fs');



if (system.args.length < 2) {
  console.error('No URL provided');
  phantom.exit(1);
}

// thanks @Mello-Yello :)
page.onInitialized = function () {
  page.evaluate(function () {
    delete window._phantom;
    delete window.callPhantom;
  });
};

page.onLoadFinished = function (status) {

  console.log('STATUS####' + status);

  var info = page.evaluate(function() {
    return {
      decoded_id: document.getElementById('DtsBlkVFQx').innerHTML,
      title: document.querySelector('meta[name="og:title"],'
        + 'meta[name=description]').content
    };
  });
  var url = 'https://openload.co/stream/' + info.decoded_id + '?mime=true';
  console.log(url + separator + info.title);
    // var srces = page.evaluateJavaScript('function(){    return document.getElementById("DtsBlkVFQx").innerHTML;  }');
    // var contenttowrite = JSON.stringify(srces);
    // console.log(contenttowrite);
    fs.write(inputbodyfile + '.output', url, 'w');
    phantom.exit();
  
};

page.settings.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36";
var inputbodyfile = system.args[1];
var expectedContent = fs.read(inputbodyfile);
var expectedLocation = system.args[2];
page.setContent(expectedContent, expectedLocation);