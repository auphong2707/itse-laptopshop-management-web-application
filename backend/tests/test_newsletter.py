from fastapi.testclient import TestClient
from main import app
from db.session import SessionLocal, engine
from db.models import Base, NewsletterSubscription

client = TestClient(app)

Base.metadata.create_all(bind=engine)

def test_subscribe_success():
    response = client.post("/newsletter/subscribe", json={"email": "test@example.com"})
    assert response.status_code == 200
    assert response.json()["message"] == "Subscribed successfully"
    assert response.json()["email"] == "test@example.com"

def test_subscribe_duplicate():
    client.post("/newsletter/subscribe", json={"email": "duplicate@example.com"})

    response = client.post("/newsletter/subscribe", json={"email": "duplicate@example.com"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already subscribed"

def test_invalid_email_format():
    response = client.post("/newsletter/subscribe", json={"email": "invalid-email"})
    assert response.status_code == 422 