import abc
import json
from pathlib import Path


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
