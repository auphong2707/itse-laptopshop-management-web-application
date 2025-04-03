from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_posts():
    response = client.get("/posts?limit=3")
    assert response.status_code == 200

    json_data = response.json()
    assert "results" in json_data
    assert isinstance(json_data["results"], list)
    assert len(json_data["results"]) <= 3
