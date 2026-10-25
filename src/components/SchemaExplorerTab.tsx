import React, { useState } from 'react';
import { Layers, Copy, Check, ChevronDown, ChevronRight, Code2 } from 'lucide-react';

export const SchemaExplorerTab: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mcpToolsSchema = [
    {
      name: 'search_trains',
      description:
        'Search for all trains running between two stations or cities on a given date. Accepts either 3-4 letter station codes (e.g., SBC, KCG, NDLS) or full city names (e.g., Bengaluru, Hyderabad). Returns train numbers, departure/arrival times, travel duration, running days, and coach classes offered.',
      inputSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: "Source station code (e.g. 'SBC', 'KCG') or city name (e.g. 'Bengaluru', 'Hyderabad')",
          },
          destination: {
            type: 'string',
            description: "Destination station code or city name (e.g. 'KCG', 'SBC', 'Hyderabad')",
          },
          date: {
            type: 'string',
            description: "Date in YYYY-MM-DD format, or natural words 'today', 'tomorrow' (default: 'tomorrow')",
            default: 'tomorrow',
          },
        },
        required: ['source', 'destination'],
      },
    },
    {
      name: 'get_train_schedule',
      description:
        'Fetch the complete station-by-station route and timetable for a train. Returns the full stop sequence including arrival and departure times, halt duration (in minutes), cumulative distance (in km), platform numbers, and day counts along the route.',
      inputSchema: {
        type: 'object',
        properties: {
          train_number: {
            type: 'string',
            description: "5-digit Indian Railways train number (e.g. '12785', '22691', '20703', '12007')",
          },
        },
        required: ['train_number'],
      },
    },
    {
      name: 'get_train_status',
      description:
        'Get the live running status, delay information, and current location of a train. Returns whether the train is running on time or delayed (in minutes), last reported station, current speed (km/h), and estimated arrival at the next station.',
      inputSchema: {
        type: 'object',
        properties: {
          train_number: {
            type: 'string',
            description: "5-digit Indian Railways train number (e.g. '12785', '22691')",
          },
          date: {
            type: 'string',
            description: "Journey date in YYYY-MM-DD or 'today' (defaults to today)",
          },
        },
        required: ['train_number'],
      },
    },
    {
      name: 'get_station_info',
      description:
        'Get detailed information about an Indian Railway station and all trains passing through it. Returns station code, full name, city, state, railway zone, and a list of all originating, terminating, and transit trains with their scheduled halt times and platforms.',
      inputSchema: {
        type: 'object',
        properties: {
          station_code_or_name: {
            type: 'string',
            description: "Station code (e.g. 'SBC', 'KCG', 'NDLS', 'SC') or station/city name (e.g. 'Bengaluru', 'Secunderabad')",
          },
        },
        required: ['station_code_or_name'],
      },
    },
    {
      name: 'check_seat_availability',
      description:
        'Check berth/seat availability status, waitlist probability, and estimated fare for a train journey. Returns current status (e.g., AVAILABLE-42, RAC 12, WL 24), confirmation probability score for waitlisted tickets, and approximate fare in INR.',
      inputSchema: {
        type: 'object',
        properties: {
          train_number: {
            type: 'string',
            description: "5-digit Indian Railways train number (e.g. '12785', '20703')",
          },
          date: {
            type: 'string',
            description: "Journey date in YYYY-MM-DD or 'tomorrow'",
          },
          class_type: {
            type: 'string',
            description: "Coach class code: 'SL' (Sleeper), '3A' (3-Tier AC), '2A' (2-Tier AC), '1A' (1st AC), 'CC' (Chair Car), 'EC' (Exec Chair Car)",
            default: '3A',
          },
        },
        required: ['train_number', 'date'],
      },
    },
    {
      name: 'get_pnr_status',
      description:
        'Check 10-digit Indian Railways PNR reservation status, passenger quota, chart status, and confirmation probability. Returns booking status (CNF, RAC, WL), current status, coach & berth assignment, quota (General, Tatkal, Senior Citizen), chart preparation status, and confirmation chance.',
      inputSchema: {
        type: 'object',
        properties: {
          pnr_number: {
            type: 'string',
            description: "10-digit numeric Indian Railways PNR number (e.g. '4231892011')",
          },
        },
        required: ['pnr_number'],
      },
    },
  ];

  const fullToolsListPayload = {
    jsonrpc: '2.0',
    id: 1,
    result: {
      tools: mcpToolsSchema,
    },
  };

  const copyToolJson = (schema: any, idx: number) => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              MCP Tools Schema Explorer (<code className="text-orange-400 font-mono text-xs">tools/list</code>)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              This is the exact JSON Schema sent by your FastMCP server during client capability negotiation. LLMs read these descriptions and parameter types to decide which tool to call.
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(fullToolsListPayload, null, 2));
              setCopiedIndex(999);
              setTimeout(() => setCopiedIndex(null), 2000);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 999 ? 'Copied Full tools/list' : 'Copy All Tools'}</span>
          </button>
        </div>
      </div>

      {/* Tools list breakdown */}
      <div className="space-y-4">
        {mcpToolsSchema.map((tool, idx) => (
          <div
            key={tool.name}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="font-mono text-base font-bold text-white">{tool.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Tool
                </span>
              </div>
              <button
                onClick={() => copyToolJson(tool, idx)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-auto"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Parameters (Input Schema)
              </span>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre className="text-emerald-400">{JSON.stringify(tool.inputSchema, null, 2)}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
