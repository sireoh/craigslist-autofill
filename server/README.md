# curl request

```bash
curl -X POST http://localhost:5694/start_scrape \
  -H "Content-Type: application/json" \
  -d '{"query": "2 bedroom", "max_results": 10, "delay": 3}'

# OR

curl -X POST http://localhost:5694/start_scrape \
  -H "Content-Type: application/json" \
  -d '{"query": "2 bedroom"}'
```
