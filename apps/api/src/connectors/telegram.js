// Telegram Bot API Handler

const handleWebhook = (req, res) => {
  const secretToken = req.headers["x-telegram-bot-api-secret-token"];

  if (
    process.env.TELEGRAM_SECRET_TOKEN &&
    secretToken !== process.env.TELEGRAM_SECRET_TOKEN
  ) {
    return res.status(403).send("Unauthorized");
  }

  const update = req.body;
  if (update.message) {
    console.log("Telegram Message Received:", update.message.text);
    // TODO: Process message
  }

  res.sendStatus(200);
};

export default {
  handleWebhook,
};
