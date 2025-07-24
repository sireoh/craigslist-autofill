from typing import Optional
from pydantic import BaseModel

################################################################################
# ----------------------------  DATA MODELS  -----------------------------------
################################################################################


class ScrapeRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10
    delay: Optional[int] = 3


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
