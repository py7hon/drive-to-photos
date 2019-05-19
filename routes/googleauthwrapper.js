var google = require('googleapis');
var googleAuth = require('google-auth-library');
var oauthConfig = require('../oauthConfig');
var gauthconfig = oauthConfig.google;

function getAuth(req) {
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(gauthconfig.clientID, gauthconfig.clientSecret, gauthconfig.callbackURL);
    oauth2Client.credentials = req.user.token;
    return oauth2Client;
}

function getAccessTokenAsync(req) {
    return new Promise((resolve, reject) => {
        var oauth2Client = getAuth(req);
        //console.log('Calling getAccessTokenAsync:' + JSON.stringify(oauth2Client));
        oauth2Client.getAccessToken((err, accessToken) => {
            if (err) {
                console.log('getAccessTokenAsync: An error occurred while retrieiving the token. ' + JSON.stringify(err));
                reject(err);
            }
            else resolve(accessToken);
        });
    });
}

// var GoogleAuthWrapper = {
//     getAccessTokenAsync = "",
//     getAuth = "getAuth"
// };

var ids = {
    getAuth: getAuth,
    getAccessTokenAsync: getAccessTokenAsync
};

module.exports = ids;
