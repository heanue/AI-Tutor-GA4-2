
import React, { useEffect, useRef, useState } from 'react';
import { Message, Sender, LessonContent, SimulationRedirect } from '../types';

interface LessonFeedProps {
  messages: Message[];
  isLoading: boolean;
  onOptionSelect: (text: string) => void;
  onSimulatorRedirect: (redirect: SimulationRedirect) => void;
}

export const LessonFeed: React.FC<LessonFeedProps> = ({ messages, isLoading, onOptionSelect, onSimulatorRedirect }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-32 pt-10">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in-up">
            {msg.sender === Sender.USER ? (
              // User Message
              <div className="flex justify-end">
                <div className="bg-slate-800 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                  <p className="text-sm md:text-base">{msg.content as string}</p>
                </div>
              </div>
            ) : (
              // Bot Lesson Card
              <LessonCard 
                content={msg.content as LessonContent} 
                onOptionSelect={onOptionSelect} 
                onSimulatorRedirect={onSimulatorRedirect}
              />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                <span className="text-orange-600 text-xs font-bold">AI</span>
             </div>
             <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const LessonCard: React.FC<{ 
    content: LessonContent; 
    onOptionSelect: (text: string) => void;
    onSimulatorRedirect: (redirect: SimulationRedirect) => void; 
}> = ({ content, onOptionSelect, onSimulatorRedirect }) => {
  const [quizState, setQuizState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [optionsVisible, setOptionsVisible] = useState(true);

  const handleQuizOption = (index: number) => {
    if (!content.quiz) return;
    if (index === content.quiz.correctAnswerIndex) {
        setQuizState('correct');
    } else {
        setQuizState('wrong');
    }
  };

  const handleTaskOption = (option: string) => {
      onOptionSelect(option);
      setOptionsVisible(false);
  }

  // Helper to render text with paragraphs nicely
  const renderFormattedText = (text: string) => {
      if (!text) return <p className="text-slate-500 italic">Content loading...</p>;

      return text.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-4"></div>;
          
          // Check for "1. Title" style headers
          if (/^\d+\./.test(trimmed) || trimmed.endsWith(':')) {
              return <h3 key={i} className="font-bold text-slate-800 mt-4 mb-2 text-lg">{trimmed.replace(/\*\*/g, '')}</h3>;
          }
          // Check for bullet points (dashes, bullets, or chevrons)
          if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('›')) {
               return (
                  <div key={i} className="flex items-start space-x-2 ml-2 mb-2">
                      <span className="text-orange-500 mt-1.5 text-[10px]">●</span>
                      <span className="text-slate-700 leading-relaxed">{trimmed.replace(/^[-•›]\s*/, '').replace(/\*\*/g, '')}</span>
                  </div>
               )
          }
          
          return <p key={i} className="text-slate-700 leading-relaxed mb-3 text-base">{trimmed.replace(/\*\*/g, '')}</p>;
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 1. Micro Lesson Text */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none">
          {renderFormattedText(content.microLessonText)}
        </div>
      </div>

      {/* 2. Example Box */}
      {content.exampleContent && (
        <div className="mx-6 mb-6">
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                {content.exampleTitle || 'Example'}
              </span>
            </div>
            <p className="text-sm text-sky-900 leading-relaxed">
              {content.exampleContent}
            </p>
          </div>
        </div>
      )}

      {/* 3. Comparison Table */}
      {content.comparison && (
        <div className="mx-6 mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
             <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{content.comparison.title}</span>
          </div>
          <div className="bg-white">
             {/* Header Row */}
             <div className="grid grid-cols-10 border-b border-gray-100 bg-gray-50/50">
                 <div className="col-span-4 p-3 text-xs font-bold text-gray-500 uppercase">Feature</div>
                 <div className="col-span-3 p-3 text-xs font-bold text-gray-500 uppercase border-l border-gray-100">{content.comparison.uaLabel}</div>
                 <div className="col-span-3 p-3 text-xs font-bold text-orange-600 uppercase border-l border-gray-100 bg-orange-50/20">{content.comparison.ga4Label}</div>
             </div>
             {/* Data Rows */}
             {content.comparison.rows.map((row, idx) => (
                 <div key={idx} className="grid grid-cols-10 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                     <div className="col-span-4 p-3 text-sm font-medium text-slate-700">{row.feature}</div>
                     <div className="col-span-3 p-3 text-sm text-slate-500 border-l border-gray-100">{row.uaValue}</div>
                     <div className="col-span-3 p-3 text-sm text-slate-900 font-medium border-l border-gray-100 bg-orange-50/10">{row.ga4Value}</div>
                 </div>
             ))}
          </div>
          <div className="bg-slate-800 p-3 flex items-start space-x-2">
             <div className="shrink-0 pt-0.5">
               <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
             </div>
             <p className="text-xs text-white leading-tight">{content.comparison.insight}</p>
          </div>
        </div>
      )}

      {/* 4. Quiz / Quick Check */}
      {content.quiz && (
        <div className="mx-6 mb-6">
          <div className="bg-[#0f172a] rounded-lg p-5 text-white">
            <div className="flex items-center space-x-2 mb-3">
               <div className="w-4 h-4 rounded-full border border-green-400 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Check</span>
            </div>
            
            <p className="text-sm font-medium mb-4">{content.quiz.question}</p>
            
            <div className="space-y-2">
               {content.quiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizOption(idx)}
                    disabled={quizState === 'correct'}
                    className={`w-full text-left px-4 py-3 rounded text-sm transition-all duration-200 border ${
                        quizState === 'correct' && idx === content.quiz!.correctAnswerIndex
                        ? 'bg-green-500/20 border-green-500 text-white'
                        : quizState === 'wrong' && idx !== content.quiz!.correctAnswerIndex 
                        ? 'bg-slate-800 border-slate-700 opacity-50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {option}
                  </button>
               ))}
            </div>

            {quizState === 'correct' && (
               <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/20 text-xs text-green-300 animate-fade-in">
                  <span className="font-bold mr-1">Correct!</span> {content.quiz.explanation}
               </div>
            )}
             {quizState === 'wrong' && (
               <div className="mt-4 p-3 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-300 animate-fade-in">
                  <span className="font-bold mr-1">Not quite.</span> Try again!
               </div>
            )}
          </div>
        </div>
      )}
      
      {/* 5. Practice Task & Simulator Button */}
      {(content.practiceTask || content.simulationRedirect) && (
        <div className="px-6 pb-6 pt-2">
            
            {/* Simulator Button - Smaller, Secondary Style */}
            {content.simulationRedirect && (
                 <div className="mb-6">
                    <button 
                        onClick={() => onSimulatorRedirect(content.simulationRedirect!)}
                        className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors group"
                    >
                        <div className="bg-white p-1 rounded-md border border-blue-100">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <span>Open Simulator Link</span>
                        <svg className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <p className="text-xs text-slate-400 mt-2 ml-1">
                        *Opens in full-screen interactive mode
                    </p>
                </div>
            )}

            {/* Question Text */}
            {content.practiceTask && (
                <div className="mb-3 animate-fade-in">
                    <p className="text-sm font-bold text-slate-800 flex items-start">
                        <span className="bg-orange-100 text-orange-600 p-1 rounded mr-2 shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        {content.practiceTask}
                    </p>
                </div>
            )}

            {/* Interactive Chips */}
            {content.taskOptions && optionsVisible && (
                <div className="flex flex-col gap-2 animate-fade-in">
                    {content.taskOptions.map((opt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleTaskOption(opt)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors shadow-sm border ${
                                opt === "Let's go!" || opt === "Let's go"
                                ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600 text-center font-bold'
                                : 'bg-white hover:bg-orange-50 text-slate-600 hover:text-orange-700 border-slate-200 hover:border-orange-200'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
       )}
    </div>
  );
};
