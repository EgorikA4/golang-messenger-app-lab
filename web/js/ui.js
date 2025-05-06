window.UI = {
    setupLoginForm: function () {
        document.getElementById("login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (!username || !password) {
                this.setErrorUnderLoginForm("Please enter both username and password.")
                return;
            }

            Auth.setCredentials(username, password);
            CentrifugeClient.init();
        });
    },

    setErrorUnderLoginForm: function (errorMsg) {
        document.getElementById("login-error").textContent = errorMsg;
        document.getElementById("login-error").classList.remove("hidden");
    },

    setupPublishForm: function () {
        document.getElementById("publish-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const select = document.getElementById("channel-select");
            const input = document.getElementById("message-input");

            const channel = CentrifugeClient.getChannelByTitle(select.value);
            const message = input.value.trim();

            CentrifugeClient.publishMessage(channel, message)
                .then(() => {
                    this.setStatusUnderPublishForm("Message was published!");
                    input.value = "";
                })
                .catch(err => {
                    this.setStatusUnderPublishForm(`Error: ${err.message}`);
                });
        });
    },

    addElementToPublishFormList: function (channelTitle) {
        const select = document.getElementById("channel-select");
        const option = document.createElement("option");
        option.value = option.textContent = channelTitle;
        select.appendChild(option);
    },

    setStatusUnderPublishForm: function (message) {
        document.getElementById("publish-status").textContent = message;
    },

    setupSubscribeForm: function () {
        document.getElementById("subscribe-form").addEventListener("submit", (e) => {
            e.preventDefault();

            const input = document.getElementById("subscribe-input");
            const channel = input.value.trim();

            CentrifugeClient.subscribeToChannel(channel, (data) => {
                console.log("Message received:", data.message);
                this.setStatusUnderSubscribeForm(`Published message: ${data.message}`);
            });

            input.value = "";
        });
    },

    setStatusUnderSubscribeForm: function (message) {
        document.getElementById("subscribe-status").textContent = message;
    }
};