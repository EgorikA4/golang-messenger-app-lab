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
            console.log("Connected to Centrifuge");
            document.getElementById("login-section").classList.add("hidden");
            document.getElementById("main-section").classList.remove("hidden");
            Auth.clearCredentials(); // Clear password
        });

        client.on("disconnected", () => {
            console.log("Disconnected from Centrifuge");
            Auth.clearCredentials();
        });

        client.connect();
        client.rpc("my.method.name", {}).then(function(res) {
            console.log('rpc result', res);
        }, function(err) {
            console.log('rpc error', err);
        });
        
    },
    subscribeToChannel: function (channelName, callback) {
        if (subscriptions[channelName]) {
            console.log("Already subscribed to", channelName);
            return;
        }

        const sub = client.newSubscription(channelName);
        sub.on("publication", (ctx) => {
            console.log("Received message on", channelName, ctx.data);
            if (callback) callback(ctx.data);
        });

        sub.on("subscribed", () => {
            console.log("Subscribed to", channelName);
            subscriptions[channelName] = sub;
        });
3
        sub.on("error", (err) => {
            console.error("Subscription error:", err.message);
        });

        sub.subscribe();
    },
    publishMessage: function (channel, message) {
        return client.publish(channel, { message });
    }
};