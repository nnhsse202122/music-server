/// <reference lib="dom" />

// elements at top:
let playlistElement = document.getElementById("playlist")! as HTMLUListElement;
let studentOptionsModalElement = document.getElementById("studentOptionsModal")! as HTMLDivElement;
let currentlyPlayingElement = document.getElementById("currentlyPlaying")! as HTMLParagraphElement;
let loadButtonElement = document.getElementById("loadButton")! as HTMLButtonElement;
let playButtonElement = document.getElementById("playButton")! as HTMLButtonElement;
let playButtonTextElement = document.getElementById("playButtonText")! as HTMLSpanElement;
let cancelOptionsButtonElement = document.getElementById("cancelOptionsButton")! as HTMLButtonElement;
let cancelSongOptionsesButtonElement = document.getElementById("cancelOptionsesButton")! as HTMLButtonElement;
let removeSongButtonElement = document.getElementById("removeSongButton")! as HTMLButtonElement;
let removeStudentButtonElement = document.getElementById("removeStudentButton")! as HTMLButtonElement;
let songOptionsModalElement = document.getElementById("songOptionsModal")! as HTMLDivElement;
let songInfoNameElement = document.getElementById("songInfoName")! as HTMLSpanElement;
let submittedByElement = document.getElementById("submittedBy")! as HTMLSpanElement; 
let playlistCardElement =  document.getElementById("playlistCard")! as HTMLDivElement;
let showPlaylistElement = document.getElementById("showPlaylist")! as HTMLButtonElement;
let cancelClearButtonElement = document.getElementById("cancelClearButton")! as HTMLButtonElement;
let confirmClearButtonElement = document.getElementById("confirmClearButton")! as HTMLButtonElement;
let clearPlaylistElement = document.getElementById("clearPlaylist")! as HTMLButtonElement;
let confirmClearModal = document.getElementById("confirmClearModal")! as HTMLDivElement;
let studentInfoNameElement = document.getElementById("studentInfoName")! as HTMLSpanElement;
let studentEmailElement = document.getElementById("studentEmail")! as HTMLSpanElement;
let classListElement = document.getElementById("class-list")! as HTMLUListElement;
let studentCardElement = document.getElementById("studentCard")! as HTMLDivElement;
let refreshClassElement = document.getElementById("refreshClass")! as HTMLButtonElement;
let disableSubmitButtonElement = document.getElementById("disableSubmitButton")! as HTMLButtonElement;
let disableSongDescriptionElement = document.getElementById("disableSongDescription")! as HTMLParagraphElement;
let disableClassButtonElement = document.getElementById("disableClassButton")! as HTMLButtonElement;
let disableClassDescriptionElement = document.getElementById("disableClassDescription")! as HTMLParagraphElement;
let shuffleButtonElement = document.getElementById("shuffleButton")! as HTMLButtonElement;
let changeClassNameButtonElement = document.getElementById("changeClassNameButton")! as HTMLButtonElement;
let changeClassNameElement = document.getElementById("changeClassName")! as HTMLInputElement;
let selectClassLabelElement = document.getElementById("selectClassLabel")! as HTMLLabelElement;
let selectorElement = document.getElementById("selector")! as HTMLDivElement;
let displayCodeElement = document.getElementById("displayCode")! as HTMLParagraphElement;

// variables
let isPlaying = false;
let classNumber = "1";
let isShuffled = false;
let currentPlaylist: SongServer.API.SongInfo[] = [];
let songBeingLookedAt: string | null = null;
let studentBeingLookedAt: string | null = null;
var songPlaylistBeingLookedAt;
//Is this needed ^^^ or this vvv
async function getCode(email: string, index: number = 0): Promise<string> {
    let response = await fetch(`/classrooms?email=${encodeURIComponent(email)}`);
    let data: SongServer.API.Responses.ClassroomsAPIResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data[index].code;
}

async function getClassList(code: string): Promise<SongServer.API.ClassroomInfo> {
    console.log(code);
    console.log("abc");
    let response = await fetch(`/api/v1/classrooms/${code}`);
    let data: SongServer.API.Responses.ClassroomAPIResponse = await response.json();
    
    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}
//Hmm ^^^

