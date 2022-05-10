document.getElementById("show-join-class-btn").addEventListener("click", () => {
    window.overlayManager.show("join-class-model");
});

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
            <button class="song-likes">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>0 Likes</span>
            </button>
            <button class="song-force-play">
                <i class="fa-solid fa-play"></i>
                <span>Force Play</span>
            </button>
        </div>
    </div>
    <div class="song-details-container">
        <div class="submit-by">
            <h3>Submitted By</h3>
            <div>
                <div>
                    <i class="fa-solid fa-user"></i>
                    <span class="submit-by-name"></span>
                </div>
                <div>
                    <i class="fa-solid fa-envelope"></i>
                    <span class="submit-by-email"></span>
                </div>
            </div>
        </div>
    </div>
</div>
<button class="drag">
    <i class="fa-solid fa-ellipsis-vertical"></i>
</button>`;
    container.appendChild(playlistItem);
    if (liked) {
        playlistItem.getElementsByClassName("song-likes")[0].setAttribute("data-liked", "");
    }
    playlistItem.getElementsByClassName("song-title")[0].textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
    return playlistItem;
}