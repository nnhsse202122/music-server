/// <reference lib="dom" />

let windowWithPlayer: YT.WindowWithPlayer = window;

// 2. This code loads the IFrame Player API code asynchronously.
let iframeLoader = document.createElement('script');
iframeLoader.src = "https://www.youtube.com/iframe_api";

let firstScriptTag = document.getElementsByTagName('script')[0];
let firstScriptTagParent = firstScriptTag.parentNode;
if (firstScriptTagParent != null) {
    firstScriptTagParent.insertBefore(iframeLoader, firstScriptTag);
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {
    windowWithPlayer.player = new YT.Player('player', {
        height: '300', // Change this to 1 to make the player invisible
        width: '300',
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event: YT.EventArgs) {

}

// 5. The API calls this function when the player's state changes.
async function onPlayerStateChange(event: YT.EventArgs) {
	if (event.data == YT.PlayerState.ENDED) {
		await loadNextSong();
		// playVideo();
	}
}