import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Sparkles, MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX,
  Heart, Droplets, Utensils, Stethoscope, Moon, Bone, CheckCircle2,
  RefreshCw, ChevronRight, User, HelpCircle, Bot, Zap, Info, ShieldAlert,
  Footprints, Brain, Flame, Activity, ArrowRight, Eye, Volume1, Compass,
  Minimize2, Maximize2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ElderAIAssistant() {
  const { user } = useAuth();
  const { speechLangCode } = useLanguage();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMascotHovered, setIsMascotHovered] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  
  // User-Controlled AI Hover Guide Mode (Default: false so it never interferes automatically)
  const [aiGuideEnabled, setAiGuideEnabled] = useState(() => {
    return localStorage.getItem('sahayak_guide_mode') === 'true';
  });
  const [hoveredGuide, setHoveredGuide] = useState(null);
  const [autoSpeakHover, setAutoSpeakHover] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const elderName = user?.first_name || user?.name?.split(' ')[0] || 'Senior';

  const toggleAiGuide = (enabled) => {
    setAiGuideEnabled(enabled);
    localStorage.setItem('sahayak_guide_mode', String(enabled));
    if (!enabled) {
      setHoveredGuide(null);
      stopSpeech();
    }
  };

  // ── Global Context-Aware Hover Listener (ONLY active when user explicitly enables AI Guide Mode) ──
  useEffect(() => {
    if (!aiGuideEnabled) {
      setHoveredGuide(null);
      return;
    }

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Ignore hover inside the chat modal itself or mascot container
      if (target.closest('[role="dialog"]') || target.closest('.ai-assistant-mascot-container')) {
        return;
      }

      // Check for explicit data attributes
      const explicitEl = target.closest('[data-sahayak-title], [data-sahayak-tip]');
      if (explicitEl) {
        const title = explicitEl.getAttribute('data-sahayak-title') || 'Health Feature';
        const has = explicitEl.getAttribute('data-sahayak-has') || explicitEl.getAttribute('data-sahayak-tip');
        const action = explicitEl.getAttribute('data-sahayak-action') || 'Click to view or interact with this feature.';
        const badge = explicitEl.getAttribute('data-sahayak-badge') || 'HealthSpan';
        
        clearTimeout(hoverTimeoutRef.current);
        setHoveredGuide({ title, has, action, badge });
        return;
      }

      // Intelligent automated element and component detection
      const cardEl = target.closest('[data-feature], .glass-card-premium, article, section, [class*="rounded-3xl"], [class*="rounded-2xl"], form, table, input, select, textarea, button, a, [role="button"]');
      if (!cardEl) return;

      const text = (cardEl.textContent || '').trim().toLowerCase();
      const tagName = cardEl.tagName.toLowerCase();
      const type = (cardEl.getAttribute('type') || '').toLowerCase();
      const placeholder = (cardEl.getAttribute('placeholder') || '').toLowerCase();
      const ariaLabel = (cardEl.getAttribute('aria-label') || '').toLowerCase();

      let detected = null;

      // ── A. Top Hero: Daily Health Blessing & Motivation ──
      if (text.includes('daily health blessing') || text.includes('superfood') || text.includes('view full remedy')) {
        detected = {
          title: "☀️ Daily Health Blessing & Motivation",
          has: "Today's healing Ayurvedic superfood and vitality quote for senior wellness.",
          action: "Click to read preparation guidelines.",
          badge: "Daily Vitality"
        };
      }
      // ── B. Pending Health Actions Hub ──
      else if (text.includes("pending health actions") || (text.includes('not logged') && (text.includes('breakfast') || text.includes('lunch') || text.includes('dinner') || text.includes('sleep') || text.includes('walk')))) {
        detected = {
          title: "⚡ Pending Health Actions Hub",
          has: "Live checklist of unlogged meals, morning sleep, or evening steps.",
          action: "Tap [+ Log] or [Log Sleep / Walk] to record quickly.",
          badge: "Actions Needed"
        };
      }
      // ── C. Hydration & Water Intake Tracker ──
      else if (text.includes('water') && (text.includes('liters') || text.includes('glasses') || text.includes('+') || text.includes('-') || text.includes('target 2.6'))) {
        detected = {
          title: "💧 Daily Water Tracker (Target: 2.6L)",
          has: "Tracks your fluid intake and dehydration warning status.",
          action: "Tap [+] each time you drink a cup of warm water or herbal tea.",
          badge: "Hydration"
        };
      }
      // ── D. Blood Pressure & Sugar Vitals Card ──
      else if (text.includes('blood pressure') || text.includes('sugar') || text.includes('mmhg') || text.includes('mg/dl') || text.includes('log vitals')) {
        detected = {
          title: "🩺 Blood Pressure & Sugar Monitor",
          has: "Records of systolic/diastolic BP, pulse rate, and glucose levels.",
          action: "Click 'Log Vitals' to record a new reading with doctor feedback.",
          badge: "Vitals Check"
        };
      }
      // ── E. Today's Meals & Nutrition Logs ──
      else if (text.includes('logged meals') || text.includes('today\'s meals') || text.includes('calories') || text.includes('protein') || text.includes('voice log a meal')) {
        detected = {
          title: "🥗 Today's Logged Meals & Calories",
          has: "Shows breakfast, lunch, and dinner with calories and protein breakdown.",
          action: "Click '+ Log Meal' or speak your meal via microphone.",
          badge: "Nutrition Tracker"
        };
      }
      // ── F. Personalized Diet Plan Card ──
      else if (text.includes('diet plan') || text.includes('icmr') || text.includes('soft meals') || text.includes('regional cuisine')) {
        detected = {
          title: "📋 Geriatric Diet Plan & Nutrition",
          has: "Doctor-tailored soft-chew meals matching ICMR nutritional guidelines.",
          action: "Click 'View Full Diet Plan' to review recipes and timings.",
          badge: "Diet & Health"
        };
      }
      // ── G. Physical Mobility & Fall Risk Test (STEADI & TUG) ──
      else if (text.includes('physical mobility') || text.includes('fall risk') || text.includes('steadi') || text.includes('tug') || text.includes('chair stand') || text.includes('balance check')) {
        detected = {
          title: "🚶 Physical Mobility & Fall Screener",
          has: "CDC 3-question balance check, walking speed timer, and chair stands.",
          action: "Follow the interactive timers. Keep a chair nearby for safety.",
          badge: "Mobility & Fall Safety"
        };
      }
      // ── H. Cognitive & Brain Health Assessment (MMSE) ──
      else if (text.includes('cognitive') || text.includes('brain health') || text.includes('mmse') || text.includes('memory') || text.includes('puzzle')) {
        detected = {
          title: "🧠 Cognitive & Memory Health Activities",
          has: "Puzzles for orientation, grocery memory recall, and task sequencing.",
          action: "Tap through activities to receive memory retention tips.",
          badge: "Brain Health"
        };
      }
      // ── I. Activity & Sleep Tracker ──
      else if (text.includes('activity & sleep') || text.includes('walk & sleep') || text.includes('steps walked') || text.includes('sleep hours')) {
        detected = {
          title: "🌙 Sleep Routine & Step Tracker",
          has: "Records last night's restful sleep hours and daily walking steps.",
          action: "Log sleep in the morning and steps before going to bed.",
          badge: "Activity & Rest"
        };
      }
      // ── J. Fasting / Vrat Routine ──
      else if (text.includes('fasting') || text.includes('vrat') || text.includes('ekadashi')) {
        detected = {
          title: "🌾 Fasting & Religious Vrat Advisor",
          has: "Adjusts hydration and electrolyte schedules during religious fasts.",
          action: "Toggle switch if observing a fast today to update dietary rules.",
          badge: "Fasting Safety"
        };
      }
      // ── K. Voice Logger Mic ──
      else if (tagName === 'button' && (text.includes('voice') || text.includes('mic') || ariaLabel.includes('voice'))) {
        detected = {
          title: "🎙️ Voice Meal & Symptom Logger",
          has: "AI speech recognition that understands Indian foods naturally.",
          action: "Tap mic and speak what you ate to calculate nutrients.",
          badge: "Voice Assistant"
        };
      }
      // ── L. Emergency SOS Button ──
      else if (text.includes('sos') || text.includes('emergency') || ariaLabel.includes('emergency')) {
        detected = {
          title: "🚨 Emergency SOS Alert",
          has: "Direct emergency broadcast to family caregivers and doctor contacts.",
          action: "Tap in an emergency to dispatch a high-priority distress alert.",
          badge: "Emergency Safety"
        };
      }
      // ── M. Form Inputs (Login, Profile, Password, Email) ──
      else if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        if (type === 'email' || placeholder.includes('email')) {
          detected = {
            title: "✉️ Email Address Field",
            has: "Account identification for sign-in and report sharing.",
            action: "Type your registered email address here.",
            badge: "Account Input"
          };
        } else if (type === 'password' || placeholder.includes('password')) {
          detected = {
            title: "🔒 Secret Password Field",
            has: "Protects your health account and medical records.",
            action: "Enter your secure account password here.",
            badge: "Security Input"
          };
        } else if (placeholder.includes('phone') || placeholder.includes('mobile')) {
          detected = {
            title: "📱 Mobile Phone Number Field",
            has: "Receives OTP login verification and SMS caregiver alerts.",
            action: "Type your 10-digit mobile number here.",
            badge: "Contact Input"
          };
        }
      }

      if (detected) {
        clearTimeout(hoverTimeoutRef.current);
        setHoveredGuide(detected);
        if (autoSpeakHover) {
          speakText(`${detected.title}. ${detected.has} ${detected.action}`);
        }
      }
    };

    const handleMouseLeaveGlobal = () => {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredGuide(null);
      }, 2500);
    };

    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveGlobal);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveGlobal);
      clearTimeout(hoverTimeoutRef.current);
    };
  }, [aiGuideEnabled, autoSpeakHover]);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Namaste ${elderName} ji! 🙏 I am Sahayak, your 24/7 AI Health Companion. Ask me any health, diet, or nutrition question, or toggle "AI Guide Mode" anytime for live section explanations!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeech();

    const cleanText = text.replace(/[*_~#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; // elder-friendly gentle pace
    utterance.pitch = 1.0;
    utterance.lang = speechLangCode || 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendMessage = async (customQuery = null) => {
    const query = (customQuery || inputText).trim();
    if (!query || loadingReply) return;

    stopSpeech();
    setInputText('');

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoadingReply(true);

    try {
      const savedProfile = JSON.parse(localStorage.getItem('elder_profile') || '{}');
      const res = await api.post('/api/elder-assistant', {
        message: query,
        elder_name: elderName,
        conditions: savedProfile.conditions || ['Diabetes', 'Digestion'],
        chewability: savedProfile.chewability || 'Soft Meals',
        current_page: location.pathname
      });

      const replyText = res.data?.reply || `For good vitality, stay hydrated and enjoy balanced, gentle meals. Let me know if you need specific advice! ☀️`;
      
      const aiMsg = {
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (isListening || customQuery) {
        speakText(replyText);
      }
    } catch (err) {
      const fallbackMsg = {
        sender: 'assistant',
        text: `Namaste ${elderName} ji! For best vitality, continue your light walks, drink warm water in gentle sips, and enjoy wholesome fiber-rich meals.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoadingReply(false);
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const QUICK_QUESTIONS = isAuthPage ? [
    { label: '❓ How to Log In?', query: 'How do I log in to my account if I forgot my password or need help?' },
    { label: '📝 How to Register?', query: 'How do I create a new senior elder account on HealthSpan?' },
    { label: '👥 What is Caregiver Access?', query: 'Can my daughter or son monitor my health through their caregiver portal?' },
    { label: '📱 Mobile OTP Login', query: 'How do I log in using my 10-digit mobile phone number?' }
  ] : [
    { label: '💧 My Water Today', query: 'How is my water intake today and when should I drink next?' },
    { label: '🥣 Dinner Suggestions', query: 'What is a soft and healthy dinner for my digestion tonight?' },
    { label: '🩺 Explain My Vitals', query: 'Explain my blood pressure and sugar readings today.' },
    { label: '🦴 Relieve Joint Pain', query: 'What natural home food or gentle habit helps relieve my joint stiffness?' },
    { label: '🌙 Better Sleep Tips', query: 'What can I do before bedtime to get deep restful sleep?' }
  ];

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = speechLangCode || 'en-IN';

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  return (
    <>
      {/* ── 1. NON-BLOCKING TOP SMART GUIDANCE TICKER (ONLY ACTIVE WHEN USER TURNS ON AI GUIDE) ── */}
      {aiGuideEnabled && hoveredGuide && !isOpen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9995] w-[94%] max-w-2xl pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200 font-['Outfit']">
          <div className="p-3 px-4 rounded-2xl bg-slate-950/90 dark:bg-slate-900/95 text-white shadow-2xl border border-teal-400/40 backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                <Compass className="w-4 h-4 animate-spin-slow text-amber-300" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-950/80 px-1.5 py-0.5 rounded">
                    {hoveredGuide.badge}
                  </span>
                  <h4 className="text-xs font-black text-white truncate">
                    {hoveredGuide.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-200 truncate mt-0.5">
                  <strong className="text-teal-200">Has:</strong> {hoveredGuide.has} <span className="text-emerald-300 mx-1">•</span> <strong className="text-emerald-300">Action:</strong> {hoveredGuide.action}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => speakText(`${hoveredGuide.title}. What this has: ${hoveredGuide.has}. What to do: ${hoveredGuide.action}`)}
                title="Hear audio explanation"
                className="p-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-white transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setHoveredGuide(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. COMPACT, NON-INTERFERING FLOATING CORNER MASCOT BUTTON ── */}
      <div className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end pointer-events-auto font-['Outfit'] select-none ai-assistant-mascot-container">
        
        {/* Subtle Greeting Bubble on Mascot Hover Only (Does NOT cover cards) */}
        {!isOpen && isMascotHovered && !hoveredGuide && (
          <div
            className="mb-2 max-w-xs px-3.5 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/90 text-white text-xs font-bold shadow-xl border border-teal-400/30 backdrop-blur-md animate-in fade-in zoom-in-95"
            style={{ borderRadius: '18px 18px 4px 18px' }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-teal-300">
                Sahayak AI Health Companion
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAiGuide(!aiGuideEnabled);
                }}
                className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all cursor-pointer ${
                  aiGuideEnabled ? 'bg-teal-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {aiGuideEnabled ? '🧭 Hover Guide: ON' : '🧭 Hover Guide: OFF'}
              </button>
            </div>
            <p className="text-[11px] text-slate-200 font-medium leading-tight">
              Click mascot to chat about diet & health, or turn on Hover Guide for page tips!
            </p>
          </div>
        )}

        {/* Mascot Avatar Button with Minimizer */}
        <div className="relative group flex items-center gap-2">
          {/* AI Guide Quick Toggle Pill attached next to Mascot */}
          <button
            type="button"
            onClick={() => toggleAiGuide(!aiGuideEnabled)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
              aiGuideEnabled
                ? 'bg-teal-600 text-white border-teal-400 shadow-teal-600/30 scale-105'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-white'
            }`}
            title="Toggle Live Hover Guidance across portal"
          >
            <Compass className={`w-3.5 h-3.5 ${aiGuideEnabled ? 'animate-spin-slow text-amber-300' : 'text-slate-400'}`} />
            <span>{aiGuideEnabled ? 'AI Guide: ON' : 'AI Guide'}</span>
          </button>

          {/* Avatar Icon Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (isOpen) stopSpeech();
            }}
            onMouseEnter={() => setIsMascotHovered(true)}
            onMouseLeave={() => setIsMascotHovered(false)}
            aria-label="Open AI Health Assistant"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-slate-900 p-1 shadow-xl shadow-teal-700/30 hover:shadow-teal-600/60 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border-2 border-teal-500/80 dark:border-teal-400 overflow-hidden"
          >
            <img
              src="/sahayak_avatar.jpg"
              alt="Sahayak AI Health Mascot"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xl font-black shadow-inner">
                    🤖
                  </div>
                `;
              }}
            />
          </button>

          {/* Living Speaking Indicator when Audio plays */}
          {isSpeaking && (
            <span className="absolute -top-2 right-0 px-2 py-0.5 rounded-full bg-teal-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg animate-bounce">
              <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
            </span>
          )}
        </div>
      </div>

      {/* ── 3. INTERACTIVE CHAT MODAL / COMPANION DRAWER (React Portal) ── */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 font-['Outfit'] animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full sm:w-[440px] h-[92vh] sm:h-[630px] bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300"
          >
            {/* Top Teal Ribbon Accent */}
            <div className="h-2.5 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-[#006b5f] shrink-0" />

            {/* Chat Header with Mascot */}
            <div className="p-4 flex items-center justify-between border-b border-teal-100 dark:border-slate-800 bg-teal-50/60 dark:bg-slate-900/90 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-md shadow-teal-600/20 shrink-0 bg-white">
                  <img src="/sahayak_avatar.jpg" alt="Sahayak" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                      HealthSpan Sahayak
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      Active AI Co-Pilot
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Senior Companion & Guide • {elderName} ji
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    title="Stop audio readout"
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all animate-pulse cursor-pointer"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setIsOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick 1-Tap Senior Prompts */}
            <div className="px-4 py-2 bg-teal-50/40 dark:bg-teal-950/20 border-b border-teal-100/50 dark:border-teal-900/30 overflow-x-auto scrollbar-none shrink-0">
              <div className="flex items-center gap-1.5 min-w-max">
                <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Suggestions:
                </span>
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.query)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all cursor-pointer shadow-2xs"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[9px] opacity-70 font-bold">
                      <span>{m.time}</span>
                      {m.sender === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => speakText(m.text)}
                          title="Listen to response"
                          className="hover:text-teal-400 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" /> Speak
                        </button>
                      )}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loadingReply && (
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl w-fit border border-teal-200 dark:border-teal-900/50 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>Sahayak is thinking...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Stop listening' : 'Speak to Sahayak'}
                  className={`p-3 rounded-2xl transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                      : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  placeholder={isListening ? 'Listening to you speak...' : `Ask Sahayak anything in any language...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || loadingReply}
                  className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white transition-all cursor-pointer shrink-0 shadow-md shadow-teal-600/20 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
