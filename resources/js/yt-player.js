"use strict";
/// <reference path="../../types/youtube.d.ts"/>
class YTPlayer {
    constructor() {
        // load iframe api thingy
        let loader = document.createElement("script");
        loader.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(loader);
        this._paused = false;
        this._buffering = true;
        this._ended = false;
        this._player = null;
    }
    get paused() {
        return this._paused;
    }
    get buffering() {
        return this._buffering;
    }
    get ended() {
        return this._ended;
    }
    togglePause() {
        console.log("Toggle pause!");
        if (!this._buffering) {
            console.log("Actually doing it...");
            if (this.paused) {
                this._player?.playVideo();
            }
            else {
                this._player?.pauseVideo();
            }
        }
    }
    _onPlayerStateChange(event) {
        console.log("playerStateChange!");
        console.log(event);
        this._buffering = event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.UNSTARTED;
        if (event.data === YT.PlayerState.BUFFERING) {
            window.playlistController?.onBuffering();
        }
        else if (event.data === YT.PlayerState.ENDED) {
            console.log("Load next song UwU");
            this._ended = true;
            window.playlistController?.nextSong();
        }
        else if (event.data === YT.PlayerState.PAUSED) {
            window.playlistController?.onPaused();
            this._paused = true;
        }
        else if (event.data === YT.PlayerState.PLAYING) {
            window.playlistController?.onResume();
            this._paused = false;
        }
        else if (event.data === YT.PlayerState.UNSTARTED) {
            this._ended = false;
        }
    }
    init() {
        this._player = new YT.Player("player", {
            height: "300",
            width: "300",
            events: {
                "onStateChange": (event) => {
                    this._onPlayerStateChange(event);
                },
                "onError": (event) => {
                    switch (event.data) {
                        case 2:
                            console.error("request contains an invalid parameter value");
                            break;
                        case 5:
                            console.error("The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.");
                            break;
                        case 100:
                            console.error("The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.");
                            break;
                        case 101:
                        case 150:
                            console.error("Uploader has blocked this content from embedded playback");
                            window.playlistController?.nextSong();
                            break;
                        case 150:
                            console.error("playback error code: " + event.data);
                            break;
                    }
                }
            }
        });
        window.playlistController?.refreshVolume();
    }
    /**
     * Loads a video from a video ID into the video player.
     * @param videoID  The video ID
     */
    loadVideo(videoID) {
        this._buffering = true;
        this._player?.loadVideoById(videoID);
    }
    setVolume(volume) {
        this._player?.setVolume(volume);
    }
    getVolume() {
        let getVolFn = this._player?.getVolume;
        if (getVolFn != null)
            return getVolFn();
        return 100;
    }
}
var player = new YTPlayer();
/** @returns {void} */
function onYouTubeIframeAPIReady() {
    window.player.init();
}
