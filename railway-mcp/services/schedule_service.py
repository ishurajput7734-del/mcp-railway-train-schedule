"""
Train schedule service.
Fetches full station-by-station timetable, halt durations, distance and day count.
"""

import logging
from typing import Any, Dict, List
from services.data_provider import get_data_provider

logger = logging.getLogger("railway_mcp.schedule_service")


def get_train_schedule(train_number: str) -> Dict[str, Any]:
    """
    Get full station-by-station timetable for a given train number.

    Args:
        train_number: 5-digit Indian Railways train number (e.g. '12785', '22691')
    """
    provider = get_data_provider()

    clean_num = train_number.strip() if train_number else ""
    if not clean_num:
        return {
            "success": False,
            "error": "Train number cannot be empty. Please provide a 5-digit train number like '12785'.",
        }

    train = provider.get_train_by_number(clean_num)
    if not train:
        # Provide helpful hint of known train numbers
        all_trains = provider.get_all_trains()
        sample_numbers = [f"{t['train_number']} ({t['train_name']})" for t in all_trains[:5]]
        return {
            "success": False,
            "error": f"Train number '{clean_num}' not found in database.",
            "suggestion": f"Sample valid train numbers include: {', '.join(sample_numbers)}.",
        }

    route: List[Dict[str, Any]] = train.get("route", [])
    total_stops = len(route)
    origin_stop = route[0] if route else {}
    final_stop = route[-1] if route else {}

    formatted_stops = []
    for s in route:
        formatted_stops.append({
            "stop_number": s.get("stop_number", 0),
            "station_code": s.get("station_code", ""),
            "station_name": s.get("station_name", ""),
            "arrival_time": s.get("arrival", "--:--"),
            "departure_time": s.get("departure", "--:--"),
            "halt_duration_minutes": s.get("halt_minutes", 0),
            "distance_from_origin_km": s.get("distance_km", 0),
            "day_count": s.get("day_count", 1),
            "platform_number": s.get("platform", 1),
        })

    return {
        "success": True,
        "train_number": train["train_number"],
        "train_name": train["train_name"],
        "train_type": train.get("train_type", "Express"),
        "origin": f"{train['source']['name']} ({train['source']['code']})",
        "destination": f"{train['destination']['name']} ({train['destination']['code']})",
        "total_distance_km": train.get("distance_km", final_stop.get("distance_km", 0)),
        "total_duration": train.get("duration", "N/A"),
        "total_stops": total_stops,
        "running_days": train.get("running_days", []),
        "classes_offered": train.get("classes", []),
        "pantry_car": train.get("pantry", False),
        "schedule": formatted_stops,
    }
