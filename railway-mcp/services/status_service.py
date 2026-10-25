"""
Train live running status service.
Simulates realistic real-time train tracking, current position, speed, and delays.
"""

from datetime import datetime, timedelta
import hashlib
import logging
from typing import Any, Dict, Optional
from services.data_provider import get_data_provider
from services.search_service import parse_date_string

logger = logging.getLogger("railway_mcp.status_service")


def get_train_status(train_number: str, date: Optional[str] = None) -> Dict[str, Any]:
    """
    Get live running status and delay information for a train.

    Args:
        train_number: 5-digit Indian Railways train number (e.g. '12785')
        date: Travel date (defaults to today if omitted)
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
        return {
            "success": False,
            "error": f"Train number '{clean_num}' not found.",
        }

    target_date = datetime.now()
    date_str = date.strip() if date else "today"
    parsed_date = parse_date_string(date_str)
    if parsed_date:
        target_date = parsed_date

    date_formatted = target_date.strftime("%Y-%m-%d")

    # Generate deterministic yet realistic live status based on train number + date
    seed_str = f"{clean_num}-{date_formatted}"
    hash_val = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)

    # Delay distribution: 40% on time (< 5m), 40% slight delay (5-30m), 20% moderate delay (30-65m)
    delay_selector = hash_val % 100
    if delay_selector < 40:
        delay_minutes = hash_val % 6
    elif delay_selector < 80:
        delay_minutes = 6 + (hash_val % 25)
    else:
        delay_minutes = 31 + (hash_val % 35)

    route = train.get("route", [])
    if not route:
        return {
            "success": False,
            "error": f"No route information available for train {clean_num}.",
        }

    total_stops = len(route)
    # Pick current simulated stop position along route
    stop_idx = (hash_val // 10) % (total_stops - 1)
    current_station = route[stop_idx]
    next_station = route[min(stop_idx + 1, total_stops - 1)]

    speed_kmh = 65 + (hash_val % 45) if stop_idx < total_stops - 1 else 0

    if delay_minutes == 0:
        delay_text = "Right On Time"
        status_category = "ON_TIME"
    elif delay_minutes <= 15:
        delay_text = f"Delayed by {delay_minutes} mins"
        status_category = "SLIGHT_DELAY"
    else:
        delay_text = f"Delayed by {delay_minutes} mins"
        status_category = "DELAYED"

    total_distance = train.get("distance_km", route[-1].get("distance_km", 0))
    distance_covered = current_station.get("distance_km", 0)
    distance_remaining = max(0, total_distance - distance_covered)

    return {
        "success": True,
        "train_number": train["train_number"],
        "train_name": train["train_name"],
        "journey_date": date_formatted,
        "current_status": {
            "status_summary": f"Departed {current_station['station_name']} ({current_station['station_code']}), proceeding towards {next_station['station_name']} ({next_station['station_code']})",
            "status_category": status_category,
            "delay_minutes": delay_minutes,
            "delay_text": delay_text,
            "current_speed_kmh": speed_kmh,
            "last_reported_station": {
                "code": current_station["station_code"],
                "name": current_station["station_name"],
                "scheduled_departure": current_station.get("departure", "--:--"),
                "actual_departure": f"{current_station.get('departure', '--:--')} (+{delay_minutes}m)" if current_station.get('departure') != '--:--' else '--:--',
                "stop_number": current_station.get("stop_number", 1),
            },
            "next_upcoming_station": {
                "code": next_station["station_code"],
                "name": next_station["station_name"],
                "scheduled_arrival": next_station.get("arrival", "--:--"),
                "expected_arrival": f"{next_station.get('arrival', '--:--')} (+{delay_minutes}m)" if next_station.get('arrival') != '--:--' else '--:--',
                "distance_from_origin_km": next_station.get("distance_km", 0),
                "platform": next_station.get("platform", 1),
            },
            "journey_progress": {
                "distance_covered_km": distance_covered,
                "distance_remaining_km": distance_remaining,
                "total_distance_km": total_distance,
                "percentage_completed": round((distance_covered / total_distance) * 100, 1) if total_distance > 0 else 0,
            },
        },
        "source": f"{train['source']['name']} ({train['source']['code']})",
        "destination": f"{train['destination']['name']} ({train['destination']['code']})",
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
    }
