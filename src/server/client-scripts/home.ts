/// <reference lib="dom" />

//load up that authy boi
gapi.load("auth2", () => {
    // @ts-ignore
    gapi.auth2.init()
});

document.getElementById("loginButton")!.addEventListener("click", googleLogin);

async function googleLogin() {
    let googleUser = await gapi.auth2.getAuthInstance().signIn(); // <- this one gonna open the google window
    try {
        let contentThing = JSON.stringify({
            token: googleUser.getAuthResponse().id_token
        });
        console.log(contentThing);
        let request = await fetch(`/authorize`, {
            method: "POST",
            body: contentThing,
            headers: {
                "Content-Type": "application/json"
            }
        });
        let response: SongServer.API.Responses.AuthorizeResponse = await request.json();
        window.localStorage.setItem("auth", response.success ? response.data.token : "");
        //window.location.pathname = "/dashboard";
    }
    catch(err) {
        window.alert("Error whilst authorizing: " + err);
    }
}