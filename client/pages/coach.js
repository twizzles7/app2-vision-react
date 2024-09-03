import { useState, useEffect } from 'react';
import coachService from '../services/coachService';

export default function Coach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Load conversation history
    const loadHistory = async () => {
      const history = await coachService.getConversationHistory();
      setMessages(history);
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input };
      setMessages([...messages, userMessage]);
      setInput('');

      const aiResponse = await coachService.sendMessage(input);
      setMessages([...messages, userMessage, aiResponse]);
    }
  };

  return (
    <div>
      <h1>AI Career Coach</h1>
      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}