/* The playlist variable we have as of now works a bit strangely -- every even index is the song, and every odd index is the name of the student who submitted it. */
async function getPlaylist(playlistID: string): Promise<SongServer.API.PlaylistInfo | null> {
    let response = await fetch(`/api/v1/playlists/${playlistID}`);
    let data: SongServer.API.Responses.PlaylistInfoResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}

// deleted specified playlist
async function deletePlaylist(playlistID: string): Promise<boolean> {
    let response = await fetch(`/api/v1/playlists/${playlistID}`, {
        "method": "DELETE"
    });
    let data: SongServer.API.Responses.DeletePlaylistResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}


// shuffles the currently selected playlist
async function shufflePlaylist() {
    isShuffled = !isShuffled;
    currentPlaylist = [];
    let newPlaylist = await getPlaylist(await getCurrentClassCode());
    let newSongs = [...newPlaylist!.songs];
    if (isShuffled) {
        while (newSongs.length > 0) {
            let randIndex = Math.floor(Math.random() * newSongs.length);
            currentPlaylist.push(newSongs[randIndex]);
            newSongs.splice(randIndex, 1); // remove one item
        }
        console.log(currentPlaylist);
    }
}

// returns the current class code for the teacher
async function getCurrentClassCode(): Promise<string> {
    // @ts-ignore
    return await getCode(profile.getEmail(), parseInt(classNumber));
}


async function updateCurrentlyPlayingText(id: string): Promise<void> {
    let response = await fetch(`/api/v1/videos/${id}`);
    let data: SongServer.API.Responses.FetchVideoAPIResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    currentlyPlayingElement.textContent = data.data.title;
}

let currentSongIndex = 0;
async function loadNextSong() {
	if (windowWithPlayer.player != null) {
		let newPlaylist = await getPlaylist(await getCurrentClassCode());
        let songID = currentPlaylist[currentSongIndex].id;

        // handle wrapping
        currentSongIndex++;
        if (currentSongIndex > newPlaylist!.songs.length) {
            currentSongIndex = 0;
        }

		windowWithPlayer.player.loadVideoById(songID); 

        // update the play button
        isPlaying = true;
        playButtonTextElement.textContent = "Pause";
        await updateCurrentlyPlayingText(songID);
    }
}

loadButtonElement.addEventListener("click", async () => {
  await loadNextSong();
});
playButtonElement.addEventListener("click", () => {
    if (isPlaying) { // Execute this if a video is currently playing
        windowWithPlayer.player?.pauseVideo();
        playButtonTextElement.textContent = "Play";
    } 
    else { // Execute this if a video is currently paused
        if (currentSongIndex == 0){
            loadNextSong();
        }

        windowWithPlayer.player?.pauseVideo();
        playButtonTextElement.textContent = "Pause";
    }
    isPlaying = !isPlaying;
});

cancelOptionsButtonElement.addEventListener("click", async () => {
    songOptionsModalElement.style.display = "none";
});

cancelSongOptionsesButtonElement.addEventListener("click", async () => {
    studentOptionsModalElement.style.display = "none";
});

removeSongButtonElement.addEventListener("click", async () => {
    songOptionsModalElement.style.display = "none";
    console.log("bruhas");
    await removeSongFromPlaylist();
    await showPlaylist();
    songOptionsModalElement.style.display = "none";
})

removeStudentButtonElement.addEventListener("click", async () => {
    studentOptionsModalElement.style.display = "none";
	console.log(studentBeingLookedAt);
	await removeStudentFromClass();
	await refreshClass();
	studentOptionsModalElement.style.display = "none";
})

showPlaylistElement.addEventListener("click", showPlaylist)

async function showPlaylist() {
    playlistCardElement.style.display = "inline-block";
    playlistElement.textContent = '';
    let newPlaylist = await getPlaylist(await getCurrentClassCode());
    if (newPlaylist == null) return;

    let songs = newPlaylist.songs;
    console.log(songs);

    // song id
    for (let index = 0; index < songs.length; index++) {
        let song = songs[index];
        let studentName = song.requested_by;

        let response = await fetch(`/api/v1/yt/videos/${song.id}`);
        let data: SongServer.API.Responses.FetchVideoAPIResponse = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        let title = data.data.title;

        let newItem = document.createElement("button");
        newItem.setAttribute('id', "song-" + song.id);
        newItem.classList.add("playlistSongs1");

        newItem.addEventListener("click", async () => {
            displaySongInfo(title, studentName);
            console.log("Sent ID and Student Name to MODAL");

            songBeingLookedAt = song.id;
            
            songInfoNameElement.textContent = "Song Name: " + title;
            submittedByElement.textContent = "Submitted By: " + studentName;
            songOptionsModalElement.style.display = "block";
        });

        newItem.textContent = title;
        playlistElement.appendChild(newItem);
    }
}


