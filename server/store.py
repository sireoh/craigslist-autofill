from models import ProgressState
from threading import Lock


class ProgressStateManager:
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ProgressStateManager, cls).__new__(cls)
                cls._instance._initialize(*args, **kwargs)
        return cls._instance

    def _initialize(self):
        self._state = ProgressState(
            phase="general/idle",
            current=0,
            total=0,
            percent=0,
            message="[Idle] Waiting for task ...",
        )
        self._lock = Lock()

    def set_state(self, phase, current, total, percent, message):
        with self._lock:
            self._state.phase = phase
            self._state.current = current
            self._state.total = total
            self._state.percent = percent
            self._state.message = message

    def get_state(self):
        with self._lock:
            return self._state
