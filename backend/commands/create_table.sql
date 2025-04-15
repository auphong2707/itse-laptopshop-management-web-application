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
    email TEXT,
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

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    image_url TEXT,
    description TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at column to laptops table
ALTER TABLE laptops ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure updated_at updates on modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_laptops_updated_at
BEFORE UPDATE ON laptops
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Add updated_at column to reviews table
ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Add updated_at column to newsletter_subscriptions table
ALTER TABLE newsletter_subscriptions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TRIGGER set_newsletter_subscriptions_updated_at
BEFORE UPDATE ON newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Add updated_at column to posts table
ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ORDERS
DROP TABLE IF EXISTS orders CASCADE; 
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Firebase UID

    -- User details snapshot at time of order
    first_name TEXT,                 
    last_name TEXT,                 
    user_name TEXT,                  
    user_email TEXT,                 
    shipping_address TEXT,           
    phone_number TEXT,               
    company TEXT,                    
    country VARCHAR(10),             
    zip_code VARCHAR(20),            

    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS order_items;
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL, -- Should reference laptops.id
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- **IMPORTANT: Store the price paid per item**
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    -- Optional: Add FOREIGN KEY (product_id) REFERENCES laptops(id) ON DELETE SET NULL (or RESTRICT)
);

-- Ensure updated_at updates on modification for orders
DROP TRIGGER IF EXISTS set_orders_updated_at ON orders; -- Add drop for idempotency
CREATE OR REPLACE FUNCTION set_updated_at() -- Ensure this function exists
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create the RefundTicket table with email and phone_number as identifiers
CREATE TABLE IF NOT EXISTS refund_tickets (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,  -- User's email
    phone_number TEXT NOT NULL,  -- User's phone number
    order_id INTEGER NOT NULL,  -- Associated order ID
    reason TEXT NOT NULL,  -- Reason for the refund
    amount DECIMAL(10, 2) CHECK (amount > 0),  -- Refund amount must be positive
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',  -- Only valid statuses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the refund was created
    resolved_at TIMESTAMP,  -- Timestamp when the refund was resolved (if applicable)
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,  -- Foreign key to orders
    CONSTRAINT unique_user_email_phone UNIQUE(email, phone_number)  -- Ensure unique combination of email and phone
);

-- Create a function that updates the refund status to 'approved' when resolved_at is set
CREATE OR REPLACE FUNCTION update_refund_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If the resolved_at field is set, change the status to 'approved'
    IF NEW.resolved_at IS NOT NULL THEN
        NEW.status := 'approved';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that calls the function after the resolved_at field is updated
CREATE TRIGGER update_refund_status_trigger
AFTER UPDATE OF resolved_at
ON refund_tickets
FOR EACH ROW
EXECUTE FUNCTION update_refund_status();

-- Add updated_at column to refund_tickets table
ALTER TABLE refund_tickets ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger to update the updated_at field on every update
CREATE OR REPLACE FUNCTION set_refund_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the `updated_at` timestamp on every update
CREATE TRIGGER set_refund_ticket_updated_at_trigger
BEFORE UPDATE ON refund_tickets
FOR EACH ROW
EXECUTE FUNCTION set_refund_ticket_updated_at();