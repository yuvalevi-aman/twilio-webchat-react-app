const axios = require("axios");
const { createToken } = require("../helpers/createToken");
const { TOKEN_TTL_IN_SECONDS } = require("../constants");
const { getTwilioClient } = require("../helpers/getTwilioClient");
const { logFinalAction, logInitialAction, logInterimAction } = require("../helpers/logs");
const { version } = require("./../../package.json");

const contactWebchatOrchestrator = async (request, customerFriendlyName) => {
  logInterimAction("Calling Webchat Orchestrator");

  const params = new URLSearchParams();
  params.append("AddressSid", process.env.ADDRESS_SID);
  params.append("ChatFriendlyName", "Webchat widget");
  params.append("CustomerFriendlyName", customerFriendlyName);
  params.append(
    "PreEngagementData",
    JSON.stringify({
      ...request.body?.formData,
      friendlyName: customerFriendlyName
    })
  );

  let conversationSid;
  let identity;

  try {
    const res = await axios.post(`https://flex-api.twilio.com/v2/WebChats`, params, {
      auth: {
        username: process.env.ACCOUNT_SID,
        password: process.env.AUTH_TOKEN
      },
      headers: {
        "ui-version": version
      }
    });
    ({ identity, conversation_sid: conversationSid } = res.data);
  } catch (e) {
    logInterimAction("Orchestration failed:", e.response?.data?.message);
    throw e.response.data;
  }

  return { conversationSid, identity };
};

const triggerStudioFlow = async (conversationSid, identity) => {
  logInterimAction("Triggering Studio Flow (silent message)");

  return getTwilioClient()
    .conversations.conversations(conversationSid)
    .messages.create({
      body: " ", 
      author: identity,
      xTwilioWebhookEnabled: true
    })
    .then(() => {
      logInterimAction("Silent trigger message sent to conversation");
    })
    .catch((e) => {
      logInterimAction("Failed to send silent trigger message:", e.message);
    });
};

const initWebchatController = async (request, response) => {
  logInitialAction("Initiating webchat");

  const customerFriendlyName = request.body?.formData?.friendlyName || "Customer";

  let conversationSid;
  let identity;

  try {
    const result = await contactWebchatOrchestrator(request, customerFriendlyName);
    ({ identity, conversationSid } = result);
  } catch (error) {
    return response.status(500).send(`Couldn't initiate WebChat: ${error?.message}`);
  }

  const token = createToken(identity);

  if (typeof request.body?.formData?.query !== "undefined") {
    await triggerStudioFlow(conversationSid, identity);
  }

  response.send({
    token,
    conversationSid,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
  });

  logFinalAction("Webchat successfully initiated");
};

module.exports = { initWebchatController };
