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
    let data = await ClientAPI().classrooms.classroom(code).settings.get();

    if (!data.success) {
        throw new Error(data.message);
    }

    console.log("Song Submission Enable Data Accessed");
    console.log(data);
        
	if (data.data.allowSongSubmission) {
        let fetchData = await ClientAPI().youtube.search(searchTerm);

        if (!fetchData.success) {
            throw new Error(fetchData.message);
        }
        let videoData = fetchData.data;
        showSongChoices(videoData);
	}
	else {
		window.alert("Song could not be submitted. Make sure you've joined a classroom. If you have, ask your teacher if submitting a song is currently disabled for this playlist.");
	}
		
});

function showSongChoices(data: SongServer.API.FetchedVideo[]) {
    if (data.length > 0) {
        songChoice1Element.textContent = "Title: " + data[0].title;
	    songChoice1Element.setAttribute("videoid", data[0].id);
        songChoiceBox1Element.style.display = "block";
    }
    if (data.length > 1) {
        songChoice2Element.textContent = "Title: " + data[1].title;
	    songChoice2Element.setAttribute("videoid", data[1].id);
        songChoiceBox2Element.style.display = "block";
    }
    if (data.length > 2) {
        songChoice3Element.textContent = "Title: " + data[2].title;
	    songChoice3Element.setAttribute("videoid", data[2].id);
        songChoiceBox3Element.style.display = "block";
    }
}

async function addSongToPlaylist(id: string, classCode: string) {
    let data = await ClientAPI().classrooms.classroom(classCode).playlist.songs.add({
        "source": "youtube",
        "songID": id
    });
    if (!data.success) {
        window.alert("Error occurred wilst proccessing your request: " + data.message);
    }

    console.log(data);
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