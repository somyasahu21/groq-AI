import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/App.css';

const defaultAvatars = ['🧑', '👩', '🧔', '👩‍💻', '👨‍🚀', '🧙‍♂️', '🐱', '🐶'];

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('default');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // 🗣️ Text-to-speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  // 💬 Handle user message
  const handleSend = useCallback(async (message) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      const botReply = data.reply || "🤖 Sorry, I couldn't understand that.";

      setMessages((prev) => [...prev, { text: botReply, sender: 'bot' }]);
      speak(botReply);
    } catch (error) {
      console.error('❌ Backend error:', error);
      setMessages((prev) => [
        ...prev,
        { text: '⚠️ Server error. Please try again later.', sender: 'bot' },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  // 🎤 Voice recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [handleSend]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening((prev) => !prev);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  // ⌨️ Optional: handle Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        e.preventDefault();
        handleSend(input);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, input]);

  // 🎨 Mood themes
  useEffect(() => {
    const moods = ['default', 'sunset', 'neon', 'aqua'];
    if (messages.length && messages.length % 5 === 0) {
      const mood = moods[Math.floor(Math.random() * moods.length)];
      setTheme(mood);
    }
  }, [messages]);

  // 👤 Setup screen
  if (!isSetupComplete) {
    return (
      <div className="setup-container">
        <h2>Welcome to Groq Assistant</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="avatar-picker">
          <p>Choose your avatar:</p>
          <div className="avatars">
            {defaultAvatars.map((av, index) => (
              <span
                key={index}
                className={`avatar-option ${userAvatar === av ? 'selected' : ''}`}
                onClick={() => setUserAvatar(av)}
              >
                {av}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            if (userName && userAvatar) {
              setIsSetupComplete(true);
            } else {
              alert('Please enter your name and choose an avatar!');
            }
          }}
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className={`chat-container ${theme}`}>
      <header className="chat-header">🤖 Groq Assistant</header>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div className={`message ${msg.sender}`} key={index}>
            <div className="avatar">
              {msg.sender === 'user' ? userAvatar : '🤖'}
            </div>
            <div className="text">
              <strong>
                {msg.sender === 'user' ? userName : 'Groq'}:
              </strong>{' '}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">
            <div className="avatar">🤖</div>
            <div className="dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleFormSubmit}>
        <input
          type="text"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button type="button" onClick={toggleListening}>
          🎤
        </button>
        <button type="submit">➤</button>
      </form>
    </div>
  );
};

export default ChatPage;
