import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, X, Users, Clock,
  Paperclip, Smile, MoreVertical, Check, CheckCheck,
  Phone, Video, Info, Search, ArrowLeft,
  FileText, Image, File, Download, Eye
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isClient: boolean;
  read: boolean;
  type: 'text' | 'file' | 'system';
  attachment?: {
    name: string;
    size: string;
    type: string;
    url?: string;
    base64?: string;
  };
}

interface ChatCollaborationProps {
  projectName: string;
  clientMode?: boolean;
  onClose?: () => void;
}

const ChatCollaboration: React.FC<ChatCollaborationProps> = ({
  projectName,
  clientMode = false,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true); // Start with chat minimized
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we should send welcome message
  const [hasGreeted, setHasGreeted] = useState(false);

  // Load initial messages
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${projectName}`);
    let initialMessages: Message[] = [];

    if (savedMessages) {
      try {
        initialMessages = JSON.parse(savedMessages);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        // Reset to empty if corrupted
        localStorage.removeItem(`chat_${projectName}`);
        initialMessages = [];
      }
    }

    // If no messages exist, add system welcome message
    if (initialMessages.length === 0) {
      initialMessages = [{
        id: '1',
        sender: 'System',
        content: `Welcome to ${projectName} collaboration chat! Feel free to discuss project updates, share feedback, or ask questions.`,
        timestamp: new Date(),
        isClient: false,
        read: true,
        type: 'system'
      }];
      setMessages(initialMessages);
    }

    // Check if Dev Assistant has already greeted in this session
    const hasDevAssistantGreeting = initialMessages.some(m =>
      m.sender === 'Dev Assistant' &&
      m.content.includes('dedicated developer assistant')
    );

    // Always show welcome message if Dev Assistant hasn't greeted yet
    if (!hasDevAssistantGreeting && !hasGreeted) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          sender: 'Dev Assistant',
          content: 'Hi! I\'m your dedicated developer assistant for this project. Do you have any requirements or features you\'d like to discuss today?',
          timestamp: new Date(),
          isClient: false,
          read: false,
          type: 'text'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setHasGreeted(true);
      }, 1500);
    } else if (hasDevAssistantGreeting) {
      setHasGreeted(true);
    }
  }, [projectName]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${projectName}`, JSON.stringify(messages));
    }
  }, [messages, projectName]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update unread count
  useEffect(() => {
    const unread = messages.filter(m => !m.read && !m.isClient).length;
    setUnreadCount(unread);
  }, [messages]);

  // Send proactive messages based on inactivity
  useEffect(() => {
    const checkEngagement = () => {
      const lastUserMessage = messages
        .filter(m => m.isClient)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const lastAssistantMessage = messages
        .filter(m => m.sender === 'Dev Assistant')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const now = new Date().getTime();
      const timeSinceLastUser = lastUserMessage
        ? now - new Date(lastUserMessage.timestamp).getTime()
        : Infinity;
      const timeSinceLastAssistant = lastAssistantMessage
        ? now - new Date(lastAssistantMessage.timestamp).getTime()
        : Infinity;

      // Send follow-up after 2 minutes of inactivity
      if (timeSinceLastAssistant > 120000 && timeSinceLastUser > 120000 && messages.length > 2) {
        const followUpMessages = [
          'Is there anything specific you\'d like to discuss about the project?',
          'Feel free to ask about project progress, features, or any concerns you might have.',
          'I\'m here if you need any updates on the development status.',
          'Would you like me to provide a quick status update on the current milestones?'
        ];

        const randomMessage = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];

        const followUp: Message = {
          id: Date.now().toString(),
          sender: 'Dev Assistant',
          content: randomMessage,
          timestamp: new Date(),
          isClient: false,
          read: false,
          type: 'text'
        };
        setMessages(prev => [...prev, followUp]);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkEngagement, 30000);
    return () => clearInterval(interval);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Use Claude API for intelligent responses
  const generateAssistantResponse = async (userMessage: string): Promise<string> => {
    try {
      // Check if we're on production or Vercel
      const isProduction = window.location.hostname === 'pulseofproject.com' ||
                          window.location.hostname.includes('vercel.app');

      console.log('Dev Assistant: Generating response for:', userMessage);
      console.log('Dev Assistant: Hostname:', window.location.hostname);

      // Try API - production uses serverless function, development uses local server
      const apiUrl = isProduction
        ? '/api/chat/message'
        : 'http://localhost:3002/api/chat/message';

      console.log('Dev Assistant: Calling Claude API at:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          projectName: projectName,
          context: 'PulseOfProject client chat - Junior Developer assistant'
        })
      });

      console.log('Dev Assistant: API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dev Assistant: Response source:', data.source || 'unknown');
        console.log('Dev Assistant: Response received:', data.response?.substring(0, 50) + '...');
        return data.response;
      } else {
        console.error('Dev Assistant: API error:', response.status);
        const errorText = await response.text();
        console.error('Dev Assistant: Error details:', errorText);
      }
    } catch (error) {
      console.error('Dev Assistant: Error, using fallback:', error);
    }

    // Fallback to local intelligent responses (Junior Developer personality)
    const lowerMessage = userMessage.toLowerCase();

    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|hey|howdy|greetings|yo|sup)/)) {
      return 'Hey there! 👋 I\'m Alex, your Dev Assistant. I\'m here to help with the project. What can I do for you today?';
    }

    // Check for identity questions
    if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
      return 'I\'m Alex, a Junior Developer assistant at Bettroi working on your NeuroSense360 & PulseOfProject for Limitless Brain Lab! I help track progress, answer questions, and collect feedback. Bettroi manages 45+ projects, and yours is a high priority one. Think of me as your dedicated dev team member who\'s always here to help. 🚀';
    }

    // Random gibberish or testing
    if (lowerMessage.match(/^[a-z]{5,}$/) || lowerMessage.includes('test')) {
      return 'Hey! Looks like you\'re testing the chat. Everything\'s working great! Feel free to ask me about the project status, features, or anything else you need help with.';
    }

    // Check for common requests and respond appropriately
    if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return 'Great question! The NeuroSense360 & PulseOfProject is at 65% completion - we\'re making solid progress! We\'re currently in week 8 of our 12-week timeline, focusing on core features. At Bettroi, we\'re committed to delivering quality results for Limitless Brain Lab. The team is really excited about what we\'re building. Want me to break down what we\'ve completed so far?';
    }

    if (lowerMessage.includes('timeline') || lowerMessage.includes('deadline')) {
      return 'We\'re right on track! The next milestone is coming up in 7 days, and we\'re on schedule to complete everything within our 12-week timeline. The team is working hard and we\'re confident we\'ll deliver on time. Would you like to see the detailed Gantt chart?';
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      return 'Oh no! Let me help you with that. I\'ll log this issue right away and get the team on it. Could you share a bit more detail about what\'s happening? Screenshots would be super helpful if you have any!';
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('add') || lowerMessage.includes('implement')) {
      return 'That\'s an awesome idea! I love it when clients suggest features - you guys always have great insights. Let me add this to our backlog and discuss it with the team. Can you tell me more about how you envision this working?';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I\'m here to help! You can ask me about:\n• Project status and progress\n• Timeline and deadlines\n• Feature requests\n• Bug reports\n• Technical questions\n\nWhat would you like to know about?';
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('good')) {
      return 'You\'re very welcome! It\'s my pleasure to help. Is there anything else you\'d like to discuss about the project? I\'m always here if you need anything!';
    }

    // Default response with more personality
    return `Thanks for reaching out! I've noted your message "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}". Let me think about this and get back to you with a proper response. Is there anything specific you'd like me to focus on?`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: clientMode ? 'Client' : 'Team',
        content: newMessage,
        timestamp: new Date(),
        isClient: clientMode,
        read: false,
        type: 'text'
      };

      setMessages([...messages, message]);
      const sentMessage = newMessage;
      setNewMessage('');

      // Dev Assistant auto-response for all messages (both client and team)
      // Always generate a response to demonstrate the assistant functionality
      setTimeout(async () => {
        setIsTyping(true);

        // Generate response using Claude API or fallback
        const responseContent = await generateAssistantResponse(sentMessage);

        setTimeout(() => {
          setIsTyping(false);
          const response: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'Dev Assistant',
            content: responseContent,
            timestamp: new Date(),
            isClient: false,
            read: false,
            type: 'text'
          };
          setMessages(prev => [...prev, response]);
        }, 1500);
      }, 500);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PDF or image
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      if (!isPDF && !isImage) {
        alert('Please upload only PDF or image files (JPG, PNG, GIF, etc.)');
        return;
      }

      // Create file reader to convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        const message: Message = {
          id: Date.now().toString(),
          sender: clientMode ? 'Client' : 'Team',
          content: `Shared ${isPDF ? 'a document' : 'an image'}: ${file.name}`,
          timestamp: new Date(),
          isClient: clientMode,
          read: false,
          type: 'file',
          attachment: {
            name: file.name,
            size: file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            base64: base64,
            url: URL.createObjectURL(file)
          }
        };
        setMessages([...messages, message]);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const markAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
  };

  const clearChatHistory = () => {
    localStorage.removeItem(`chat_${projectName}`);
    setMessages([{
      id: '1',
      sender: 'System',
      content: 'Chat history cleared. Starting fresh conversation.',
      timestamp: new Date(),
      isClient: false,
      read: true,
      type: 'system'
    }]);
    setHasGreeted(false);

    // Send welcome message after clearing
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        sender: 'Dev Assistant',
        content: 'Hi! I\'m your dedicated developer assistant for this project. Do you have any requirements or features you\'d like to discuss today?',
        timestamp: new Date(),
        isClient: false,
        read: false,
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setHasGreeted(true);
    }, 1000);
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const renderAttachment = (attachment: Message['attachment']) => {
    if (!attachment) return null;

    const isPDF = attachment.type === 'application/pdf';
    const isImage = attachment.type.startsWith('image/');

    if (isImage && attachment.base64) {
      return (
        <div className="mb-2">
          <img
            src={attachment.base64}
            alt={attachment.name}
            className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: '200px' }}
            onClick={() => window.open(attachment.url || attachment.base64, '_blank')}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg">
        {getFileIcon(attachment.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs opacity-80">{attachment.size}</p>
        </div>
        <div className="flex gap-1">
          {isPDF && attachment.url && (
            <button
              onClick={() => window.open(attachment.url, '_blank')}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="View PDF"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = attachment.base64 || attachment.url || '';
              link.download = attachment.name;
              link.click();
            }}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => {
            setIsMinimized(false);
            markAsRead();
          }}
          className="relative bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Project Chat</h3>
              <p className="text-xs opacity-90">{projectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={clearChatHistory}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1"
              title="Clear chat history and restart conversation"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="text-xs font-medium">Clear</span>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Active now</span>
          <span className="opacity-75">• 3 team members online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.isClient ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex ${message.isClient ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'system' ? (
                <div className="max-w-[80%] bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm text-center">
                  {message.content}
                </div>
              ) : (
                <div className={`max-w-[80%] ${message.isClient ? 'order-2' : ''}`}>
                  <div className="flex items-end gap-2">
                    {!message.isClient && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                        {message.sender === 'Dev Assistant' ? 'DA' : message.sender[0]}
                      </div>
                    )}
                    <div>
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.isClient
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}>
                        {message.type === 'file' && message.attachment &&
                          renderAttachment(message.attachment)
                        }
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.isClient && (
                          <span className="text-gray-400">
                            {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-500"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
              DA
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFileUpload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload PDF or Image (JPG, PNG, GIF)"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,application/pdf"
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatCollaboration;