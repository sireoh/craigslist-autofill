from fastapi import FastAPI

from search_dal import get_all_listings

app = FastAPI()
port = 5694


@app.get("/test")
async def __test():
    return {"message": "test"}


@app.get("/search")
async def __search(query: str, delay: int = 10, max_results: int = 10):
    return get_all_listings(query=query, delay=delay, max_results=max_results)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=port)
