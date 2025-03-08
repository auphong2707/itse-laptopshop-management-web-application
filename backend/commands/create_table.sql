CREATE TABLE IF NOT EXISTS laptops (
    id SERIAL PRIMARY KEY,
    inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand TEXT,
    sub_brand TEXT,
    name TEXT,
    cpu TEXT,
    vga TEXT,
    ram_amount INTEGER,
    ram_type TEXT,
    storage_amount INTEGER,
    storage_type TEXT,
    webcam_resolution TEXT,
    screen_size DECIMAL(5,2),
    screen_resolution TEXT,
    screen_refresh_rate INTEGER,
    screen_brightness INTEGER,
    battery_capacity DECIMAL(5,2),
    battery_cells INTEGER,
    weight DECIMAL(5,2),
    default_os TEXT,
    warranty INTEGER,
    width DECIMAL(5,2),
    depth DECIMAL(5,2),
    height DECIMAL(5,2),
    number_usb_a_ports INTEGER,
    number_usb_c_ports INTEGER,
    number_hdmi_ports INTEGER,
    number_ethernet_ports INTEGER,
    number_audio_jacks INTEGER,
    product_image_mini TEXT,
    quantity INTEGER,
    original_price INT,
    sale_price INT,
    rate DECIMAL(3,2) DEFAULT 0.00,
    num_rate INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    laptop_id INTEGER NOT NULL,
    user_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laptop_id) REFERENCES laptops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_laptop_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update rate and num_rate in laptops table
    UPDATE laptops
    SET 
        rate = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE laptop_id = NEW.laptop_id),
        num_rate = (SELECT COUNT(*) FROM reviews WHERE laptop_id = NEW.laptop_id)
    WHERE id = NEW.laptop_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_laptop_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_laptop_rating();
