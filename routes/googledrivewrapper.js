var google = require('googleapis');
var service = google.drive('v3');
var googleAuthWrapper = require('../routes/googleauthwrapper');

async function getFolderIdByName(folderName, req) {
    var oauth2Client = googleAuthWrapper.getAuth(req);
    return new Promise((resolve, reject) => {
        service.files.list({
            auth: oauth2Client,
            q: "mimeType='application/vnd.google-apps.folder' and name = '" + folderName + "' and 'root' in parents",
            fields: 'files(id, name)'
        }, function (err, res) {
            if (err) {
                reject(err);
            } else {
                if (res.files.length === 1) {
                    var folderId = res.files[0].id;
                    resolve(folderId);
                }
                else {
                    reject(folderName + ' Folder not found. You must create a folder with this name in your root folder.');
                }
            }
        });
    });
}

async function listToBeProcessedMediaFiles(req) {
    var processedFolderId = await getFolderIdByName('ALL_MEDIA_TO_BE_PROCESSED', req);
    var ignoreFolderId = await getFolderIdByName('IGNORE_FOLDER', req);
    var oauth2Client = googleAuthWrapper.getAuth(req);

    return new Promise((resolve, reject) => {
        service.files.list({
            auth: oauth2Client,
            pageSize: 100,
            fields: "files",
            q: "mimeType!='application/vnd.google-apps.folder' and mimeType!='audio/mp3' and mimeType!='image/jpeg' and mimeType!='image/png' and mimeType!='application/octet-stream' and mimeType!='application/x-subrip' and mimeType!='text/plain' and mimeType!='application/pdf' and mimeType!='application/vnd.google-apps.document' and not '" + ignoreFolderId + "' in parents and not '" + processedFolderId + "' in parents"
        }, function (err, response) {
            if (err) {
                console.log('An error occurred while listing the google drive files. ' + JSON.stringify(err));
                reject(err);
            }
            else {
                resolve(response.files);
            }
        });
    });
}

async function getGoogleDriveMediaInfo(fileId, req) {
    var oauth2Client = googleAuthWrapper.getAuth(req);
    return new Promise((resolve, reject) => {
        service.files.get({
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

async function addFileToBeProcessedFolder(fileId, req) {
    var folderId = await getFolderIdByName('ALL_MEDIA_TO_BE_PROCESSED', req);
    return await addFileToMyDrive(fileId, folderId, req);
}


async function addFileToMyDrive(fileId, folderId, req) {
    var oauth2Client = googleAuthWrapper.getAuth(req);
    return new Promise((resolve, reject) => {
        service.files.get({
            auth: oauth2Client,
            fileId: fileId,
            fields: 'parents'
        }, function (err, file) {
            if (err) {
                reject(err);
            } else {
                if (file.parents && file.parents.indexOf(folderId) >= 0) {
                    reject('File already exists in this folder...');
                }
                else {
                    service.files.update({
                        auth: oauth2Client,
                        fileId: fileId,
                        addParents: folderId,
                        fields: 'id, parents'
                    }, function (err, file) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(file);
                        }
                    });
                }
            }
        });
    });
}


var ids = {
    getFolderIdByName: getFolderIdByName,
    listToBeProcessedMediaFiles: listToBeProcessedMediaFiles,
    getGoogleDriveMediaInfo: getGoogleDriveMediaInfo,
    addFileToBeProcessedFolder: addFileToBeProcessedFolder
};

module.exports = ids;
