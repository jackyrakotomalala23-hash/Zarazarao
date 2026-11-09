import React, { useEffect, useRef, useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  RefreshCw,
  HelpCircle,
  ChevronRight,
  Search,
  BookOpen,
  Award,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { 
  ZARABOT_KNOWLEDGE_BASE, 
  findBestKnowledgeMatch, 
  KnowledgeItem 
} from '@/services/zaraBotKnowledge';
import { useTranslation } from '@/contexts/TranslationContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  source?: 'knowledge_base' | 'gemini_maps';
  timestamp: string;
}

export const ZaraBotChatbot: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('bot.greeting', "Manao ahoana ! Je suis ZaraBot, votre conseiller Fihavanana sur Zarazarao Madagascar.\n\nJe peux vous renseigner sur les dons gratuits, l'esprit d'entraide Fihavanana et les quartiers (fokontanys).\n\nComment puis-je vous aider aujourd'hui ?"),
      source: 'knowledge_base',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const categories = Array.from(new Set(ZARABOT_KNOWLEDGE_BASE.map(k => k.category)));

  const filteredKnowledge = ZARABOT_KNOWLEDGE_BASE.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setActiveTab('chat');

    // 1. Check local knowledge base first for instant authoritative match
    const kbMatch = findBestKnowledgeMatch(userText);
    if (kbMatch && kbMatch.score >= 50) {
      setLoading(true);
      setTimeout(() => {
        const botReply: ChatMessage = {
          id: `bot-kb-${Date.now()}`,
          role: 'model',
          text: kbMatch.item.answer,
          source: 'knowledge_base',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
        setLoading(false);
      }, 300);
      return;
    }

    // 2. Query Gemini 3.8 Flash via server-side /api/chat with Google Maps grounding
    setLoading(true);
    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur réseau serveur.');
      }

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || (kbMatch ? kbMatch.item.answer : "Sur Zarazarao, chaque don est 100% gratuit !"),
        source: 'gemini_maps',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.warn('Chat API error, fallback to knowledge base search:', err);
      const fallbackMatch = findBestKnowledgeMatch(userText);
      const fallbackText = fallbackMatch 
        ? fallbackMatch.item.answer 
        : "Sur Zarazarao, chaque don est 100% gratuit ! Vous pouvez chercher des dons par quartier (fokontany), discuter avec le donateur en messagerie privée et convenir d'un rendez-vous bienveillant et sécurisé.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          role: 'model',
          text: fallbackText,
          source: 'knowledge_base',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKnowledgeQuestion = (item: KnowledgeItem) => {
    handleSendMessage(item.question);
  };

  const QUICK_PROMPTS = [
    t('bot.quickQ1', 'Comment publier un don ?'),
    t('bot.quickQ2', 'Comment récupérer un don ?'),
    t('bot.quickQ3', 'Règles de sécurité à Madagascar'),
  ];

  return (
    <div className="fixed bottom-16 right-2 sm:bottom-6 sm:right-6 z-50">
      {/* Floating Launcher Button (Hidden on mobile as mobile bottom nav has direct message button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden sm:flex p-3.5 bg-gradient-to-tr from-emerald-800 via-emerald-700 to-indigo-900 hover:from-emerald-700 hover:to-indigo-800 text-white rounded-full shadow-2xl hover:shadow-emerald-900/50 transition-all duration-300 active:scale-95 cursor-pointer border border-emerald-400/30 relative flex items-center justify-center group"
          aria-label="Ouvrir le chat ZaraBot IA"
          title="Ouvrir l'assistant IA ZaraBot"
        >
          <Sparkles className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-950 animate-pulse" />
        </button>
      )}

      {/* Interactive Chat Window (Reduced height on mobile to fit nicely) */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200/80 w-[calc(100vw-1rem)] sm:w-96 h-[410px] sm:h-[500px] max-h-[70vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header with Prominent Close Button */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-indigo-900 text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
                  <Bot className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-xs sm:text-sm tracking-tight">{t('bot.title', 'ZaraBot Madagascar')}</h3>
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-amber-400 text-emerald-950 px-1.5 py-0.5 rounded-md shadow-2xs">
                    IA Active
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200">
                  Assistant Solidaire Zarazarao
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'model',
                      text: t('bot.greeting', "Manao ahoana ! Comment puis-je vous aider dans votre démarche de don ou de recherche d'objet ?"),
                      source: 'knowledge_base',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Réinitialiser"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Highly Visible & Accessible Exit / Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/15 hover:bg-red-500/90 text-white rounded-xl transition-all cursor-pointer active:scale-90 flex items-center justify-center border border-white/20"
                aria-label="Fermer le chat"
                title="Fermer la fenêtre"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Chat vs Knowledge Base) */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 px-3 pt-2 gap-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-emerald-800 border-t border-x border-gray-200 -mb-[1px] shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion IA</span>
              {messages.length > 1 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {messages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl transition-colors cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-white text-emerald-800 border-t border-x border-gray-200 -mb-[1px] shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Base de connaissances ({ZARABOT_KNOWLEDGE_BASE.length})</span>
            </button>
          </div>

          {/* TAB 1: Real-time Chat Thread */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8faf7] text-xs">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-0.5 px-1 font-semibold">
                        <span>{isUser ? 'Vous' : 'ZaraBot'}</span>
                        {msg.source && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            {msg.source === 'knowledge_base' ? 'Base certifiée' : 'Google Maps & IA'}
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-[88%] px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-line shadow-2xs transition-all ${
                          isUser
                            ? 'bg-emerald-700 text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5 px-1">
                        {msg.timestamp}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2.5 text-gray-500 text-xs p-3 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs w-fit">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                    <span className="font-medium text-emerald-900">ZaraBot analyse votre demande...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fast Suggestion Chips */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-900 rounded-full text-[11px] font-semibold text-gray-600 shrink-0 transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('bot.placeholder', "Posez votre question (quartier, ville, don)...")}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: Categorized Knowledge Base Explorer */}
          {activeTab === 'knowledge' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
              <div className="p-3 bg-white border-b border-gray-200 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Toutes ({ZARABOT_KNOWLEDGE_BASE.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredKnowledge.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    Aucune question trouvée.
                  </div>
                ) : (
                  filteredKnowledge.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectKnowledgeQuestion(item)}
                      className="group bg-white p-3 rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                          {item.question}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
