import abc
import json

from constants import CONFIG_PATH


class Helpers(abc.ABC):
    @staticmethod
    def get_current_index() -> int:
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r") as f:
                data = json.load(f)
                return data.get("current_index", 0)
        return 0

    @staticmethod
    def increment_index() -> int:
        index = Helpers.get_current_index() + 1
        with open(CONFIG_PATH, "w") as f:
            json.dump({"current_index": index}, f, indent=2)
        return index
