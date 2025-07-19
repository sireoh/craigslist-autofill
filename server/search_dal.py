import random
from typing import List, cast
import requests
from bs4 import BeautifulSoup, Tag
import time

DEBUG = False

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0.0.0 Safari/537.36"
    )
}


def get_all_listings(query: str, delay: int = 3, max_results: int = 10) -> List[dict]:
    url = f"https://vancouver.craigslist.org/search/rds/apa?housing_type=6&laundry=2&query={query}&rent_period=3&sort=rel"

    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        if DEBUG:
            print(f"Request failed: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    results = soup.find("ol", class_="cl-static-search-results")

    if not isinstance(results, Tag):
        print("[ERROR] No valid results <ol> found.")
        return []

    all_list_items = results.find_all(
        "li", class_="cl-static-search-result", recursive=False
    )

    all_urls = []
    for li in all_list_items:
        if not isinstance(li, Tag):
            continue

        anchor = li.find("a")
        if not isinstance(anchor, Tag):
            continue

        href = anchor.get("href")
        if not href:
            continue

        full_url = str(href)
        if not full_url.startswith("http"):
            full_url = f"https://vancouver.craigslist.org{full_url}"

        all_urls.append(full_url)

    if DEBUG:
        print(f"[DEBUG] Total listings found: {len(all_urls)}")

    # Pick random subset
    selected_urls = random.sample(all_urls, min(max_results, len(all_urls)))

    listings: List[dict] = []

    for idx, link in enumerate(selected_urls):
        if DEBUG:
            print(f"[DEBUG] Fetching details for: {link}")
        details = __get_listing_details(link)
        if details:
            listings.append(details)

        if idx < len(selected_urls) - 1:
            if DEBUG:
                print(f"[DEBUG] Sleeping {delay} seconds...")
            time.sleep(random.uniform(delay - 0.5, delay + 0.5))

    return listings


def __get_listing_details(link: str):
    try:
        response = requests.get(link, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        if DEBUG:
            print(f"Failed to fetch details: {e}")
        return {}

    soup = BeautifulSoup(response.text, "html.parser")

    title_tag = soup.select_one("#titletextonly")
    title = title_tag.get_text(strip=True) if title_tag else ""

    price_tag = soup.select_one("span.price")
    price = price_tag.get_text(strip=True) if price_tag else ""

    body_section = soup.select_one("section#postingbody")
    body = (
        body_section.get_text(separator="\n", strip=True)
        .replace("QR Code Link to This Post", "")
        .strip()
        if body_section
        else ""
    )

    time_tag = soup.select_one("p.postinginfo time")
    posted_date = time_tag["datetime"] if time_tag else ""

    image_tags = soup.select(".gallery img")
    image_urls = [img["src"] for img in image_tags if img.get("src")]

    return {
        "title": title,
        "price": price,
        "body": body,
        "posted_date": posted_date,
        "images": image_urls,
        "link": link,
    }
