
import React, { useState } from 'react';
import { Module, ViewMode } from '../types';

interface SidebarProps {
  modules: Module[];
  activeModuleId: string | null;
  onSelectModule: (id: string) => void;
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  modules, 
  activeModuleId, 
  onSelectModule, 
  currentView, 
  onViewChange 
}) => {
  const [isLabExpanded, setIsLabExpanded] = useState(false);

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#0f172a] text-slate-300 h-screen fixed left-0 top-0 overflow-y-auto border-r border-slate-800 z-10">
      {/* Header */}
      <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-white text-sm leading-tight">GA4 Micro-Tutor</h1>
          <p className="text-xs text-slate-400">Interactive Agent</p>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 py-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Learning Mode</p>
        </div>
        
        <nav className="space-y-1 px-2">
          
          <button 
             onClick={() => onViewChange(ViewMode.AI_TUTOR)}
             className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === ViewMode.AI_TUTOR ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => onViewChange(ViewMode.LESSON)}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === ViewMode.LESSON ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Interactive Lessons</span>
          </button>

          {/* Expandable Practice Lab Menu */}
          <div>
            <button 
              onClick={() => setIsLabExpanded(!isLabExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                (currentView === ViewMode.GA4_SIMULATOR || currentView === ViewMode.INTERVIEW_SIMULATOR) 
                ? 'bg-slate-800 text-white' 
                : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Practice Lab</span>
              </div>
              <svg 
                className={`w-4 h-4 transform transition-transform duration-200 ${isLabExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sub-menu */}
            {isLabExpanded && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-800 pl-2 animate-fade-in">
                <button
                  onClick={() => onViewChange(ViewMode.GA4_SIMULATOR)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === ViewMode.GA4_SIMULATOR ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  GA4 Simulator
                </button>
                <button
                  onClick={() => onViewChange(ViewMode.INTERVIEW_SIMULATOR)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === ViewMode.INTERVIEW_SIMULATOR ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Interview Simulator
                </button>
              </div>
            )}
          </div>

        </nav>

        <div className="px-4 mt-8 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Learning Path</p>
        </div>

        <nav className="space-y-1 px-2">
          {modules.map((mod, index) => (
            <button
              key={mod.id}
              onClick={() => {
                onSelectModule(mod.id);
                onViewChange(ViewMode.LESSON);
              }}
              className={`w-full flex flex-col items-start px-3 py-2 text-left rounded-md transition-colors ${
                activeModuleId === mod.id && currentView === ViewMode.LESSON ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    activeModuleId === mod.id && currentView === ViewMode.LESSON ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  MOD {index + 1}
                </span>
                <span className="text-sm font-medium truncate">{mod.title}</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 pl-1 line-clamp-1">{mod.description}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
         <button className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Self-Paced Learning</span>
         </button>
      </div>
    </div>
  );
};
