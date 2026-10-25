import React, { useState } from 'react';
import { Copy, Check, Terminal, Folder, CheckCircle2, AlertTriangle, Monitor, Sparkles } from 'lucide-react';

export const ClaudeSetupTab: React.FC = () => {
  const [os, setOs] = useState<'macos' | 'windows' | 'linux'>('macos');
  const [projectPath, setProjectPath] = useState('/Users/username/railway-mcp');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const configLocations = {
    macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
    windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
    linux: '~/.config/Claude/claude_desktop_config.json',
  };

  const getPythonPath = () => {
    if (os === 'windows') {
      const cleanPath = projectPath.replace(/\//g, '\\');
      return `${cleanPath}\\.venv\\Scripts\\python.exe`;
    }
    return `${projectPath.replace(/\/$/, '')}/.venv/bin/python`;
  };

  const getServerPath = () => {
    if (os === 'windows') {
      const cleanPath = projectPath.replace(/\//g, '\\');
      return `${cleanPath}\\server.py`;
    }
    return `${projectPath.replace(/\/$/, '')}/server.py`;
  };

  const generatedConfig = JSON.stringify(
    {
      mcpServers: {
        'railway-assistant': {
          command: getPythonPath(),
          args: [getServerPath()],
          env: {
            RAILWAY_DATA_PROVIDER: 'local',
            LOG_LEVEL: 'INFO',
          },
        },
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const copyConfigPath = () => {
    navigator.clipboard.writeText(configLocations[os]);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-600/30">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Connect to Claude Desktop
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Official MCP Protocol
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Claude Desktop acts as the MCP client, while your Python FastMCP script runs locally as the server.
              When you ask questions like <em>"Which trains run from Bengaluru to Hyderabad tomorrow?"</em>, Claude calls your server's tools over stdio.
            </p>
          </div>
        </div>
      </div>

      {/* OS Picker & Path Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">1. Select Operating System &amp; Project Path</h3>

        <div className="flex flex-wrap gap-2">
          {(['macos', 'windows', 'linux'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => {
                setOs(platform);
                if (platform === 'windows') setProjectPath('C:\\projects\\railway-mcp');
                else if (platform === 'macos') setProjectPath('/Users/username/railway-mcp');
                else setProjectPath('/home/username/railway-mcp');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                os === platform
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Absolute directory where you extracted or saved <code className="text-orange-400 font-mono">railway-mcp</code>:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tip: Run <code className="text-slate-400">pwd</code> in your terminal inside <code className="text-slate-400">railway-mcp</code> to copy your exact absolute path.
          </p>
        </div>
      </div>

      {/* Config File Location & Code Snippet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">2. Paste Configuration into Claude Desktop</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit the file at: <code className="text-amber-400 font-mono">{configLocations[os]}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyConfigPath}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors flex items-center gap-1"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Config Path</span>
            </button>
            <button
              onClick={copyConfig}
              className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium rounded transition-colors flex items-center gap-1 shadow"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? 'Copied JSON' : 'Copy Configuration'}</span>
            </button>
          </div>
        </div>

        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
          <pre>{generatedConfig}</pre>
        </div>
      </div>

      {/* Step-by-Step Installation Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">3. Step-by-step Setup Checklist</h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold text-white">Create Python Virtual Environment</div>
              <p className="text-slate-400 mt-0.5">In terminal inside the <code className="text-slate-300">railway-mcp</code> folder:</p>
              <pre className="bg-slate-900 px-3 py-1.5 rounded mt-1 font-mono text-[11px] text-emerald-400">
                python3 -m venv .venv
              </pre>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold text-white">Install FastMCP SDK &amp; Dependencies</div>
              <pre className="bg-slate-900 px-3 py-1.5 rounded mt-1 font-mono text-[11px] text-emerald-400">
                source .venv/bin/activate  # (Windows: .venv\Scripts\activate)&#10;pip install -r requirements.txt
              </pre>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold text-white">Optional: Test in FastMCP Web Inspector</div>
              <pre className="bg-slate-900 px-3 py-1.5 rounded mt-1 font-mono text-[11px] text-emerald-400">
                mcp dev server.py
              </pre>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div>
              <div className="font-semibold text-white">Restart Claude Desktop</div>
              <p className="text-slate-400 mt-0.5">
                Completely quit Claude Desktop (<kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px]">Cmd+Q</kbd> on macOS) and reopen it.
                You will see a <strong>hammer icon</strong> in the prompt box confirming the 5 tools are connected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
