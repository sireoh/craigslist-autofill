const POSTING_FORM = {
  "posting_title": document.getElementById("postingForm").elements['PostingTitle'],
  "city": document.getElementById("postingForm").elements['geographic_area'],
  "zip_code": document.getElementById("postingForm").elements['postal'],
  "text": document.getElementById("postingForm").elements['PostingBody'],
  "rent": document.getElementById("postingForm").elements['price'],
  "bedrooms": document.getElementById("postingForm").elements['bedrooms'],
  "bathrooms": document.getElementById("postingForm").elements['bathrooms'],
  "phone_number": document.getElementById("postingForm").elements['contact_phone'],
  "contact_name": document.getElementById("postingForm").elements['contact_name'],

  "DEFAULTS" : {
    "rent_period" : document.getElementById("postingForm").elements['rent_period'],
    "laundry" : document.getElementById("postingForm").elements['laundry'],
    "parking" : document.getElementById("postingForm").elements['parking'],
    "no_smoking" : document.getElementById("postingForm").elements['no_smoking'],
  }
}

