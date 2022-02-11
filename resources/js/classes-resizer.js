const ITEM_SIZE = 350;
const ITEM_GAP = 20;
const CONTENT_PADDING = 50;

let contentElement = document.getElementById("content");
function adjustGridContent() {
    contentElement.setAttribute("style", "--items-per-row: " + (Math.floor((contentElement.clientWidth - (CONTENT_PADDING * 2) - ITEM_SIZE) / (ITEM_SIZE + ITEM_GAP)) + 1) + "; --class-item-size: " + ITEM_SIZE + "px; --content-padding: " + CONTENT_PADDING + "px; --item-gap: " + ITEM_GAP + "px;");
}

window.addEventListener("resize", () => {
    adjustGridContent();
});

adjustGridContent();