async function removeSongFromPlaylist(): Promise<boolean> {
    let songID = songBeingLookedAt;
    let playlistID = await getCurrentClassCode();
    if (songID == null) throw new Error("Cannot remove song because no song is being played/looked at")

    let response = await fetch(`/api/v1/playlists/${playlistID}/songs/${songID}`, { "method": "DELETE" });
    let data: SongServer.API.Responses.DeleteSongFromPlaylistResponse = await response.json();
    if (!data.success) {
        throw new Error(data.message);
    }
  
    console.log("(REQUEST RECEIVED BACK) after sending song to server to be removed from the playlist\nID: " + songID);
	await showPlaylist();
    return data.data;
}

async function removeStudentFromClass(): Promise<boolean> {
	let email = studentBeingLookedAt;
	let classroomID = await getCurrentClassCode();

    let response = await fetch(`/api/v1/classrooms/${classroomID}/students/${email}`, { "method": "DELETE" });
    let data: SongServer.API.Responses.ClassroomRemoveStudentAPIResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    await refreshClass();
    console.log("remove success!");
    return data.data;
}

async function displaySongInfo(id: string, stuName: string) {
    console.log("id: " + id + "\nname: " + stuName);
}

shuffleButtonElement.addEventListener("click", async () => {
    shufflePlaylist();
    if (isShuffled) {
        window.alert("Playlist is shuffling!");
    }
    else {
        window.alert("Playlist is no longer shuffling!");
    }
})


async function loadClassSelection() {
	let newItem = document.createElement('select');
	newItem.name = 'selectClass';
	newItem.id = 'selectClass';
    // @ts-ignore
	let email = profile.getEmail();
	for (let i = 0; i < 8; i++) {
		let code = await getCode(email, i);
        let response = await fetch(`/api/v1/classroom/${code}`);
        let data: SongServer.API.Responses.ClassroomAPIResponse = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        let newOption = document.createElement('option');
        newOption.innerHTML = data.data.name;
        newOption.id = 'option' + i;
        newOption.value = "" + i;

        newItem.appendChild(newOption);
	}

	selectClassLabelElement.textContent = "Select your class: ";
	selectorElement.appendChild(newItem);

	newItem.addEventListener("change", async () => {
		classNumber = newItem.value;
		classListElement.innerHTML = "";
		displayCodeElement.textContent = "Your code is: " + await getCurrentClassCode();
	});
}

changeClassNameButtonElement.addEventListener("click", async () => {
	let code = await getCurrentClassCode();
	let newName = changeClassNameElement.value;

	document.getElementById("option" + classNumber)!.textContent = newName;

    await fetch(`/api/v1/classroom/${code}`, {
        "method": "PATCH",
        "body": JSON.stringify({
        "code": code,
        "name": newName
        }),
        "headers": {
        "Content-Type": "application/json"
        }
    });
});


let isClassEnabled = true;
let classDisabledData = [];
let isSubmitEnabled = true;
let submitDisabledData: undefined | boolean;

