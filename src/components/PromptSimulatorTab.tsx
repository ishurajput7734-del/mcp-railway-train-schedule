import React, { useState } from 'react';
import { MessageSquareText, Play, Terminal, Sparkles, Check, ArrowRight, User, Bot, HelpCircle } from 'lucide-react';
import {
  searchTrainsClient,
  getTrainScheduleClient,
  getTrainStatusClient,
  getStationInfoClient,
  checkSeatAvailabilityClient,
} from '../services/railwayService';

interface ExamplePrompt {
  id: number;
  title: string;
  prompt: string;
  toolToCall: string;
  argsDescription: string;
  runSimulation: () => { tool: string; args: any; output: any; synthesized: string };
}

export const PromptSimulatorTab: React.FC = () => {
  const examplePrompts: ExamplePrompt[] = [
    {
      id: 1,
      title: '1. Route Search: Bengaluru to Hyderabad',
      prompt: 'Which trains run from Bengaluru to Hyderabad tomorrow? What are their departure times and travel durations?',
      toolToCall: 'search_trains',
      argsDescription: 'source="Bengaluru", destination="Hyderabad", date="tomorrow"',
      runSimulation: () => {
        const res = searchTrainsClient('Bengaluru', 'Hyderabad', 'tomorrow');
        const trainHighlights = res.trains
          .map(
            (t: any) =>
              `• **${t.train_name} (${t.train_number})**: Departs ${t.board_station.departure_time} from ${t.board_station.name}, arrives ${t.destination_station.arrival_time} at ${t.destination_station.name}. Duration: ${t.duration} (Runs: ${t.running_days.join(', ')}). Classes: ${t.classes_available.join(', ')}.`
          )
          .join('\n');

        const synthesized = `Here are the trains running between Bengaluru and Hyderabad tomorrow:\n\n${trainHighlights}\n\n💡 **Travel Tip**: If you prefer daytime speed, the **Vande Bharat Express (20704)** gets you there in just 8h 30m. For an overnight journey, the **Kacheguda Superfast Express (12786)** departs at 18:20 with Sleeper & AC berths.`;
        return {
          tool: 'search_trains',
          args: { source: 'Bengaluru', destination: 'Hyderabad', date: 'tomorrow' },
          output: res,
          synthesized,
        };
      },
    },
    {
      id: 2,
      title: '2. Timetable: Train 12785 Route & Halts',
      prompt: 'What is the schedule of train 12785 (Kacheguda Superfast)? How long does it stop at Kurnool?',
      toolToCall: 'get_train_schedule',
      argsDescription: 'train_number="12785"',
      runSimulation: () => {
        const res = getTrainScheduleClient('12785');
        const kurnoolStop = res.schedule?.find((s: any) => s.station_code === 'KRNT');
        const synthesized = `**Train 12785 (Kacheguda Superfast Express)** operates from **Kacheguda (KCG)** to **KSR Bengaluru (SBC)** covering **622 km** across 9 halts.\n\n• **Departure from Kacheguda**: 19:05 (Day 1)\n• **Arrival at KSR Bengaluru**: 06:25 (Day 2)\n• **Total Journey Duration**: 11h 20m\n\n📍 **Kurnool City (KRNT) Halt Details**:\n• **Arrival**: ${kurnoolStop?.arrival_time}\n• **Departure**: ${kurnoolStop?.departure_time}\n• **Halt Duration**: **${kurnoolStop?.halt_duration_minutes} minutes**\n• **Platform**: ${kurnoolStop?.platform_number}\n• **Distance from origin**: ${kurnoolStop?.distance_from_origin_km} km.`;
        return {
          tool: 'get_train_schedule',
          args: { train_number: '12785' },
          output: res,
          synthesized,
        };
      },
    },
    {
      id: 3,
      title: '3. Live Status: Train 12785 Delays & Location',
      prompt: 'What is the live running status of train 12785 today? Is it delayed and what is the next upcoming station?',
      toolToCall: 'get_train_status',
      argsDescription: 'train_number="12785", date="today"',
      runSimulation: () => {
        const res = getTrainStatusClient('12785', 'today');
        const st = res.current_status!;
        const synthesized = `**Live Running Status for Train 12785 (Kacheguda Superfast Express)**:\n\n• **Status**: ${st.delay_text} (${st.status_category})\n• **Current Location**: ${st.status_summary}\n• **Cruising Speed**: ${st.current_speed_kmh} km/h\n• **Last Reported Halt**: ${st.last_reported_station.name} (${st.last_reported_station.code}) — departed at ${st.last_reported_station.actual_departure}\n• **Next Upcoming Station**: **${st.next_upcoming_station.name} (${st.next_upcoming_station.code})** expected at **${st.next_upcoming_station.expected_arrival}** on Platform ${st.next_upcoming_station.platform}\n• **Journey Progress**: ${st.journey_progress.distance_covered_km} km completed (${st.journey_progress.percentage_completed}%), ${st.journey_progress.distance_remaining_km} km remaining.`;
        return {
          tool: 'get_train_status',
          args: { train_number: '12785', date: 'today' },
          output: res,
          synthesized,
        };
      },
    },
    {
      id: 4,
      title: '4. Station Departures: Secunderabad (SC)',
      prompt: 'What trains pass through or originate from Secunderabad (SC) station?',
      toolToCall: 'get_station_info',
      argsDescription: 'station_code_or_name="Secunderabad"',
      runSimulation: () => {
        const res = getStationInfoClient('Secunderabad');
        const list = res.trains
          ?.map(
            (t: any) =>
              `• **${t.train_name} (${t.train_number})**: Role: *${t.role_at_station}* | Platform ${t.platform} | Dep: ${t.departure} | Route: ${t.route_summary}`
          )
          .join('\n');
        const synthesized = `**Station Details: ${res.station_name} (${res.station_code})**\n• Location: ${res.city}, ${res.state}\n• Railway Zone: ${res.railway_zone}\n• Active Trains Passing Through: **${res.total_passing_trains}**\n\n**Scheduled Departures & Transits:**\n${list}`;
        return {
          tool: 'get_station_info',
          args: { station_code_or_name: 'Secunderabad' },
          output: res,
          synthesized,
        };
      },
    },
    {
      id: 5,
      title: '5. Seat Availability: 3A Berth on Train 12785',
      prompt: 'Check 3A seat availability for train 12785 tomorrow. What is the ticket status and estimated fare?',
      toolToCall: 'check_seat_availability',
      argsDescription: 'train_number="12785", date="tomorrow", class_type="3A"',
      runSimulation: () => {
        const res = checkSeatAvailabilityClient('12785', 'tomorrow', '3A');
        const synthesized = `**Seat Availability on Train 12785 (${res.train_name})**:\n\n• **Class**: 3-Tier AC (3A) | Quota: General (GN)\n• **Journey Date**: ${res.journey_date}\n• **Current Status**: **${res.availability_status}** (${res.category})\n• **Confirmation Probability**: **${res.confirmation_probability_percentage}%**\n• **Estimated Base Fare**: **${res.estimated_fare_inr}**\n• **Detail**: ${res.status_detail}\n\n🎫 *Other available classes on this train: ${res.classes_offered_by_train?.join(', ')}*.`;
        return {
          tool: 'check_seat_availability',
          args: { train_number: '12785', date: 'tomorrow', class_type: '3A' },
          output: res,
          synthesized,
        };
      },
    },
  ];

  const [activePromptId, setActivePromptId] = useState<number>(1);
  const [simulationResult, setSimulationResult] = useState<any>(() => examplePrompts[0].runSimulation());

  const selectAndRunPrompt = (prompt: ExamplePrompt) => {
    setActivePromptId(prompt.id);
    const result = prompt.runSimulation();
    setSimulationResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-orange-400" />
          5 Example Prompts for Claude Desktop
        </h2>
        <p className="text-xs text-slate-400">
          Click on any prompt below to simulate how an AI client like Claude Desktop receives the question, calls the respective MCP tool on your server, and synthesizes the final reply.
        </p>

        {/* Prompt selector pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
          {examplePrompts.map((p) => {
            const isSelected = activePromptId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectAndRunPrompt(p)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-950/40 border-orange-500/80 text-white shadow-md ring-1 ring-orange-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400">{p.title}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{p.prompt}"
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-orange-300/80 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 truncate">
                  Calls: {p.toolToCall}()
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Conversation Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Simulated Claude Desktop MCP Exchange
          </span>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Execution
          </span>
        </div>

        {/* Step 1: User message */}
        <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Query</span>
            <p className="text-sm text-white font-medium mt-0.5">
              {examplePrompts.find((p) => p.id === activePromptId)?.prompt}
            </p>
          </div>
        </div>

        {/* Step 2: MCP Tool Invocation */}
        <div className="flex items-start gap-3 bg-orange-950/20 p-4 rounded-xl border border-orange-500/30">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                MCP Tool Call ➔ {simulationResult.tool}()
              </span>
              <span className="text-[10px] text-slate-400 font-mono">stdio JSON-RPC</span>
            </div>
            <pre className="mt-1.5 p-2 bg-slate-950 rounded text-xs font-mono text-amber-300 overflow-x-auto border border-slate-800">
              {JSON.stringify(simulationResult.args, null, 2)}
            </pre>
          </div>
        </div>

        {/* Step 3: Claude Synthesized Natural Language Response */}
        <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-600/20">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Claude Desktop Answer
            </span>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {simulationResult.synthesized}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
