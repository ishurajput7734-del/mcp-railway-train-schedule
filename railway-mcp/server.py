"""
Model Context Protocol (MCP) Server for Indian Railways Train Schedule Assistant.
Built using the official Anthropic FastMCP SDK.

Allows AI assistants (like Claude Desktop) to answer railway questions:
- "Which trains run from Bengaluru to Hyderabad tomorrow?"
- "What is the schedule of train 12785?"
- "Is 22691 running on time today?"
- "What trains pass through Secunderabad station?"
- "Check 3A seat availability for train 12785 tomorrow."
"""

import json
import logging
import os
import sys
from typing import Any, Dict, Optional

# Add the railway-mcp root directory to Python path for seamless imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],  # Send logs to stderr to keep stdout clean for MCP JSON-RPC
)
logger = logging.getLogger("railway_mcp.server")

# Import the services
from services.search_service import search_trains as execute_search_trains
from services.schedule_service import get_train_schedule as execute_get_train_schedule
from services.status_service import get_train_status as execute_get_train_status
from services.station_service import get_station_info as execute_get_station_info
from services.availability_service import check_seat_availability as execute_check_seat_availability
from services.pnr_service import get_pnr_status as execute_get_pnr_status

# Initialize FastMCP Server
try:
    from mcp.server.fastmcp import FastMCP
    mcp = FastMCP(
        name="Railway-Train-Schedule-Assistant",
        instructions=(
            "You are an Indian Railways assistant. You have access to real-time tools for train search, "
            "station-by-station timetables, live train running status & delays, station info with passing trains, "
            "and seat availability across AC & Sleeper classes. Use these tools to provide accurate, up-to-date, "
            "and helpful travel advice."
        ),
    )
    HAS_FASTMCP = True
except ImportError:
    HAS_FASTMCP = False
    logger.warning("FastMCP SDK not installed in current environment. Direct service functions remain available.")
    mcp = None


