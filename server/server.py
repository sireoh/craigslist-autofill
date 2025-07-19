from fastapi import FastAPI

from models import ScrapeRequest
from scrape_dal import start_scrape
from store import progress_state

app = FastAPI()
port = 5694


@app.post("/start_scrape")
async def __start_scrape(req: ScrapeRequest):
    """
    Kick off a background scrape job.
    Body must match `ScrapeRequest`.
    """
    start_scrape(req)
    return {"message": "Scraping started"}


@app.get("/progress")
async def __progress():
    """
    Poll-able endpoint for the client to track progress.
    Response shape depends on current phase.
    """
    phase = progress_state["phase"]

    if phase == "scraping":
        return {"action": "scraping all the listings"}

    if phase == "details":
        total = progress_state["total"] or 1  # avoid div-by-zero
        percent = int(progress_state["current"] / total * 100)
        return {
            "action": "getting listing details",
            "percent": percent,
            "listings": progress_state["listings"],
        }

    # Anything else ('idle' or 'done')
    return {"action": phase}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=port)
