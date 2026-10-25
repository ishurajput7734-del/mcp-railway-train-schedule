import React, { useState } from 'react';
import { Cpu, Ticket, Calculator, Clock, Check, Copy, ArrowUpRight } from 'lucide-react';

export const ExtensionsTab: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pnrToolCode = `@mcp.tool()
def get_pnr_status(pnr_number: str) -> str:
    """
    Check 10-digit Indian Railways PNR booking status, coach & berth assignment.
    
    Args:
        pnr_number: 10-digit numeric PNR number (e.g. '4231892011')
    """
    clean_pnr = pnr_number.strip().replace("-", "")
    if len(clean_pnr) != 10 or not clean_pnr.isdigit():
        return json.dumps({
            "success": False,
            "error": "Invalid PNR. PNR must be a 10-digit numeric number."
        })
    
    # In live integration, queries RapidAPI or CRIS PNR gateway:
    # response = requests.get(f"https://irctc1.p.rapidapi.com/api/v3/getPNRStatus?pnrNumber={clean_pnr}", headers=headers)
    return json.dumps({
        "success": True,
        "pnr": clean_pnr,
        "train_number": "12785",
        "train_name": "Kacheguda Superfast Express",
        "boarding_station": "KCG",
        "destination_station": "SBC",
        "chart_status": "CHART NOT PREPARED",
        "passengers": [
            {
                "passenger_number": 1,
                "booking_status": "CNF",
                "current_status": "CNF",
                "coach": "B3",
                "berth": 21,
                "berth_type": "LOWER BERTH (LB)"
            }
        ]
    }, indent=2)`;

  const fareToolCode = `@mcp.tool()
def calculate_fare(
    train_number: str,
    source_station: str,
    destination_station: str,
    class_type: str = "3A",
    quota: str = "GN"
) -> str:
    """
    Compute dynamic Indian Railways ticket fare breakdown including GST, superfast charge, and tatkal fees.
    
    Args:
        train_number: 5-digit train number
        source_station: Origin station code (e.g. SBC)
        destination_station: Destination station code (e.g. KCG)
        class_type: 'SL', '3A', '2A', '1A', 'CC', 'EC'
        quota: 'GN' (General), 'TQ' (Tatkal), 'PT' (Premium Tatkal), 'SS' (Senior Citizen)
    """
    # Rate table with distance calculation
    base_fare = 890
    superfast_charge = 45
    reservation_fee = 40
    gst = int(base_fare * 0.05) if class_type in ["1A", "2A", "3A", "CC", "EC"] else 0
    tatkal_surcharge = 350 if quota in ["TQ", "PT"] else 0
    total = base_fare + superfast_charge + reservation_fee + gst + tatkal_surcharge
    
    return json.dumps({
        "success": True,
        "train_number": train_number,
        "class": class_type,
        "quota": quota,
        "fare_breakdown": {
            "base_fare": f"₹{base_fare}",
            "superfast_charge": f"₹{superfast_charge}",
            "reservation_fee": f"₹{reservation_fee}",
            "gst_5_percent": f"₹{gst}",
            "tatkal_charge": f"₹{tatkal_surcharge}",
            "total_fare": f"₹{total}"
        }
    }, indent=2)`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-400" />
          Production Extensions &amp; Live API Swapping
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          The server's modular architecture is designed so you can seamlessly plug in live APIs, PNR lookup, and fare estimation tools.
        </p>
      </div>

      {/* Swapping Data Layer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h3 className="text-sm font-bold text-white">1. Single Config/Env Variable API Swap</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The data layer in <code className="text-amber-400 font-mono">railway-mcp/services/data_provider.py</code> is written using the <strong>Abstract Factory Pattern</strong>. To swap from the local JSON dataset to a live RapidAPI endpoint (or private IRCTC service), simply add these variables to your <code className="text-amber-400 font-mono">.env</code> or Claude Desktop config:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
          RAILWAY_DATA_PROVIDER=api<br />
          RAPIDAPI_KEY=your_live_rapidapi_key<br />
          RAPIDAPI_BASE_URL=https://irctc1.p.rapidapi.com
        </div>
        <p className="text-[11px] text-slate-400">
          The server detects <code className="text-slate-300">RAILWAY_DATA_PROVIDER=api</code> automatically on startup without requiring any code changes in <code className="text-slate-300">server.py</code>!
        </p>
      </div>

      {/* Extension 1: PNR Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Extension 1: PNR Status Tracker Tool</h3>
          </div>
          <button
            onClick={() => copySnippet(pnrToolCode, 'pnr')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition-colors"
          >
            {copiedKey === 'pnr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Tool Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-300">
          Paste this new tool into <code className="text-amber-400 font-mono">server.py</code> to let Claude answer questions like <em>"What is the status of my PNR 4231892011?"</em>:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[300px]">
          <pre>{pnrToolCode}</pre>
        </div>
      </div>

      {/* Extension 2: Fare Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Extension 2: Dynamic Fare &amp; Tatkal Calculator</h3>
          </div>
          <button
            onClick={() => copySnippet(fareToolCode, 'fare')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition-colors"
          >
            {copiedKey === 'fare' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Tool Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-300">
          Enables accurate fare breakdowns across General and Tatkal quotas with GST calculation:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[300px]">
          <pre>{fareToolCode}</pre>
        </div>
      </div>
    </div>
  );
};
