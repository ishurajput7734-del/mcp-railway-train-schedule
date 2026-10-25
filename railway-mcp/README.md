# Railway Train Schedule MCP Server 🚆

A Model Context Protocol (MCP) server built with Python and the official FastMCP SDK. It equips AI clients like **Claude Desktop**, **Cursor**, or custom LLM agents with real-time Indian Railways tools to search trains, inspect station-by-station timetables, track live running status, query station departures, and check seat availability.

---

## 📁 Project Structure

```text
railway-mcp/
├── server.py                   # FastMCP server entrypoint & tool registrations
├── data/
│   └── trains.json             # 18+ realistic trains & 39 Indian Railway stations
├── services/
│   ├── __init__.py             # Service package marker
│   ├── data_provider.py       # Pluggable data layer (Local JSON ↔ RapidAPI switch)
│   ├── search_service.py       # Route search, day-of-week & intermediate halt matcher
│   ├── schedule_service.py     # Detailed timetable, halts, platforms & distance
│   ├── status_service.py       # Live running status, delay & speed tracker
│   ├── station_service.py      # Station details & transit/originating train directory
│   └── availability_service.py # Quota seat status (AVAILABLE/RAC/WL) & fare calculator
├── tests/
│   └── test_server.py          # Unit & integration test suite (17 comprehensive tests)
├── claude_desktop_config.json  # Ready-to-copy Claude Desktop config
├── requirements.txt            # Python dependencies
└── README.md                   # Setup guide and documentation
```

---

## 🛠️ Tools Implemented

| Tool Name | Parameters | Description |
|---|---|---|
| `search_trains` | `source`, `destination`, `date` (optional, default `"tomorrow"`) | Finds all trains between stations or cities. Resolves codes (`SBC`, `KCG`) or names (`Bengaluru`, `Hyderabad`) and checks intermediate halts. |
| `get_train_schedule` | `train_number` | Station-by-station route with arrival/departure times, halt minutes, platforms, and distance. |
| `get_train_status` | `train_number`, `date` (optional, default `"today"`) | Live running status, current location, speed (km/h), delay minutes, and next stop. |
| `get_station_info` | `station_code_or_name` | Station details (code, city, zone) and list of all originating, terminating, and transit trains. |
| `check_seat_availability` | `train_number`, `date`, `class_type` (default `"3A"`) | Seat availability (`AVAILABLE-XX`, `RAC XX`, `WL XX`), confirmation probability %, and fare in ₹. |

---

## 🚀 Quickstart & Installation

### Step 1: Create a Python Virtual Environment

```bash
cd railway-mcp

# Create virtual environment (Python 3.10+)
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows (cmd.exe):
.venv\Scripts\activate.bat
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Test with FastMCP Inspector

The FastMCP CLI includes an interactive web inspector to inspect tools and run calls:

```bash
mcp dev server.py
```

This launches a local inspector in your browser (usually `http://localhost:5173`) where you can trigger each tool and inspect the JSON output.

### Step 4: Run Direct Unit Tests

```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
# or with pytest:
pytest tests/ -v
```

---

## 🖥️ Claude Desktop Integration

To connect this MCP server to **Claude Desktop**, add the server entry to your Claude configuration file.

### Configuration File Locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### `claude_desktop_config.json` Snippet:

Replace `/ABSOLUTE/PATH/TO/` with the absolute path to your `railway-mcp` directory (and path to your virtualenv's Python binary):

```json
{
  "mcpServers": {
    "railway-assistant": {
      "command": "/ABSOLUTE/PATH/TO/railway-mcp/.venv/bin/python",
      "args": [
        "/ABSOLUTE/PATH/TO/railway-mcp/server.py"
      ],
      "env": {
        "RAILWAY_DATA_PROVIDER": "local",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

> **Windows Tip**: On Windows, use double backslashes:
> `"command": "C:\\Users\\YourUser\\railway-mcp\\.venv\\Scripts\\python.exe"`

Restart Claude Desktop. You will see a 🔨 hammer icon in Claude Desktop confirming the **railway-assistant** tools are active!

---

## 💬 5 Example Prompts to Test with Claude

Try typing these natural language prompts into Claude Desktop:

1. **Route Search**:
   > *"Which trains run from Bengaluru to Hyderabad tomorrow? What are their departure times and travel durations?"*
2. **Detailed Timetable**:
   > *"Show me the full schedule and all halt stations for train 12785 (Kacheguda Superfast). How long does it stop at Kurnool?"*
3. **Live Delay & Status**:
   > *"What is the live running status of train 12785 today? Is it delayed and what is the next upcoming station?"*
4. **Station Departure Directory**:
   > *"What trains pass through or originate from KSR Bengaluru (SBC) station?"*
5. **Seat Availability & Multi-hop Trip Planning**:
   > *"I want to travel from Bengaluru to Hyderabad this weekend. Which train is faster, and can you check 3A seat availability on train 12785?"*

---

## 🔌 Swapping the Data Layer for a Live API

The project includes an extensible abstract class `TrainDataProvider` in `services/data_provider.py`. By default, it reads `data/trains.json`.

To switch to a live Indian Railways API (such as RapidAPI IRCTC):

1. Set your environment variables in `.env`:
   ```bash
   RAILWAY_DATA_PROVIDER=api
   RAPIDAPI_KEY=your_rapidapi_key_here
   RAPIDAPI_BASE_URL=https://irctc1.p.rapidapi.com
   ```
2. The server factory in `services/data_provider.py` automatically routes requests to `RapidApiDataProvider`, which you can customize to query live HTTP endpoints.

---

## 🌟 Suggestions for Extensions

1. **PNR Status Tracker**: Add a `get_pnr_status(pnr_number: str)` tool to parse coach number, berth allocation (LB, MB, UB, SL, SU), chart preparation status, and current passenger status.
2. **Dynamic Ticket-Fare & Concession Calculator**: Add `calculate_fare(train_number, source, destination, class_type, quota, concession)` factoring in dynamic pricing, senior citizen quotas, tatkal charges, and GST.
3. **Tatkal Booking Alarm & Opening Time Advisor**: Add a tool advising users when Tatkal booking opens (10:00 AM for AC, 11:00 AM for Non-AC one day in advance) and automated booking readiness checks.
4. **Platform & Coach Position Locator**: Add detailed coach layout indicators (e.g. Engine -> DL1 -> S1-S7 -> B1-B6 -> A1 -> H1 -> Guard).