def format_json(data: Dict[str, Any]) -> str:
    """Helper to return pretty-formatted JSON string for LLM readability."""
    return json.dumps(data, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# MCP Tools Registration
# ---------------------------------------------------------------------------

if HAS_FASTMCP and mcp is not None:

    @mcp.tool()
    def search_trains(
        source: str,
        destination: str,
        date: str = "tomorrow",
    ) -> str:
        """
        Search for all trains running between two stations or cities on a given date.

        Accepts either 3-4 letter station codes (e.g., 'SBC', 'KCG', 'NDLS', 'MAS')
        or full city names (e.g., 'Bengaluru', 'Bangalore', 'Hyderabad', 'Delhi').
        Returns train numbers, departure/arrival times, travel duration, running days,
        and coach classes offered.

        Args:
            source: Source station code (e.g. 'SBC', 'KCG') or city name (e.g. 'Bengaluru', 'Hyderabad')
            destination: Destination station code or city name
            date: Date in YYYY-MM-DD format, or natural words 'today', 'tomorrow' (default: 'tomorrow')
        """
        logger.info("Tool called: search_trains(source=%s, destination=%s, date=%s)", source, destination, date)
        result = execute_search_trains(source=source, destination=destination, date=date)
        return format_json(result)

    @mcp.tool()
    def get_train_schedule(
        train_number: str,
    ) -> str:
        """
        Fetch the complete station-by-station route and timetable for a train.

        Returns the full stop sequence including arrival and departure times,
        halt duration (in minutes), cumulative distance (in km), platform numbers,
        and day counts along the route.

        Args:
            train_number: 5-digit Indian Railways train number (e.g. '12785', '22691', '20703', '12007')
        """
        logger.info("Tool called: get_train_schedule(train_number=%s)", train_number)
        result = execute_get_train_schedule(train_number=train_number)
        return format_json(result)

    @mcp.tool()
    def get_train_status(
        train_number: str,
        date: Optional[str] = None,
    ) -> str:
        """
        Get the live running status, delay information, and current location of a train.

        Returns whether the train is running on time or delayed (in minutes),
        last reported station, current speed (km/h), and estimated arrival at the next station.

        Args:
            train_number: 5-digit Indian Railways train number (e.g. '12785', '22691')
            date: Journey date in YYYY-MM-DD or 'today' (defaults to today)
        """
        logger.info("Tool called: get_train_status(train_number=%s, date=%s)", train_number, date)
        result = execute_get_train_status(train_number=train_number, date=date)
        return format_json(result)

    @mcp.tool()
    def get_station_info(
        station_code_or_name: str,
    ) -> str:
        """
        Get detailed information about an Indian Railway station and all trains passing through it.

        Returns station code, full name, city, state, railway zone, and a list of all
        originating, terminating, and transit trains with their scheduled halt times and platforms.

        Args:
            station_code_or_name: Station code (e.g. 'SBC', 'KCG', 'NDLS', 'SC') or station/city name (e.g. 'Bengaluru', 'Secunderabad')
        """
        logger.info("Tool called: get_station_info(station=%s)", station_code_or_name)
        result = execute_get_station_info(station_code_or_name=station_code_or_name)
        return format_json(result)

    @mcp.tool()
    def check_seat_availability(
        train_number: str,
        date: str,
        class_type: str = "3A",
    ) -> str:
        """
        Check berth/seat availability status, waitlist probability, and estimated fare for a train journey.

        Returns current status (e.g., 'AVAILABLE-42', 'RAC 12', 'WL 24'), confirmation probability
        score for waitlisted tickets, and approximate fare in INR.

        Args:
            train_number: 5-digit Indian Railways train number (e.g. '12785', '20703')
            date: Journey date in YYYY-MM-DD or 'tomorrow'
            class_type: Coach class code: 'SL' (Sleeper), '3A' (3-Tier AC), '2A' (2-Tier AC), '1A' (1st AC), 'CC' (Chair Car), 'EC' (Exec Chair Car)
        """
        logger.info(
            "Tool called: check_seat_availability(train=%s, date=%s, class=%s)",
            train_number,
            date,
            class_type,
        )
        result = execute_check_seat_availability(train_number=train_number, date=date, class_type=class_type)
        return format_json(result)

    @mcp.tool()
    def get_pnr_status(
        pnr_number: str,
    ) -> str:
        """
        Check 10-digit Indian Railways PNR reservation status, passenger quota, chart status, and confirmation probability.

        Returns booking status (CNF, RAC, WL), current status, coach & berth assignment,
        quota (General, Tatkal, Senior Citizen), chart preparation status, and confirmation chance.

        Args:
            pnr_number: 10-digit Indian Railways PNR number (e.g. '4231892011')
        """
        logger.info("Tool called: get_pnr_status(pnr=%s)", pnr_number)
        result = execute_get_pnr_status(pnr_number=pnr_number)
        return format_json(result)


# Direct programmatic interface for testing and non-MCP invocation
def call_tool(tool_name: str, **kwargs) -> Dict[str, Any]:
    """Execute a tool directly by name with kwargs and return parsed dictionary."""
    tool_map = {
        "search_trains": execute_search_trains,
        "get_train_schedule": execute_get_train_schedule,
        "get_train_status": execute_get_train_status,
        "get_station_info": execute_get_station_info,
        "check_seat_availability": execute_check_seat_availability,
        "get_pnr_status": execute_get_pnr_status,
    }
    if tool_name not in tool_map:
        raise ValueError(f"Unknown tool: '{tool_name}'. Available: {list(tool_map.keys())}")
    return tool_map[tool_name](**kwargs)


if __name__ == "__main__":
    if HAS_FASTMCP and mcp is not None:
        logger.info("Starting Railway MCP Server on stdio transport...")
        mcp.run()
    else:
        print("MCP SDK not detected. Install with: pip install 'mcp[cli]>=1.3.0'")
        sys.exit(1)
