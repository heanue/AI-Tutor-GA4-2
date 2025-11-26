
import React from 'react';

export const AiTutorView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0f172a] text-white p-8 md:p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1 mb-4 border border-slate-700">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300">AI Career Coach Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Current Learning Path</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            You’re building your Google Analytics expertise. Select the next course that fits your career goals.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-6 md:p-8 space-y-12">
        
        {/* Section 1: Current Learning Path */}
        <section>
          <div className="flex items-center space-x-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
             </div>
             <h2 className="text-xl font-bold text-slate-800">Current Track: GA4 Analytics Mastery</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
             <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-100 hidden md:block z-0"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                   {/* Step 1 */}
                   <div className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white mb-3">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">UA vs GA4</h3>
                      <p className="text-xs text-slate-500 mt-1">Foundations</p>
                   </div>
                   
                   {/* Step 2 */}
                   <div className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white mb-3">
                         2
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">Setup & Config</h3>
                      <p className="text-xs text-slate-500 mt-1">Implementation</p>
                   </div>

                   {/* Step 3 */}
                   <div className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold shadow-sm ring-4 ring-white mb-3">
                         3
                      </div>
                      <h3 className="text-sm font-medium text-slate-500">Interface</h3>
                      <p className="text-xs text-slate-400 mt-1">Navigation</p>
                   </div>

                   {/* Step 4 */}
                   <div className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold shadow-sm ring-4 ring-white mb-3">
                         4
                      </div>
                      <h3 className="text-sm font-medium text-slate-500">User Behavior</h3>
                      <p className="text-xs text-slate-400 mt-1">Analysis</p>
                   </div>

                    {/* Step 5 */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold shadow-sm ring-4 ring-white mb-3">
                         5
                      </div>
                      <h3 className="text-sm font-medium text-slate-500">Reports</h3>
                      <p className="text-xs text-slate-400 mt-1">Insights</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Section 2: Recommended Courses */}
        <section>
          <div className="flex items-center space-x-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <h2 className="text-xl font-bold text-slate-800">Recommended Next Steps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Course 1 */}
             <CourseCard 
                title="Digital Marketing Foundation" 
                category="Marketing"
                color="blue"
                description="Master the core pillars of digital marketing: SEO, SEM, Social Media, and Email Marketing."
                agenda={[
                    "SEO Fundamentals & Keyword Strategy",
                    "Paid Search (PPC) Basics",
                    "Content Marketing Strategy",
                    "Email Automation Flows"
                ]}
             />

             {/* Course 2 */}
             <CourseCard 
                title="Change Career into AI" 
                category="Career"
                color="orange"
                description="A strategic guide for professionals looking to pivot into Artificial Intelligence roles."
                agenda={[
                    "AI Landscape & Key Terminology",
                    "Identifying Transferable Skills",
                    "Building an AI Portfolio",
                    "Networking & Job Search Strategy"
                ]}
             />

             {/* Course 3 */}
             <CourseCard 
                title="AI in Social Media Marketing" 
                category="Specialization"
                color="purple"
                description="Learn to leverage GenAI tools to automate content creation and optimize engagement."
                agenda={[
                    "Generative AI for Copywriting",
                    "AI Image Generation for Ads",
                    "Automated Community Management",
                    "Predictive Trend Analysis"
                ]}
             />

             {/* Course 4 */}
             <CourseCard 
                title="Build a Business with AI" 
                category="Entrepreneurship"
                color="green"
                description="Launch and scale a startup using AI tools for product, marketing, and operations."
                agenda={[
                    "Idea Validation with AI Agents",
                    "No-Code MVP Building",
                    "Automated Sales Funnels",
                    "AI Customer Support Setup"
                ]}
             />

          </div>
        </section>

      </div>
    </div>
  );
};

interface CourseCardProps {
    title: string;
    category: string;
    description: string;
    agenda: string[];
    color: 'blue' | 'orange' | 'purple' | 'green';
}

const CourseCard: React.FC<CourseCardProps> = ({ title, category, description, agenda, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        orange: "bg-orange-50 text-orange-700 border-orange-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        green: "bg-green-50 text-green-700 border-green-200",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${colorClasses[color]}`}>
                    {category}
                </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm mb-6 flex-1">{description}</p>
            
            <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Course Agenda</h4>
                <ul className="space-y-2">
                    {agenda.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700">
                             <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming Soon
            </button>
        </div>
    );
};
