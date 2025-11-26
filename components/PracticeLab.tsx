
import React, { useState, useEffect } from 'react';
import { SimulationRedirect } from '../types';

// --- Types & Data for Interview Simulator ---

interface RoleData {
  id: string;
  title: string;
  description: string;
  whyGa4: string;
  questions: { q: string; a: string }[];
}

const INTERVIEW_ROLES: RoleData[] = [
  {
    id: 'digital-marketing',
    title: 'Digital Marketing Specialist',
    description: 'Focuses on executing marketing campaigns and analyzing their performance.',
    whyGa4: 'Uses GA4 to track campaign traffic, analyze channel performance (Social vs Organic vs Paid), and measure basic conversions.',
    questions: [
      { q: "How do you check which marketing channel is driving the most traffic?", a: "I would go to Reports > Acquisition > Traffic Acquisition and look at the 'Session default channel group' dimension sorted by Users or Sessions." },
      { q: "What is the difference between User Acquisition and Traffic Acquisition reports?", a: "User Acquisition focuses on the 'First user default channel group' (how they found us initially). Traffic Acquisition focuses on the 'Session default channel group' (where they came from for this specific session)." }
    ]
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing Manager',
    description: 'Responsible for paid acquisition efficiency and ROAS.',
    whyGa4: 'Relies on attribution models, conversion paths, and deep ecommerce analysis to optimize spend.',
    questions: [
      { q: "How would you analyze the ROAS of a Google Ads campaign in GA4?", a: "I'd link Google Ads to GA4, then check the Advertising workspace to see 'Return on ad spend' and 'Cost per conversion' across campaigns." },
      { q: "Explain 'Data-driven attribution' in GA4.", a: "Unlike last-click, it uses machine learning to assign credit for a conversion to every touchpoint in the user journey based on its actual impact." }
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Oversees product development and feature adoption.',
    whyGa4: 'Tracks feature usage, user retention, and funnels to understand how people interact with the product.',
    questions: [
      { q: "How do you track if users are using a specific new feature?", a: "I would set up a custom event (e.g., 'feature_clicked') and view the Event Count in Engagement reports or create a Funnel Exploration." },
      { q: "Which metric best indicates product stickiness?", a: "User Retention and Engagement Rate are key. I'd also look at 'DAU/MAU' ratios if available, or Cohort Explorations." }
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Deep dives into raw data, trends, and custom reporting.',
    whyGa4: 'Uses Explorations for ad-hoc analysis, BigQuery linking for raw data, and custom metrics.',
    questions: [
      { q: "When would you use an Exploration over a standard Report?", a: "Standard reports are aggregated and static. I use Explorations for ad-hoc queries, segment overlap, funnel visualization, and deeper drill-downs." },
      { q: "How does GA4 handle data sampling?", a: "Standard reports are unsampled. Explorations may be sampled if the data exceeds quota limits (10M events for free). I'd check the green shield icon." }
    ]
  },
  {
    id: 'growth-marketer',
    title: 'Growth Marketer',
    description: 'Focuses on rapid experimentation and full-funnel growth.',
    whyGa4: 'Looks at the entire lifecycle: Acquisition -> Activation (Events) -> Retention -> Revenue.',
    questions: [
      { q: "How do you identify drop-off points in the user journey?", a: "I would build a Funnel Exploration: Session Start -> View Item -> Add to Cart -> Purchase to see exactly where we lose users." },
      { q: "What is 'Engagement Rate' and why does it matter?", a: "It's the percentage of engaged sessions (lasted >10s, had a conversion, or 2+ pageviews). It replaces Bounce Rate as a better measure of quality traffic." }
    ]
  },
  {
    id: 'ecommerce-manager',
    title: 'E-commerce Manager',
    description: 'Manages online store sales and inventory performance.',
    whyGa4: 'Tracks specific items, view_item_list, add_to_cart, purchase revenue, and checkout behavior.',
    questions: [
      { q: "Where do you find product-level performance data?", a: "Reports > Monetization > E-commerce purchases. I can see Item Name, Items Added to Cart, and Item Revenue." },
      { q: "How do you track how many people abandon their cart?", a: "By comparing 'add_to_cart' events vs 'purchase' events in a Funnel Exploration." }
    ]
  },
  {
    id: 'seo-specialist',
    title: 'SEO Specialist',
    description: 'Focuses on organic search visibility and site performance.',
    whyGa4: 'Monitors Organic Search traffic, landing page engagement, and Google Search Console integration.',
    questions: [
      { q: "How do you isolate Organic Search traffic?", a: "In Traffic Acquisition, I'd change the primary dimension to 'Session default channel group' and filter/search for 'Organic Search'." },
      { q: "How do you check which landing pages rank best?", a: "Reports > Engagement > Landing page + query string. I'd add a filter for organic traffic to see which pages bring in SEO users." }
    ]
  },
  {
    id: 'content-strategist',
    title: 'Content Strategist',
    description: 'Creates and optimizes content for engagement.',
    whyGa4: 'Measures scroll depth, time on page, and content downloads.',
    questions: [
      { q: "How do you measure if people are actually reading your blog posts?", a: "I look at 'Scroll' events (enhanced measurement tracks 90% depth) and 'Average Engagement Time' rather than just pageviews." },
      { q: "Can you track file downloads?", a: "Yes, GA4 Enhanced Measurement automatically tracks 'file_download' events for common file types like PDFs." }
    ]
  },
  {
    id: 'ux-designer',
    title: 'UX Designer / Researcher',
    description: 'Improves user interface and experience.',
    whyGa4: 'Analyzes user paths, click events, and site search behavior to find friction points.',
    questions: [
      { q: "How do you see the path users take through the site?", a: "I use the Path Exploration tool in the Explore tab. It visualizes the tree graph of user flow from a starting point." },
      { q: "How do you track interaction with a specific button?", a: "I'd rely on 'click' events (outbound) or set up a custom event triggered by that button's ID/Class via Google Tag Manager." }
    ]
  },
  {
    id: 'implementation-specialist',
    title: 'Analytics Implementation Specialist',
    description: 'Sets up the tracking infrastructure (GTM + GA4).',
    whyGa4: 'Configures Data Streams, custom dimensions, debugging, and consent mode.',
    questions: [
      { q: "How do you debug if an event is firing correctly?", a: "I use the 'DebugView' in GA4 admin, combined with GTM Preview Mode to see events arriving in real-time." },
      { q: "What is the difference between a User Property and an Event Parameter?", a: "Event Parameters describe the action (e.g., video_title). User Properties describe the person (e.g., membership_level) and persist across sessions." }
    ]
  }
];

// --- Types for Simulator ---

type NavItem = 'home' | 'reports' | 'explore' | 'advertising' | 'admin';
type SubNavItem = 
  | 'snapshot' | 'realtime' 
  // Acquisition
  | 'acq_overview' | 'user_acq' | 'traffic_acq' | 'user_cohorts' | 'lead_acq' | 'non_google'
  // Engagement
  | 'eng_overview' | 'events' | 'conversions' | 'pages' | 'landing'
  // Others
  | 'monetization' | 'retention' | 'user_attr' | 'tech';

// --- MAIN COMPONENT ---

interface PracticeLabProps {
  mode: 'ga4' | 'interview';
  redirectContext?: SimulationRedirect | null;
  onBack: () => void;
}

export const PracticeLab: React.FC<PracticeLabProps> = ({ mode, redirectContext, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] text-slate-800 font-sans">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {mode === 'ga4' ? (
                <GA4Simulator initialContext={redirectContext} onBack={onBack} />
            ) : (
                <InterviewSimulator onBack={onBack} />
            )}
        </div>
    </div>
  );
};

