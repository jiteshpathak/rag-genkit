import { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/api';

export default function ChatInterface() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // Add user question to conversation
    const userMessage = { role: 'user', content: question };
    setConversation(prev => [...prev, userMessage]);
    
    setQuestion('');
    setLoading(true);
    
    try {
      const response = await askQuestion(question);
      
      // Add AI response to conversation
      const aiMessage = { 
        role: 'ai', 
        content: response.text,
        sources: response.sources // Assuming backend returns sources
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'ai',
        content: `❌ Error: ${error.response?.data?.message || 'Failed to get response'}`
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Document Q&A</h2>
      
      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-primary-50 self-end ml-auto' 
                : 'bg-gray-50 self-start'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            
            {msg.sources && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-medium">Sources:</p>
                <ul className="text-xs text-gray-500">
                  {msg.sources.map((source, i) => (
                    <li key={i} className="truncate">{source.url}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="p-4 rounded-lg bg-gray-50 self-start">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Ask about your documents..."
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-primary text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}