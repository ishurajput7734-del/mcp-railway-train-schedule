import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Gauge,
  Armchair,
  Route,
  Building2,
  Utensils,
  ChevronRight,
  Compass,
  Ticket,
  Users,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import {
  searchTrainsClient,
  getTrainScheduleClient,
  getTrainStatusClient,
  getStationInfoClient,
  checkSeatAvailabilityClient,
  getPnrStatusClient,
} from '../services/railwayService';

type ToolType =
  | 'search_trains'
  | 'get_train_schedule'
  | 'get_train_status'
  | 'get_station_info'
  | 'check_seat_availability'
  | 'get_pnr_status';

export const ToolPlayground: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('search_trains');
  const [viewMode, setViewMode] = useState<'visual' | 'raw_json'>('visual');
  const [copied, setCopied] = useState(false);

  // Form states
  const [searchSrc, setSearchSrc] = useState('Bengaluru');
  const [searchDst, setSearchDst] = useState('Hyderabad');
  const [searchDate, setSearchDate] = useState('tomorrow');

  const [scheduleTrainNum, setScheduleTrainNum] = useState('12785');

  const [statusTrainNum, setStatusTrainNum] = useState('12785');
  const [statusDate, setStatusDate] = useState('today');

  const [stationQuery, setStationQuery] = useState('SBC');

  const [availTrainNum, setAvailTrainNum] = useState('12785');
  const [availDate, setAvailDate] = useState('tomorrow');
  const [availClass, setAvailClass] = useState('3A');

  const [pnrInput, setPnrInput] = useState('4231892011');

  // Execution result
  const [lastResult, setLastResult] = useState<any>(() =>
    searchTrainsClient('Bengaluru', 'Hyderabad', 'tomorrow')
  );

  const executeCurrentTool = (overrideTool?: ToolType) => {
    const tool = overrideTool || selectedTool;
    let res: any;

    if (tool === 'search_trains') {
      res = searchTrainsClient(searchSrc, searchDst, searchDate);
    } else if (tool === 'get_train_schedule') {
      res = getTrainScheduleClient(scheduleTrainNum);
    } else if (tool === 'get_train_status') {
      res = getTrainStatusClient(statusTrainNum, statusDate);
    } else if (tool === 'get_station_info') {
      res = getStationInfoClient(stationQuery);
    } else if (tool === 'check_seat_availability') {
      res = checkSeatAvailabilityClient(availTrainNum, availDate, availClass);
    } else if (tool === 'get_pnr_status') {
      res = getPnrStatusClient(pnrInput);
    }

    setLastResult(res);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick navigation handlers from one tool to another
  const jumpToSchedule = (trainNo: string) => {
    setScheduleTrainNum(trainNo);
    setSelectedTool('get_train_schedule');
    const res = getTrainScheduleClient(trainNo);
    setLastResult(res);
  };

  const jumpToStatus = (trainNo: string) => {
    setStatusTrainNum(trainNo);
    setSelectedTool('get_train_status');
    const res = getTrainStatusClient(trainNo, 'today');
    setLastResult(res);
  };

  const jumpToAvailability = (trainNo: string, defClass: string = '3A') => {
    setAvailTrainNum(trainNo);
    setAvailClass(defClass);
    setSelectedTool('check_seat_availability');
    const res = checkSeatAvailabilityClient(trainNo, 'tomorrow', defClass);
    setLastResult(res);
  };

  const toolsList: { id: ToolType; label: string; desc: string; icon: any }[] = [
    {
      id: 'search_trains',
      label: '1. search_trains',
      desc: 'Find trains by city/code',
      icon: Search,
    },
    {
      id: 'get_train_schedule',
      label: '2. get_train_schedule',
      desc: 'Station route & timetable',
      icon: Route,
    },
    {
      id: 'get_train_status',
      label: '3. get_train_status',
      desc: 'Live running status & delay',
      icon: Gauge,
    },
    {
      id: 'get_station_info',
      label: '4. get_station_info',
      desc: 'Station info & passing trains',
      icon: Building2,
    },
    {
      id: 'check_seat_availability',
      label: '5. check_seat_availability',
      desc: 'Available/RAC/WL & fare',
      icon: Armchair,
    },
    {
      id: 'get_pnr_status',
      label: '6. get_pnr_status',
      desc: 'PNR quota & confirmation',
      icon: Ticket,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tool Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              MCP Tools Console
            </h2>
            <p className="text-xs text-slate-400">
              Trigger MCP tool calls interactively with typed parameters or preview the raw JSON-RPC payload.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'visual'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visual View
            </button>
            <button
              onClick={() => setViewMode('raw_json')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all font-mono ${
                viewMode === 'raw_json'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MCP JSON-RPC
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {toolsList.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTool(t.id);
                  executeCurrentTool(t.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-950/40 border-orange-500/80 text-white shadow-lg shadow-orange-950/40 ring-1 ring-orange-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white truncate">{t.label}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Controls for Active Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700">
              {selectedTool}()
            </span>
            <span className="text-xs text-slate-400">Configure parameters</span>
          </div>
          <button
            onClick={() => executeCurrentTool()}
            className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            Run Tool
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. search_trains form */}
        {selectedTool === 'search_trains' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Source Station or City
                </label>
                <input
                  type="text"
                  value={searchSrc}
                  onChange={(e) => setSearchSrc(e.target.value)}
                  placeholder="e.g. Bengaluru, SBC, KCG"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Destination Station or City
                </label>
                <input
                  type="text"
                  value={searchDst}
                  onChange={(e) => setSearchDst(e.target.value)}
                  placeholder="e.g. Hyderabad, KCG, MAS"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Travel Date
                </label>
                <input
                  type="text"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder="tomorrow, today, or YYYY-MM-DD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Quick route chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400">Quick routes:</span>
              <button
                onClick={() => {
                  setSearchSrc('Bengaluru');
                  setSearchDst('Hyderabad');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
              >
                Bengaluru ↔ Hyderabad
              </button>
              <button
                onClick={() => {
                  setSearchSrc('Kacheguda');
                  setSearchDst('KSR Bengaluru');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
              >
                Kacheguda ↔ SBC
              </button>
              <button
                onClick={() => {
                  setSearchSrc('Bengaluru');
                  setSearchDst('Chennai');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
              >
                Bengaluru ↔ Chennai
              </button>
              <button
                onClick={() => {
                  setSearchSrc('Mumbai');
                  setSearchDst('Delhi');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
              >
                Mumbai ↔ Delhi
              </button>
            </div>
          </div>
        )}

        {/* 2. get_train_schedule form */}
        {selectedTool === 'get_train_schedule' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Train Number (5 Digits)
                </label>
                <input
                  type="text"
                  value={scheduleTrainNum}
                  onChange={(e) => setScheduleTrainNum(e.target.value)}
                  placeholder="e.g. 12785, 20703, 22691"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col justify-end">
                <span className="text-xs text-slate-400 mb-1">Popular trains:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['12785', '12786', '20703', '22691', '12007', '12951'].map((num) => (
                    <button
                      key={num}
                      onClick={() => setScheduleTrainNum(num)}
                      className={`px-2 py-1 rounded text-xs ${
                        scheduleTrainNum === num
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. get_train_status form */}
        {selectedTool === 'get_train_status' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Train Number
                </label>
                <input
                  type="text"
                  value={statusTrainNum}
                  onChange={(e) => setStatusTrainNum(e.target.value)}
                  placeholder="e.g. 12785"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={statusDate}
                  onChange={(e) => setStatusDate(e.target.value)}
                  placeholder="today, tomorrow, or YYYY-MM-DD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. get_station_info form */}
        {selectedTool === 'get_station_info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Station Code or City Name
                </label>
                <input
                  type="text"
                  value={stationQuery}
                  onChange={(e) => setStationQuery(e.target.value)}
                  placeholder="e.g. SBC, KCG, SC, NDLS, Bengaluru"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col justify-end">
                <span className="text-xs text-slate-400 mb-1">Quick stations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['SBC', 'KCG', 'SC', 'MAS', 'NDLS', 'MMCT'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setStationQuery(code)}
                      className={`px-2 py-1 rounded text-xs ${
                        stationQuery === code
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. check_seat_availability form */}
        {selectedTool === 'check_seat_availability' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Train Number
                </label>
                <input
                  type="text"
                  value={availTrainNum}
                  onChange={(e) => setAvailTrainNum(e.target.value)}
                  placeholder="e.g. 12785"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Travel Date
                </label>
                <input
                  type="text"
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  placeholder="tomorrow, today, or YYYY-MM-DD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Coach Class
                </label>
                <select
                  value={availClass}
                  onChange={(e) => setAvailClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="3A">3A - AC 3 Tier</option>
                  <option value="2A">2A - AC 2 Tier</option>
                  <option value="1A">1A - AC First Class</option>
                  <option value="SL">SL - Sleeper</option>
                  <option value="CC">CC - AC Chair Car</option>
                  <option value="EC">EC - Exec Chair Car</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 6. get_pnr_status form */}
        {selectedTool === 'get_pnr_status' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  10-Digit PNR Number
                </label>
                <input
                  type="text"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value)}
                  placeholder="e.g. 4231892011"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono text-sm tracking-wider"
                />
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-xs text-slate-400 mb-1">Try sample PNRs:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setPnrInput('4231892011');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono ${
                      pnrInput === '4231892011'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    4231892011 (CNF)
                  </button>
                  <button
                    onClick={() => {
                      setPnrInput('6521908432');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono ${
                      pnrInput === '6521908432'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    6521908432 (RAC)
                  </button>
                  <button
                    onClick={() => {
                      setPnrInput('8109234512');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono ${
                      pnrInput === '8109234512'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    8109234512 (WL)
                  </button>
                  <button
                    onClick={() => {
                      setPnrInput('9048123019');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono ${
                      pnrInput === '9048123019'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    9048123019 (Tatkal)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Display Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Tool Execution Result</span>
            {lastResult?.success ? (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> success: true
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-3 h-3" /> success: false
              </span>
            )}
          </div>

          <button
            onClick={copyJson}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* RAW JSON VIEW */}
        {viewMode === 'raw_json' ? (
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400 max-h-[500px]">
            <pre>{JSON.stringify(lastResult, null, 2)}</pre>
          </div>
        ) : (
          /* VISUAL VIEW */
          <div>
            {!lastResult?.success ? (
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 text-rose-300 text-xs">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  {lastResult?.error || 'Execution encountered an error'}
                </div>
                {lastResult?.suggestion && (
                  <p className="text-slate-400 mt-2">{lastResult.suggestion}</p>
                )}
                {lastResult?.available_classes_for_train && (
                  <p className="text-slate-400 mt-2">
                    Available classes on this train: {lastResult.available_classes_for_train.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                {/* Visual rendering per tool */}

                {/* 1. search_trains results */}
                {selectedTool === 'search_trains' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800">
                      <span>{lastResult.message}</span>
                      <span className="font-mono text-orange-400">{lastResult.trains_found} Trains</span>
                    </div>

                    <div className="space-y-3">
                      {lastResult.trains?.map((train: any) => (
                        <div
                          key={train.train_number}
                          className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-base text-amber-400">
                                  {train.train_number}
                                </span>
                                <span className="font-semibold text-white text-sm">
                                  {train.train_name}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {train.train_type}
                                </span>
                                {train.pantry && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <Utensils className="w-2.5 h-2.5" /> Pantry
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {train.runs_on_target_date ? (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  Runs on {lastResult.query.day_of_week}
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                  Not running on {lastResult.query.day_of_week}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-1">
                            {/* Boarding */}
                            <div>
                              <div className="text-xl font-bold text-white font-mono">
                                {train.board_station.departure_time}
                              </div>
                              <div className="text-xs text-slate-300 font-medium">
                                {train.board_station.name} ({train.board_station.code})
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Platform {train.board_station.platform}
                              </div>
                            </div>

                            {/* Duration / Arrow */}
                            <div className="flex flex-col items-center justify-center text-center">
                              <span className="text-xs font-medium text-slate-400 mb-1">
                                {train.duration} • {train.distance_km} km
                              </span>
                              <div className="w-full flex items-center justify-center gap-2">
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-orange-500"></div>
                                <Compass className="w-3.5 h-3.5 text-orange-400" />
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-orange-500 via-slate-700 to-transparent"></div>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                Runs: {train.running_days.join(', ')}
                              </div>
                            </div>

                            {/* Destination */}
                            <div className="sm:text-right">
                              <div className="text-xl font-bold text-white font-mono">
                                {train.destination_station.arrival_time}
                              </div>
                              <div className="text-xs text-slate-300 font-medium">
                                {train.destination_station.name} ({train.destination_station.code})
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Platform {train.destination_station.platform}
                              </div>
                            </div>
                          </div>

                          {/* Quick tool buttons */}
                          <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">Classes:</span>
                              {train.classes_available.map((c: string) => (
                                <button
                                  key={c}
                                  onClick={() => jumpToAvailability(train.train_number, c)}
                                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-300 font-mono transition-colors"
                                  title={`Check availability for ${c}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <button
                                onClick={() => jumpToSchedule(train.train_number)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
                              >
                                <Route className="w-3 h-3 text-orange-400" /> Full Schedule
                              </button>
                              <button
                                onClick={() => jumpToStatus(train.train_number)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
                              >
                                <Gauge className="w-3 h-3 text-emerald-400" /> Live Status
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. get_train_schedule results */}
                {selectedTool === 'get_train_schedule' && (
                  <div className="space-y-5">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-bold text-amber-400">
                            {lastResult.train_number}
                          </span>
                          <span className="font-bold text-white text-base">
                            {lastResult.train_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {lastResult.train_type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {lastResult.origin} ➔ {lastResult.destination} • {lastResult.total_distance_km} km • {lastResult.total_duration}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <button
                          onClick={() => jumpToStatus(lastResult.train_number)}
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-1.5"
                        >
                          <Gauge className="w-3.5 h-3.5" /> Check Live Status
                        </button>
                      </div>
                    </div>

                    {/* Schedule Stepper */}
                    <div className="relative border-l-2 border-orange-500/40 ml-4 pl-6 space-y-4">
                      {lastResult.schedule?.map((stop: any, idx: number) => {
                        const isFirst = idx === 0;
                        const isLast = idx === (lastResult.schedule.length - 1);
                        return (
                          <div key={stop.stop_number} className="relative group">
                            {/* Circle marker */}
                            <div
                              className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                                isFirst || isLast
                                  ? 'bg-orange-500 border-white ring-4 ring-orange-500/20'
                                  : 'bg-slate-900 border-orange-400'
                              }`}
                            ></div>

                            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500 font-mono">
                                    #{stop.stop_number}
                                  </span>
                                  <span className="font-bold text-white text-sm">
                                    {stop.station_name}
                                  </span>
                                  <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                                    {stop.station_code}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    Platform {stop.platform_number}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Day {stop.day_count} • {stop.distance_from_origin_km} km from start
                                  {stop.halt_duration_minutes > 0 && ` • Halt: ${stop.halt_duration_minutes} mins`}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs font-mono">
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Arrival</span>
                                  <span className="text-slate-200 font-bold">{stop.arrival_time}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Departure</span>
                                  <span className="text-slate-200 font-bold">{stop.departure_time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. get_train_status results */}
                {selectedTool === 'get_train_status' && lastResult.current_status && (
                  <div className="space-y-5">
                    {/* Status Hero Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-bold text-amber-400">
                              {lastResult.train_number}
                            </span>
                            <span className="font-bold text-white text-base">
                              {lastResult.train_name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {lastResult.source} ➔ {lastResult.destination}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              lastResult.current_status.status_category === 'ON_TIME'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : lastResult.current_status.status_category === 'SLIGHT_DELAY'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {lastResult.current_status.delay_text}
                          </span>
                        </div>
                      </div>

                      {/* Current Status Message */}
                      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
                        <Gauge className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>{lastResult.current_status.status_summary}</span>
                      </div>

                      {/* Speedometer & Progress */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 text-center">
                          <span className="text-[11px] text-slate-400 block">Current Speed</span>
                          <span className="text-2xl font-bold font-mono text-white">
                            {lastResult.current_status.current_speed_kmh}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1">km/h</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 text-center">
                          <span className="text-[11px] text-slate-400 block">Covered Distance</span>
                          <span className="text-2xl font-bold font-mono text-white">
                            {lastResult.current_status.journey_progress.distance_covered_km}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1">
                            / {lastResult.current_status.journey_progress.total_distance_km} km
                          </span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 text-center">
                          <span className="text-[11px] text-slate-400 block">Journey Completed</span>
                          <span className="text-2xl font-bold font-mono text-orange-400">
                            {lastResult.current_status.journey_progress.percentage_completed}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, lastResult.current_status.journey_progress.percentage_completed)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Station Stops Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Last Reported Station
                          </span>
                          <div className="font-bold text-white text-sm mt-1">
                            {lastResult.current_status.last_reported_station.name} (
                            {lastResult.current_status.last_reported_station.code})
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
                            <span>Sched: {lastResult.current_status.last_reported_station.scheduled_departure}</span>
                            <span className="text-orange-400">
                              Actual: {lastResult.current_status.last_reported_station.actual_departure}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Next Upcoming Station
                          </span>
                          <div className="font-bold text-white text-sm mt-1">
                            {lastResult.current_status.next_upcoming_station.name} (
                            {lastResult.current_status.next_upcoming_station.code})
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
                            <span>Sched: {lastResult.current_status.next_upcoming_station.scheduled_arrival}</span>
                            <span className="text-emerald-400">
                              Expected: {lastResult.current_status.next_upcoming_station.expected_arrival}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. get_station_info results */}
                {selectedTool === 'get_station_info' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-bold text-amber-400">
                            {lastResult.station_code}
                          </span>
                          <span className="font-bold text-white text-base">
                            {lastResult.station_name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {lastResult.city}, {lastResult.state} • {lastResult.railway_zone}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 self-start sm:self-auto">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-orange-400">
                          {lastResult.total_passing_trains} Passing Trains
                        </span>
                      </div>
                    </div>

                    {/* Passing Trains List */}
                    <div className="space-y-2.5">
                      {lastResult.trains?.map((t: any) => (
                        <div
                          key={t.train_number}
                          className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {t.train_number}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {t.train_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {t.route_summary} • Platform {t.platform}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded ${
                                t.role_at_station === 'Originating'
                                  ? 'bg-blue-500/15 text-blue-400'
                                  : t.role_at_station === 'Terminating'
                                  ? 'bg-purple-500/15 text-purple-400'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {t.role_at_station}
                            </span>
                            <div className="font-mono text-slate-200">
                              Arr: {t.arrival} | Dep: {t.departure}
                            </div>
                            <button
                              onClick={() => jumpToSchedule(t.train_number)}
                              className="text-orange-400 hover:text-orange-300 font-medium text-xs ml-1"
                            >
                              Route ➔
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. check_seat_availability results */}
                {selectedTool === 'check_seat_availability' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-bold text-amber-400">
                              {lastResult.train_number}
                            </span>
                            <span className="font-bold text-white text-base">
                              {lastResult.train_name}
                            </span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-600 text-white">
                              {lastResult.class_code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {lastResult.origin} ➔ {lastResult.destination} • Date: {lastResult.journey_date}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-4 py-2 rounded-xl text-center border font-mono font-bold text-sm ${
                            lastResult.category === 'AVAILABLE'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : lastResult.category === 'RAC'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                          }`}
                        >
                          {lastResult.availability_status}
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                        {lastResult.status_detail}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[11px] text-slate-400 block">Quota</span>
                          <span className="text-sm font-semibold text-white">
                            {lastResult.quota}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[11px] text-slate-400 block">Confirmation Probability</span>
                          <span className="text-sm font-semibold text-emerald-400">
                            {lastResult.confirmation_probability_percentage}%
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[11px] text-slate-400 block">Estimated Fare</span>
                          <span className="text-sm font-bold text-white font-mono">
                            {lastResult.estimated_fare_inr}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. get_pnr_status results */}
                {selectedTool === 'get_pnr_status' && (
                  <div className="space-y-5">
                    {/* Hero Header */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">PNR:</span>
                            <span className="font-mono text-xl font-bold text-amber-400 tracking-wider">
                              {lastResult.pnr_number}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded bg-orange-600 text-white font-bold font-mono">
                              {lastResult.class_code}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-white mt-1">
                            {lastResult.train_name} ({lastResult.train_number}) • {lastResult.train_type}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {lastResult.boarding_station?.name} ({lastResult.boarding_station?.code}) ➔{' '}
                            {lastResult.destination_station?.name} ({lastResult.destination_station?.code})
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1.5">
                          <div className="flex items-center gap-2">
                            {/* Chart Status Badge */}
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                                lastResult.chart_status === 'CHART PREPARED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {lastResult.chart_status}
                            </span>

                            {/* Overall Status Badge */}
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-bold font-mono border ${
                                lastResult.overall_category === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : lastResult.overall_category === 'RAC'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              {lastResult.overall_status}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Journey Date: <strong className="text-white">{lastResult.journey_date}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Quota & Confirmation Probability Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                        {/* Passenger Quota Card */}
                        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                            Passenger Quota
                          </span>
                          <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-orange-400" />
                            {lastResult.passenger_quota}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {lastResult.passenger_quota?.includes('General')
                              ? 'Standard General GN Quota booking'
                              : lastResult.passenger_quota?.includes('Tatkal')
                              ? 'Emergency Tatkal premium reservation'
                              : 'Special concession reservation quota'}
                          </p>
                        </div>

                        {/* Confirmation Probability Gauge Card */}
                        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 sm:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                              Current Confirmation Probability
                            </span>
                            <span
                              className={`text-sm font-bold font-mono ${
                                (lastResult.confirmation_probability_percentage || 0) >= 80
                                  ? 'text-emerald-400'
                                  : (lastResult.confirmation_probability_percentage || 0) >= 50
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {lastResult.confirmation_probability_percentage}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-700 ${
                                (lastResult.confirmation_probability_percentage || 0) >= 80
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                  : (lastResult.confirmation_probability_percentage || 0) >= 50
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                  : 'bg-gradient-to-r from-rose-500 to-orange-400'
                              }`}
                              style={{
                                width: `${lastResult.confirmation_probability_percentage || 0}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                            <span>
                              {lastResult.overall_category === 'CONFIRMED'
                                ? 'Berth is confirmed and confirmed seats are guaranteed.'
                                : lastResult.overall_category === 'RAC'
                                ? 'RAC ticket allows travel. High probability of full berth conversion upon charting.'
                                : 'Waitlisted ticket. Boarding requires ticket to reach RAC or Confirmed before charting.'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Passenger Details List */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-orange-400" />
                            Passenger Breakdown ({lastResult.total_passengers} Passenger
                            {(lastResult.total_passengers || 0) > 1 ? 's' : ''})
                          </span>
                        </div>

                        <div className="space-y-3">
                          {lastResult.passengers?.map((p: any) => (
                            <div
                              key={p.passenger_number}
                              className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-orange-400">
                                  #{p.passenger_number}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span>Passenger {p.passenger_number}</span>
                                    <span
                                      className={`text-[10px] px-2 py-0.2 rounded font-mono font-bold ${
                                        p.current_status === 'CNF'
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : p.current_status.startsWith('RAC')
                                          ? 'bg-amber-500/20 text-amber-400'
                                          : 'bg-rose-500/20 text-rose-400'
                                      }`}
                                    >
                                      {p.current_status}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Booking Status: <span className="text-slate-300 font-mono">{p.booking_status}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Coach</span>
                                  <span className="font-bold text-white font-mono">{p.coach}</span>
                                </div>

                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Berth</span>
                                  <span className="font-bold text-amber-400 font-mono">
                                    {p.berth_number ? p.berth_number : '--'}
                                  </span>
                                </div>

                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-left min-w-[130px]">
                                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Berth Type</span>
                                  <span className="font-medium text-slate-200 text-[11px] truncate block">
                                    {p.berth_type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
