# Extension Installation

Click "Load Temporary Add-on" at

```bash
git clone </craigslist-autofill>.git
about:debugging#/runtime/this-firefox
click manifest.json
press open
```

# Setup Server

```shell
python -m venv .venv
.venv/Scripts/activate.ps1
pip install -r requirements.txt
python server.py
```

# Instructions on how to use :

1. Spin up the server, you can find the instructions under "Setup server"
   It will give you a link called "http://0.0.0.0:5694", but you want "http://localhost:5694"
2. Input the server link
3. Input the Hugging Face API key, instructions will be found in "Set up Hugging Face API Key"

What is "Craigslist Query"?
Its what you prompt craigslist, to find listings data. eg 2 bedroom apartment, or 1 bedroom studio.
Make this as simple as possible, because its scraping craigslist for the dataset.

First task;
1 . gather listings:

After you'll get an alert called "Fetched 65 listings", meaning the initial scrape was successsfull.

To view the listings that you've gatherd click "Fetch listings".

TODO: make the location change depending on the person's location (gather_listings API call). harded coded to surrey rn.

After you press "Fetch Listings" you can press "Scrape data", depending on the initial dataset that you've collected.

After the progress bar reaches 100%, it means it has generated a output_XXXX.json file. You can view this by clicking "Fetch Outputs"

Now, you can either "View" or download to see if that dataset is right for you.

If you are happy with it, click "Load Data". and Select ur desired output_XXXX.json. "Load it by pressing Load"

Once loaded, you are ready to Prompt the AI Model. Right now its using deepseek/r1

Wait for the alert "Saved to results.json".

And now you have enough data to fill in a form.

Press "Fill Form", to select the desired results.json you want to load. Click "View" to double check if the data is correct.

If you are happy with the data, then press "Load" to fill in the form.

Happy AI posting !

Click "Make new Post" on craigslist
Housing offered
apartments / housing for rent

# Important note:

- Gathering listings means you are sending the craigslist query to the craigslist search. So ensure you prompt the query correctly.
