import React, { useState } from 'react';
import { FileCode2, Copy, Check, Folder, FileText, ChevronRight, Terminal } from 'lucide-react';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';

export const CodeExplorerTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-orange-400" />
          Project Source Code Explorer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Browse the complete <code className="text-orange-400 font-mono">railway-mcp/</code> directory. Every file has been generated and validated with 17/17 tests passing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left file tree */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            railway-mcp/
          </div>

          <div className="space-y-1">
            {PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      isSelected
                        ? 'bg-orange-700/60 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right code preview */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{selectedFile.path}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <button
              onClick={copyCode}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied File' : 'Copy File Content'}</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed text-slate-200">
            <pre>{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
