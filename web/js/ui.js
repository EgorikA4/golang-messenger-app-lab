window.UI = {
    setupLoginForm: function () {
        document.getElementById("btnLogin").addEventListener("click", () => {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (!username || !password) {
                document.getElementById("login-error").textContent = "Please enter both username and password.";
                document.getElementById("login-error").classList.remove("hidden");
                return;
            }

            event.preventDefault();
            Auth.setCredentials(username, password);
            CentrifugeClient.init();
         });
    },

    setupSubscribeForm: function () {
        document.getElementById("subscribe-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("subscribe-input");
            const channel = input.value.trim();
            if (!channel) return;

            const select = document.getElementById("channel-select");
            const option = document.createElement("option");
            option.value = option.textContent = channel;
            select.appendChild(option);

            CentrifugeClient.subscribeToChannel(channel, (data) => {
                console.log("Message received:", data.message);
                document.getElementById("subscribe-status").textContent = `Published message: ${data.message}`;
            });

            input.value = "";
        });
    },

    setupPublishButton: function () {
        document.getElementById("btnPublish").addEventListener("click", () => {
            const select = document.getElementById("channel-select");
            const input = document.getElementById("message-input");
            const channel = select.value;
            const message = input.value.trim();

            if (!channel || !message) {
                document.getElementById("publish-status").textContent = "Please select a channel and enter a message.";
                return;
            }

            event.preventDefault();
            console.log(message);
            CentrifugeClient.publishMessage(channel, message)
                .then(() => {
                    document.getElementById("publish-status").textContent = "Message published!";
                    input.value = "";
                })
                .catch(err => {
                    console.error("Publish error:", err);
                    document.getElementById("publish-status").textContent = `Error: ${err.message}`;
                });
        });
    }
};