from typing import Optional
from pydantic import BaseModel

################################################################################
# ----------------------------  DATA MODELS  -----------------------------------
################################################################################


class GatherRequest(BaseModel):
    query: str
    max_results: Optional[int] = 65


class ScrapeRequest(BaseModel):
    listingsdoc_id: str


################################################################################
# --------------------------  CLIENT REQUEST  -------------------------------- #
################################################################################


class Header(BaseModel):
    city: str
    zip_code: str


class Details(BaseModel):
    bedrooms: str
    bathrooms: str


class Contact(BaseModel):
    phone_number: str
    contact_name: str


class CraigslistQuery(BaseModel):
    query: str


class Settings(BaseModel):
    header: Header
    details: Details
    contact: Contact
    craigslist_query: CraigslistQuery


class PresetData(BaseModel):
    id: str
    settings: Settings
    output_file: Optional[str] = None

    class Config:
        extra = "allow"


################################################################################
# --===------------------------  AI REQUEST  ----------------=---------------- #
################################################################################
class AIConfig(BaseModel):
    hf_api_key: str
