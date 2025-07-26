# progress_hook.py
from models import ProgressState
from progress_state_manager import progress_manager


def progress() -> ProgressState:
    # Get the current state from the ProgressStateManager
    current_state = progress_manager.get_state()

    # Calculate the percent to avoid division by zero
    total = current_state.total or 1  # Avoid div-by-zero
    percent = int(current_state.current / total * 100)

    # Update the percent in the state
    current_state.percent = percent

    return current_state
