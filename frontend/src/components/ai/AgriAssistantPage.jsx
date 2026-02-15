import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoFlower, IoInformationCircleOutline, IoLeaf, IoWater, IoAlertCircle } from 'react-icons/io5';
import api from '../../services/api';
import './AgriAssistant.css';

const AgriAssistantPage = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', parts: [{ text: "Namaste! Welcome to your full-screen Agri Assistant dashboard. I can help you with crop disease identification, weather advice, soil health, and market prices. What's on your mind today?" }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
        setIsLoading(true);

        try {
            const history = chatHistory.map(item => ({
                role: item.role,
                parts: item.parts
            }));

            const response = await api.post('/ai/chat', {
                message: userMsg,
                history: history
            });

            if (response.data.success) {
                setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.data.reply }] }]);
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            setChatHistory(prev => [...prev, {
                role: 'model',
                parts: [{ text: "I apologize, but I'm having trouble connecting right now. Please ensure your API key permissions are enabled." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="agri-page-container">
            <div className="agri-sidebar">
                <div className="sidebar-header">
                    <IoLeaf className="logo-icon" />
                    <h2>AgriExpert AI</h2>
                </div>
                <div className="suggestions">
                    <div className="suggestion-card" onClick={() => setMessage("How to protect wheat from rust disease?")}>
                        <IoAlertCircle className="card-icon info" />
                        <span>Pest Control Advice</span>
                    </div>
                    <div className="suggestion-card" onClick={() => setMessage("What are the best crops for clayey soil in monsoon?")}>
                        <IoLeaf className="card-icon green" />
                        <span>Soil Selection</span>
                    </div>
                    <div className="suggestion-card" onClick={() => setMessage("Explain the current MSP for Cotton.")}>
                        <IoInformationCircleOutline className="card-icon yellow" />
                        <span>Market & MSP Info</span>
                    </div>
                    <div className="suggestion-card" onClick={() => setMessage("Irrigation tips for Mango orchards.")}>
                        <IoWater className="card-icon blue" />
                        <span>Irrigation Tips</span>
                    </div>
                </div>
            </div>

            <div className="agri-main-chat">
                <div className="chat-header">
                    <div className="header-title">
                        <IoFlower className="flower-icon" />
                        <div>
                            <h1>Agricultural Intelligence</h1>
                            <p>Real-time AI support for Indian Farmers</p>
                        </div>
                    </div>
                </div>

                <div className="chat-messages">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`message-row ${chat.role}`}>
                            <div className="avatar">
                                {chat.role === 'model' ? <IoFlower /> : 'U'}
                            </div>
                            <div className="message-content">
                                {chat.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-row model">
                            <div className="avatar"><IoFlower /></div>
                            <div className="message-content typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type your agricultural query here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!message.trim() || isLoading}>
                        <IoSend />
                        <span>Ask AI</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgriAssistantPage;
