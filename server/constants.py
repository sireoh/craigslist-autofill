from pathlib import Path


HEADERS = {  # unchanged
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0.0.0 Safari/537.36"
    )
}

# Config Paths

OUTPUT_DIR = Path("outputs")
OUTPUT_CONFIG_PATH = OUTPUT_DIR / "outputs_config.json"

LISTINGS_DIR = Path("listings")
LISTINGS_CONFIG_PATH = LISTINGS_DIR / "listings_config.json"

SAMPLE_SIZE = 13
