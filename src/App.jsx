// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// -----------------------------------------------------------

import React, { useState } from 'react';
import { Save, Sparkles, Send, ArrowLeft } from 'lucide-react';
import './App.css';

const GoldenQuill = () => {
  // State for the Editor
  const [title, setTitle] = useState('Title');
  const [mainText, setMainText] = useState('');

  // State for the Bank
  const [bankItems, setBankItems] = useState([
    { id: 1, content: 'Idea 1' },
    { id: 2, content: 'Draft Concept A' },
  ]);

  // State for Chat
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I help you write today?' }
  ]);

  // Handlers
  const handleSaveToBank = () => {
    if (!mainText) return;
    const newItem = {
      id: Date.now(),
      content: mainText.slice(0, 20) + (mainText.length > 20 ? '...' : '')
    };
    setBankItems([...bankItems, newItem]);
  };

  const handleDeleteBankItem = (id) => {
    setBankItems(bankItems.filter(item => item.id !== id));
  };

  const loadFromBank = (content) => {
    setMainText(content);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');

    try {
      const response = await fetch('http://localhost:3001/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: chatInput,
          bankItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server.');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    }
  };

  return (
    <div className="app-container">
      
      {/* MAIN CONTAINER */}
      <div className="main-card">
        
        {/* HEADER */}
        <div className="header-section">
          <div className="header-pill">
            GOLDEN QUILL
          </div>
        </div>

        {/* MIDDLE SECTION: Editor + Bank */}
        <div className="workspace">
          
          {/* LEFT: Editor Section */}
          <div className="editor-section">
            {/* Decoration Arrow */}
            <div className="entry-room-label">
               <ArrowLeft size={16} />
            </div>

            {/* Editor Box */}
            <div className="editor-box">
              
              {/* Title Input */}
              <div className="title-input-wrapper">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="title-input"
                />
              </div>

              {/* Text Area */}
              <textarea 
                className="main-textarea"
                placeholder="Start writing text here..."
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
              />

              {/* Floating Action Buttons */}
              <div className="actions-container">
                
                {/* Save Button */}
                <button onClick={handleSaveToBank} className="btn-save">
                  <Save size={16} /> Save
                </button>

                {/* AI Diamond Button */}
                <button className="btn-diamond">
                  <div className="diamond-inner">
                    <Sparkles size={20} color="#1e293b" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: The Bank */}
          <div className="bank-section">
            <div className="bank-header">Bank</div>
            
            <div className="bank-list">
              {bankItems.map((item) => (
                <div key={item.id} className="bank-row">
                  {/* Idea Card */}
                  <div 
                    onClick={() => loadFromBank(item.content)}
                    className="bank-card"
                  >
                    {item.content}
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteBankItem(item.id)}
                    className="btn-delete"
                  >
                    D
                  </button>
                </div>
              ))}

              {bankItems.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginTop: '20px' }}>
                  Bank is empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: AI Chat Function */}
        <div className="chat-section">
          <div className="chat-header">
            Ai chat function
          </div>
          
          {/* Chat History */}
          <div className="chat-history">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg-wrapper ${msg.role}`}>
                <span className="msg-bubble">
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chat-input-area">
            <input 
              className="chat-input"
              placeholder="Ask AI..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="btn-send" onClick={handleSendMessage}>
               <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER: Workflow Notes */}
      <div className="notes-container">
        <div className="notes-label">Long term ideas // Possible other ideas</div>
        <div className="notes-card">
          <p className="handwriting">
            begin writing an incomeplete idea to see where it can go...
          </p>
        </div>
      </div>

    </div>
  );
};

export default GoldenQuill;