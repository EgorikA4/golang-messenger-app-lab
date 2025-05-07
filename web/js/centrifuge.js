const CENTRIFUGE_URL = "ws://127.0.0.1:8080/centrifugo/connection/websocket";

let client = null;
let subscriptions = new Map();

window.CentrifugeClient = {
    init: function () {
        client = new Centrifuge(CENTRIFUGE_URL, {
            getToken: Auth.getToken,
            debug: true
        });

        client.on("connected", () => {
            client.rpc("InitUser", {})
                .then(() => {
                    this.getUserChannelsList();
                    document.getElementById("login-section").classList.add("hidden");
                    document.getElementById("main-section").classList.remove("hidden");
                    Auth.clearCredentials(); // Clear password
                })
                .catch((error) => {
                    window.UI.setErrorUnderLoginForm(`Unexpected error: ${error.message}`);
                });
        });

        client.on("disconnected", () => {
            Auth.clearCredentials();
        });

        client.connect();
    },
    getUserChannelsList: function () {
        client.rpc("GetUserChannelsList", {}).then((response) => {
            channelsList = response.data
            for (let index = 0; index < channelsList.length; index++) {
                const channel = channelsList[index];
                subscriptions.set(channel.Title, channel.Channel);
                window.UI.addElementToPublishFormList(channel.Title);
            }
        });
    },
    getChannelByTitle: function (title) {
        return subscriptions.get(title);
    },
    publishMessage: function (channel, message) {
        return client.publish(channel, {"message": message});
    },

    subscribeToChannel: function (channelName, callback) {
        for (let channel of subscriptions.values()) {
            if (channel === channelName) {
                window.UI.setStatusUnderSubscribeForm(`Already subscribed to ${channelName}`);
                return;
            }
        }

        let sub = client.newSubscription(channelName);
        sub.on("publication", (ctx) => {
            console.log("Received message on", ctx.data);
            if (callback) callback(ctx.data);
        });

        sub.on("subscribed", (ctx) => {
            const data = ctx.data;
            console.log("Subscribed to", data.Channel);
            subscriptions.set(data.Title, data.Channel);
            window.UI.addElementToPublishFormList(data.Title);
        });

        sub.on("error", (ctx) => {
            console.log(ctx);
            console.log("Subscription error:", ctx);
        });

        sub.subscribe();
    }
};