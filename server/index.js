require("dotenv").config();
const express = require("express");

const { validateRequestOriginMiddleware } = require("./middlewares/validateRequestOriginMiddleware");
const { initWebchatController } = require("./controllers/initWebchatController");
const { refreshTokenController } = require("./controllers/refreshTokenController");
const { emailTranscriptController } = require("./controllers/emailTranscriptController");
const { webhookChatStartedController } = require("./controllers/webhookChatStartedController");

const cors = require("cors");
const { allowedOrigins } = require("./helpers/getAllowedOrigins");

const app = express();
const port = 3001;

app.use(express.json());
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    next();
});
app.use(
    cors({
        origins: allowedOrigins
    })
);
app.listen(port, () => {
    console.log(`Twilio Webchat App server running on port ${port}`);
});

app.post("/initWebchat", validateRequestOriginMiddleware, initWebchatController);
app.post("/refreshToken", validateRequestOriginMiddleware, refreshTokenController);
app.post("/email", validateRequestOriginMiddleware, emailTranscriptController);
app.post("/webhook/chat-started", webhookChatStartedController);
