from fastapi import APIRouter, Query
from elasticsearch import Elasticsearch

posts_router = APIRouter(prefix="/posts", tags=["posts"])
es = Elasticsearch("http://elasticsearch:9200")


@posts_router.get("/")
def get_posts(limit: int = Query(12)):
    """
    Get posts
    """
    results = es.search(index="posts", body={"query": {"match_all": {}}, "size": limit})
    return {"results": [hit["_source"] for hit in results["hits"]["hits"]]}
