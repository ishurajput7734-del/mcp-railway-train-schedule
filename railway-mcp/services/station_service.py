"""
Station information service.
Fetches station details, geographic/zone information, and all passing trains.
"""

import logging
from typing import Any, Dict, List
from services.data_provider import get_data_provider

logger = logging.getLogger("railway_mcp.station_service")


def get_station_info(station_code_or_name: str) -> Dict[str, Any]:
    """
    Get detailed station metadata and all trains passing through, originating, or terminating at it.

    Args:
        station_code_or_name: Station code (e.g. 'SBC', 'KCG', 'NDLS') or city/station name ('Bengaluru', 'Hyderabad')
    """
    provider = get_data_provider()

    clean_query = station_code_or_name.strip() if station_code_or_name else ""
    if not clean_query:
        return {
            "success": False,
            "error": "Station code or name cannot be empty. Try 'SBC', 'KCG', 'Bengaluru', or 'Secunderabad'.",
        }

    station = provider.resolve_station(clean_query)
    if not station:
        all_stations = provider.get_all_stations()
        sample_stations = [f"{s['code']} ({s['name']})" for s in all_stations[:6]]
        return {
            "success": False,
            "error": f"Station '{clean_query}' could not be identified.",
            "suggestion": f"Known stations include: {', '.join(sample_stations)}.",
        }

    stn_code = station["code"]
    all_trains = provider.get_all_trains()

    passing_trains: List[Dict[str, Any]] = []

    for train in all_trains:
        route = train.get("route", [])
        for stop in route:
            if stop["station_code"] == stn_code:
                is_origin = (stop["stop_number"] == 1)
                is_destination = (stop["stop_number"] == len(route))

                train_role = "Originating" if is_origin else ("Terminating" if is_destination else "Halt / Transit")

                passing_trains.append({
                    "train_number": train["train_number"],
                    "train_name": train["train_name"],
                    "train_type": train.get("train_type", "Express"),
                    "role_at_station": train_role,
                    "platform": stop.get("platform", 1),
                    "arrival": stop.get("arrival", "--:--"),
                    "departure": stop.get("departure", "--:--"),
                    "halt_minutes": stop.get("halt_minutes", 0),
                    "route_summary": f"{train['source']['code']} -> {train['destination']['code']}",
                    "running_days": train.get("running_days", []),
                })
                break

    # Sort trains chronologically by departure or arrival
    passing_trains.sort(
        key=lambda t: t["departure"] if t["departure"] != "--:--" else t["arrival"]
    )

    return {
        "success": True,
        "station_code": station["code"],
        "station_name": station["name"],
        "city": station.get("city", "Unknown"),
        "state": station.get("state", "Unknown"),
        "railway_zone": station.get("zone", "Indian Railways"),
        "aliases": station.get("aliases", []),
        "total_passing_trains": len(passing_trains),
        "trains": passing_trains,
    }
