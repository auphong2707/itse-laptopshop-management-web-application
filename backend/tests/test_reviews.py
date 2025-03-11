import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_reviews():
    response = client.get("/reviews?rating=4&limit=3")
    assert response.status_code == 200
    assert isinstance(response.json(), list) 
    assert len(response.json()) == 3
