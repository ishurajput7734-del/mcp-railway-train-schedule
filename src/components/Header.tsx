import React from 'react';
import { Train, Terminal, Settings, MessageSquareText, FileCode2, Layers, Cpu, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'playground' | 'claude-config' | 'prompts' | 'schemas' | 'code' | 'extensions';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'playground', label: 'Tool Playground', icon: Terminal, badge: '6 Tools' },
    { id: 'claude-config', label: 'Claude Desktop Config', icon: Settings, badge: 'Ready' },
    { id: 'prompts', label: '5 Test Prompts', icon: MessageSquareText, badge: 'Simulated' },
    { id: 'schemas', label: 'MCP Schema Explorer', icon: Layers, badge: 'tools/list' },
    { id: 'code', label: 'Python Source Files', icon: FileCode2, badge: '11 files' },
    { id: 'extensions', label: 'API & Extensions', icon: Cpu, badge: 'RapidAPI' },
  ] as const;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Railway MCP Server</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  FastMCP
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> 17/17 Tests Passing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Model Context Protocol for Indian Railways • SBC ↔ KCG Corridor &amp; National Network
              </p>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Transport: <strong className="text-emerald-400 font-mono">stdio</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">FastMCP: <strong className="text-amber-400 font-mono">v1.3+</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none border-t border-slate-800/60 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-orange-700/60 text-orange-100' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
