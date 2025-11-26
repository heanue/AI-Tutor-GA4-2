
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { LessonFeed } from './components/LessonFeed';
import { PracticeLab } from './components/PracticeLab';
import { AiTutorView } from './components/AiTutorView';
import { Module, Message, Sender, LessonContent, ViewMode, SimulationRedirect } from './types';
import { sendMessageToGemini } from './services/gemini';

// Refined Module 1 Prompt to strictly follow the user request for VISUALS
const MOD_1_PROMPT = `
TEACHING PLAN for MODULE 1 (UA vs GA4):
Please follow this structure strictly.
1. High Level Intro: Explain what GA4 is, its purpose (problem solving), and why businesses use it.
2. Event-Based Deep Dive: Explain "everything is an event".
   - **MANDATORY**: Provide a 'practiceTask' asking "What is one interaction that GA4 tracks as an event?"
   - **MANDATORY**: Provide 'taskOptions' array with 3 examples (e.g., "Page View", "Session Timeout", "Bounce Rate") so the user can choose.
3. Comparison Visual: Create a **Comparison Table** (using the 'comparison' object with multiple rows).
   - Rows should include: "Measurement Model" (Session vs Event), "Session Restart" (Midnight/Campaign vs None), "Hit Types" (Various vs Events only).
4. Impact on Roles: Briefly explain what changes for marketers, PMs, and analysts.
5. QUIZ SEQUENCE (5 QUESTIONS):
   - After the explanation is done, start the quiz.
   - PRESENT QUESTIONS ONE BY ONE.
   - **CRITICAL**: For every question, you MUST return a 'quiz' JSON object with 'options' and 'correctAnswerIndex'.
   - Wait for the user to answer correctly before generating the next 'quiz' object.
`;

const MOD_3_PROMPT = `
TEACHING PLAN for MODULE 3 (Interface Overview):
Follow this sequence strictly. Teach one section at a time.

1. **Introduction & Home**: Explain that GA4 Home is the landing page with AI insights.
   - **ACTION**: Include a 'simulationRedirect' object: {"page": "home", "message": "Check the 'Event count' in the main card tabs."}
   - **TASK**: Ask the user: "Open the Simulator. What is the total Event Count shown on the Home dashboard?"

2. **Reports Workspace**: Explain where standard aggregated data lives.
   - **ACTION**: Include a 'simulationRedirect' object: {"page": "reports", "subPage": "snapshot", "message": "Find 'Users by Session default channel group' card."}
   - **TASK**: Ask: "In the Reports Snapshot, which channel group (blue bar) is driving the most traffic?"

3. **Realtime Report**: Explain monitoring activity as it happens (last 30 mins).
   - **ACTION**: Include a 'simulationRedirect' object: {"page": "reports", "subPage": "realtime", "message": "Check 'Users in last 30 minutes' count."}
   - **TASK**: Ask: "How many users are active right now in the simulation?"

4. **Explorations**: Brief intro to custom analysis.
   - **ACTION**: Include a 'simulationRedirect' object: {"page": "explore", "message": "Look at the template gallery options."}
   - **TASK**: Ask: "What is the specific tool used for path analysis called?" (Hint: Path exploration).

**RULE**: Do not output all steps at once. Wait for the user to confirm or answer before moving to the next interface section.
`;

const MODULES: Module[] = [
  { 
    id: 'm1', 
    title: 'UA vs GA4: The Shift', 
    description: 'Deep dive into events vs sessions.', 
    promptContext: MOD_1_PROMPT 
  },
  // Reordered: Setup & Config is now M2
  { 
    id: 'm2', 
    title: 'Setup & Config', 
    description: 'Tags, Data Streams, DebugView.', 
    promptContext: 'Module 2: How to set up GA4. Using Google Tag Manager basics. DebugView usage. Creating custom events.' 
  },
  { 
    id: 'm3', 
    title: 'Interface Overview', 
    description: 'Navigating reports & explorations.', 
    promptContext: MOD_3_PROMPT 
  },
  { 
    id: 'm4', 
    title: 'User Behavior', 
    description: 'Analyzing acquisition & engagement.', 
    promptContext: 'Module 4: User Acquisition vs Traffic Acquisition. Engagement Rate. Events per User.' 
  },
  // New Module 5: Reports & Advertising
  { 
    id: 'm5', 
    title: 'Reports & Advertising', 
    description: 'Deep dive into standard reports and advertising workspace.', 
    promptContext: 'Module 5: Detailed look at Life Cycle reports (Acquisition, Monetization, Retention). Advertising workspace attribution models.' 
  },
];

