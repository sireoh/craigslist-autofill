from typing import Optional
from pydantic import BaseModel

################################################################################
# ----------------------------  DATA MODELS  -----------------------------------
################################################################################


class ScrapeRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10
    delay: Optional[int] = 3
