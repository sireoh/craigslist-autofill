import abc
import json
from pathlib import Path
import random
import os
from typing import Dict, List

from bs4 import BeautifulSoup
import requests

from constants import HEADERS, LISTINGS_DIR, OUTPUT_DIR, SAMPLE_SIZE


class Helpers(abc.ABC):
    @staticmethod
    def get_current_index(config_path: Path) -> int:
        if config_path.exists():
            with open(config_path, "r") as f:
                data = json.load(f)
                return data.get("current_index", 0)
        return 0

    @staticmethod
    def increment_index(config_path: Path) -> int:
        index = Helpers.get_current_index(config_path) + 1
        with open(config_path, "w") as f:
            json.dump({"current_index": index}, f, indent=2)
        return index

    @staticmethod
    def decrement_index(config_path: Path) -> int:
        index = Helpers.get_current_index(config_path) - 1
        with open(config_path, "w") as f:
            json.dump({"current_index": index}, f, indent=2)
        return index

    @staticmethod
    def load_listings_file(listingsdoc_id: str) -> List[str]:
        """Load the listings file and return the URLs"""
        filepath = LISTINGS_DIR / f"{listingsdoc_id}.json"
        with open(filepath, "r") as f:
            data = json.load(f)
        return data["data"]

    @staticmethod
    def sample_listings(all_urls: List[str]) -> List[str]:
        """Gather listings from the specified file and sample them if needed"""
        if len(all_urls) > SAMPLE_SIZE:
            return random.sample(all_urls, SAMPLE_SIZE)
        return []

    @staticmethod
    def save_output(data: List[Dict], index: int) -> Path:
        """Save the output file with padded index"""
        filename = f"output_{index:04d}.json"
        output_path = OUTPUT_DIR / filename
        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)
        return output_path

    @staticmethod
    def ensure_directories_exist():
        """Ensure all required directories exist"""
        OUTPUT_DIR.mkdir(exist_ok=True)
        LISTINGS_DIR.mkdir(exist_ok=True)

    @staticmethod
    def parse_details(single_url: str):
        """Scrape individual listing details from Craigslist from a url"""
        try:
            resp = requests.get(single_url, headers=HEADERS)
            resp.raise_for_status()
        except requests.RequestException:
            return {}

        soup = BeautifulSoup(resp.text, "html.parser")

        title = soup.select_one("#titletextonly")
        price = soup.select_one("span.price")
        posted_date = soup.select_one("p.postinginfo time")
        body = soup.select_one("section#postingbody")

        image_urls = [
            img["src"] for img in soup.select(".gallery img") if img.get("src")
        ]

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
            "link": single_url,
        }

    class AI(abc.ABC):
        @staticmethod
        def get_config_file():
            try:
                if os.path.exists("config.json"):
                    with open("config.json", "r") as f:
                        contents = json.load(f)
                    return {"data": contents}
                else:
                    return {"message": "config.json file doesn't exist"}
            except json.JSONDecodeError:
                return {"message": "config.json exists but contains invalid JSON"}
            except Exception as e:
                return {"message": f"An error occurred: {str(e)}"}

        @staticmethod
        def get_output_file_by_id(output_file_id: str):
            """Load the output file and return the URLs"""
            filepath = OUTPUT_DIR / f"{output_file_id}.json"
            with open(filepath, "r") as f:
                data = json.load(f)
                return {"data": data}
