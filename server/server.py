from threading import Thread
from typing import Optional
from fastapi import FastAPI
from openai import OpenAI

from ai_model_dal import get_ai_config, prompt_ai, update_ai_config
from client_dal import load_output_file, update_config
from models import AIConfig, PresetData, GatherRequest, ScrapeRequest
from progress_hook import progress
from scrape_dal import gather_listings, scrape_data
from fastapi.middleware.cors import CORSMiddleware

from server_dal import (
    delete_listing_by_name,
    delete_output_by_name,
    get_listings,
    get_outputs,
    serve_listing_file,
    serve_output_file,
)

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

####################################################################
# ==================== SCRAPING ENDPOINTS ======================== #
####################################################################


@app.post("/gather_listings")
async def __gather_listings(req: Optional[GatherRequest] = None):
    return gather_listings(req)


@app.post("/scrape_data")
async def __scrape_data(req: Optional[ScrapeRequest] = None):
    """
    Start the scraping process in a separate thread.
    """

    def scrape_task():
        scrape_data(req)

    # Run the scraping process in a separate thread
    thread = Thread(target=scrape_task)
    thread.start()

    return {"message": "Scraping process started"}


@app.get("/progress")
async def __progress():
    """
    Poll-able endpoint for the client to track progress.
    Response shape depends on current phase.
    """
    return progress()


####################################################################
# ==================== OUTPUTS ENDPOINTS ========================= #
####################################################################


@app.get("/outputs")
async def __outputs():
    return get_outputs()


@app.get("/outputs/{filename}/download")
async def __serve_output_file_to_download(filename):
    return serve_output_file(filename, True)


@app.get("/outputs/{filename}/view")
async def __serve_output_file_to_view(filename):
    return serve_output_file(filename, False)


@app.delete("/outputs/{filename}")
async def __delete_output_by_name(filename):
    return delete_output_by_name(filename)


####################################################################
# =================== LISTINGS ENDPOINTS ========================= #
####################################################################


@app.get("/listings")
async def __get_listings():
    return get_listings()


@app.get("/listings/{filename}/download")
async def __serve_listing_file_to_download(filename):
    return serve_listing_file(filename, True)


@app.get("/listings/{filename}/view")
async def __serve_listing_file_to_view(filename):
    return serve_listing_file(filename, False)


@app.delete("/listings/{filename}")
async def __delete_listing_by_name(filename):
    return delete_listing_by_name(filename)


####################################################################
# ==================== CONFIG ENDPOINTS ========================== #
####################################################################


@app.patch("/config")
async def __update_config(req: PresetData):
    return update_config(req)


@app.patch("/config/{output_file}")
async def __load_output_file(req: PresetData, output_file: str):
    return load_output_file(req, output_file)


####################################################################
# ======================= AI ENDPOINTS =========================== #
####################################################################


@app.patch("/ai_model/config")
async def __update_ai_config(req: AIConfig):
    return update_ai_config(req)


@app.get("/ai_model/prompt_ai")
async def __prompt_ai():
    try:
        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=get_ai_config()["hf_api_key"],
        )
        return prompt_ai(client)
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=port)
