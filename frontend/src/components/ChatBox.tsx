import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { detectAndExecuteGroqCommand } from '../utils/groq';
import { set } from 'date-fns';
import { detectLanguage } from '../utils/gtranslate';
import { DayPlan } from '../types';
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  language: 'EN' | 'VI';
  AICommand?: string | null;
  onAIActionComplete?: () => void;
  onAICommand?: (command: string, payload?: any) => void;
  city?: string;
  cityCoordinates?: { latitude: number; longitude: number };
  plan: { name: string; days: DayPlan[], city?: string; cityCoordinates?: { latitude: number; longitude: number } };
}

export function ChatBox({ language, AICommand, onAIActionComplete, onAICommand, city, cityCoordinates, plan }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        language === 'EN'
          ? 'Hello! I\'m your travel assistant. How can I help you plan your trip today?'
          : 'Xin chào! Tôi là trợ lý du lịch của bạn. Tôi có thể giúp gì cho chuyến đi của bạn hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Detect user input language
      const detectedLang = await detectLanguage(input);

      // Call GROQ command detection and execution
      const result = await detectAndExecuteGroqCommand(plan, input);

      // Send the result back to parent component
      if (onAICommand && result.command) {
        const { command, ...payload } = result;
        onAICommand(command, payload);
      }

      // Show AI response in the same language as user input
      let aiContent = result.response_en;
      if (detectedLang === 'vi') aiContent = result.response_vi;
      else if (detectedLang === 'en') aiContent = result.response_en;
      else aiContent = result.response_en || result.response_vi; // fallback

      if (aiContent) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

      setIsTyping(false);
    }
    catch (error) {
      console.error('Error detecting/executing GROQ command:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200" data-tutorial-card="chatbox">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004DB6] to-[#70C573] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {language === 'EN' ? 'AI Assistant' : 'Trợ lý AI'}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">
                {language === 'EN' ? 'Online' : 'Trực tuyến'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              {message.type === 'user' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"
                >
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={`rounded-2xl px-2 py-2 ${message.type === 'user'
                  ? 'text-gray-900'
                  : 'text-gray-900'
                  }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004DB6] to-[#70C573] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'EN'
                ? 'Ask me anything about your trip...'
                : 'Hỏi tôi bất cứ điều gì về chuyến đi...'
            }
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            className="h-[60px] w-[60px] bg-[#004DB6] hover:bg-[#003d8f]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}