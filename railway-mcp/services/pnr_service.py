"""
PNR status service.
Simulates fetching Indian Railways 10-digit PNR reservation status,
passenger list, quota, chart status, and confirmation probability.
"""

from datetime import datetime
import hashlib
import logging
from typing import Any, Dict, List, Optional
from services.data_provider import get_data_provider

logger = logging.getLogger("railway_mcp.pnr_service")

QUOTAS = ["General (GN)", "Tatkal (TQ)", "Ladies (LD)", "Senior Citizen (SS)"]
BERTH_TYPES = [
    "Lower Berth (LB)",
    "Middle Berth (MB)",
    "Upper Berth (UB)",
    "Side Lower (SL)",
    "Side Upper (SU)",
]


def get_pnr_status(pnr_number: str) -> Dict[str, Any]:
    """
    Check 10-digit Indian Railways PNR reservation status, passenger details,
    quota, chart preparation status, and confirmation probability.

    Args:
        pnr_number: 10-digit numeric Indian Railways PNR number (e.g. '4231892011')
    """
    provider = get_data_provider()

    clean_pnr = pnr_number.strip().replace("-", "").replace(" ", "") if pnr_number else ""
    if not clean_pnr:
        return {
            "success": False,
            "error": "PNR number cannot be empty. Please provide a valid 10-digit PNR number.",
        }

    if len(clean_pnr) != 10 or not clean_pnr.isdigit():
        return {
            "success": False,
            "error": f"Invalid PNR format: '{pnr_number}'. PNR must be exactly 10 numeric digits.",
            "suggestion": "Sample test PNRs: '4231892011' (Confirmed), '6521908432' (RAC), '8109234512' (Waitlisted).",
        }

    # Deterministic simulation based on PNR number
    hash_val = int(hashlib.md5(clean_pnr.encode()).hexdigest(), 16)

    all_trains = provider.get_all_trains()
    train_idx = hash_val % len(all_trains)
    train = all_trains[train_idx]

    # Quota selection
    quota_idx = (hash_val // 10) % len(QUOTAS)
    quota = QUOTAS[quota_idx]

    # Chart preparation status (40% prepared, 60% not prepared)
    chart_prepared = (hash_val % 10) < 4
    chart_status = "CHART PREPARED" if chart_prepared else "CHART NOT PREPARED"

    # Number of passengers on this PNR (1 to 3)
    num_passengers = 1 + ((hash_val // 100) % 3)

    classes_available = train.get("classes", ["3A"])
    class_code = classes_available[(hash_val // 7) % len(classes_available)]

    passengers: List[Dict[str, Any]] = []

    # Scenario selector: 0-45 (Confirmed), 46-75 (RAC -> CNF or RAC), 76-99 (Waitlisted)
    scenario = hash_val % 100

    if scenario < 50:
        overall_category = "CONFIRMED"
        confirmation_prob = 100
        overall_status_text = "Confirmed"
    elif scenario < 75:
        overall_category = "RAC"
        rac_no = 1 + (hash_val % 18)
        confirmation_prob = max(65, 96 - rac_no * 2)
        overall_status_text = f"RAC {rac_no}"
    else:
        overall_category = "WAITLISTED"
        wl_no = 1 + (hash_val % 35)
        confirmation_prob = max(20, 85 - wl_no * 2)
        overall_status_text = f"WL {wl_no}"

    coach_prefix = "B" if class_code == "3A" else ("A" if class_code == "2A" else ("H" if class_code == "1A" else ("C" if class_code == "CC" else "S")))

    for i in range(1, num_passengers + 1):
        p_hash = hash_val + i * 37
        berth_no = 1 + (p_hash % 64)
        coach_no = f"{coach_prefix}{1 + (p_hash % 6)}"
        berth_type = BERTH_TYPES[p_hash % len(BERTH_TYPES)]

        if overall_category == "CONFIRMED":
            booking_status = "CNF"
            current_status = "CNF"
            coach = coach_no
            berth = berth_no
            b_type = berth_type
        elif overall_category == "RAC":
            p_rac = (hash_val % 15) + i
            booking_status = f"RAC {p_rac + 4}"
            current_status = f"RAC {p_rac}"
            coach = coach_no if chart_prepared else "To be allotted"
            berth = berth_no if chart_prepared else None
            b_type = "Side Lower (RAC)" if chart_prepared else "To be allotted at charting"
        else:
            p_wl = (hash_val % 25) + i
            booking_status = f"GNWL {p_wl + 12}"
            current_status = f"GNWL {p_wl}"
            coach = "None"
            berth = None
            b_type = "No Berth (Waitlisted)"

        passengers.append({
            "passenger_number": i,
            "booking_status": booking_status,
            "current_status": current_status,
            "coach": coach,
            "berth_number": berth,
            "berth_type": b_type,
            "confirmation_probability": confirmation_prob if overall_category != "CONFIRMED" else 100,
        })

    return {
        "success": True,
        "pnr_number": clean_pnr,
        "train_number": train["train_number"],
        "train_name": train["train_name"],
        "train_type": train.get("train_type", "Express"),
        "booking_date": "2026-10-20",
        "journey_date": "2026-10-28",
        "class_code": class_code,
        "passenger_quota": quota,
        "chart_status": chart_status,
        "overall_status": overall_status_text,
        "overall_category": overall_category,
        "confirmation_probability_percentage": confirmation_prob,
        "boarding_station": {
            "code": train["source"]["code"],
            "name": train["source"]["name"],
            "departure_time": train.get("departure_time", "19:05"),
        },
        "destination_station": {
            "code": train["destination"]["code"],
            "name": train["destination"]["name"],
            "arrival_time": train.get("arrival_time", "06:25"),
        },
        "total_passengers": len(passengers),
        "passengers": passengers,
    }
