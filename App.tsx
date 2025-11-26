
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
You must follow this EXACT state-machine sequence. 
Check the user's last message to determine which step to output.

**STATE 1: INTRO (Default Start)**
- IF user starts module, OUTPUT:
  - 'microLessonText': "Module 3: Exploring the GA4 Interface\n\nIn this module, we will go beyond just clicking buttons. You will learn the *logic* behind the interface design. GA4 is structured around the customer journey—from acquisition to retention—rather than just isolated sessions.\n\nWhat you will learn:\n› Home Page: AI-driven insights & personalization\n› Reports Snapshot: The Life Cycle collection\n› Realtime: Debugging & immediate feedback\n› Explorations: Advanced ad-hoc analysis"
  - 'practiceTask': "Ready to explore the interface?"
  - 'taskOptions': ["Let's go!"]

**STATE 2: HOME PAGE**
- IF user says "Let's go!" or "Let's go", OUTPUT:
  - 'microLessonText': "1. The Home Page: Your AI Command Center\n\nThe Home page is not just a static dashboard; it is dynamic. Google uses machine learning to surface 'Insights' and 'Recommendations' tailored to your specific data history.\n\nIt highlights:\n- **Key Metrics**: Users, Event Count, and Conversions at a glance.\n- **Recently Accessed**: Quickly jump back to reports you use often.\n- **Suggested Insights**: Automated anomaly detection (e.g., 'Spike in users from Japan').\n\nUse the Home page for a daily health check of your property before diving deep."
  - 'simulationRedirect': { "page": "home", "message": "Explore the Home dashboard metrics." }
  - 'practiceTask': "Open the Simulator to check the Home Dashboard. What is the total 'Event Count' displayed in the main card?"
  - 'taskOptions': ["68K", "2M", "146K"]

**STATE 3: REPORTS SNAPSHOT**
- IF user answers "2M" (or correctly identifies Event Count), OUTPUT:
  - 'microLessonText': "2. Reports Snapshot: The Life Cycle Collection\n\nNavigate to the 'Reports' workspace. Unlike the Home page, this is where structured analysis happens. The menu is divided into two main Collections:\n\n1. **Life Cycle**: Mirrors the user funnel (Acquisition -> Engagement -> Monetization -> Retention).\n2. **User**: Who your visitors are (Demographics -> Tech).\n\nThe 'Reports Snapshot' is the overview dashboard for all these reports. It gives you 'cheat sheet' cards for every stage of the funnel."
  - 'simulationRedirect': { "page": "reports", "subPage": "snapshot", "message": "Explore the Reports Snapshot cards." }
  - 'practiceTask': "Check the Simulator's Snapshot. Which channel group (blue bar) is currently driving the most traffic in the 'Users by Session default channel group' card?"
  - 'taskOptions': ["Direct", "Organic Search", "Paid Search"]

**STATE 4: REALTIME**
- IF user answers "Direct" (or correctly identifies channel), OUTPUT:
  - 'microLessonText': "3. Realtime Report: Immediate Validation\n\nThe Realtime report is unique because it shows data from the last 30 minutes (per minute). \n\n**Why use this?**\n- **Debugging**: Did you just launch a new campaign or tag? Check here to see if traffic hits immediately.\n- **Urgency**: Monitor flash sales or viral social posts as they happen.\n\nNote: Data here is not fully processed yet, so do not use it for historical reporting."
  - 'simulationRedirect': { "page": "reports", "subPage": "realtime", "message": "View the Realtime activity map and cards." }
  - 'practiceTask': "In the Simulator's Realtime view, look at the top card. How many 'Active Users' are on the site right now (last 30 min)?"
  - 'taskOptions': ["37", "42", "9"]

**STATE 5: EXPLORATIONS**
- IF user answers "42" (or correctly identifies users), OUTPUT:
  - 'microLessonText': "4. Explorations: Beyond Standard Reports\n\nStandard reports (like Acquisition) are 'aggregated'—they are pre-built and static. Sometimes, you need to answer complex questions like \"What exact path did users take from the Home page to the Cart?\"\n\nFor this, we use **Explorations**. This is a canvas for ad-hoc analysis where you can drag-and-drop segments, dimensions, and metrics to build custom visualizations like Funnels and Path analysis."
  - 'simulationRedirect': { "page": "explore", "message": "Check the available Exploration templates." }
  - 'practiceTask': "Which Exploration tool in the simulator is best for visualizing the specific steps (or tree graph) users take through your site?"
  - 'taskOptions': ["Free form", "Path exploration", "Funnel exploration"]
`;

const MODULES: Module[] = [
  { 
    id: 'm1', 
    title: 'UA vs GA4: The Shift', 
    description: 'Deep dive into events vs sessions.', 
    promptContext: MOD_1_PROMPT 
  },
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
                onBack={() => setViewMode(ViewMode.LESSON)}
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
