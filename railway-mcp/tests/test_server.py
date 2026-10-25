"""
Unit and integration tests for Railway MCP Server services and tools.
Supports execution via both standard library unittest and pytest:
    python3 -m unittest discover -s railway-mcp/tests
    pytest railway-mcp/tests
"""

import os
import sys
import unittest

# Ensure railway-mcp root directory is on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.search_service import search_trains
from services.schedule_service import get_train_schedule
from services.status_service import get_train_status
from services.station_service import get_station_info
from services.availability_service import check_seat_availability
from server import call_tool


class TestSearchTrains(unittest.TestCase):
    """Tests for search_trains tool."""

    def test_search_bengaluru_to_hyderabad(self):
        result = search_trains(source="Bengaluru", destination="Hyderabad", date="tomorrow")
        self.assertTrue(result["success"])
        self.assertGreater(result["trains_found"], 0)
        train_numbers = [t["train_number"] for t in result["trains"]]
        # Expect 12786 (SBC -> KCG) or 20704 (YPR -> KCG)
        self.assertTrue(any(num in ["12786", "20704"] for num in train_numbers))

    def test_search_station_codes_case_insensitive(self):
        result = search_trains(source="kcg", destination="sbc", date="2026-11-01")
        self.assertTrue(result["success"])
        self.assertGreater(result["trains_found"], 0)
        self.assertEqual(result["trains"][0]["train_number"], "12785")
        self.assertEqual(result["trains"][0]["board_station"]["code"], "KCG")
        self.assertEqual(result["trains"][0]["destination_station"]["code"], "SBC")

    def test_search_intermediate_route_stops(self):
        # Kurnool (KRNT) to Bengaluru (SBC) should match 12785 which halts at Kurnool
        result = search_trains(source="Kurnool", destination="Bengaluru", date="tomorrow")
        self.assertTrue(result["success"])
        self.assertGreaterEqual(result["trains_found"], 1)
        matched_train = result["trains"][0]
        self.assertEqual(matched_train["board_station"]["code"], "KRNT")

    def test_search_invalid_station(self):
        result = search_trains(source="NonExistentCity123", destination="Hyderabad", date="tomorrow")
        self.assertFalse(result["success"])
        self.assertIn("not recognized", result["error"])
        self.assertEqual(result["trains_found"], 0)

    def test_search_invalid_date(self):
        result = search_trains(source="SBC", destination="KCG", date="not-a-valid-date")
        self.assertFalse(result["success"])
        self.assertIn("Invalid date format", result["error"])


class TestTrainSchedule(unittest.TestCase):
    """Tests for get_train_schedule tool."""

    def test_get_valid_schedule_12785(self):
        result = get_train_schedule("12785")
        self.assertTrue(result["success"])
        self.assertEqual(result["train_number"], "12785")
        self.assertIn("Kacheguda Superfast", result["train_name"])
        self.assertEqual(result["total_stops"], 9)
        self.assertEqual(result["schedule"][0]["station_code"], "KCG")
        self.assertEqual(result["schedule"][-1]["station_code"], "SBC")
        self.assertEqual(result["total_distance_km"], 622)

    def test_get_invalid_train_schedule(self):
        result = get_train_schedule("99999")
        self.assertFalse(result["success"])
        self.assertIn("not found", result["error"])
        self.assertIn("suggestion", result)

    def test_get_empty_train_schedule(self):
        result = get_train_schedule("")
        self.assertFalse(result["success"])
        self.assertIn("cannot be empty", result["error"])


class TestTrainStatus(unittest.TestCase):
    """Tests for get_train_status tool."""

    def test_get_valid_status_12785(self):
        result = get_train_status("12785", "today")
        self.assertTrue(result["success"])
        self.assertEqual(result["train_number"], "12785")
        self.assertIn("current_status", result)
        status = result["current_status"]
        self.assertIn("delay_minutes", status)
        self.assertIn("delay_text", status)
        self.assertIn("last_reported_station", status)
        self.assertIn("next_upcoming_station", status)

    def test_get_status_invalid_train(self):
        result = get_train_status("00000")
        self.assertFalse(result["success"])
        self.assertIn("not found", result["error"])


class TestStationInfo(unittest.TestCase):
    """Tests for get_station_info tool."""

    def test_get_station_by_code(self):
        result = get_station_info("SBC")
        self.assertTrue(result["success"])
        self.assertEqual(result["station_code"], "SBC")
        self.assertEqual(result["city"], "Bengaluru")
        self.assertGreater(result["total_passing_trains"], 0)

    def test_get_station_by_city_alias(self):
        result = get_station_info("Bangalore")
        self.assertTrue(result["success"])
        self.assertIn(result["station_code"], ["SBC", "YPR", "SMVB"])

    def test_get_station_unknown(self):
        result = get_station_info("Atlantis")
        self.assertFalse(result["success"])
        self.assertIn("could not be identified", result["error"])


class TestSeatAvailability(unittest.TestCase):
    """Tests for check_seat_availability tool."""

    def test_check_availability_valid_class(self):
        result = check_seat_availability(train_number="12785", date="tomorrow", class_type="3A")
        self.assertTrue(result["success"])
        self.assertEqual(result["train_number"], "12785")
        self.assertEqual(result["class_code"], "3A")
        self.assertIn(result["category"], ["AVAILABLE", "RAC", "WAITLIST"])
        self.assertIn("estimated_fare_inr", result)
        self.assertGreater(result["confirmation_probability_percentage"], 0)

    def test_check_availability_unsupported_class(self):
        # Train 20703 (Vande Bharat) only has CC and EC, not SL
        result = check_seat_availability(train_number="20703", date="tomorrow", class_type="SL")
        self.assertFalse(result["success"])
        self.assertIn("not offered", result["error"])
        self.assertIn("available_classes_for_train", result)
        self.assertIn("CC", result["available_classes_for_train"])


class TestPnrStatus(unittest.TestCase):
    """Tests for get_pnr_status tool."""

    def test_valid_pnr_status(self):
        from services.pnr_service import get_pnr_status
        result = get_pnr_status("4231892011")
        self.assertTrue(result["success"])
        self.assertEqual(result["pnr_number"], "4231892011")
        self.assertIn("passenger_quota", result)
        self.assertIn("chart_status", result)
        self.assertIn("confirmation_probability_percentage", result)
        self.assertGreater(len(result["passengers"]), 0)
        p1 = result["passengers"][0]
        self.assertIn("booking_status", p1)
        self.assertIn("current_status", p1)

    def test_invalid_pnr_length(self):
        from services.pnr_service import get_pnr_status
        result = get_pnr_status("12345")
        self.assertFalse(result["success"])
        self.assertIn("Invalid PNR format", result["error"])

    def test_empty_pnr(self):
        from services.pnr_service import get_pnr_status
        result = get_pnr_status("")
        self.assertFalse(result["success"])
        self.assertIn("cannot be empty", result["error"])


class TestCallToolHelper(unittest.TestCase):
    """Tests for direct programmatic tool runner."""

    def test_call_tool_dispatch(self):
        res = call_tool("get_train_schedule", train_number="12785")
        self.assertTrue(res["success"])
        self.assertEqual(res["train_number"], "12785")

    def test_call_tool_unknown(self):
        with self.assertRaises(ValueError):
            call_tool("non_existent_tool")


if __name__ == "__main__":
    unittest.main()
