import json
from typing import Optional, cast
from helpers import Helpers
from models import GatherRequest
from bs4 import BeautifulSoup, ResultSet, Tag
import requests
from constants import HEADERS, LISTINGS_CONFIG_PATH, LISTINGS_DIR
import os


def scrape_data():
    pass


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
