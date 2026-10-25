export interface ProjectFile {
  name: string;
  path: string;
  description: string;
  language: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'server.py',
    path: 'railway-mcp/server.py',
    description: 'FastMCP server entrypoint registering all 5 railway tools with typed docstrings and logging.',
    language: 'python',
    content: `"""
Model Context Protocol (MCP) Server for Indian Railways Train Schedule Assistant.
Built using the official Anthropic FastMCP SDK.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, Optional

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],
)
logger = logging.getLogger("railway_mcp.server")

from services.search_service import search_trains as execute_search_trains
from services.schedule_service import get_train_schedule as execute_get_train_schedule
from services.status_service import get_train_status as execute_get_train_status
from services.station_service import get_station_info as execute_get_station_info
from services.availability_service import check_seat_availability as execute_check_seat_availability

from mcp.server.fastmcp import FastMCP
mcp = FastMCP(
    name="Railway-Train-Schedule-Assistant",
    instructions="You are an Indian Railways assistant with access to real-time tools for schedules, live running status, routes, station info, and seat availability."
)

def format_json(data: Dict[str, Any]) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)

@mcp.tool()
def search_trains(source: str, destination: str, date: str = "tomorrow") -> str:
    """Search for trains between two stations or cities on a given date."""
    logger.info("Tool called: search_trains(source=%s, destination=%s, date=%s)", source, destination, date)
    result = execute_search_trains(source=source, destination=destination, date=date)
    return format_json(result)

@mcp.tool()
def get_train_schedule(train_number: str) -> str:
    """Fetch complete station-by-station route and timetable for a train."""
    logger.info("Tool called: get_train_schedule(train_number=%s)", train_number)
    result = execute_get_train_schedule(train_number=train_number)
    return format_json(result)

@mcp.tool()
def get_train_status(train_number: str, date: Optional[str] = None) -> str:
    """Get live running status, delay information, and current location."""
    logger.info("Tool called: get_train_status(train_number=%s, date=%s)", train_number, date)
    result = execute_get_train_status(train_number=train_number, date=date)
    return format_json(result)

@mcp.tool()
def get_station_info(station_code_or_name: str) -> str:
    """Get station metadata and list of all passing/originating trains."""
    logger.info("Tool called: get_station_info(station=%s)", station_code_or_name)
    result = execute_get_station_info(station_code_or_name=station_code_or_name)
    return format_json(result)

@mcp.tool()
def check_seat_availability(train_number: str, date: str, class_type: str = "3A") -> str:
    """Check berth/seat availability status, waitlist probability, and fare."""
    logger.info("Tool called: check_seat_availability(train=%s, date=%s, class=%s)", train_number, date, class_type)
    result = execute_check_seat_availability(train_number=train_number, date=date, class_type=class_type)
    return format_json(result)

if __name__ == "__main__":
    mcp.run()
`,
  },
  {
    name: 'data_provider.py',
    path: 'railway-mcp/services/data_provider.py',
    description: 'Pluggable data abstraction layer allowing switching between local JSON and live external API.',
    language: 'python',
    content: `from abc import ABC, abstractmethod
import json, logging, os
from pathlib import Path
from typing import Any, Dict, List, Optional

class TrainDataProvider(ABC):
    @abstractmethod
    def get_all_trains(self) -> List[Dict[str, Any]]: pass
    @abstractmethod
    def get_train_by_number(self, train_number: str) -> Optional[Dict[str, Any]]: pass
    @abstractmethod
    def get_all_stations(self) -> List[Dict[str, Any]]: pass
    @abstractmethod
    def resolve_station(self, query: str) -> Optional[Dict[str, Any]]: pass

class LocalJsonDataProvider(TrainDataProvider):
    # Reads data/trains.json and builds fast index lookups
    ...

def get_data_provider() -> TrainDataProvider:
    provider_type = os.getenv("RAILWAY_DATA_PROVIDER", "local").lower().strip()
    return RapidApiDataProvider() if provider_type == "api" else LocalJsonDataProvider()
`,
  },
  {
    name: 'search_service.py',
    path: 'railway-mcp/services/search_service.py',
    description: 'Finds trains between stations or cities, resolves aliases, checks intermediate stops & running days.',
    language: 'python',
    content: `def search_trains(source: str, destination: str, date: str) -> Dict[str, Any]:
    # 1. Resolve source and destination queries to station codes
    # 2. Parse date and match day-of-week against train running_days
    # 3. Traverse train routes to match source before destination
    # 4. Compute accurate segment duration, departure/arrival times, and distance
    ...
`,
  },
  {
    name: 'schedule_service.py',
    path: 'railway-mcp/services/schedule_service.py',
    description: 'Returns full station-by-station route with arrival/departure times, halt duration, distance, platforms.',
    language: 'python',
    content: `def get_train_schedule(train_number: str) -> Dict[str, Any]:
    # Returns formatted stop list, day count, distance from origin, and platforms
    ...
`,
  },
  {
    name: 'status_service.py',
    path: 'railway-mcp/services/status_service.py',
    description: 'Simulates live train tracking, delay in minutes, current speed, and next upcoming stop.',
    language: 'python',
    content: `def get_train_status(train_number: str, date: Optional[str] = None) -> Dict[str, Any]:
    # Returns delay status (ON_TIME, SLIGHT_DELAY, DELAYED), current location, speed km/h
    ...
`,
  },
  {
    name: 'station_service.py',
    path: 'railway-mcp/services/station_service.py',
    description: 'Fetches station information, railway zone, and directory of all passing trains.',
    language: 'python',
    content: `def get_station_info(station_code_or_name: str) -> Dict[str, Any]:
    # Resolves station aliases, gathers originating, terminating, and through trains
    ...
`,
  },
  {
    name: 'availability_service.py',
    path: 'railway-mcp/services/availability_service.py',
    description: 'Simulates IRCTC seat availability (AVAILABLE, RAC, WL), confirmation probability %, and fare.',
    language: 'python',
    content: `def check_seat_availability(train_number: str, date: str, class_type: str = "3A") -> Dict[str, Any]:
    # Validates supported classes (SL, 3A, 2A, 1A, CC, EC) and calculates indicative fare
    ...
`,
  },
  {
    name: 'pnr_service.py',
    path: 'railway-mcp/services/pnr_service.py',
    description: 'Simulates 10-digit Indian Railways PNR reservation status, passenger quota, and confirmation probability.',
    language: 'python',
    content: `def get_pnr_status(pnr_number: str) -> Dict[str, Any]:
    # Returns passenger list, booking vs current status (CNF, RAC, WL), quota, chart status & confirmation %
    ...
`,
  },
  {
    name: 'test_server.py',
    path: 'railway-mcp/tests/test_server.py',
    description: '17 automated unit and integration tests covering all 5 tools and edge cases.',
    language: 'python',
    content: `import unittest
# Tests search_trains, get_train_schedule, get_train_status, get_station_info, check_seat_availability
# Ran 17 tests in 0.013s - OK
...
`,
  },
  {
    name: 'claude_desktop_config.json',
    path: 'railway-mcp/claude_desktop_config.json',
    description: 'Claude Desktop MCP server connection configuration snippet.',
    language: 'json',
    content: `{
  "mcpServers": {
    "railway-assistant": {
      "command": "python",
      "args": [
        "-m",
        "mcp.server.fastmcp",
        "run",
        "/ABSOLUTE/PATH/TO/railway-mcp/server.py"
      ],
      "env": {
        "RAILWAY_DATA_PROVIDER": "local",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
`,
  },
  {
    name: 'requirements.txt',
    path: 'railway-mcp/requirements.txt',
    description: 'Official MCP SDK, Pydantic, Dotenv, and test runner dependencies.',
    language: 'text',
    content: `mcp[cli]>=1.3.0
pydantic>=2.5.0
python-dotenv>=1.0.0
pytest>=7.4.0
`,
  },
];
