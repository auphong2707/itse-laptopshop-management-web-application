from fastapi.testclient import TestClient
from main import app
from db.session import engine
from db.models import Base
import uuid

client = TestClient(app)

Base.metadata.create_all(bind=engine)


def test_subscribe_success():
    email = f"{uuid.uuid4().hex[:8]}@example.com"  # unique email per run
    response = client.post("/newsletter/subscribe", json={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == "Subscribed successfully"
    assert response.json()["email"] == email


def test_subscribe_duplicate():
    client.post("/newsletter/subscribe", json={"email": "duplicate@example.com"})

    response = client.post(
        "/newsletter/subscribe", json={"email": "duplicate@example.com"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already subscribed"


def test_invalid_email_format():
    response = client.post("/newsletter/subscribe", json={"email": "invalid-email"})
    assert response.status_code == 422
