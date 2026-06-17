import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function SymptomChecker({ patient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate personalized greeting
  useEffect(() => {
    if (patient && messages.length === 0) {
      let greeting = `Hi ${patient.name}! I am your AI Health Assistant. `;
      
      if (patient.prescriptions && patient.prescriptions.length > 0) {
        const meds = patient.prescriptions.map(p => p.tabletName).join(', ');
        greeting += `Just a friendly reminder to take your medications (${meds}) as prescribed today. `;
      }
      
      if (patient.nextVisitDate) {
        greeting += `Also, don't forget your next doctor's visit on ${new Date(patient.nextVisitDate).toLocaleDateString()}. `;
      } else {
        greeting += `I noticed you don't have a next visit scheduled. If you're feeling unwell, please schedule one soon. `;
      }

      greeting += `Please describe any symptoms you are experiencing, and I can provide some preliminary guidance.`;

      setMessages([{ role: 'ai', text: greeting }]);
    }
  }, [patient]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const response = await generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    
    // Add user message with image preview immediately
    setMessages(prev => [...prev, { role: 'user', type: 'image', imageUrl }]);
    setIsTyping(true);

    try {
      // Run real OCR on the image entirely inside the browser
      const result = await Tesseract.recognize(file, 'eng');
      const ocrText = result.data.text.trim();
      
      const response = await generatePillAnalysis(ocrText, true);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      console.error('OCR Error:', err);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I had trouble reading the text on that image. Please try a clearer photo." }]);
    } finally {
      setIsTyping(false);
      e.target.value = null; // Reset input
    }
  };

  const generatePillAnalysis = async (ocrText, isImageMode = true) => {
    const lowerText = ocrText.toLowerCase();
    
    // 1. Instant fallback for common drugs
    if (lowerText.includes('paracetamol') || lowerText.includes('paracitamol') || lowerText.includes('parasitamol') || lowerText.includes('dolo')) {
      return `🔍 **Analysis Complete:** This is **Paracetamol**. It is an analgesic used to treat mild-to-moderate pain and reduce fever. Please do not exceed 4000mg in 24 hours.`;
    }
    if (lowerText.includes('ibuprofen') || lowerText.includes('ibuprofin') || lowerText.includes('advil')) {
      return `🔍 **Analysis Complete:** This is **Ibuprofen**, a nonsteroidal anti-inflammatory drug (NSAID) used to reduce inflammation and relieve pain.`;
    }
    if (lowerText.includes('amoxicillin') || lowerText.includes('amoxisilin')) {
      return `🔍 **Analysis Complete:** This is **Amoxicillin**, an antibiotic. It is crucial to complete the entire course, even if you feel better.`;
    }

    // 2. Dynamic Universal Wikipedia Search
    // Clean text and extract words longer than 5 chars
    const words = ocrText.replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 5)
      .sort((a, b) => b.length - a.length); // Try longest words first

    const ignoreList = ["tablets", "pharma", "marketed", "capsules", "syrup", "dosage", "private", "limited", "manufactured", "company"];

    for (const word of words) {
      if (ignoreList.includes(word.toLowerCase())) continue;
      
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${word}`);
        if (res.ok) {
          const data = await res.json();
          // Verify the summary is actually about a drug or medical concept
          const summary = data.extract.toLowerCase();
          if (summary.includes('medication') || summary.includes('drug') || summary.includes('treatment') || summary.includes('used to') || summary.includes('medical') || summary.includes('vitamin') || summary.includes('supplement') || summary.includes('acid')) {
            return `🔍 **Information Found:** I looked up **"${word}"**.\n\n**Medical Uses:** ${data.extract}\n\n*Source: Wikipedia Medical Database. Please consult your doctor for exact dosage.*`;
          }
        }
      } catch (err) {
        // Ignore fetch errors and try the next word
      }
    }

    // 3. Ultimate Fallback if Wikipedia fails
    if (isImageMode) {
      if (ocrText.length > 3) {
        return `🔍 **Analysis Complete:** I scanned the image and read the following raw text:\n\n> *"${ocrText.replace(/\\n/g, ' ')}"* \n\n**Note:** Because the text might be blurry, curved, or sideways, I couldn't find a matching medical record for it on Wikipedia. \n\nPlease try taking a clear, close-up photo where the text is perfectly horizontal (left-to-right), or consult your doctor for exact usage.`;
      }
      return "🔍 **Analysis Complete:** I scanned the image but couldn't clearly read any text. Please try uploading a clearer, closer photo of the tablet name, making sure the text is horizontal.";
    }
    
    return null; // Return null if it's text mode and no drug was found
  };

  const generateAIResponse = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Emergencies
    if (lowerMessage.includes('chest') || lowerMessage.includes('heart') || lowerMessage.includes('breath') || lowerMessage.includes('breathing')) {
      return "⚠️ Chest pain or difficulty breathing can be signs of a serious medical emergency. Please call emergency services (like 911) or go to the nearest emergency room immediately.";
    }

    // Common ailments
    if (lowerMessage.includes('headache') || lowerMessage.includes('migraine')) {
      return "Headaches can be caused by dehydration, stress, eye strain, or lack of sleep. Try drinking a large glass of water, avoiding screens, and resting in a quiet, dark room. If the pain is severe or persists, please book an appointment.";
    }
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature') || lowerMessage.includes('hot')) {
      return "A fever is usually a sign that your body is fighting an infection. Please monitor your temperature regularly and stay hydrated. If your temperature exceeds 103°F (39.4°C) or lasts more than 3 days, it is highly recommended to schedule a doctor's visit.";
    }
    if (lowerMessage.includes('stomach') || lowerMessage.includes('nausea') || lowerMessage.includes('vomit') || lowerMessage.includes('belly')) {
      return "Stomach discomfort can be caused by something you ate, a virus, or stress. Stick to a bland diet (like bananas, rice, applesauce, and toast) and sip clear fluids. If you experience severe abdominal pain or cannot keep fluids down, please seek care.";
    }
    if (lowerMessage.includes('diarrhea') || lowerMessage.includes('bowel') || lowerMessage.includes('loose')) {
      return "For gastrointestinal issues like diarrhea, the most important thing is staying hydrated. Drink plenty of water or electrolyte solutions. Avoid dairy, caffeine, and greasy foods. If it lasts more than 2 days, consult your doctor.";
    }
    if (lowerMessage.includes('cough') || lowerMessage.includes('throat') || lowerMessage.includes('cold') || lowerMessage.includes('sneeze') || lowerMessage.includes('flu')) {
      return "For cold-like symptoms, warm tea with honey and throat lozenges can help soothe irritation. Make sure to get plenty of rest and monitor your temperature. If your cough produces thick mucus or you feel short of breath, contact your doctor right away.";
    }
    
    // Pain and Body
    if (lowerMessage.includes('back') || lowerMessage.includes('spine')) {
      return "Back pain is very common and often muscular. Try applying heat or ice to the affected area, do gentle stretches, and avoid heavy lifting. If the pain radiates down your leg or causes numbness, please schedule a visit.";
    }
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache')) {
      return "I'm sorry to hear you're in pain. Depending on the location, resting the area and applying ice or heat might help. Over-the-counter pain relievers can also provide temporary relief. Could you tell me more specifically where it hurts?";
    }
    if (lowerMessage.includes('dizzy') || lowerMessage.includes('vertigo') || lowerMessage.includes('faint') || lowerMessage.includes('lightheaded')) {
      return "Dizziness can be caused by dehydration, low blood sugar, or standing up too quickly. Please sit or lie down immediately to avoid falling. Drink some water or have a small snack. If it continues, consult your doctor.";
    }
    if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('itch')) {
      return "Skin rashes can result from allergies, irritants, or infections. Avoid scratching and apply a cool compress or over-the-counter hydrocortisone cream. If the rash spreads rapidly, becomes painful, or is accompanied by a fever, please see a doctor.";
    }
    if (lowerMessage.includes('eye') || lowerMessage.includes('vision') || lowerMessage.includes('blurry')) {
      return "Eye issues should be treated with care. If you have blurry vision, pain, or sudden changes in your sight, please contact an eye specialist or visit an urgent care center immediately. For simple eye strain, try the 20-20-20 rule (look away 20 feet for 20 seconds every 20 minutes).";
    }

    // Mental & Wellness
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      return "Feeling tired or having trouble sleeping can significantly impact your health. Try maintaining a consistent sleep schedule, avoiding screens an hour before bed, and reducing caffeine. If fatigue is interfering with your daily life, please discuss it with your doctor.";
    }
    if (lowerMessage.includes('anxiety') || lowerMessage.includes('stress') || lowerMessage.includes('panic')) {
      return "I understand that stress and anxiety can feel overwhelming. Try taking deep, slow breaths or practicing a short mindfulness exercise. Remember that mental health is just as important as physical health. Please reach out to your healthcare provider or a therapist for professional support.";
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi' || lowerMessage === 'hey') {
      return "Hello! I am here to help. Please tell me what symptoms you are experiencing today.";
    }

    // NEW: Text-based Wikipedia Dictionary Lookup
    // If they typed something that wasn't a symptom, see if it's a pill!
    const pillLookup = await generatePillAnalysis(message, false);
    if (pillLookup) {
      return pillLookup;
    }
    
    // Improved Fallback
    return "Thank you for sharing that. While I don't have a specific protocol for that exact symptom, I strongly recommend keeping a close eye on how you feel. Please log any relevant vitals in your dashboard. If your symptoms are worsening or making you uncomfortable, the safest option is always to schedule an appointment with your doctor.";
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group flex items-center gap-3"
      >
        <MessageSquare className="w-5 h-5 group-hover:animate-pulse" />
        <span className="font-semibold tracking-wide">Ask AI / Search Pill</span>
        {/* Notification dot */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">HealthTrack AI</h3>
            <p className="text-xs text-white/80">Symptom Checker & Triage</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-sm overflow-hidden ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none text-slate-700'}`}>
              {msg.type === 'image' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs opacity-90 font-medium mb-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Image Uploaded
                  </div>
                  <img src={msg.imageUrl} alt="Uploaded Pill" className="rounded-xl max-w-full h-auto border border-white/20" />
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 flex-row">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary/10 text-secondary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          {/* Camera Button */}
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isTyping}
            title="Identify a Pill"
            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question or type a pill name..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow min-w-0"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