const INITIAL_GREETING: LessonContent = {
    microLessonText: "Welcome to the GA4 Micro-Tutor! I'm here to help you transition from Universal Analytics to the new event-based world of GA4. We'll learn by doing—short lessons followed by quick checks.",
    practiceTask: "Ready to start? Select 'UA vs GA4' from the menu or type 'Let's go'!",
    taskOptions: ["Let's go!", "What is GA4?"]
};

const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LESSON);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', sender: Sender.BOT, content: INITIAL_GREETING, timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold redirect context for simulator
  const [simulationContext, setSimulationContext] = useState<SimulationRedirect | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const activeModule = MODULES.find(m => m.id === activeModuleId);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
        id: Date.now().toString(),
        sender: Sender.USER,
        content: text,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        // Get context from active module
        const context = activeModule ? activeModule.promptContext : undefined;
        
        // Call API
        const responseContent = await sendMessageToGemini(messages.concat(userMsg), text, context);
        
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: Sender.BOT,
            content: responseContent,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, botMsg]);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
        // Keep focus
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendMessage = () => {
      const text = inputValue;
      setInputValue(''); // Clear immediately
      sendMessage(text);
  };

  const handleOptionSelect = (text: string) => {
      sendMessage(text);
  };

  const handleSimulatorRedirect = (redirect: SimulationRedirect) => {
      setSimulationContext(redirect);
      setViewMode(ViewMode.GA4_SIMULATOR);
  };

  const handleModuleSelect = async (id: string) => {
      setActiveModuleId(id);
      setViewMode(ViewMode.LESSON);
      const mod = MODULES.find(m => m.id === id);
      if (!mod) return;

      setIsLoading(true);
      // Trigger a "Start this module" prompt internally to the AI
      const startPrompt = `Start teaching ${mod.title}. Follow the plan: ${mod.promptContext}`;
      
      try {
        const responseContent = await sendMessageToGemini(messages, startPrompt, mod.promptContext);
         const botMsg: Message = {
            id: Date.now().toString(),
            sender: Sender.BOT,
            content: responseContent,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
      } finally {
        setIsLoading(false);
      }
  };

  // MAIN RENDER LOGIC
  const renderContent = () => {
      if (viewMode === ViewMode.AI_TUTOR) {
          return <AiTutorView />;
      }
      
      if (viewMode === ViewMode.GA4_SIMULATOR || viewMode === ViewMode.INTERVIEW_SIMULATOR) {
          return (
            <PracticeLab 
                mode={viewMode === ViewMode.GA4_SIMULATOR ? 'ga4' : 'interview'} 
                redirectContext={viewMode === ViewMode.GA4_SIMULATOR ? simulationContext : null}
            />
          );
      }

      // Default: Lesson View
      return (
          <>
            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
                <h2 className="font-bold text-slate-700">
                    {activeModule ? activeModule.title : 'GA4 Micro-Tutor'}
                </h2>
                <div className="flex items-center text-xs text-slate-500 space-x-4">
                    <span className="hidden md:inline flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Device
                    </span>
                    <button className="hover:text-slate-800" onClick={() => setMessages([{ id: 'init', sender: Sender.BOT, content: INITIAL_GREETING, timestamp: Date.now() }])}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Scrollable Feed */}
            <LessonFeed 
                messages={messages} 
                isLoading={isLoading} 
                onOptionSelect={handleOptionSelect}
                onSimulatorRedirect={handleSimulatorRedirect}
            />

            {/* Input Area (Sticky Bottom) */}
            <div className="bg-white p-4 border-t border-gray-100">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your answer or ask a question..."
                        disabled={isLoading}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 top-2 bg-orange-300 hover:bg-orange-400 text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Tutor • Powered by Gemini</span>
                    </div>
                </div>
            </div>
          </>
      );
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        modules={MODULES} 
        activeModuleId={activeModuleId} 
        onSelectModule={handleModuleSelect}
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 relative h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
