"""
Data provider interface and local JSON implementation.
Supports swapping between local dataset and external live APIs (like RapidAPI IRCTC).
"""

from abc import ABC, abstractmethod
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("railway_mcp.data_provider")


class TrainDataProvider(ABC):
    """Abstract interface for railway train data access."""

    @abstractmethod
    def get_all_trains(self) -> List[Dict[str, Any]]:
        """Return all trains in the database."""
        pass

    @abstractmethod
    def get_train_by_number(self, train_number: str) -> Optional[Dict[str, Any]]:
        """Return train dictionary matching the 5-digit train number."""
        pass

    @abstractmethod
    def get_all_stations(self) -> List[Dict[str, Any]]:
        """Return all stations in the database."""
        pass

    @abstractmethod
    def resolve_station(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Resolve a user query (code, station name, or city name) to a station record.
        Case-insensitive and alias-aware.
        """
        pass

    @abstractmethod
    def get_stations_for_query(self, query: str) -> List[Dict[str, Any]]:
        """
        Return all stations associated with a city name or alias.
        For example 'Bengaluru' matches SBC, YPR, SMVB.
        """
        pass


class LocalJsonDataProvider(TrainDataProvider):
    """
    Local JSON-based implementation for development, testing, and offline usage.
    Reads from railway-mcp/data/trains.json.
    """

    def __init__(self, data_path: Optional[str] = None):
        if data_path:
            self.file_path = Path(data_path)
        else:
            # Look relative to this file
            current_dir = Path(__file__).resolve().parent
            default_path = current_dir.parent / "data" / "trains.json"
            self.file_path = default_path

        self._trains: List[Dict[str, Any]] = []
        self._stations: List[Dict[str, Any]] = []
        self._station_lookup: Dict[str, Dict[str, Any]] = {}
        self._city_to_stations: Dict[str, List[Dict[str, Any]]] = {}
        self._load_data()

    def _load_data(self) -> None:
        if not self.file_path.exists():
            logger.error("Trains dataset not found at %s", self.file_path)
            raise FileNotFoundError(f"Trains dataset not found at {self.file_path}")

        logger.info("Loading trains data from %s", self.file_path)
        with open(self.file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self._stations = data.get("stations", [])
        self._trains = data.get("trains", [])

        # Build fast lookup indexes
        for stn in self._stations:
            code = stn["code"].upper()
            self._station_lookup[code] = stn
            aliases = stn.get("aliases", [])
            for alias in aliases:
                norm_alias = alias.strip().lower()
                if norm_alias not in self._station_lookup:
                    self._station_lookup[norm_alias] = stn

            city = stn.get("city", "").strip().lower()
            if city:
                if city not in self._city_to_stations:
                    self._city_to_stations[city] = []
                self._city_to_stations[city].append(stn)

        logger.info(
            "Loaded %d stations and %d trains successfully",
            len(self._stations),
            len(self._trains),
        )

    def get_all_trains(self) -> List[Dict[str, Any]]:
        return self._trains

    def get_train_by_number(self, train_number: str) -> Optional[Dict[str, Any]]:
        clean_num = train_number.strip()
        for t in self._trains:
            if t["train_number"] == clean_num:
                return t
        return None

    def get_all_stations(self) -> List[Dict[str, Any]]:
        return self._stations

    def resolve_station(self, query: str) -> Optional[Dict[str, Any]]:
        if not query:
            return None
        q = query.strip().lower()
        # Direct lookup by uppercase code
        if q.upper() in self._station_lookup:
            return self._station_lookup[q.upper()]
        # Direct alias lookup
        if q in self._station_lookup:
            return self._station_lookup[q]
        # Partial match on name
        for stn in self._stations:
            if q in stn["name"].lower() or q in stn["city"].lower():
                return stn
        return None

    def get_stations_for_query(self, query: str) -> List[Dict[str, Any]]:
        if not query:
            return []
        q = query.strip().lower()
        results: List[Dict[str, Any]] = []
        seen_codes = set()

        # Check city index
        if q in self._city_to_stations:
            for stn in self._city_to_stations[q]:
                if stn["code"] not in seen_codes:
                    results.append(stn)
                    seen_codes.add(stn["code"])

        # Check exact code or alias
        resolved = self.resolve_station(query)
        if resolved and resolved["code"] not in seen_codes:
            results.append(resolved)
            seen_codes.add(resolved["code"])

        # Check station names containing substring
        for stn in self._stations:
            if stn["code"] not in seen_codes:
                if q in stn["name"].lower() or q in stn["city"].lower() or any(q in a.lower() for a in stn.get("aliases", [])):
                    results.append(stn)
                    seen_codes.add(stn["code"])

        return results


class RapidApiDataProvider(TrainDataProvider):
    """
    Example provider for live external Indian Railways API (e.g., RapidAPI / IRCTC).
    Swap to this provider simply by setting RAILWAY_DATA_PROVIDER=api in .env.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("RAPIDAPI_KEY", "")
        self.base_url = os.getenv("RAPIDAPI_BASE_URL", "https://irctc1.p.rapidapi.com")
        self._fallback = LocalJsonDataProvider()
        logger.info("Initialized RapidApiDataProvider (fallback to local if key is unset)")

    def get_all_trains(self) -> List[Dict[str, Any]]:
        # In real integration, fetch from API or return cached trains
        return self._fallback.get_all_trains()

    def get_train_by_number(self, train_number: str) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return self._fallback.get_train_by_number(train_number)
        # HTTP client call could be placed here:
        # response = requests.get(f"{self.base_url}/api/v1/getTrainSchedule", headers={"X-RapidAPI-Key": self.api_key}, params={"trainNo": train_number})
        # return response.json()
        return self._fallback.get_train_by_number(train_number)

    def get_all_stations(self) -> List[Dict[str, Any]]:
        return self._fallback.get_all_stations()

    def resolve_station(self, query: str) -> Optional[Dict[str, Any]]:
        return self._fallback.resolve_station(query)

    def get_stations_for_query(self, query: str) -> List[Dict[str, Any]]:
        return self._fallback.get_stations_for_query(query)


# Global singleton instance
_provider_instance: Optional[TrainDataProvider] = None


def get_data_provider() -> TrainDataProvider:
    """
    Factory function returning the configured TrainDataProvider.
    Controlled by RAILWAY_DATA_PROVIDER environment variable:
    - 'local' (default): Uses LocalJsonDataProvider
    - 'api': Uses RapidApiDataProvider
    """
    global _provider_instance
    if _provider_instance is None:
        provider_type = os.getenv("RAILWAY_DATA_PROVIDER", "local").lower().strip()
        if provider_type == "api":
            logger.info("Configuring RapidAPI data provider")
            _provider_instance = RapidApiDataProvider()
        else:
            logger.info("Configuring Local JSON data provider")
            _provider_instance = LocalJsonDataProvider()
    return _provider_instance
