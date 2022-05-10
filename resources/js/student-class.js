
var songSearchManager = new SongSearchManager(false);

/** @param {HTMLElement} container
 * @param {number} position
 * @param {string} title
 * @param {boolean} liked
 * @returns {HTMLDivElement}
 */
 function createPlaylistItem(container, position, title, liked) {
    let playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    playlistItem.setAttribute("data-student", "");
    playlistItem.innerHTML = `
<div class="position">
    ${position}
</div>
<div class="icon">
    <i class="fa-solid fa-music"></i>
</div>
<div class="playlist-item-content">
    <div class="song-info">
        <div class="song-title"></div>
        <div class="song-actions">
            <button class="song-likes" ${(liked ? "data-liked" : "")}>
                <i class="fa-solid fa-thumbs-up"></i>
                <span>Like</span>
            </button>
            <button class="song-force-play">
                <i class="fa-solid fa-play"></i>
                <span>Force Play</span>
            </button>
        </div>
    </div>
    <div class="song-details-container">
    </div>
</div>`;
    container.appendChild(playlistItem);
    if (liked) {
        playlistItem.getElementsByClassName("song-likes")[0].setAttribute("data-liked", "");
    }
    playlistItem.getElementsByClassName("song-title")[0].textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
    return playlistItem;
}

let playlistContainer = document.getElementById("playlist-container");

function refreshPlaylist() {
    SongServerAPI(2).classroom(classCode).playlist.songs.get().then((data) => {
        if (!data.success) {
            playlistContainer.innerHTML = `<div id="playlist-container-empty">
            You are not allowed to view the playlist.
        </div>`;
            return;
        }

        playlistContainer.innerHTML = `<div id="playlist-container-empty" style="display: none">
        Your playlist is empty!
    </div>`;

        if (data.data.length === 0) {
            console.log("No songs found :(");
            document.getElementById("playlist-container-empty").style.display = "block";
        }

        data.data.forEach((song) => {
            createPlaylistItem(playlistContainer, song.position, song.title, song.is_liked);
        });
    });
}

refreshPlaylist();