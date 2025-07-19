import json
import random
from threading import Thread
from typing import List, cast
import requests
from bs4 import BeautifulSoup, Tag
import time
from helpers import Helpers
from models import ScrapeRequest
from store import progress_state
from constants import HEADERS, OUTPUT_DIR

DEBUG = False


def start_scrape(req: ScrapeRequest) -> None:
    """
    Kick off the two-phase scrape in a background thread.
    Phase 1: collect listing URLs
    Phase 2: fetch details for a random sample of those URLs
    """
    # ---- initialise progress state ----
    progress_state.update(
        {
            "phase": "scraping",
            "current": 0,
            "total": 0,
            "listings": [],
        }
    )

    def run_scraper() -> None:
        # Phase-1 & Phase-2 combined helper
        __get_all_listings(
            query=req.query,
            delay=req.delay or 3,
            max_results=req.max_results or 10,
        )
        progress_state["phase"] = "done"

    Thread(target=run_scraper, daemon=True).start()


def __get_all_listings(
    *,
    query: str,
    delay: int = 3,
    max_results: int = 10,
) -> List[dict]:
    """
    Returns a list of `max_results` listing-detail dicts.
    Progress is exposed through the global `progress_state`.
    """
    # -----------------------------------------------------------------
    # Phase 1 ─ scrape the search results page for *all* listing URLs
    # -----------------------------------------------------------------
    url = (
        "https://vancouver.craigslist.org/search/rds/apa"
        "?housing_type=6&laundry=2"
        f"&query={query}&rent_period=3&sort=rel"
    )

    try:
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
    except requests.RequestException:
        progress_state["phase"] = "done"
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    results = soup.find("ol", class_="cl-static-search-results")
    if not isinstance(results, Tag):
        progress_state["phase"] = "done"
        return []

    anchors = cast(
        List[Tag],
        results.find_all("a", href=True, recursive=True),
    )
    all_urls = [
        (
            str(a["href"])
            if str(a["href"]).startswith("http")
            else f'https://vancouver.craigslist.org{str(a["href"])}'
        )
        for a in anchors
    ]
    if not all_urls:
        progress_state["phase"] = "done"
        return []

    # -----------------------------------------------------------------
    # Phase 2 ─ fetch `max_results` random listings & emit progress
    # -----------------------------------------------------------------
    selected_urls = random.sample(all_urls, min(max_results, len(all_urls)))

    progress_state.update(
        {
            "phase": "details",
            "current": 0,
            "total": len(selected_urls),
            "listings": [],
        }
    )

    listings: List[dict] = []
    for idx, link in enumerate(selected_urls, 1):
        details = __get_listing_details(link)
        if details:
            listings.append(details)
            progress_state["listings"].append(details)

        progress_state["current"] = idx

        if idx < len(selected_urls):  # stagger requests a bit
            time.sleep(random.uniform(delay - 0.5, delay + 0.5))

    # Save final result to file
    output_index = Helpers.get_current_index()
    output_file = OUTPUT_DIR / f"data_{output_index:04d}.json"
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(listings, f, ensure_ascii=False, indent=2)

    Helpers.increment_index()

    return listings


def __get_listing_details(link: str) -> dict:
    try:
        resp = requests.get(link, headers=HEADERS)
        resp.raise_for_status()
    except requests.RequestException:
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")

    title = soup.select_one("#titletextonly")
    price = soup.select_one("span.price")
    posted_date = soup.select_one("p.postinginfo time")
    body = soup.select_one("section#postingbody")

    image_urls = [img["src"] for img in soup.select(".gallery img") if img.get("src")]

    return {
        "title": title.get_text(strip=True) if title else "",
        "price": price.get_text(strip=True) if price else "",
        "posted_date": posted_date["datetime"] if posted_date else "",
        "body": (
            body.get_text(separator="\n", strip=True).replace(
                "QR Code Link to This Post", ""
            )
            if body
            else ""
        ),
        "images": image_urls,
        "link": link,
    }
