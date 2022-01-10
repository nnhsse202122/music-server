/// <reference lib="dom" />

// elements
let submitButtonElement = document.getElementById("submitButton")! as HTMLButtonElement;
let searchWordElement = document.getElementById("searchWord")! as HTMLInputElement;
let songChoice1Element = document.getElementById("songChoice1")! as HTMLParagraphElement;
let songChoice2Element = document.getElementById("songChoice2")! as HTMLParagraphElement;
let songChoice3Element = document.getElementById("songChoice3")! as HTMLParagraphElement;
let songChoiceBox1Element = document.getElementById("songChoiceBox1")! as HTMLDivElement;
let songChoiceBox2Element = document.getElementById("songChoiceBox2")! as HTMLDivElement;
let songChoiceBox3Element = document.getElementById("songChoiceBox3")! as HTMLDivElement;
let verifyModalElement = document.getElementById("verifyModal")! as HTMLDivElement;
let verifyElement = document.getElementById("verify")! as HTMLInputElement;
let confirmSongElement = document.getElementById("confirmSong")! as HTMLButtonElement;
let verifyCancelButtonElement = document.getElementById("verifyCancelButton")! as HTMLButtonElement;
let cancelButtonElement = document.getElementById("cancelButton")! as HTMLButtonElement;
let store_nameElement = document.getElementById("store_name")! as HTMLDivElement;
let displayCodeElement = document.getElementById("displayCode")! as HTMLParagraphElement;

// selectedSongID variable
let selectedSongID: string = "";

var getCurrentCode: () => Promise<string>;

submitButtonElement.addEventListener("click", async () => {
	let searchTerm = searchWordElement.value;
	let code = await getCurrentCode();
    let response = await fetch(`/api/v1/classrooms/${code}/settings`, {
        "headers": {
            "Authorization": `Basic ${window.localStorage.getItem("auth")}`
        }
    });
    let data: SongServer.API.Responses.ClassroomSettingsAPIResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    console.log("Song Submission Enable Data Accessed");
    console.log(data);
        
	if (data.data.allowSongSubmission) {
        let fetchResponse = await fetch(`/api/v1/yt/videos?query=${encodeURI(searchTerm)}`);
        let fetchData: SongServer.API.Responses.SearchVideosAPIResponse = await fetchResponse.json();

        if (!fetchData.success) {
            throw new Error(fetchData.message);
        }
        let videoData = fetchData.data;
        showSongChoices(videoData[0].id, videoData[1].id, videoData[2].id,videoData[0].title, videoData[1].title, videoData[2].title);
	}
	else {
		window.alert("Song could not be submitted. Make sure you've joined a classroom. If you have, ask your teacher if submitting a song is currently disabled for this playlist.");
	}
		
});

function showSongChoices(videoId1: string, videoId2: string, videoId3: string, videoTitle1: string, videoTitle2: string, videoTitle3: string) {
    songChoice1Element.textContent = "Title: " + videoTitle1;
	songChoice1Element.setAttribute("videoid", videoId1);
    songChoice2Element.textContent = "Title: " + videoTitle2;
	songChoice2Element.setAttribute("videoid", videoId2);
    songChoice3Element.textContent = "Title: " + videoTitle3;
	songChoice3Element.setAttribute("videoid", videoId3);


    songChoiceBox1Element.style.display = "block";
    songChoiceBox2Element.style.display = "block";
    songChoiceBox3Element.style.display = "block";
}

async function addSongToPlaylist(id: string, playlistID: string) {
    await fetch(`/playlists/${playlistID}/songs`, {
        "method": "POST",
        "body": JSON.stringify({
            "songID": id
        }),
        "headers": {
            "Content-Type": "application/json",
            "Authorization": `Basic ${window.localStorage.getItem("auth")}`
        }
    }).then(response => response.json())
        .then(data => {
            // if (data.contains === true) {
            //   window.alert("Song was already in the playlist and could not be submitted. Please try again with a different song.");
            // }
            // else {
            //   console.log("Sent song to server for database logging\nID: " + data.id);
            // }
        })
        .catch(err => {
            window.alert("An error occurred whilst processing your request: " + err);
        });
}


songChoiceBox1Element.addEventListener("click", async () => {
    verifyModalElement.style.display = "block";
	selectedSongID = songChoice1Element.getAttribute("videoid")!;
	// await fetch(`/addtempsong?id=${encodeURI(id)}`)
});

songChoiceBox2Element.addEventListener("click", async () => {
    verifyModalElement.style.display = "block";
	selectedSongID = songChoice1Element.getAttribute("videoid")!;
	// await fetch(`/addtempsong?id=${encodeURI(id)}`)
});

songChoiceBox3Element.addEventListener("click", async () => {
    verifyModalElement.style.display = "block";
	selectedSongID = songChoice1Element.getAttribute("videoid")!;
	// await fetch(`/addtempsong?id=${encodeURI(id)}`)
});

cancelButtonElement.addEventListener("click", async () => {
	searchWordElement.value = "";

    songChoiceBox1Element.style.display = "none";
    songChoiceBox2Element.style.display = "none";
    songChoiceBox3Element.style.display = "none";


    songChoice1Element.textContent = "";
    songChoice2Element.textContent = "";
    songChoice3Element.textContent = "";


    songChoiceBox1Element.style.display = "none";
    songChoiceBox2Element.style.display = "none";
    songChoiceBox3Element.style.display = "none";

    verifyModalElement.style.display = "none";

    verifyElement.checked = false;

});

/* modal design for the verification box */


verifyElement.addEventListener("click", async () => {
    if (verifyElement.checked) {
        confirmSongElement.disabled = false;
        confirmSongElement.style.borderColor = "#49b8da"; 
    }
    else {
        confirmSongElement.disabled = true;
        confirmSongElement.style.borderColor = "#b3b3b3";
    }
});

// todo: move this to a onclick listener for the verify model.
window.onclick = function(event) {
    if (event.target == verifyModalElement) {
        verifyModalElement.style.display = "none";
    }
}

confirmSongElement.addEventListener("click", async () => {
	verifyModalElement.style.display = "none";
    songChoiceBox1Element.style.display = "none";
    songChoiceBox2Element.style.display = "none";
    songChoiceBox3Element.style.display = "none";
    searchWordElement.value = "";
    verifyElement.checked = false;
    confirmSongElement.disabled = true;
    confirmSongElement.style.borderColor = "#b3b3b3";
    //let name = store_nameElement.textContent;
    // console.log(name);
    //var songInfo = [id, name];

    addSongToPlaylist(selectedSongID, await getCurrentCode());
});

verifyCancelButtonElement.addEventListener("click", () => {
	verifyModalElement.style.display = "none";
    verifyElement.checked = false;
    confirmSongElement.disabled = true;
    confirmSongElement.style.borderColor = "#b3b3b3";
});

/*
async function emailToName(email) {
	let name = await fetch(`/getemailtoname?email=${encodeURI(email)}`)
		.then(response => response.json())
		.then(data => {
			console.log(data.name);
			return data.name;
		});
	return name;
}*/