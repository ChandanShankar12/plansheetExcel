'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingModalProps {
  isFloating?: boolean;
}

export function FloatingModal({ isFloating = false }: FloatingModalProps) {
  const [position, setPosition] = useState({ x: 20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set initial position after component mounts
    setPosition({ x: 20, y: window.innerHeight - 500 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFloating) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
      const currentMessage = inputMessage;
      setInputMessage('');

      const response = await axios.post('/api/chat', { 
        message: currentMessage 
      });
      
      if (response.data.error) {
        const errorMessage = response.data.error.includes('ModuleNotFoundError') 
          ? 'Server configuration error. Please contact support.'
          : response.data.error;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${errorMessage}` 
        }]);
      } else if (response.data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.response 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Received an invalid response from the server.' 
        }]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Failed to connect to the AI model';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const modalStyles = isFloating
    ? ({
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
      } as const)
    : {};

  return (
    <div
      style={modalStyles}
      className={`
        flex flex-col items-center justify-between
        backdrop-blur-ls rounded-lg bg-[#F5F5F5] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border-[1px] border-[#000000] border-opacity-10
        ${isFloating ? 'w-[524px] h-[500px]' : 'w-full'}
      `}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-3 border-b">
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-[12px]">
            <Image
              src="/Icons/icon_add_files.svg"
              alt="AI Assistant"
              width={16}
              height={16}
            />
            <span className="text-sm text-gray-700">AI Assistant</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              Start a conversation with the AI...
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
