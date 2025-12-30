-- Insert admin account
INSERT INTO users (email, hashed_password, first_name, last_name, phone_number, shipping_address, role, is_active)
VALUES ('admin@admin.com', '$2b$12$DeLLXXJQbO8YxMdv5JcujuvchwjIKtKccmPbIA7vUgRLnSAjw.TFm', 'Admin', 'User', '+84999999999', 'Admin Address', 'admin', true);
