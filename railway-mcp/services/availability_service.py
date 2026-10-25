"""
Seat availability service.
Simulates realistic IRCTC quota availability, status codes (AVAILABLE, RAC, WL),
and confirmation probability.
"""

from datetime import datetime
import hashlib
import logging
from typing import Any, Dict, Optional
from services.data_provider import get_data_provider
from services.search_service import parse_date_string

logger = logging.getLogger("railway_mcp.availability_service")

# Class code normalization
CLASS_NORMALIZER = {
    "1a": "1A",
    "first ac": "1A",
    "1st ac": "1A",
    "2a": "2A",
    "second ac": "2A",
    "2nd ac": "2A",
    "3a": "3A",
    "third ac": "3A",
    "3rd ac": "3A",
    "3e": "3E",
    "3 ac economy": "3E",
    "cc": "CC",
    "chair car": "CC",
    "ac chair car": "CC",
    "ec": "EC",
    "exec chair car": "EC",
    "executive": "EC",
    "sl": "SL",
    "sleeper": "SL",
    "2s": "2S",
    "second sitting": "2S",
}

# Base fare rate per km multiplier (indicative in INR)
BASE_FARE_PER_KM = {
    "1A": 3.4,
    "2A": 2.1,
    "3A": 1.5,
    "3E": 1.35,
    "EC": 2.8,
    "CC": 1.45,
    "SL": 0.55,
    "2S": 0.28,
}


def check_seat_availability(
    train_number: str,
    date: str,
    class_type: str = "3A",
) -> Dict[str, Any]:
    """
    Check seat availability and booking status for a specific train, travel date, and coach class.

    Args:
        train_number: 5-digit Indian Railways train number (e.g. '12785')
        date: Travel date (e.g. 'YYYY-MM-DD' or 'tomorrow')
        class_type: Coach class code: 'SL', '3A', '2A', '1A', 'CC', 'EC', '2S' (default: '3A')
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

    parsed_date = parse_date_string(date) if date else datetime.now()
    if not parsed_date:
        return {
            "success": False,
            "error": f"Invalid date: '{date}'. Use YYYY-MM-DD or 'tomorrow'.",
        }

    formatted_date = parsed_date.strftime("%Y-%m-%d")

    # Normalize class
    norm_class = CLASS_NORMALIZER.get(class_type.strip().lower(), class_type.strip().upper())
    supported_classes = train.get("classes", [])

    if norm_class not in supported_classes:
        return {
            "success": False,
            "error": f"Class '{norm_class}' is not offered on {train['train_name']} ({clean_num}).",
            "available_classes_for_train": supported_classes,
        }

    # Deterministic simulation based on train, date, and class
    seed_str = f"{clean_num}-{formatted_date}-{norm_class}"
    hash_val = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)

    # 55% chance of AVAILABLE, 25% RAC, 20% Waitlist (WL)
    bucket = hash_val % 100
    if bucket < 55:
        seats_available = 4 + (hash_val % 78)
        status_code = f"AVAILABLE-{seats_available:02d}"
        status_category = "AVAILABLE"
        confirmation_prob = 100
        status_msg = f"{seats_available} seats currently available for booking."
    elif bucket < 80:
        rac_number = 1 + (hash_val % 35)
        status_code = f"RAC {rac_number}"
        status_category = "RAC"
        confirmation_prob = max(60, 95 - rac_number)
        status_msg = f"Reservation Against Cancellation (RAC {rac_number}). High chance of berth confirmation."
    else:
        wl_number = 1 + (hash_val % 45)
        status_code = f"GNWL {wl_number} / WL {wl_number}"
        status_category = "WAITLIST"
        confirmation_prob = max(15, 80 - (wl_number * 2))
        status_msg = f"General Waitlist (WL {wl_number}). Confirmation probability approx {confirmation_prob}%."

    # Indicative fare calculation
    distance_km = train.get("distance_km", 600)
    multiplier = BASE_FARE_PER_KM.get(norm_class, 1.2)
    estimated_fare_inr = int(distance_km * multiplier + 60)  # + reservation/superfast surcharge

    return {
        "success": True,
        "train_number": train["train_number"],
        "train_name": train["train_name"],
        "journey_date": formatted_date,
        "class_code": norm_class,
        "quota": "General (GN)",
        "availability_status": status_code,
        "category": status_category,
        "confirmation_probability_percentage": confirmation_prob,
        "status_detail": status_msg,
        "estimated_fare_inr": f"₹{estimated_fare_inr}",
        "classes_offered_by_train": supported_classes,
        "origin": f"{train['source']['name']} ({train['source']['code']})",
        "destination": f"{train['destination']['name']} ({train['destination']['code']})",
    }
