// WhatsApp Cloud API Handler
const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400); // Bad Request if parameters missing
  }
};

const handleIncomingMessage = (req, res) => {
  // Process incoming messages (Mock implementation)
  const body = req.body;

  // Basic validation of WhatsApp payload structure
  if (body.object) {
    console.log("WhatsApp Event Received:", JSON.stringify(body, null, 2));
    // TODO: Queue message for processing
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};

export default {
  verifyWebhook,
  handleIncomingMessage,
};
