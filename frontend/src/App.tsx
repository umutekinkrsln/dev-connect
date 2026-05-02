import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface Message {
  id?: number;
  username: string;
  content: string;
  createdAt?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [username] = useState('Dev_' + Math.floor(Math.random() * 1000));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Otomatik aşağı kaydırma fonksiyonu
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.on('previous_messages', (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('previous_messages');
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('send_message', { username, content: input });
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl text-center py-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          DevConnect Chat
        </h1>
        <p className="text-gray-400 mt-2 italic">Kullanıcı adın: <span className="text-emerald-400 font-mono">{username}</span></p>
      </div>

      {/* Chat Area */}
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.map((msg, index) => {
            const isMe = msg.username === username;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}>
                  <p className="text-xs font-bold mb-1 opacity-75">{msg.username}</p>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] mt-1 text-right opacity-50">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Az önce'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            placeholder="Kodla ilgili bir şeyler sor..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;