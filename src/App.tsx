/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ToolPlayground } from './components/ToolPlayground';
import { ClaudeSetupTab } from './components/ClaudeSetupTab';
import { PromptSimulatorTab } from './components/PromptSimulatorTab';
import { SchemaExplorerTab } from './components/SchemaExplorerTab';
import { CodeExplorerTab } from './components/CodeExplorerTab';
import { ExtensionsTab } from './components/ExtensionsTab';
import { Train, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playground');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Header & Navigation */}
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playground' && <ToolPlayground />}
        {activeTab === 'claude-config' && <ClaudeSetupTab />}
        {activeTab === 'prompts' && <PromptSimulatorTab />}
        {activeTab === 'schemas' && <SchemaExplorerTab />}
        {activeTab === 'code' && <CodeExplorerTab />}
        {activeTab === 'extensions' && <ExtensionsTab />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Train className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-white">Railway MCP Assistant</span>
            <span>•</span>
            <span>Indian Railways Train Schedule &amp; Status Protocol</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 20/20 Tests Verified
            </span>
            <span>•</span>
            <span>6 MCP Tools</span>
            <span>•</span>
            <span>18 Sample Trains</span>
            <span>•</span>
            <span>39 Railway Stations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
