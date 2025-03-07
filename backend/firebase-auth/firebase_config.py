import firebase_admin
from firebase_admin import credentials, auth, firestore

# Khởi tạo Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Kết nối Firestore
db = firestore.client()
