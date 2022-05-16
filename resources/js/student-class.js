
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
    SongServerAPI(2).classroom(classCode).settings.get().then((settingsData) => {
        if (!settingsData.success) {
            console.error("Failed to fetch settings data");
            settingsData.data = {
                "likesEnabled": false,
                "priorityEnabled": false
            }
        }

        SongServerAPI(2).classroom(classCode).playlist.songs.get().then((data) => {
            if (!data.success) {
                playlistContainer.innerHTML = `<div id="playlist-container-empty">
                You are not allowed to view the playlist.
            </div>`;
                return;
            }

            console.log(settingsData);

            if (!settingsData.data.likesEnabled) {
                playlistContainer.setAttribute("data-likes-hidden", "");
            }
            else {
                playlistContainer.removeAttribute("data-likes-hidden");
            }

            if (!settingsData.data.priorityEnabled) {
                playlistContainer.setAttribute("data-priority-hidden", "");
            }
            else {
                playlistContainer.removeAttribute("data-priority-hidden");
            }
    
            playlistContainer.innerHTML = `<div id="playlist-container-empty" style="display: none">
            Your playlist is empty!
        </div>`;
    
            if (data.data.length === 0) {
                console.log("No songs found :(");
                document.getElementById("playlist-container-empty").style.display = "block";
            }
    
            data.data.forEach((song, index) => {
                let item = createPlaylistItem(playlistContainer, song.position, song.title, song.is_liked);
                /** @type {HTMLDivElement} */
                let iconContainer = item.getElementsByClassName("icon")[0];
                if (song.source === "youtube") {
                    iconContainer.children[0].remove();
                    let icon = document.createElement("img");
                    icon.src = `https://i.ytimg.com/vi/${song.id}/default.jpg`;
                    iconContainer.appendChild(icon);
                }
                item.getElementsByClassName("song-likes")[0].addEventListener("click", async () => {
                    window.overlayManager.show("loading");
                    let req = await SongServerAPI(2).classroom(classCode).playlist.songs.likeSong(index);
                    if (!req.success) {
                        alert("Failed to like song: " + req.message);
                        window.overlayManager.hide();
                        return;
                    }
                    window.overlayManager.hide();
    
                    refreshPlaylist();
                });
            });
        });
    });
}

refreshPlaylist();