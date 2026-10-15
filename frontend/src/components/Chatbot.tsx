'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, X, Send, Bot, User, Loader2, Sparkles, 
  ExternalLink, Heart, Compass, Award, Briefcase, Cpu, ArrowRight
} from 'lucide-react';
import { isOpportunitySaved, toggleOpportunitySave, subscribeToBookmarks } from '@/utils/bookmarkService';

interface OpportunityCardData {
  id: string;
  title: string;
  organization: string;
  category: string;
  mode: string;
  paymentType: string;
  badge?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  cards?: OpportunityCardData[];
}

const QUICK_CHIPS = [
  { label: '🚀 Top Hackathons', query: 'Show me the best upcoming student hackathons with cash prizes.' },
  { label: '💼 Paid Internships', query: 'Which companies are hiring interns with monthly stipends?' },
  { label: '🎓 Free Certifications', query: 'What free cloud and programming certifications can I earn?' },
  { label: '🖥️ GPU Workstations', query: 'Are there any free GPU computing workstations or cloud sandboxes?' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'matcher'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  
  // Skill matcher state
  const [skillsInput, setSkillsInput] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your StudentzCert AI Career Advisor. Ask me anything about hackathons, internships, or certifications, or switch to the **Skill Matcher** tab to match your profile!",
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToBookmarks(() => {
      // Re-render when bookmarks change
      setSavedIds(prev => [...prev]);
    });
    return unsubscribe;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Parse text into clean body and structured opportunity cards
  const parseBotResponse = (rawText: string): { cleanText: string; cards: OpportunityCardData[] } => {
    const cards: OpportunityCardData[] = [];
    const cardRegex = /\[OPPORTUNITY:\s*({.*?})\]/g;
    
    let match;
    while ((match = cardRegex.exec(rawText)) !== null) {
      try {
        const cardObj = JSON.parse(match[1]);
        cards.push(cardObj);
      } catch (e) {
        console.warn('Could not parse card JSON:', match[1]);
      }
    }

    const cleanText = rawText.replace(cardRegex, '').trim();
    return { cleanText, cards };
  };

  const handleSend = async (customQuery?: string, isSkillMatch: boolean = false) => {
    const textToSend = customQuery || (isSkillMatch ? skillsInput : inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customQuery && !isSkillMatch) setInputValue('');
    if (isSkillMatch) {
      setSkillsInput('');
      setActiveTab('chat');
    }
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.sender === 'bot' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          isSkillMatch,
          skillsText: isSkillMatch ? textToSend : undefined
        })
      });

      const data = await res.json();
      const rawReply = data.reply || 'Here are verified opportunities you can explore on the platform.';
      const { cleanText, cards } = parseBotResponse(rawReply);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText,
        sender: 'bot',
        cards
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had a momentary connection hiccup. Please try asking again!',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleCardBookmark = async (card: OpportunityCardData) => {
    const oppObj: any = {
      id: card.id,
      title: card.title,
      organization: card.organization,
      category: card.category,
      mode: card.mode,
      paymentType: card.paymentType,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      duration: 'Ongoing',
      certificateAvailable: true,
    };
    await toggleOpportunitySave(oppObj);
    setSavedIds(prev => prev.includes(card.id) ? prev.filter(x => x !== card.id) : [...prev, card.id]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center border border-white/20"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
            ✨ AI Career Matcher
          </span>
        </button>
      )}

      {/* Main Chat / Matcher Widget */}
      {isOpen && (
        <div className="bg-zinc-900 border border-zinc-700/80 w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-100px)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xl">
          
          {/* Header */}
          <div className="bg-zinc-800/90 p-3.5 px-4 flex items-center justify-between border-b border-zinc-700/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  StudentzCert AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-zinc-400 text-xs">Career Advisor & Matcher</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Advisor Chat
            </button>
            <button
              onClick={() => setActiveTab('matcher')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'matcher'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-indigo-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ✨ AI Skill Matcher
            </button>
          </div>

          {/* Tab 1: Regular Chat View */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/60 hide-scrollbar">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex-shrink-0 flex items-center justify-center mt-1">
                          <Bot className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                      
                      <div 
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
                            : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/70 rounded-tl-sm shadow-sm'
                        }`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {msg.text}
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex-shrink-0 flex items-center justify-center mt-1">
                          <User className="w-4 h-4 text-indigo-300" />
                        </div>
                      )}
                    </div>

                    {/* Interactive Embedded Opportunity Cards */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="mt-3 w-full space-y-2.5 pl-9">
                        {msg.cards.map((card, idx) => {
                          const isSaved = isOpportunitySaved(card.id);
                          return (
                            <div 
                              key={idx}
                              className="p-3 rounded-xl bg-zinc-800/95 border border-indigo-500/30 shadow-lg hover:border-indigo-500/60 transition-all flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  {card.category}
                                </span>
                                {card.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {card.badge}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-white font-bold text-xs line-clamp-1">{card.title}</h4>
                                <p className="text-zinc-400 text-[11px] line-clamp-1">{card.organization} • {card.mode}</p>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[11px] font-semibold text-zinc-300">
                                  {card.paymentType === 'FREE' ? 'Free' : card.paymentType}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCardBookmark(card)}
                                    className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors"
                                    title="Bookmark"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                                  </button>
                                  <Link
                                    href={`/explore/${card.id}`}
                                    className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    View <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start items-center">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-2 text-xs text-zinc-400">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      Analyzing opportunities...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-zinc-950/80 border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                {QUICK_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip.query)}
                    disabled={isLoading}
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors border border-zinc-700/60 disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-zinc-800 border-t border-zinc-700 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask for hackathons, internships, certificates..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white p-2.5 rounded-full transition-colors flex-shrink-0 flex items-center justify-center shadow-md"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Tab 2: AI Skill Matcher */}
          {activeTab === 'matcher' && (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between bg-zinc-900/80">
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                  <span className="font-bold text-white block mb-1">✨ AI Opportunity Matchmaker</span>
                  Paste your tech skills, preferred languages, college branch, or resume summary. Our AI will analyze our entire opportunity index and compute your top matching opportunities with match percentage scores!
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Your Skills & Interests
                  </label>
                  <textarea
                    rows={6}
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. 3rd year CSE student. Fluent in React, TypeScript, and basic Python. Looking for remote internships or hackathons with mentorship..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Quick skill tags */}
                <div className="flex flex-wrap gap-1.5">
                  {['React & Next.js', 'Python & AI', 'Cloud & AWS', 'Docker & DevOps', 'Beginner Friendly'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSkillsInput(prev => prev ? `${prev}, ${tag}` : tag)}
                      className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleSend(undefined, true)}
                  disabled={!skillsInput.trim() || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze & Match Opportunities
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
