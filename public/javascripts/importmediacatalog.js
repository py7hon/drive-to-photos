
'use strict';

import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { throttle, debounce } from "throttle-debounce";
import Divider from '@material-ui/core/Divider';

const styles = {
    card: {
        maxWidth: 345,
    },
    media: {
        // ⚠️ object-fit is not supported by IE 11.
        objectFit: 'cover',
    }
};


const e = React.createElement;

class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        return e(
            'button',
            { onClick: () => this.setState({ liked: true }) },
            'Like'
        );
    }
}
class MediaItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: false
        };
    }
    render() {
        return (
            <Card className={this.props.selected == "true" ? "selected card" : "card"}
                onClick={() => this.props.clicked(this.props.mediaObject)}>
                <CardActionArea>
                    <CardMedia
                        className="media"
                        image={this.props.mediaObject.thumbnailLink}
                        title={this.props.mediaObject.name}
                    />
                    <CardContent>
                        {/* {this.props.mediaObject.mimeType} */}
                        {/* <Typography gutterBottom variant="overline" component="h2" noWrap="true">
                            {this.props.mediaObject.name}
                            
                        </Typography> */}
                        <Typography component="p">
                            {this.props.mediaObject.name}
                            {/* {this.props.mediaObject.mimeType} */}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
    }
}

class ImdbExtendedInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            titleId: null,
            item: null
        };
    }

    componentWillReceiveProps(nextProps) {
        //debugger;
        this.setState({ error: null, isLoaded: false, item: null, titleId: nextProps.titleId }, () => {
            this.state.titleId && this.loadItem(this.state.titleId);
        });
    }

    loadItem(titleId) {
        fetch("/admin/imdbtitle/" + titleId)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        item: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {

    }

    render() {
        const { error, isLoaded, item, titleId } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!titleId) {
            return <div></div>;
        } else if (!isLoaded) {
            return <CircularProgress color="secondary" />
            // return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <Typography variant="h5" component="h3">
                        {item.title}
                    </Typography>
                    <Typography component="p" align="justify" paragraph="true">
                        {item.story}
                    </Typography>

                </div>

            );
        }
    }
}

class ImdbInfo extends React.Component {
    constructor(props) {
        //debugger;
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            mediaItem: props.mediaItem,
            mediaTitle: '',
            selectedItemId: null,
            refreshTimer: null
        };
        this.autocompleteSearchDebounced = debounce(500, this.loadItems);
        //this.autocompleteSearchThrottled = throttle(500, this.loadItems);
        // this.itemClicked = this.itemClicked.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            error: null,
            isLoaded: false,
            items: [],
            selectedItemId: null,
            refreshTimer: null,
            mediaItem: nextProps.mediaItem,
            mediaTitle: nextProps.mediaItem.name,
            savingItem: false
        }, () => {
            this.loadItems(this.state.mediaTitle);
        });
    }

    saveItem(item) {
        this.setState({
            savingItem: true
        })
        var o = this.state;
        debugger;
        // this.setState({ selectedItemId: item.id, selectedItem: item })
    }

    refreshTitles(event) {
        this.setState({ mediaTitle: event.target.value }, () => {
            this.autocompleteSearchDebounced(this.state.mediaTitle);
        });
    }

    setItem(event, titleId) {
        this.setState({ selectedItemId: event.id })
    }

    loadItems(searchTerm) {
        console.log(`Search Term: ${searchTerm}`);
        if (searchTerm) {
            fetch("/admin/imdbinfo?mediaTitle=" + searchTerm)
                .then(res => res.json())
                .then(
                    (result) => {
                        //debugger;
                        this.setState({
                            isLoaded: true,
                            items: result
                        });
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        this.setState({
                            isLoaded: true,
                            error
                        });
                    }
                )
        } else {
            this.setState({
                isLoaded: true,
                items: []
            });
        }

    }

    componentDidMount() {
        //debugger;
        //loadItems(this.state.defaultTitle);
    }
    render() {
        const { error, isLoaded, items, mediaItem, mediaTitle, selectedItemId, savingItem } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!mediaItem) {
            return <div>Please select an item.</div>;
        } else if (!isLoaded) {
            return <CircularProgress color="secondary" />
        }
        return (
            <div className="search">
                <TextField
                    label="Media Title"
                    className=""
                    value={mediaTitle}
                    onChange={this.refreshTitles.bind(this)}
                    margin="normal"
                    style={{ width: '100%' }}
                />

                <Paper elevation={1} className="imdb-search-result-container">
                    {/* height: 238 */}
                    <div style={{ float: "left", maxWidth: 328 }}>
                        {(items.d === undefined) && (<div>No results found</div>)}
                        {items.d && items.d.map(item => (
                            <div className="imdb-item" >
                                <span target="_blank" href={"https://www.imdb.com/title/" + item.id}>
                                    <img height="190" width="128" alt={`${item.l} (${item.y})`}
                                        title={`${item.l} (${item.y})`}
                                        onClick={() => this.setItem(item).bind(this)}
                                        src={item.i && item.i[0]} />
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ minHeight: 119, marginRight: 3 }}>
                        <ImdbExtendedInfo titleId={selectedItemId}></ImdbExtendedInfo>
                    </div>
                    <Divider />
                    <div className="align-right">
                        <Button size="small" color="primary" onClick={() => { this.saveItem() }}>
                            {/* <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} /> */}
                            Save
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={savingItem}
                            onClick={() => { this.saveItem() }}
                        >
                            Save
                        </Button>
                        {savingItem && <CircularProgress size={24} />}

                    </div>
                </Paper>


            </div>)
    }
}


