exports.webhookChatStartedController = async (req, res) => {
    const { customerName, flowSid, conversationSid, triggerEvent, instanceSid, channelSid } = req.body;
    console.log("Webhook Chat Started:", { customerName, flowSid, conversationSid, triggerEvent, instanceSid, channelSid });
    res.status(200).send({ success: true, message: "Webhook received" });
};