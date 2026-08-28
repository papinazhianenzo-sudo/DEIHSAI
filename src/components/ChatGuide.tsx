import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2, Mic, MicOff } from 'lucide-react';
import { Mascot } from './Mascot';
import { ChatMessage, SoilClassificationResult } from '../types';
import { playChime, speakImmediate } from '../utils/audio';

interface ChatGuideProps {
  classification: SoilClassificationResult | null;
  moisture: number;
  temp: number;
  ph: number;
  selectedCrop: string;
  voiceEnabled: boolean;
  language: 'taglish' | 'english';
  onLanguageToggle: () => void;
  externalQuestionPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const ChatGuide: React.FC<ChatGuideProps> = ({
  classification,
  moisture,
  temp,
  ph,
  selectedCrop,
  voiceEnabled,
  language,
  onLanguageToggle,
  externalQuestionPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Kumusta! Ako si Eastee, ang iyong EastAi field assistant 🌱. Pwede kang magtanong kung paano isasagawa ang rekomendasyon — halimbawa "Paano mag-apply ng direktang sikat ng araw?", "Paano ihalo ang apog sa acidic na lupa?", o "Kailan mainam magdilig?"',
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle external triggers (e.g. from clicking "Paano gawin?" in Advisory panel)
  useEffect(() => {
    if (externalQuestionPrompt) {
      handleSend(externalQuestionPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalQuestionPrompt]);

  // Voice speech-to-text setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'taglish' ? 'fil-PH' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Generate dynamic suggestion prompts based on current soil parameters
  const generateSuggestions = () => {
    const suggestions: string[] = [];

    if (classification) {
      if (classification.moisture.level !== 'ok') {
        suggestions.push(`Paano gawin ang "${classification.moisture.actionText}" sa moisture?`);
      }
      if (classification.temp.level !== 'ok') {
        suggestions.push(`Paano i-apply ang "${classification.temp.actionText}" sa temperatura?`);
      }
      if (classification.ph.level !== 'ok') {
        suggestions.push(`Paano gawin ang "${classification.ph.actionText}" sa pH?`);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Ano ang mainam na pataba para sa kasalukuyang lupa?');
      suggestions.push('Paano maiiwasan ang acidity sa susunod na taniman?');
      suggestions.push('Gaano kalalim dapat pumasok ang patubig sa ugat?');
    }

    return suggestions.slice(0, 3);
  };

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      playChime([520, 680]);

      const sensorPayload = classification
        ? {
            moisture,
            moistureCond: classification.moisture.condition,
            moistureDo: classification.moisture.actionText,
            temp,
            tempCond: classification.temp.condition,
            tempDo: classification.temp.actionText,
            ph,
            phCond: classification.ph.condition,
            phDo: classification.ph.actionText,
            overall: classification.overall,
          }
        : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          sensorReading: sensorPayload,
          cropType: selectedCrop,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to contact field guide server');
      }

      const data = await response.json();
      const botReply = data.reply || data.fallback || 'Pasensya na, pakisubukan muli.';

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      playChime([780, 1040]);
      speakImmediate(botReply, voiceEnabled);
    } catch (err: any) {
      console.error('Chat guide error:', err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          'Maaaring may aberya sa koneksyon. Pakitingnan ang gabay sa itaas o subukan magtanong muli mamaya.',
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header controls & Language Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-[#6E7D6A] font-semibold">
          Grounded sa kasalukuyang sukat ng sensor at agrikulturang gabay.
        </p>
        <button
          onClick={onLanguageToggle}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#F4FAF0] text-[#32642B] border border-[#DCE8D5] shadow-2xs transition-colors cursor-pointer"
        >
          Wika: {language === 'taglish' ? '🇵🇭 Taglish' : '🌐 English'}
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {generateSuggestions().map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#E8F5E4] hover:bg-[#DCF0D8] text-[#32642B] border border-[#C8DBC0] transition-all cursor-pointer shadow-2xs text-left"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1 p-3.5 rounded-2xl bg-[#F9FBF8] border border-[#E2EAD8]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 items-end max-w-[90%] ${
              msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            {msg.role === 'assistant' ? (
              <Mascot className="w-8 h-8 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#4D8B43] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs">
                👤
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl text-[13.5px] leading-relaxed font-medium shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-[#4D8B43] text-white rounded-br-xs'
                  : 'bg-white border border-[#E2EAD8] text-[#2C3E2D] rounded-bl-xs whitespace-pre-wrap'
              }`}
            >
              <div>{msg.content}</div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <span
                  className={`text-[10px] font-semibold ${
                    msg.role === 'user' ? 'text-emerald-100' : 'text-[#8C9B88]'
                  }`}
                >
                  {msg.timestamp}
                </span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakImmediate(msg.content, voiceEnabled)}
                    className="text-[#6E7D6A] hover:text-[#4D8B43] transition-colors cursor-pointer p-1"
                    title="Basahin nang malakas / Speak aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-end self-start max-w-[85%]">
            <Mascot className="w-8 h-8 flex-shrink-0" isSensing={true} />
            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EAD8] text-xs font-bold text-[#6E7D6A] italic flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#D97706] animate-spin" />
              Nagiisip si Eastee ng pinakamagandang payo para sa iyong pananim...
            </div>
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      {/* Chat Input Row */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          id="chatInputField"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Magtanong dito, hal. Paano magbawas ng tubig sa basang lupa?..."
          className="flex-1 bg-white border border-[#DCE8D5] rounded-full px-4 py-2.5 text-[13.5px] font-semibold text-[#2C3E2D] placeholder:text-[#8C9B88] focus:outline-none focus:ring-2 focus:ring-[#4D8B43] shadow-2xs"
        />

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all cursor-pointer shadow-2xs ${
            isListening
              ? 'bg-[#E11D48] text-white border-[#BE123C] animate-pulse'
              : 'bg-white text-[#6E7D6A] hover:text-[#4D8B43] border-[#DCE8D5] hover:bg-[#F4FAF0]'
          }`}
          title={isListening ? 'Listening... Speak now' : 'Magsalita gamit ang boses (Voice input)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          id="chatSendBtn"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#4D8B43] hover:bg-[#3E7436] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

