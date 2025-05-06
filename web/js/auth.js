const CLIENT_ID = "frontend";
const KEYCLOAK_TOKEN_URL = "http://localhost:8090/realms/messenger/protocol/openid-connect/token";

let username = "";
let password = "";
let refresh_token = "";

window.Auth = {
    getToken: async function () {
        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const body = new URLSearchParams();
        body.append("client_id", CLIENT_ID);

        if (refresh_token === "") {
            body.append("username", username);
            body.append("password", password);
            body.append("grant_type", "password");
        } else {
            body.append("refresh_token", refresh_token);
            body.append("grant_type", "refresh_token");
        }

        return await fetch(KEYCLOAK_TOKEN_URL, {
            method: "POST",
            headers: headers,
            body: body
        })
            .then(async (response) => {
                if (response.status === 401) {
                    window.UI.setErrorUnderLoginForm("Bad credentials!");
                } else if (response.status === 200) {
                    data = await response.json();
                    refresh_token = data.refresh_token;
                    return data.access_token;
                } else {
                    window.UI.setErrorUnderLoginForm("Unexpected error!");
                    return;
                }
            })
            .catch(async (error) => {
                window.UI.setErrorUnderLoginForm(`Unexpected error: ${error.message}`);
            });
    },
    setCredentials: function (user, pass) {
        username = user;
        password = pass;
    },
    getRefreshToken: function () {
        return refresh_token;
    },
    clearCredentials: function () {
        username = "";
        password = "";
        refresh_token = "";
    }
};