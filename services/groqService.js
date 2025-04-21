const axios = require('axios');

const queryGroqAPI = async (message) => {
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error('Groq API call failed');
  }
};

module.exports = { queryGroqAPI };
