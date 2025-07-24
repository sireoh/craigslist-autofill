# extension installation

Click "Load Temporary Add-on" at

```
about:debugging#/runtime/this-firefox
```

# curl request

```bash
curl -X POST http://localhost:5694/start_scrape \
  -H "Content-Type: application/json" \
  -d '{"query": "2 bedroom basement", "max_results": 10, "delay": 3}'

# OR

curl -X POST http://localhost:5694/start_scrape \
  -H "Content-Type: application/json" \
  -d '{"query": "2 bedroom basement"}'
```

# to add

```bash
https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite?tab=readme-ov-file#installation-firefox
```

# setup server

```shell
python -m venv .venv
.venv/Scripts/activate.ps1
pip install requirements.txt
python server.py
```
