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

// variables
let isPlaying = false;
let classNumber = "1";
let isShuffled = false;
let currentPlaylist: SongServer.API.SongInfo[] = [];
let songBeingLookedAt: string | null = null;
let studentBeingLookedAt: string | null = null;
var songPlaylistBeingLookedAt;
//Is this needed ^^^ or this vvv
async function getCode(index: number = 0): Promise<string> {
    let data = await ClientAPI().classrooms.list();

    if (!data.success) {
        throw new Error(data.message);
    }

    if (index === 0 && data.data.length === 0) {
        let classData = await ClientAPI().classrooms.create({
            "allowSongSubmissions": true,
            "joinable": true,
            "name": "Classroom"
        });

        if (!classData.success) {
            throw new Error(classData.message);
        }

        if (classData.data.playlist == null || classData.data.playlist.length == 0) {
            let playlistInfo = await ClientAPI().playlists.create(profile.getEmail(), {
                "name": "Class Playlist 1",
                "playlistVisibility": "private"
            });

            if (!playlistInfo.success) {
                throw new Error(playlistInfo.message);
            }

            let s = await ClientAPI().classrooms.classroom(classData.data.code).playlist.set(profile.getEmail(), playlistInfo.data.id);
    
            if (!s.success) {
                throw new Error(s.message);
            }

            classData.data.playlist = [];
        }

        return classData.data.code;
    }

    if (data.data[index] == null) {
        // @ts-ignore
        return null;
    }
    return data.data[index].code;
}

var profile: gapi.auth2.BasicProfile;

//load up that authy boi
gapi.load("auth2", async () => {
    
    // todo: figure out params
    // @ts-ignore
    gapi.auth2.init()
        .then(async response => {
            profile = response.currentUser.get().getBasicProfile();
            console.log('Full Name: ' + profile.getName());
            console.log('Email: ' + profile.getEmail());

            store_nameElement.textContent = profile.getName();
            let currentCode = await getCurrentClassCode();
            displayCodeElement.textContent = "Your current code is: " + currentCode;
            await loadClassSelection();
            await xyz();
    });
});

async function getClassList(code: string): Promise<SongServer.API.ClassroomInfo> {
    console.log(code);
    console.log("abc");
    let data = await ClientAPI().classrooms.classroom(code).get();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}
//Hmm ^^^

/* The playlist variable we have as of now works a bit strangely -- every even index is the song, and every odd index is the name of the student who submitted it. */
async function getClassPlaylist(classroomCode: string): Promise<SongServer.API.ClassroomPlaylistInfo> {
    let data = await ClientAPI().classrooms.classroom(classroomCode).playlist.get();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}

// deleted specified playlist
async function deleteClassPlaylist(classroomCode: string): Promise<boolean> {

    let data = await ClientAPI().classrooms.classroom(classroomCode).playlist.remove();
    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
}


// shuffles the currently selected playlist
async function shufflePlaylist() {
    let data = await ClientAPI().classrooms.classroom(await getCurrentClassCode()).playlist.shuffle();
    if (!data.success) {
        throw new Error(data.message);
    }
    // @ts-ignore
    currentPlaylist = data.data.songs;
}

// returns the current class code for the teacher
async function getCurrentClassCode(): Promise<string> {
    // @ts-ignore
    return await getCode(parseInt(classNumber) - 1);
}


async function updateCurrentlyPlayingText(id: string): Promise<void> {
    let data = await ClientAPI().youtube.get(id);

    if (!data.success) {
        throw new Error(data.message);
    }

    currentlyPlayingElement.textContent = data.data.title;
}