// --- INTERVIEW SIMULATOR COMPONENT ---

const InterviewSimulator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  if (selectedRole) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-gray-50 animate-fade-in-up">
        <button 
            onClick={() => setSelectedRole(null)}
            className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
        >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Roles
        </button>

        <div className="max-w-3xl mx-auto">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                 <div className="flex items-start justify-between mb-4">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedRole.title}</h2>
                        <p className="text-slate-600">{selectedRole.description}</p>
                     </div>
                     <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Role Guide
                     </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <h3 className="text-sm font-bold text-slate-700 uppercase mb-1">Why they use GA4</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">{selectedRole.whyGa4}</p>
                 </div>
             </div>

             <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Interview Questions Simulator</h3>
             <div className="space-y-4">
                 {selectedRole.questions.map((q, idx) => (
                     <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                         <div className="p-6 border-b border-gray-100 bg-white">
                             <div className="flex items-center space-x-3 mb-2">
                                 <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">Q{idx + 1}</span>
                                 <h4 className="font-semibold text-slate-800">{q.q}</h4>
                             </div>
                         </div>
                         <div className="p-6 bg-slate-50/50">
                             <div className="flex items-start space-x-3">
                                <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 mb-1">Ideal Answer</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{q.a}</p>
                                </div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-50 relative">
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-slate-500 hover:text-orange-600 font-medium flex items-center transition-colors"
        >
             <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Lessons
        </button>

        <div className="max-w-6xl mx-auto mt-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Interview Simulator</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Select a role to practice scenario-based GA4 interview questions. Master the metrics that matter most to your career path.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {INTERVIEW_ROLES.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-left group flex flex-col h-full"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{role.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{role.description}</p>
                        <div className="text-xs font-semibold text-blue-600 flex items-center mt-auto">
                            Start Practice
                            <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};


// --- GA4 SIMULATOR COMPONENT ---

interface GA4SimulatorProps {
    initialContext?: SimulationRedirect | null;
    onBack: () => void;
}

const GA4Simulator: React.FC<GA4SimulatorProps> = ({ initialContext, onBack }) => {
  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [activeSubNav, setActiveSubNav] = useState<SubNavItem>('snapshot');
  
  // Collapse States
  const [lifecycleOpen, setLifecycleOpen] = useState(true);
  const [acquisitionOpen, setAcquisitionOpen] = useState(true);
  const [engagementOpen, setEngagementOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(false);

  // Home Chart Tab State
  const [homeChartTab, setHomeChartTab] = useState<'users' | 'event_count' | 'key_events'>('users');
  
  // Handle Initial Context Redirect
  useEffect(() => {
      if (initialContext) {
          if (initialContext.page) setActiveNav(initialContext.page as NavItem);
          if (initialContext.subPage) setActiveSubNav(initialContext.subPage as SubNavItem);
      }
  }, [initialContext]);

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] text-slate-800 font-sans relative">
      
      {/* Minimalist Return Overlay */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <button 
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg border border-slate-700 flex items-center space-x-3 transition-transform hover:scale-105"
          >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold">Simulator Active — Return to Lesson</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
          </button>
      </div>

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 h-[60px] flex items-center justify-between px-4 shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center space-x-4">
           {/* Logo Area */}
          <div className="flex items-center text-slate-700 cursor-pointer" onClick={() => setActiveNav('home')}>
             <svg className="w-6 h-6 text-orange-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /> 
                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity=".3"/>
             </svg>
             <span className="text-lg font-normal text-gray-600">Analytics</span>
             <span className="mx-4 text-gray-300">|</span>
             <div className="text-sm text-gray-500 hidden md:block">All accounts &gt; GA4 Micro-Tutor Demo</div>
          </div>
          
          {/* Search Bar */}
          <div className="bg-gray-100 hover:bg-white hover:shadow-md transition-all rounded-lg px-3 py-2 text-sm text-slate-600 w-64 md:w-96 flex items-center cursor-text border border-transparent hover:border-gray-200 hidden md:flex">
             <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
             <span className="text-gray-500">Try searching "how to create a custom event"</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-medium cursor-pointer">
               M
           </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Icon Rail */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
          <NavIcon icon="home" active={activeNav === 'home'} onClick={() => setActiveNav('home')} label="Home" />
          <NavIcon icon="reports" active={activeNav === 'reports'} onClick={() => setActiveNav('reports')} label="Reports" />
          <NavIcon icon="explore" active={activeNav === 'explore'} onClick={() => setActiveNav('explore')} label="Explore" />
          <NavIcon icon="advertising" active={activeNav === 'advertising'} onClick={() => setActiveNav('advertising')} label="Advertising" />
          <div className="flex-1"></div>
          <NavIcon icon="admin" active={activeNav === 'admin'} onClick={() => setActiveNav('admin')} label="Admin" />
        </div>

        {/* Secondary Navigation (Only for Reports) */}
        {activeNav === 'reports' && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block animate-fade-in flex-shrink-0">
            <div className="px-4 py-5">
              <h2 className="text-xl font-normal text-slate-800">Reports</h2>
            </div>
            
            <div className="space-y-1">
              <SubNavItemSingle label="Reports snapshot" active={activeSubNav === 'snapshot'} onClick={() => setActiveSubNav('snapshot')} icon="snapshot" />
              <SubNavItemSingle label="Realtime" active={activeSubNav === 'realtime'} onClick={() => setActiveSubNav('realtime')} icon="realtime" />
              
              <div className="mt-4 border-t border-gray-100 pt-4"></div>
              
              <SubNavGroup label="Life cycle" isOpen={lifecycleOpen} toggle={() => setLifecycleOpen(!lifecycleOpen)}>
                 {/* Acquisition Group */}
                 <SubNavTopic label="Acquisition" isOpen={acquisitionOpen} toggle={() => setAcquisitionOpen(!acquisitionOpen)}>
                    <SubNavItem label="Overview" active={activeSubNav === 'acq_overview'} onClick={() => setActiveSubNav('acq_overview')} />
                    <SubNavItem label="User acquisition" active={activeSubNav === 'user_acq'} onClick={() => setActiveSubNav('user_acq')} />
                    <SubNavItem label="Traffic acquisition" active={activeSubNav === 'traffic_acq'} onClick={() => setActiveSubNav('traffic_acq')} />
                    <SubNavItem label="User acquisition cohorts" active={activeSubNav === 'user_cohorts'} onClick={() => setActiveSubNav('user_cohorts')} />
                    <SubNavItem label="Lead acquisition" active={activeSubNav === 'lead_acq'} onClick={() => setActiveSubNav('lead_acq')} />
                    <SubNavItem label="Non-Google campaign" active={activeSubNav === 'non_google'} onClick={() => setActiveSubNav('non_google')} />
                 </SubNavTopic>

                 {/* Engagement Group */}
                 <SubNavTopic label="Engagement" isOpen={engagementOpen} toggle={() => setEngagementOpen(!engagementOpen)}>
                    <SubNavItem label="Overview" active={activeSubNav === 'eng_overview'} onClick={() => setActiveSubNav('eng_overview')} />
                    <SubNavItem label="Events" active={activeSubNav === 'events'} onClick={() => setActiveSubNav('events')} />
                    <SubNavItem label="Conversions: Event name" active={activeSubNav === 'conversions'} onClick={() => setActiveSubNav('conversions')} />
                    <SubNavItem label="Pages and screens" active={activeSubNav === 'pages'} onClick={() => setActiveSubNav('pages')} />
                    <SubNavItem label="Landing page" active={activeSubNav === 'landing'} onClick={() => setActiveSubNav('landing')} />
                 </SubNavTopic>

                 <SubNavItem label="Monetization" active={activeSubNav === 'monetization'} onClick={() => setActiveSubNav('monetization')} />
                 <SubNavItem label="Retention" active={activeSubNav === 'retention'} onClick={() => setActiveSubNav('retention')} />
              </SubNavGroup>

              <SubNavGroup label="User" isOpen={userOpen} toggle={() => setUserOpen(!userOpen)}>
                 <SubNavItem label="User attributes" active={activeSubNav === 'user_attr'} onClick={() => setActiveSubNav('user_attr')} />
                 <SubNavItem label="Tech" active={activeSubNav === 'tech'} onClick={() => setActiveSubNav('tech')} />
              </SubNavGroup>
            </div>
          </div>
        )}

        {/* MAIN CONTENT VIEWS */}
        <div className="flex-1 overflow-y-auto bg-[#f9f9f9] p-6 pb-24">
          
          {/* VIEW: HOME DASHBOARD */}
          {activeNav === 'home' && (
            <div className="max-w-[1200px] mx-auto animate-fade-in-up">
                <h1 className="text-2xl font-normal text-slate-800 mb-6">Home</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    {/* Main Chart Card (Takes 3 columns) */}
                    <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-0 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button 
                                onClick={() => setHomeChartTab('users')}
                                className={`flex-1 py-4 px-4 text-left transition-colors relative ${homeChartTab === 'users' ? 'bg-white' : 'bg-slate-50 hover:bg-white'}`}
                            >
                                <div className="flex items-center space-x-1 mb-1">
                                    <span className={`text-sm font-medium ${homeChartTab === 'users' ? 'text-blue-600' : 'text-slate-600'}`}>Active users</span>
                                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                                </div>
                                <div className="text-2xl font-normal text-slate-800">68K</div>
                                <div className="text-xs text-green-600 font-medium">↑ 15.7%</div>
                                {homeChartTab === 'users' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                            </button>
                            <div className="w-px bg-gray-200"></div>
                            <button 
                                onClick={() => setHomeChartTab('event_count')}
                                className={`flex-1 py-4 px-4 text-left transition-colors relative ${homeChartTab === 'event_count' ? 'bg-white' : 'bg-slate-50 hover:bg-white'}`}
                            >
                                <div className="flex items-center space-x-1 mb-1">
                                    <span className={`text-sm font-medium ${homeChartTab === 'event_count' ? 'text-blue-600' : 'text-slate-600'}`}>Event count</span>
                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                                </div>
                                <div className="text-2xl font-normal text-slate-800">2M</div>
                                <div className="text-xs text-green-600 font-medium">↑ 35.1%</div>
                                {homeChartTab === 'event_count' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                            </button>
                            <div className="w-px bg-gray-200"></div>
                            <button 
                                onClick={() => setHomeChartTab('key_events')}
                                className={`flex-1 py-4 px-4 text-left transition-colors relative ${homeChartTab === 'key_events' ? 'bg-white' : 'bg-slate-50 hover:bg-white'}`}
                            >
                                <div className="flex items-center space-x-1 mb-1">
                                    <span className={`text-sm font-medium ${homeChartTab === 'key_events' ? 'text-blue-600' : 'text-slate-600'}`}>Key events</span>
                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                                </div>
                                <div className="text-2xl font-normal text-slate-800">146K</div>
                                <div className="text-xs text-green-600 font-medium">↑ 51.7%</div>
                                {homeChartTab === 'key_events' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                            </button>
                        </div>
                        {/* Chart Area */}
                        <div className="p-4 h-64 relative">
                             {/* CSS Mock Chart Line */}
                             <svg className="w-full h-full" preserveAspectRatio="none">
                                <polyline 
                                    fill="none" 
                                    stroke="#3b82f6" 
                                    strokeWidth="2" 
                                    points="0,200 100,100 200,180 300,120 400,140 500,60 600,160 700,180 800,100 900,110 1000,50 1100,100 1200,100"
                                />
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                </linearGradient>
                                <polygon 
                                    fill="url(#grad)" 
                                    points="0,200 100,100 200,180 300,120 400,140 500,60 600,160 700,180 800,100 900,110 1000,50 1100,100 1200,100 1200,250 0,250"
                                />
                             </svg>
                             <div className="absolute bottom-2 left-4 flex items-center text-xs text-gray-500">
                                <div className="w-3 h-0.5 bg-blue-500 mr-2"></div> Last 30 days
                                <div className="w-3 h-0.5 bg-blue-300 ml-4 mr-2 border-t border-dashed border-blue-500"></div> Previous period
                             </div>
                        </div>
                    </div>

                    {/* Realtime Card (Right) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                       <div>
                           <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                               Active users in last 30 minutes
                               <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           </div>
                           <div className="text-4xl font-normal text-slate-800 mt-2">37</div>
                           <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Active users per minute</div>
                       </div>
                       
                       <div className="flex items-end space-x-1 h-20 mt-4">
                           {[...Array(15)].map((_, i) => (
                               <div key={i} className="bg-blue-500 w-full hover:bg-blue-600 transition-colors rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                           ))}
                       </div>

                       <div className="mt-4 pt-4 border-t border-gray-100">
                           <div className="flex justify-between text-xs text-gray-600 py-1">
                               <span>India</span>
                               <span>9</span>
                           </div>
                           <div className="w-full bg-gray-100 h-1 rounded-full mb-2"><div className="w-[60%] h-1 bg-blue-500 rounded-full"></div></div>
                           
                           <div className="flex justify-between text-xs text-gray-600 py-1">
                               <span>United States</span>
                               <span>7</span>
                           </div>
                           <div className="w-full bg-gray-100 h-1 rounded-full"><div className="w-[45%] h-1 bg-blue-500 rounded-full"></div></div>
                       </div>

                       <div className="mt-4 text-center">
                           <button onClick={() => { setActiveNav('reports'); setActiveSubNav('realtime'); }} className="text-blue-600 text-xs font-medium hover:underline flex items-center justify-center">
                               View real time 
                               <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           </button>
                       </div>
                   </div>
                </div>

                {/* Suggestions Row */}
                <h3 className="text-lg font-normal text-slate-800 mb-4">Suggested for you</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Active Users by Country ID */}
                    <ReportCard title="Active users by Country">
                        <div className="relative h-32 w-full bg-[#f0f4f8] rounded mt-2 flex items-center justify-center">
                             <div className="absolute inset-0 opacity-20 bg-blue-100 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200 to-transparent"></div>
                             {/* Abstract Map */}
                             <svg className="w-full h-full text-blue-200" fill="currentColor" viewBox="0 0 100 60" preserveAspectRatio="none">
                                 <path d="M20,10 Q25,5 30,10 T40,20 T50,15 T70,25 T90,20 V50 H10 V20 z" />
                             </svg>
                             <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 rounded-full shadow-lg ring-2 ring-white"></div>
                             <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-lg ring-2 ring-white"></div>
                        </div>
                        <div className="mt-2 text-right">
                             <span className="text-xs text-blue-600 hover:underline cursor-pointer">View countries →</span>
                        </div>
                    </ReportCard>

                    {/* Sessions by Default Channel */}
                    <ReportCard title="Sessions by Session default channel group">
                         <div className="space-y-2 pt-2">
                             <BarChartRow label="Direct" value="8.2K" width="80%" />
                             <BarChartRow label="Organic Search" value="6.9K" width="65%" />
                             <BarChartRow label="Paid Search" value="2.3K" width="25%" />
                         </div>
                         <div className="mt-3 text-right">
                             <span className="text-xs text-blue-600 hover:underline cursor-pointer">View traffic acquisition →</span>
                        </div>
                    </ReportCard>

                    {/* Views by Page Title */}
                    <ReportCard title="Views by Page title and screen class">
                        <div className="space-y-2 pt-2">
                             <div className="flex justify-between text-xs py-1 border-b border-gray-50">
                                 <span className="text-gray-600">Home</span>
                                 <span className="text-gray-800 font-medium">18K</span>
                             </div>
                             <div className="flex justify-between text-xs py-1 border-b border-gray-50">
                                 <span className="text-gray-600">Google Merch Shop</span>
                                 <span className="text-gray-800 font-medium">10K</span>
                             </div>
                             <div className="flex justify-between text-xs py-1 border-b border-gray-50">
                                 <span className="text-gray-600">New | Google Merch...</span>
                                 <span className="text-gray-800 font-medium">8.3K</span>
                             </div>
                        </div>
                        <div className="mt-3 text-right">
                             <span className="text-xs text-blue-600 hover:underline cursor-pointer">View pages and screens →</span>
                        </div>
                    </ReportCard>
                </div>
            </div>
          )}

          {/* VIEW: REPORTS SNAPSHOT */}
          {activeNav === 'reports' && activeSubNav === 'snapshot' && (
             <div className="max-w-[1200px] mx-auto animate-fade-in-up">
                
                {/* Header Date & Edit */}
                <div className="flex justify-between items-center mb-6">
                   <div>
                       <h1 className="text-2xl font-normal text-slate-800">Reports snapshot</h1>
                       <p className="text-sm text-gray-500 mt-1">Comparisons: All Users</p>
                   </div>
                   <div className="flex items-center space-x-3 hidden md:flex">
                       <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center">
                           <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                           </svg>
                           Customise report
                       </button>
                       <div className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm flex items-center cursor-pointer hover:bg-gray-50">
                           <span className="mr-2">Last 28 days</span>
                           <span className="text-xs text-gray-400">Oct 26 - Nov 23</span>
                           <svg className="w-3 h-3 ml-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                       </div>
                   </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                   <div className="col-span-1 md:col-span-3 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                       <MetricCardBig title="Users" value="14K" change="12.5%" isPositive icon="users" />
                       <MetricCardBig title="New users" value="11.5K" change="8.2%" isPositive icon="new_users" />
                       <MetricCardBig title="Average engagement time" value="2m 05s" change="2.1%" isPositive={false} icon="time" />
                   </div>
                   {/* Realtime Card */}
                   <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-[150px] md:h-auto">
                       <div>
                           <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Users in last 30 minutes</div>
                           <div className="text-3xl font-medium text-slate-800">42</div>
                           <div className="text-xs text-gray-400 mt-1">Users per minute</div>
                       </div>
                       <div className="flex items-end space-x-[2px] h-12 mt-2">
                           {[...Array(20)].map((_, i) => (
                               <div key={i} className="bg-blue-500 w-1.5 rounded-t-sm" style={{ height: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.5 }}></div>
                           ))}
                       </div>
                       <div className="mt-2 text-center">
                           <button onClick={() => setActiveSubNav('realtime')} className="text-blue-600 text-xs font-medium hover:underline">View Realtime</button>
                       </div>
                   </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Insights / Channels */}
                    <ReportCard title="Users by Session default channel group">
                        <div className="space-y-4 pt-2">
                            <BarChartRow label="Organic Search" value="6.5K" width="80%" />
                            <BarChartRow label="Direct" value="3.2K" width="45%" />
                            <BarChartRow label="Referral" value="1.8K" width="25%" />
                            <BarChartRow label="Paid Search" value="900" width="15%" />
                            <BarChartRow label="Organic Social" value="600" width="10%" />
                        </div>
                         <div className="mt-4 flex justify-end">
                             <button className="text-blue-600 text-sm font-medium hover:underline">View user acquisition &rarr;</button>
                        </div>
                    </ReportCard>

                    {/* Users by Country (Map Placeholder) */}
                    <ReportCard title="Users by Country">
                        <div className="relative h-48 w-full bg-[#f0f4f8] rounded-lg mt-2 overflow-hidden flex items-center justify-center border border-blue-50">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-gray-100 to-gray-100"></div>
                            
                            <div className="absolute top-1/4 left-1/4 w-12 h-8 bg-blue-300 rounded-full opacity-60"></div>
                            <div className="absolute top-1/3 left-1/5 w-16 h-12 bg-blue-400 rounded-full opacity-60"></div>
                            <div className="absolute top-1/2 left-2/3 w-20 h-16 bg-blue-500 rounded-full opacity-60"></div>
                            
                            <div className="z-10 text-xs text-blue-800 font-medium bg-white/80 px-2 py-1 rounded shadow-sm">United States: 45%</div>
                        </div>
                        <div className="mt-4 flex justify-end">
                             <button className="text-blue-600 text-sm font-medium hover:underline">View demographic details &rarr;</button>
                        </div>
                    </ReportCard>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Activity over time */}
                    <ReportCard title="Users by Day">
                        <div className="h-48 flex items-end justify-between space-x-1 pt-4">
                             {[35, 42, 38, 55, 62, 58, 65, 70, 68, 85, 90, 88].map((val, idx) => (
                                 <div key={idx} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm relative group" style={{ height: `${val}%` }}>
                                     <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none">
                                         {val * 100} users
                                     </div>
                                 </div>
                             ))}
                        </div>
                         <div className="flex justify-between text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2">
                             <span>Oct 26</span>
                             <span>Nov 9</span>
                             <span>Nov 23</span>
                         </div>
                    </ReportCard>

                     <ReportCard title="Views by Page title and screen class">
                         <div className="space-y-3 pt-2">
                             <div className="flex justify-between text-xs text-gray-500 pb-1 border-b border-gray-50">
                                 <span>Page title</span>
                                 <span>Views</span>
                             </div>
                             <PageRow title="Home" views="18K" />
                             <PageRow title="Google Merch Shop" views="10K" />
                             <PageRow title="Basket" views="5.4K" />
                             <PageRow title="Men's / Unisex | Apparel" views="3.2K" />
                             <PageRow title="Sale | Google Merch Shop" views="2.1K" />
                         </div>
                          <div className="mt-4 flex justify-end">
                             <button className="text-blue-600 text-sm font-medium hover:underline">View pages and screens &rarr;</button>
                        </div>
                     </ReportCard>
                </div>
             </div>
          )}

          {/* VIEW: REALTIME */}
          {activeNav === 'reports' && activeSubNav === 'realtime' && (
             <div className="max-w-[1200px] mx-auto animate-fade-in-up">
                 <h1 className="text-2xl font-normal text-slate-800 mb-6">Realtime overview</h1>
                 
                 {/* Top Map Card */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-0 overflow-hidden mb-4">
                     <div className="grid grid-cols-1 lg:grid-cols-3">
                         {/* Left: Metrics */}
                         <div className="p-5 border-r border-gray-100">
                             <div className="mb-6">
                                 <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Active users in last 30 minutes</div>
                                 <div className="text-5xl font-normal text-slate-800">42</div>
                                 <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Active users per minute</div>
                             </div>
                             <div className="flex items-end space-x-[2px] h-16 mt-2 mb-6">
                                 {[...Array(30)].map((_, i) => (
                                     <div key={i} className="bg-blue-500 w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                                 ))}
                             </div>
                             <div>
                                 <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Active users in last 5 minutes</div>
                                 <div className="text-2xl font-normal text-slate-800">9</div>
                                 <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Active users per minute</div>
                             </div>
                              <div className="flex items-end space-x-[4px] h-10 mt-2">
                                 {[...Array(5)].map((_, i) => (
                                     <div key={i} className="bg-blue-500 w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Right: Map */}
                         <div className="col-span-2 bg-[#f8f9fa] relative min-h-[300px]">
                             <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                 <button className="w-8 h-8 bg-white rounded shadow text-gray-600 flex items-center justify-center font-bold text-lg hover:bg-gray-50">+</button>
                                 <button className="w-8 h-8 bg-white rounded shadow text-gray-600 flex items-center justify-center font-bold text-lg hover:bg-gray-50">-</button>
                             </div>
                             {/* Abstract Map Dots */}
                             <div className="w-full h-full flex items-center justify-center opacity-60">
                                <svg className="w-3/4 h-3/4 text-gray-300" fill="currentColor" viewBox="0 0 100 60">
                                   <path d="M20,10 Q25,5 30,10 T40,20 T50,15 T70,25 T90,20 V50 H10 V20 z" />
                                </svg>
                             </div>
                             {/* Bubbles */}
                             <div className="absolute top-[40%] left-[25%] w-6 h-6 bg-blue-500/80 rounded-full animate-pulse flex items-center justify-center text-[10px] text-white">12</div>
                             <div className="absolute top-[30%] left-[35%] w-4 h-4 bg-blue-500/80 rounded-full animate-pulse"></div>
                             <div className="absolute top-[60%] left-[22%] w-8 h-8 bg-blue-500/80 rounded-full animate-pulse flex items-center justify-center text-[10px] text-white">18</div>
                         </div>
                     </div>
                 </div>

                 {/* Bottom Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     
                     {/* Card 1 */}
                     <ReportCard title="Active users by First user source">
                         <div className="space-y-3 pt-2">
                             <div className="flex justify-between text-xs text-gray-500 pb-1 border-b border-gray-50">
                                 <span>First user source</span>
                                 <span>Users</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">(direct)</span>
                                 <span className="w-8 text-right text-slate-700">5</span>
                                 <div className="w-16 ml-2 h-2 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-blue-500 w-[100%]"></div></div>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">google</span>
                                 <span className="w-8 text-right text-slate-700">5</span>
                                 <div className="w-16 ml-2 h-2 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-blue-500 w-[100%]"></div></div>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">art-analytics.appspot.com</span>
                                 <span className="w-8 text-right text-slate-700">1</span>
                                 <div className="w-16 ml-2 h-2 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-blue-500 w-[20%]"></div></div>
                             </div>
                         </div>
                     </ReportCard>

                     {/* Card 2 */}
                     <ReportCard title="Active users by Audience">
                          <div className="space-y-3 pt-2">
                             <div className="flex justify-between text-xs text-gray-500 pb-1 border-b border-gray-50">
                                 <span>Audience</span>
                                 <span>Users</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">All Users</span>
                                 <span className="w-8 text-right text-slate-700">42</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Non-purchasers</span>
                                 <span className="w-8 text-right text-slate-700">40</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Recently active users</span>
                                 <span className="w-8 text-right text-slate-700">32</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Users scrolled 75%+</span>
                                 <span className="w-8 text-right text-slate-700">27</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Engaged Users</span>
                                 <span className="w-8 text-right text-slate-700">16</span>
                             </div>
                         </div>
                     </ReportCard>

                     {/* Card 3 */}
                     <ReportCard title="Views by Page title and screen name">
                          <div className="space-y-3 pt-2">
                             <div className="flex justify-between text-xs text-gray-500 pb-1 border-b border-gray-50">
                                 <span>Page title and screen...</span>
                                 <span>Views</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Home</span>
                                 <span className="w-8 text-right text-slate-700">33</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Google Merch Shop</span>
                                 <span className="w-8 text-right text-slate-700">10</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Writing | Google Mer...</span>
                                 <span className="w-8 text-right text-slate-700">10</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">New | Google Merch ...</span>
                                 <span className="w-8 text-right text-slate-700">8</span>
                             </div>
                             <div className="flex items-center text-sm py-1">
                                 <span className="flex-1 truncate text-slate-700">Google New York He...</span>
                                 <span className="w-8 text-right text-slate-700">5</span>
                             </div>
                         </div>
                     </ReportCard>
                 </div>
             </div>
          )}

          {/* VIEW: NOT IMPLEMENTED */}
          {activeNav !== 'home' && !(activeNav === 'reports' && (activeSubNav === 'snapshot' || activeSubNav === 'realtime')) && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center text-slate-400">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-medium text-slate-600 mb-2">Lesson Focus: Reports</h3>
                 <p className="max-w-md text-sm text-gray-500 mb-6">
                     This area is simulated. For this lesson, please navigate to <strong>Home</strong> or <strong>Reports &gt; Snapshot / Realtime</strong>.
                 </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Sub-components for Layout ---

const NavIcon = ({ icon, active, onClick, label }: { icon: string, active: boolean, onClick: () => void, label: string }) => {
  const getIcon = () => {
    switch(icon) {
      case 'home': return <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />;
      case 'reports': return <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />;
      case 'explore': return <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />;
      case 'advertising': return <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />;
      case 'admin': return <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />;
      default: return null;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors group relative my-1 ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        {getIcon()}
      </svg>
      {/* Tooltip */}
      <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
        {label}
      </span>
    </div>
  );
};

const SubNavItemSingle = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: string }) => (
    <div 
        onClick={onClick}
        className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-slate-600'}`}
    >
        {icon === 'snapshot' && (
            <svg className="w-5 h-5 mr-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
        )}
        {icon === 'realtime' && (
            <svg className="w-5 h-5 mr-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
        )}
        <span className="text-sm font-medium">{label}</span>
        {active && <div className="ml-auto w-1 h-1 rounded-full bg-blue-600"></div>}
    </div>
);

const SubNavGroup = ({ label, isOpen, toggle, children }: React.PropsWithChildren<{ label: string, isOpen: boolean, toggle: () => void }>) => (
    <div className="mt-1">
        <div onClick={toggle} className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 text-slate-600">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[11px]">{label}</span>
            <svg className={`w-3 h-3 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
            {children}
        </div>
    </div>
);

const SubNavTopic = ({ label, isOpen, toggle, children }: React.PropsWithChildren<{ label: string, isOpen: boolean, toggle: () => void }>) => (
    <div>
        <div onClick={toggle} className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 text-slate-600 pl-4">
            <span className="text-sm font-medium">{label}</span>
             <svg className={`w-3 h-3 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            {children}
        </div>
    </div>
);

const SubNavItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`pl-8 pr-4 py-1.5 text-[13px] cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
    >
        {label}
    </div>
);

const MetricCardBig = ({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: string }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-[150px] relative overflow-hidden">
        <div className="z-10">
            <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
            <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-3xl font-normal text-slate-800">{value}</h3>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? '↑' : '↓'} {change}
                </span>
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gray-50 rounded-full opacity-50 z-0"></div>
    </div>
);

const ReportCard = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
        <h3 className="text-base font-normal text-slate-700 mb-4">{title}</h3>
        {children}
    </div>
);

const BarChartRow = ({ label, value, width }: { label: string, value: string, width: string }) => (
    <div className="flex items-center text-sm">
        <span className="w-32 text-gray-600 truncate mr-3" title={label}>{label}</span>
        <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden flex items-center">
            <div className="h-full bg-blue-500 rounded-sm" style={{ width: width }}></div>
        </div>
        <span className="w-10 text-right text-gray-600 ml-3">{value}</span>
    </div>
);

const PageRow = ({ title, views }: { title: string, views: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-1 rounded">
        <span className="text-sm text-blue-600 hover:underline cursor-pointer truncate max-w-[80%]">{title}</span>
        <span className="text-sm text-gray-600">{views}</span>
    </div>
);