class MediaList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            selectedItem: null,
            selectedItemId: null
        };
        this.itemClicked = this.itemClicked.bind(this)
    }

    itemClicked(item) {
        this.setState({ selectedItemId: item.id, selectedItem: item })
    }

    componentDidMount() {
        fetch("/admin/FilesToProcess")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="flex-container">
                    <div className="media-list">

                        {items.map(item => (
                            <MediaItem selected={this.state.selectedItemId == item.id ? "true" : "false"}
                                mediaObject={item} clicked={this.itemClicked}>
                            </MediaItem>
                        ))}

                    </div>
                    <div className="imdb-info">
                        <ImdbInfo mediaItem={this.state.selectedItem}>
                        </ImdbInfo>
                    </div>
                </div>

            );
        }
    }
}


class MediaCrawler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            selectedItem: null,
            selectedItemId: null,
            counter: 0
        };
        // this.itemClicked = this.itemClicked.bind(this)
    }

    // itemClicked(item) {
    //     this.setState({ selectedItemId: item.id, selectedItem: item })
    // }

    componentDidMount() {
        fetch("/admin/FilesToProcess")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            ).then(() => {
                this.processIt();
            })
    }

    processIt() {
        const { counter, items } = this.state;
        if (items.length == 0) {
            alert('completed'); return;
        }
        if (items.length > 0 && counter >= items.length) {
            location.reload(); return;
        }
        var nextItem = items[counter];// this.state.items[this.state.counter];
        this.setState({
            counter: this.state.counter + 1,
            selectedItem: nextItem
        }, () => {
            debugger;
            this.addFileToFolder(nextItem.id).then(() => {
                this.processIt();
            });
        });
    }

    addFileToFolder(fileId) {

        return this.postData(`/admin/addFileToBeProcessedDrive`, { fileId: fileId })
            .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
            .catch(error => console.error(error));
    }

    postData(url = ``, data = {}) {
        // Default options are marked with *
        return fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then(response => response.json()); // parses response to JSON
    }

    render() {
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="flex-container">
                    {this.state.counter}
                    {JSON.stringify(this.state.selectedItem)}
                    {/* <div className="media-list">

                        {items.map(item => (
                            <MediaItem selected={this.state.selectedItemId == item.id ? "true" : "false"}
                                mediaObject={item} clicked={this.itemClicked}>
                            </MediaItem>
                        ))}

                    </div>
                    <div className="imdb-info">
                        <ImdbInfo mediaItem={this.state.selectedItem}>
                        </ImdbInfo>
                    </div> */}
                </div>
            );
        }
    }
}

var importMediaDomContainer = document.querySelector('#like_button_container');
if (importMediaDomContainer) {
    ReactDOM.render(e(MediaList), importMediaDomContainer);
} else {
    var crawlMediaDomContainer = document.querySelector('#crawl-media-list');
    ReactDOM.render(e(MediaCrawler), crawlMediaDomContainer);
}
