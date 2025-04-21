const { queryGroqAPI } = require('../services/groqService');

const handleGroqChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const groqResponse = await queryGroqAPI(message);
    res.json({ reply: groqResponse });
  } catch (error) {
    console.error('Groq Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Groq API' });
  }
};

module.exports = { handleGroqChat };