let currentSongIndex = 0;
async function loadNextSong() {
	if (windowWithPlayer.player != null) {
        // @ts-ignore
	    currentPlaylist = (await getClassPlaylist(await getCurrentClassCode())).songs;
        let songID = currentPlaylist[currentSongIndex].id;

        // handle wrapping
        currentSongIndex++;
        if (currentSongIndex >= currentPlaylist.length) {
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
    await removeSongFromClassPlaylist();
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
    let newPlaylist = await getClassPlaylist(await getCurrentClassCode());
    if (newPlaylist == null) return;

    let songs = newPlaylist.songs;
    console.log(songs);

    // song id
    for (let index = 0; index < songs.length; index++) {
        let song = songs[index] as SongServer.API.ClassroomTeacherSongInfo;
        let studentName = song.requested_by!;

        let data = await ClientAPI().youtube.get(song.id!);

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
            submittedByElement.textContent = "Submitted By: " + studentName.name;
            songOptionsModalElement.style.display = "block";
        });

        newItem.textContent = title;
        playlistElement.appendChild(newItem);
    }
}


async function removeSongFromClassPlaylist(): Promise<boolean> {
    let songID = songBeingLookedAt;
    let playlistID = await getCurrentClassCode();
    if (songID == null) throw new Error("Cannot remove song because no song is being played/looked at");

    // for now use youtube source, but may be changed later
    let data = await ClientAPI().classrooms.classroom(playlistID).playlist.songs.remove({
        "songID": songID,
        "source": "youtube"
    });

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

    let data = await ClientAPI().classrooms.classroom(classroomID).removeStudent(email!);

    if (!data.success) {
        throw new Error(data.message);
    }

    await refreshClass();
    console.log("remove success!");
    return data.data;
}

async function displaySongInfo(id: string, stuName: SongServer.API.BasicUser) {
    console.log("id: " + id + "\nname: " + stuName.name);
}

shuffleButtonElement.addEventListener("click", async () => {
    shufflePlaylist();
    window.alert("Shuffled playlist!");
})


async function loadClassSelection() {
	let newItem = document.createElement('select');
	newItem.name = 'selectClass';
	newItem.id = 'selectClass';
    // @ts-ignore
	let email = profile.getEmail();
    // load one class, eventually load dynamically
    let data = await ClientAPI().classrooms.list();
    if (!data.success) {
        throw new Error(data.message);
    }

    for (let i = 0; i < data.data.length; i++) {
        let classInfo = data.data[i];
        let newOption = document.createElement('option');
        newOption.innerHTML = classInfo.name;
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

    await ClientAPI().classrooms.classroom(code).modify({
        "name": newName
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
    await ClientAPI().classrooms.classroom(code).settings.modify({
        "allowSongSubmission": isSubmitEnabled
    });
    // so it's not linked to pressing the button
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

        await ClientAPI().classrooms.classroom(code).settings.modify({
            "joinable": false
        });
    }
    else { // else(if disabled)
        isClassEnabled = true; // enable
        disableClassButtonElement.textContent = "Disable Classroom Code"; // change button to ask for disable
        disableClassDescriptionElement.textContent = "Your class is currently ENABLED"; // change description to enabled
        
        await ClientAPI().classrooms.classroom(code).settings.modify({
            "joinable": true
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
        
        await ClientAPI().classrooms.classroom(code).settings.modify({
            "allowSongSubmission": false
        });
    }
    else { // else(if disabled)
        submitDisabledData = true; // enable
        disableSubmitButtonElement.textContent = "Disable Song Submissions"; // change button to ask for disable
        disableSongDescriptionElement.textContent = "Your playlist is currently ENABLED"; // change description to enabled
        
        await ClientAPI().classrooms.classroom(code).settings.modify({
            "allowSongSubmission": true
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
cancelClearButtonElement.addEventListener("click", async () => {
    confirmClearModal.style.display = "none";
});

confirmClearButtonElement.addEventListener("click", async () => {
    deleteClassPlaylist(await getCurrentClassCode());
    confirmClearModal.style.display = "none";
});

clearPlaylistElement.addEventListener("click", async () => {
    confirmClearModal.style.display = "block";
});

getCurrentCode = getCurrentClassCode;