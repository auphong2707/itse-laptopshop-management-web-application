from fastapi import APIRouter, Query
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Post

posts_router = APIRouter(prefix="/posts", tags=["posts"])

@posts_router.get("/")
def get_posts(limit: int = Query(12), db: Session = Depends(get_db)):
    """
    Get posts
    """
    posts = db.query(Post).limit(limit).all()
    return {"results": [{column.name: getattr(post, column.name) for column in post.__table__.columns} for post in posts]}
