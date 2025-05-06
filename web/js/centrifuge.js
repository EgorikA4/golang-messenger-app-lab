const CENTRIFUGE_URL = "ws://127.0.0.1:8080/centrifugo/connection/websocket";

let client = null;
const subscriptions = {};

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
                subscriptions[channel.Title] = channel.Channel;
                window.UI.addElementToPublishFormList(channel.Title);
            }
        });
    },
    getChannelByTitle: function (title) {
        return subscriptions[title];
    },
    publishMessage: function (channel, message) {
        return client.publish(channel, {"message": message});
    },

    // TODO: check if exists (title -> channel) && (channel -> title) dicts
    subscribeToChannel: function (channelName, callback) {
        if (channelName in subscriptions.values()) {
            console.log("Already subscribed to", channelName);
            return;
        }

        const sub = client.newSubscription(channelName);
        const title = Object.keys(subscriptions).find(key => subscriptions[key] === channelName);
        sub.on("publication", (ctx) => {
            console.log("Received message on", title, ctx.data);
            if (callback) callback(ctx.data);
        });

        sub.on("subscribed", () => {
            console.log("Subscribed to", channelName);
            subscriptions[title] = channelName;
            window.UI.addElementToPublishFormList(channel.Title);
        });

        sub.on("error", (err) => {
            console.error("Subscription error:", err.message);
        });

        sub.subscribe();
    }
};