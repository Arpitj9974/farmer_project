import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoChatbubbleEllipses, IoClose, IoFlower, IoInformationCircleOutline } from 'react-icons/io5';
import api from '../../services/api';
import './AgriAssistant.css';

const AgriAssistant = ({ embedded = false, isOpenProps = false, onClose }) => {
    const [isOpenState, setIsOpenState] = useState(false);
    const isOpen = embedded ? isOpenProps : isOpenState;

    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', parts: [{ text: "Namaste! I am your FarmerConnect Agri Assistant. How can I help you with your farming or trading today?" }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
        setIsLoading(true);

        try {
            // Filter history for Gemini format
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
                parts: [{ text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOpen = () => setIsOpenState(!isOpenState);
    const handleClose = () => {
        if (embedded && onClose) onClose();
        else setIsOpenState(false);
    };

    return (
        <div className={`agri-assistant-container ${embedded ? 'embedded' : ''} ${isOpen ? 'active' : ''}`}>
            {/* Floating Button - Only show if NOT embedded */}
            {!embedded && (
                <button
                    className="agri-assistant-toggle"
                    onClick={toggleOpen}
                    title="Agri Assistant"
                >
                    {isOpen ? <IoClose size={28} /> : <IoChatbubbleEllipses size={28} />}
                    {!isOpen && <span className="notification-dot"></span>}
                </button>
            )}

            {/* Chat Window */}
            <div className="agri-assistant-window">
                <div className="agri-assistant-header">
                    <div className="header-info">
                        <div className="icon-wrapper">
                            <IoFlower size={24} />
                        </div>
                        <div>
                            <h3>Agri Assistant</h3>
                            <span className="online-status">Powered by AI</span>
                        </div>
                    </div>
                    <button onClick={handleClose} className="close-btn">
                        <IoClose size={20} />
                    </button>
                </div>

                <div className="agri-assistant-messages">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`message-bubble ${chat.role}`}>
                            <div className="bubble-content">
                                {chat.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-bubble model">
                            <div className="bubble-content typing">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form className="agri-assistant-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Ask about crops, MSP, pest control..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!message.trim() || isLoading}>
                        <IoSend size={20} />
                    </button>
                </form>

                <div className="agri-assistant-footer">
                    <IoInformationCircleOutline size={12} />
                    <span>AI-generated advice. Verify locally.</span>
                </div>
            </div>
        </div>
    );
};

export default AgriAssistant;
