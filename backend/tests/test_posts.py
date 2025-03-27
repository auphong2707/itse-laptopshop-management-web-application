import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_posts():
    response = client.get("/posts?limit=3")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 3