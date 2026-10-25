"""
Train search service for railway assistant.
Finds trains between any source and destination station/city on a given date.
Handles intermediate route stops, day-of-week matching, and city aliases.
"""

from datetime import datetime, timedelta
import logging
from typing import Any, Dict, List, Optional
from services.data_provider import get_data_provider

logger = logging.getLogger("railway_mcp.search_service")

DAY_MAP = {
    0: "Mon",
    1: "Tue",
    2: "Wed",
    3: "Thu",
    4: "Fri",
    5: "Sat",
    6: "Sun",
}


def parse_date_string(date_str: str) -> Optional[datetime]:
    """Parse flexible date strings including YYYY-MM-DD, DD-MM-YYYY, today, tomorrow."""
    clean = date_str.strip().lower()
    now = datetime.now()
    if clean in ("today", "tod"):
        return now
    if clean in ("tomorrow", "tom"):
        return now + timedelta(days=1)
    if clean in ("day after tomorrow", "overmorrow"):
        return now + timedelta(days=2)

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d %b %Y",
        "%d %B %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(clean, fmt)
        except ValueError:
            continue
    return None


def calculate_segment_duration(dep_time_str: str, arr_time_str: str, days_difference: int = 0) -> str:
    """Calculate duration between two HH:MM time strings spanning across days."""
    try:
        dep_h, dep_m = map(int, dep_time_str.split(":"))
        arr_h, arr_m = map(int, arr_time_str.split(":"))

        dep_total = dep_h * 60 + dep_m
        arr_total = (days_difference * 24 * 60) + (arr_h * 60 + arr_m)

        if arr_total < dep_total:
            # Assumed next day if days_difference wasn't already incremented
            arr_total += 24 * 60

        diff_minutes = arr_total - dep_total
        hours = diff_minutes // 60
        mins = diff_minutes % 60
        return f"{hours}h {mins:02d}m"
    except Exception:
        return "--"


def search_trains(
    source: str,
    destination: str,
    date: str,
) -> Dict[str, Any]:
    """
    Search trains connecting source and destination on a specific date.

    Args:
        source: Station code (e.g. SBC, KCG) or city name (e.g. 'Bengaluru', 'Hyderabad')
        destination: Station code or city name
        date: Travel date in 'YYYY-MM-DD' format or natural strings like 'tomorrow'
    """
    provider = get_data_provider()

    # Input validation
    if not source or not source.strip():
        return {
            "success": False,
            "error": "Source station or city cannot be empty.",
            "trains_found": 0,
            "trains": [],
        }

    if not destination or not destination.strip():
        return {
            "success": False,
            "error": "Destination station or city cannot be empty.",
            "trains_found": 0,
            "trains": [],
        }

    parsed_date = parse_date_string(date)
    if not parsed_date:
        return {
            "success": False,
            "error": f"Invalid date format: '{date}'. Please use YYYY-MM-DD or 'tomorrow'.",
            "trains_found": 0,
            "trains": [],
        }

    day_of_week_idx = parsed_date.weekday()
    target_day = DAY_MAP[day_of_week_idx]
    formatted_date = parsed_date.strftime("%Y-%m-%d")

    # Resolve station matches (could be multiple if city has multiple stations like SBC, YPR in Bengaluru)
    src_stations = provider.get_stations_for_query(source)
    dst_stations = provider.get_stations_for_query(destination)

    if not src_stations:
        return {
            "success": False,
            "error": f"Station or city '{source}' not recognized. Try station code (e.g. SBC, NDLS, KCG) or city name.",
            "trains_found": 0,
            "trains": [],
        }

    if not dst_stations:
        return {
            "success": False,
            "error": f"Station or city '{destination}' not recognized. Try station code (e.g. SBC, NDLS, KCG) or city name.",
            "trains_found": 0,
            "trains": [],
        }

    src_codes = {s["code"] for s in src_stations}
    dst_codes = {s["code"] for s in dst_stations}

    matching_trains: List[Dict[str, Any]] = []
    all_trains = provider.get_all_trains()

    for train in all_trains:
        route = train.get("route", [])
        src_stop = None
        dst_stop = None

        # Find matching stop positions along the route
        for stop in route:
            stn_code = stop["station_code"]
            if stn_code in src_codes and src_stop is None:
                src_stop = stop
            elif stn_code in dst_codes and src_stop is not None:
                dst_stop = stop
                break

        if src_stop and dst_stop:
            running_days = train.get("running_days", [])
            runs_on_date = target_day in running_days

            # Segment departure and arrival
            dep_time = src_stop["departure"] if src_stop["departure"] != "--:--" else src_stop["arrival"]
            arr_time = dst_stop["arrival"] if dst_stop["arrival"] != "--:--" else dst_stop["departure"]

            day_span = max(0, dst_stop.get("day_count", 1) - src_stop.get("day_count", 1))
            distance_segment = max(0, dst_stop.get("distance_km", 0) - src_stop.get("distance_km", 0))
            duration_segment = calculate_segment_duration(dep_time, arr_time, day_span)

            matching_trains.append({
                "train_number": train["train_number"],
                "train_name": train["train_name"],
                "train_type": train.get("train_type", "Express"),
                "board_station": {
                    "code": src_stop["station_code"],
                    "name": src_stop["station_name"],
                    "departure_time": dep_time,
                    "platform": src_stop.get("platform", 1),
                },
                "destination_station": {
                    "code": dst_stop["station_code"],
                    "name": dst_stop["station_name"],
                    "arrival_time": arr_time,
                    "platform": dst_stop.get("platform", 1),
                },
                "duration": duration_segment,
                "distance_km": distance_segment,
                "running_days": running_days,
                "runs_on_target_date": runs_on_date,
                "classes_available": train.get("classes", []),
                "pantry": train.get("pantry", False),
            })

    # Sort trains: those running on target date first, then by departure time
    matching_trains.sort(
        key=lambda t: (not t["runs_on_target_date"], t["board_station"]["departure_time"])
    )

    primary_src = src_stations[0]["name"]
    primary_dst = dst_stations[0]["name"]

    return {
        "success": True,
        "query": {
            "source": source,
            "destination": destination,
            "requested_date": formatted_date,
            "day_of_week": target_day,
            "resolved_source_stations": [f"{s['name']} ({s['code']})" for s in src_stations],
            "resolved_destination_stations": [f"{s['name']} ({s['code']})" for s in dst_stations],
        },
        "trains_found": len(matching_trains),
        "trains": matching_trains,
        "message": f"Found {len(matching_trains)} train(s) between {primary_src} and {primary_dst} for {formatted_date} ({target_day}).",
    }
