const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

app.post('/slash', async (req, res) => {
  const { channel_id, channel_name, user_id } = req.body;
  
  // Acknowledge immediately
  res.json({ response_type: 'ephemeral', text: `Converting #${channel_name} to private...` });
  
  try {
    const response = await fetch('https://slack.com/api/admin.conversations.convertToPrivate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel_id })
    });
    
    const data = await response.json();
    
    // Send follow-up message
    const message = data.ok 
      ? `✅ Successfully converted #${channel_name} to private.`
      : `❌ Failed: ${data.error}`;
    
    await fetch('https://slack.com/api/chat.postEphemeral', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel: channel_id, user: user_id, text: message })
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
