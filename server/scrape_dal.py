import json
from typing import Optional, cast
from helpers import Helpers
from models import GatherRequest, ScrapeRequest
from bs4 import BeautifulSoup, ResultSet, Tag
import requests
from constants import HEADERS, LISTINGS_CONFIG_PATH, LISTINGS_DIR
import os
from pathlib import Path


def gather_listings(req: Optional[GatherRequest] = None) -> dict[str, str]:
    """
    Gather data from individual listings based on the provided query.
    For now, just logs the URLs that would be scraped.
    """
    # If request is empty, try to read from config.json
    if req is None:
        try:
            # Check if config.json exists
            if not os.path.exists("config.json"):
                return {"message": "config.json file not found"}

            # Read config file
            with open("config.json", "r") as f:
                config = json.load(f)

            # Extract the query from config
            query = config["settings"]["craigslist_query"]["query"]
            req = GatherRequest(query=query)
        except Exception as e:
            return {"message": f"Error reading config.json: {str(e)}"}

    # Build the search URL
    url = f"https://vancouver.craigslist.org/search/hhh?query={req.query}#search=2~gallery~0"

    try:
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return {"message": "Failed to fetch search results"}

    soup = BeautifulSoup(resp.text, "html.parser")
    results = soup.find("ol", class_="cl-static-search-results")
    if results is None or not isinstance(results, Tag):
        return {"message": "No search results found"}

    # Cast to ResultSet[Tag] to satisfy type checker
    anchors = cast(ResultSet[Tag], results.find_all("a", href=True, recursive=True))
    all_urls: list[str] = []

    # Default to 65 if max_results is None (as per GatherRequest model)
    max_results = req.max_results if req.max_results is not None else 65
    # Ensure we don't exceed available listings
    max_results = min(max_results, len(anchors))

    print(f"Max results setting: {max_results}, Total anchors found: {len(anchors)}")

    for a in anchors[:max_results]:
        href = a["href"]
        href_str = str(href)
        full_url = (
            href_str
            if href_str.startswith("http")
            else f"https://vancouver.craigslist.org{href_str}"
        )
        all_urls.append(full_url)

    # Create directories if they don't exist
    LISTINGS_DIR.mkdir(parents=True, exist_ok=True)

    # Get current index and create filename
    current_index = Helpers.get_current_index(LISTINGS_CONFIG_PATH)
    padded_index = f"{current_index:02d}"  # Formats as 00, 01, etc.
    output_filename = LISTINGS_DIR / f"listings_{padded_index}.json"

    # Write the URLs to file
    with open(output_filename, "w") as f:
        json.dump({"data": all_urls}, f, indent=2)

    # Increment the index for next time
    Helpers.increment_index(LISTINGS_CONFIG_PATH)

    if not all_urls:
        return {"message": "No listings found in search results"}

    return {
        "message": f"Found {len(all_urls)} listings to scrape",
        "output_file": str(output_filename),
    }


def scrape_data(req: Optional[ScrapeRequest] = None):
    # If request is provided, use the specified listingsdoc_id
    if req is not None and req.listingsdoc_id:
        # Here you would implement the scraping with the provided ID
        return {"message": f"Scraping with provided ID: {req.listingsdoc_id}"}

    # If no request is provided, check for listings directory and config
    listings_dir = Path("listings")

    # Check if listings directory exists
    if not listings_dir.exists() or not listings_dir.is_dir():
        return {"message": "/listings directory doesn't exist."}

    config_path = listings_dir / "listings_config.json"

    # Check if config file exists
    if not config_path.exists():
        return {"message": "listings_config.json doesn't exist in /listings directory."}

    # Read the config file
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            current_index = config.get("current_index")

            if current_index is None:
                return {"message": "current_index not found in listings_config.json"}

            # Convert to 0-based index (subtract 1)
            zero_based_index = current_index - 1
            if zero_based_index < 0:  # Handle case where current_index was 0
                return {"message": "No listings files available (current_index is 0)"}

            # Format the filename with leading zero for single-digit numbers
            filename = f"listings_{zero_based_index:02d}.json"
            file_path = listings_dir / filename

            if not file_path.exists():
                return {
                    "message": f"File {filename} doesn't exist in /listings directory"
                }

            # Here you would implement the scraping using the found file
            return {
                "message": f"Scraping with most recent listings file: {filename}",
                "file_path": str(file_path),
            }

    except json.JSONDecodeError:
        return {"message": "listings_config.json contains invalid JSON"}
    except Exception as e:
        return {"message": f"An error occurred: {str(e)}"}
