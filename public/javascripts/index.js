// console.log('notifications adding...');
// var socket = io('/notifications');
// var downloadsInProgress = [];

// socket.on("progress", function (data) {

//     var progressElementCountup = downloadsInProgress[data.requestId];

//     if (progressElementCountup) {

//         //check if it is  in  progress or downloaded.. todo: if download completed remove it...
//         progressElementCountup.update(data.recvd / data.size * 100);   //do error handling...
//         console.log("progress", JSON.stringify(data));
//     }
//     else {
//         console.log('No progress counter found for this ' + JSON.stringify(data));
//     }

// });

// function transfer(fileid) {
//     var request = superagent;
//     var albumId = document.getElementById('ddl_' + fileid).value;

//     //window.location.href='/index/transfer/' + fileid + '/' + albumId;

//     var options = {
//         useEasing: false,
//         useGrouping: true,
//         separator: ',',
//         decimal: '.',
//         prefix: '',
//         suffix: ' %',
//     };
//     var progressElementCountup = new CountUp('progress_' + fileid, 0, 0, 2, 0.5, options);
//     if (!progressElementCountup.error) {
//         progressElementCountup.start();
//     } else {
//         console.error(progressElementCountup.error);
//     }


//     request
//         .get('/index/transfer/' + fileid + '/' + albumId)   //TODO: for now its a get, need to change to POST.
//         // .send({ name: 'Manny', species: 'cat' })
//         // .set('X-API-Key', 'foobar')
//         .set('Accept', 'application/json')
//         .end(function (err, res) {
//             debugger;
//             socket.emit("subscribe", { requestId: res.body.requestId });
//             downloadsInProgress[res.body.requestId] = progressElementCountup;

//         });


// }

// function viewPhotos(fileid) {

//     var albumId = document.getElementById('ddl_' + fileid).value;

//     window.location.href = '/index/album/' + albumId;
// }

// [].slice.call( document.querySelectorAll( 'button.progress-button' ) ).forEach( function( bttn ) {
//     new ProgressButton( bttn, {
//         callback : function( instance ) {
//             var progress = 0,
//                 interval = setInterval( function() {
//                     progress = Math.min( progress + Math.random() * 0.1, 1 );
//                     instance._setProgress( progress );
//                     if( progress === 1 ) {
//                         instance._stop(1);
//                         clearInterval( interval );
//                     }
//                 }, 200 );
//         }
//     } );
// } );

function loadMore(el, ev) {
    var lstCount = document.querySelectorAll('.mdc-layout-grid__cell').length;
    document.querySelector('#loadMoreProgressBar').style.display = '';
    el.disabled = true;
    fetch('/index/ajaxnext/' + el.getAttribute('data-next-page-token'), {
        credentials: "same-origin"
    }).then(response => {
        response.text().then((x) => {
            el.remove();
            var os = document.createElement('div')
            os.innerHTML = x;
            var nextPageToken = os.querySelector(".load-more-link");
            var parentContainer = document.querySelector('.mdc-layout-grid__inner');
            os.querySelectorAll(".mdc-layout-grid__cell").forEach(newel => {
                parentContainer.appendChild(newel);
            });
            nextPageToken && parentContainer.parentNode.appendChild(nextPageToken);
            document.querySelector('#loadMoreProgressBar').style.display = 'none';
            setTimeout(() => {
                if (lstCount !== document.querySelectorAll('.mdc-layout-grid__cell').length) {
                    var lastElement = document.querySelectorAll('.mdc-layout-grid__cell')[lstCount]
                    lastElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }, 500);
        });
        // debugger;  
    }).catch(error => {
        document.querySelector('#loadMoreProgressBar').style.display = 'none';
        el.disabled = false;
        console.error('Error:', error)
    });
    //   .then(response => console.log('Success:', response));


}

function loadVideoUploadProgress(runId, elementId) {
    var timer = setInterval(function () {
        fetch('/videos/progressInfo/' + runId)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    clearInterval(timer);
                    return "not found";
                }
            })
            .then((myJson) => {
                document.getElementById(elementId).innerHTML = JSON.stringify(myJson);
                if (myJson.fileSize === myJson.fileUploaded) {
                    clearInterval(timer);
                }
            }).catch((error) => {
                clearInterval(timer);
                console.log(error);
            });
    }, 1000);
}

function removeVideo(docId) {
    return fetch('/index/addToIgnoreList', {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        //mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, same-origin, *omit
        headers: {
            //"Content-Type": "application/json; charset=utf-8",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        //redirect: "follow", // manual, *follow, error
        //referrer: "no-referrer", // no-referrer, *client
        //body: JSON.stringify(data), // body data type must match "Content-Type" header
        body: 'fileId=' + docId
    }).then(response => {
        if (response.ok) {
            document.querySelector("[data-doc-id='" + docId + "']").remove();
            console.log('Removed successfully...');
        }
        else {
            console.log('Error occurred while removing the file...' + docId);
        }
    }); // parses response to JSON   
}