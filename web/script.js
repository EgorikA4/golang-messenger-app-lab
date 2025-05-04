const CLIENT_ID = "frontend";
const CLIENT_SECRET = "Fx6g4LJpKN5Y9NEhdom0rXxL83wVHD6h";
const KEYCLOAK_TOKEN_URL = "http://localhost:8090/realms/master/protocol/openid-connect/token"
const CENTRIFUGE_URL = "ws://127.0.0.1:8080/centrifugo/connection/websocket";
// const KEYCLOAK_LOGOUT_URL = "http://127.0.0.1:7070/realms/master/protocol/openid-connect/logout"
let username = ""
let password = ""
let refresh_token = "";
let connected = false;

function getToken() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", CLIENT_ID);
    urlencoded.append("client_secret", CLIENT_SECRET);

    if (refresh_token == "") {
		urlencoded.append("username", username);
		urlencoded.append("password", password);
		urlencoded.append("grant_type", "password");
	} else {
		urlencoded.append("refresh_token", refresh_token);
		urlencoded.append("grant_type", "refresh_token");
	}

    return fetch(KEYCLOAK_TOKEN_URL, {
        method: "POST",
        headers: myHeaders,
        body: urlencoded
    })
		.then((response) => response.json())
		.then((result) => {
			console.log("token accepted");
            console.log(result);
			refresh_token = result.refresh_token;

			return result.access_token;
		})
		.catch((error) => console.error(error));
}

document.getElementById("username").value = "nikita.glinka";
document.getElementById("password").value = "0C620H4puJrv";

const client = new Centrifuge(CENTRIFUGE_URL,
	{
		getToken: getToken,
		debug: true,
	}
);

client.on("connected", () => {
	password = null;
	document.getElementById("password").value = "";
	connected = true;
});

client.on("disconnected", () => {
	refresh_token = "";
	client.setToken("");
	connected = false;
});

document.getElementById("btnLogin").addEventListener("click", () => {
	if (connected) {
		return;
	}

	username = document.getElementById("username").value;
	password = document.getElementById("password").value;

	if (username != "" && password != "") {
		client.connect();
	} else {
		console.error("empty username or password");
	}
});

// document.getElementById("btnLogout").addEventListener("click", () => {
// 	if (!connected) {
// 		return;
// 	}
// 
// 	console.log("disconnecting");
// 
// 	const params = new URLSearchParams();
// 	params.append("client_id", CLIENT_ID);
//     params.append("client_secret", CLIENT_SECRET);
// 
// 	const requestOptions = {
// 		method: "POST",
// 		headers: headers,
// 		body: params,
// 	};
// 
// 	if (refresh_token != "") {
// 		params.append("refresh_token", refresh_token);
// 		params.append("grant_type", "refresh_token");
// 
// 		fetch(KEYCLOAK_LOGOUT_URL, requestOptions)
// 			.then((response) => {
// 				console.log("session closed");
// 			})
// 			.catch((error) => console.error(error))
// 			.finally(() => {
// 				client.disconnect();
// 			});
// 	} else {
// 		console.error("no refresh token");
// 	}
// });
