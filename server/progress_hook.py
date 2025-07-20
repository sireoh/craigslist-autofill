from store import progress_state


def progress():
    phase = progress_state["phase"]

    if phase == "scraping":
        return {"phase": "scraping all the listings"}

    if phase == "details":
        total = progress_state["total"] or 1  # avoid div-by-zero
        percent = int(progress_state["current"] / total * 100)
        return {
            "phase": "getting listing details",
            "percent": percent,
            "listings": progress_state["listings"],
        }

    # Anything else ('idle' or 'done')
    return {"phase": phase}
