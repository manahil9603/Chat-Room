(function(){
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    // Join logic
    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        if (username.length == 0) return;

        uname = username;
        socket.emit("newUser", uname);
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    // Send message
    app.querySelector(".chat-screen #send-message").addEventListener("click", function() {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) return;

        renderMessage("my", {
            username: uname,
            text: message
        });

        socket.emit("chat", {
            username: uname,
            text: message
        });

        app.querySelector(".chat-screen #message-input").value = "";
    });

    // Enter key support
    app.querySelector("#message-input").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            app.querySelector("#send-message").click();
        }
    });

    // Exit chat
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    // Receive messages
    socket.on("update", function(update){
        renderMessage("update", update);
    });

    socket.on("chat", function(message){
        renderMessage("other", message);
    });

    // Render messages
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if (type == "my") {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div class="name">You</div>
                <div class="text">${message.text}</div>
            `;
        } else if (type == "other") {
            el.setAttribute("class", "message other-message");
            // Only allow img tags for stickers
            const cleanText = message.text.startsWith('<img') ? 
                message.text : 
                document.createTextNode(message.text).textContent;
            el.innerHTML = `
                <div class="name">${message.username}</div>
                <div class="text">${cleanText}</div>
            `;
        } else if (type == "update") {
            el.setAttribute("class", "update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

 
    // === Stickers ===
    document.getElementById("sticker-button").addEventListener("click", (e) => {
        e.stopPropagation();
        const panel = document.getElementById("sticker-panel");
        panel.style.display = panel.style.display === "none" ? "flex" : "none";
    });

    // Close sticker panel when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#sticker-panel') && e.target.id !== 'sticker-button') {
            document.getElementById("sticker-panel").style.display = "none";
        }
    });

    // Sticker click handler
    document.querySelectorAll(".sticker").forEach(sticker => {
        sticker.addEventListener("click", () => {
            const url = sticker.getAttribute('src');
            const messageHTML = `<img src="${url}" class="chat-sticker" alt="sticker">`;

            renderMessage("my", {
                username: uname,
                text: messageHTML
            });

            socket.emit("chat", {
                username: uname,
                text: messageHTML
            });

            document.getElementById("sticker-panel").style.display = "none";
        });
    });
})();