// support method for enabling/disabling, activated upon sign-in
async function xyz () {
	console.log("123");
    // enabling/disabling classes
    // classDisabledData = [await getCurrentCode(), isClassEnabled];
    // await fetch(`/sendclassenabled?classArray=${encodeURI(classDisabledData)}`)
        // 	.then(response => response.json())
        // 	.then(data => {
                
        // 	}); // so it's not linked to pressing the button
    disableClassButtonElement.textContent = "Disable Classroom Code";
    disableClassDescriptionElement.textContent = "Your class is currently ENABLED";

    let code = await getCurrentClassCode();

    console.log(456);

    // enabling/disabling song submission
    await fetch(`/api/v1/classroom/${code}/settings`, {
        "method": "PATCH",
        "body": JSON.stringify({
            "allowSongSubmission": isSubmitEnabled
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    });// so it's not linked to pressing the button
    disableSubmitButtonElement.innerHTML = "Disable Song Submissions";
    disableSongDescriptionElement.textContent = "Your playlist is currently ENABLED";
}

// method for allowing disabling/enabling classes
disableClassButtonElement.addEventListener("click", async () => {
	let code = await getCurrentClassCode();

    if (isClassEnabled) { // if enabled
        isClassEnabled = false; // disable
        disableClassButtonElement.textContent = "Enable Classroom Code"; // change button to ask for enable
        disableClassDescriptionElement.textContent = "Your class is currently DISABLED"; // change description to disabled

        await fetch(`/api/v1/classroom/${code}/settings`, {
            "method": "PATCH",
            "body": JSON.stringify({
                "joinable": false
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        });
    }
    else { // else(if disabled)
        isClassEnabled = true; // enable
        disableClassButtonElement.textContent = "Disable Classroom Code"; // change button to ask for disable
        disableClassDescriptionElement.textContent = "Your class is currently ENABLED"; // change description to enabled
        
        await fetch(`/api/v1/classroom/${code}/settings`, {
            "method": "PATCH",
            "body": JSON.stringify({
                "joinable": true
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        });
    }
});
// method for allowing disabling/enabling song submissions
disableSubmitButtonElement.addEventListener("click", async () => {
	let code = await getCurrentClassCode();
    if (submitDisabledData != true && submitDisabledData != false) { // if undefined
        submitDisabledData = true;
    }
    if (submitDisabledData === true) { // if enabled
        submitDisabledData = false; // disable
        disableSubmitButtonElement.textContent = "Enable Song Submissions"; // change button to ask for enable
        disableSongDescriptionElement.textContent = "Your playlist is currently DISABLED"; // change description to disabled
        
        await fetch(`/api/v1/classroom/${code}/settings`, {
            "method": "PATCH",
            "body": JSON.stringify({
                "allowSongSubmission": false
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        });
    }
    else { // else(if disabled)
        submitDisabledData = true; // enable
        disableSubmitButtonElement.textContent = "Disable Song Submissions"; // change button to ask for disable
        disableSongDescriptionElement.textContent = "Your playlist is currently ENABLED"; // change description to enabled
        
        await fetch(`/api/v1/classroom/${code}/settings`, {
            "method": "PATCH",
            "body": JSON.stringify({
                "allowSongSubmission": true
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        });
    }
});

refreshClassElement.addEventListener("click", refreshClass)


async function refreshClass() {
    let code = await getCurrentClassCode();
    let classroom = (await getClassList(code)) as SongServer.API.TeacherClassroomInfo;
	console.log(classroom);
    classListElement.innerHTML = "";
    studentCardElement.style.display = "inline-block";
    for (let i = 0; i < classroom.students.length; i++) {
        let student = classroom.students[i];

        let newItem1 = document.createElement("button");
        newItem1.textContent = "" + student.email;
        console.log(classroom.students[i]);
        newItem1.classList.add("playlistSongs2");
        //newItem.setAttribute('id', songs[i]);
        
        newItem1.addEventListener("click", () => {
            studentBeingLookedAt = student.email;
            studentInfoNameElement.textContent = "Student Name: " + student.name;
            studentEmailElement.textContent = "Student Email: " + student.email;
            studentOptionsModalElement.style.display = "block";
        });
        classListElement.appendChild(newItem1);
    }
}

async function emailToName(email: string, code: string): Promise<string> {
    let response = await fetch(`/api/v1/classroom/${code}/students/${email}`);
    let data: SongServer.API.Responses.ClassroomStudentAPIResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    console.log(data.data.name);
    return data.data.name;
}

cancelClearButtonElement.addEventListener("click", async () => {
    confirmClearModal.style.display = "none";
});

confirmClearButtonElement.addEventListener("click", async () => {
    deletePlaylist(await getCurrentClassCode());
    confirmClearModal.style.display = "none";
});

clearPlaylistElement.addEventListener("click", async () => {
    confirmClearModal.style.display = "block";
});