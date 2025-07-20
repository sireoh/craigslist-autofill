from fastapi import FastAPI

from models import ScrapeRequest
from progress_hook import progress
from scrape_dal import start_scrape
from fastapi.middleware.cors import CORSMiddleware

from server_dal import delete_output_by_name, get_outputs, serve_output_file

app = FastAPI()
port = 5694

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # You can replace "*" with a specific origin like "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return progress()


@app.get("/outputs")
async def __outputs():
    return get_outputs()


@app.get("/outputs/{filename}")
async def __serve_output_file(filename):
    return serve_output_file(filename)


@app.delete("/outputs/{filename}")
async def __delete_output_by_name(filename):
    return delete_output_by_name(filename)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=port)
