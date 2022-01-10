/// <reference lib="dom" />

let submitCodeElement = document.getElementById("submitCode")! as HTMLButtonElement;
let classCodeEnterElement = document.getElementById("classCodeEnter")! as HTMLInputElement;

// function that returns the student's current class code
async function getCurrentCodeForStudent(): Promise<string> {
    let response = await fetch(`/api/v1/users/`, {
        "headers": {
            "Authorization": `Basic ${window.localStorage.getItem("auth")}`
        }
    });
    let data: SongServer.API.Responses.FetchUserResponse = await response.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    if (data.data.type === "student") {
        if (data.data.currentClass == null) {
            throw new Error("Student isn't in a class");
        }
        return data.data.currentClass;
    }
    else {
        throw new Error("Gotten user wasn't a student. Was type " + data.data.type);
    }
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

            let currentCode = await getCurrentCodeForStudent();
            displayCodeElement.textContent = "Your current code is: " + currentCode;
    });
})

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        window.location.pathname = "";
    });
}
    
// method to join a class, if class is enabled
submitCodeElement.addEventListener("click", async () => {
    await joinClass(classCodeEnterElement.value, profile.getEmail(), profile.getName());
});
    
async function joinClass(code: string, email: string, name: string) {
    let response = await fetch(`/api/v1/classrooms/${code}/students/`, {
        "method": "POST",
        "body": JSON.stringify({
            "email": email,
            "name": name
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    });
    let data: SongServer.API.Responses.ClassroomAddStudentAPIResponse = await response.json();
    if (!data.success) {
        window.alert("Error: " + data.message);
        return;
    }

    console.log("Student successfully added");
    displayCodeElement.textContent = "Your current code is: " + code;
}