from typing import Dict


progress_state: Dict = {
    "phase": "idle",  # idle | scraping | details | done
    "current": 0,
    "total": 0,
    "listings": [],  # progressively-filled list of dicts
}
