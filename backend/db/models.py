from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    DECIMAL,
    DateTime,
    func,
    TIMESTAMP,
    Float,
    CheckConstraint,
    Enum,
    Index,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
import enum

Base = declarative_base()


class Laptop(Base):
    __tablename__ = "laptops"

    id = Column(Integer, primary_key=True, index=True)
    inserted_at = Column(TIMESTAMP, server_default=func.now())
    brand = Column(String, nullable=False)
    sub_brand = Column(String)
    name = Column(String, nullable=False)
    cpu = Column(String, nullable=False)
    vga = Column(String)
    ram_amount = Column(Integer, nullable=False)
    ram_type = Column(String, nullable=False)
    storage_amount = Column(Integer, nullable=False)
    storage_type = Column(String, nullable=False)
    webcam_resolution = Column(String)
    screen_size = Column(DECIMAL(5, 2))
    screen_resolution = Column(String)
    screen_refresh_rate = Column(Integer)
    screen_brightness = Column(Integer)
    battery_capacity = Column(DECIMAL(5, 2))
    battery_cells = Column(Integer)
    weight = Column(String)
    default_os = Column(String)
    warranty = Column(Integer)
    width = Column(DECIMAL(5, 2))
    depth = Column(DECIMAL(5, 2))
    height = Column(DECIMAL(5, 2))
    number_usb_a_ports = Column(Integer)
    number_usb_c_ports = Column(Integer)
    number_hdmi_ports = Column(Integer)
    number_ethernet_ports = Column(Integer)
    number_audio_jacks = Column(Integer)
    product_image_mini = Column(JSON)
    quantity = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    sale_price = Column(Integer, nullable=False)
    rate = Column(DECIMAL(3, 2))
    num_rate = Column(Integer)


class LaptopCardView(Base):
    __tablename__ = "laptop_card_view"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    brand = Column(String, nullable=False)
    sub_brand = Column(String)
    inserted_at = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    product_image_mini = Column(String)
    rate = Column(DECIMAL(3, 2))
    num_rate = Column(Integer, default=0)
    name = Column(String, nullable=False)
    original_price = Column(Integer, nullable=False)
    sale_price = Column(Integer, nullable=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    laptop_id = Column(
        Integer, ForeignKey("laptops.id", ondelete="CASCADE"), nullable=False
    )
    user_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(String, nullable=True)
    created_at = Column(String, nullable=False)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    image_url = Column(String, nullable=True)  # URL for the image
    description = Column(String, nullable=False)  # Post description
    link = Column(String, nullable=True)  # Optional URL link
    created_at = Column(DateTime, server_default=func.current_timestamp())


class NewsletterSubscription(Base):
    __tablename__ = "newsletter_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String, unique=True, nullable=False)
    subscribed_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), nullable=False)  # Firebase UID length

    first_name = Column(Text, nullable=True)
    last_name = Column(Text, nullable=True)
    user_name = Column(Text, nullable=True)
    user_email = Column(Text, nullable=True)
    shipping_address = Column(Text, nullable=True)
    phone_number = Column(Text, nullable=True)
    company = Column(Text, nullable=True)
    country = Column(String(10), nullable=True)
    zip_code = Column(String(20), nullable=True)

    total_price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(Integer, nullable=False)  # Consider ForeignKey("laptops.id")
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(DECIMAL(10, 2), nullable=False)  # Store the price

    order = relationship("Order", back_populates="items")


# Enum for Refund Status
class RefundStatus(enum.Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"


class RefundTicket(Base):
    __tablename__ = "refund_tickets"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)  # User's email
    phone_number = Column(String, nullable=False)  # User's phone number
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )  # Associated order ID
    reason = Column(String, nullable=False)  # Reason for the refund
    amount = Column(Float, nullable=False)  # Refund amount
    status = Column(
        Enum(RefundStatus), nullable=False, default=RefundStatus.pending
    )  # Use Enum for status
    created_at = Column(
        DateTime, default=datetime.utcnow
    )  # Timestamp when the refund was created
    resolved_at = Column(
        DateTime, nullable=True
    )  # Timestamp when the refund was resolved (if applicable)

    # Relationship to `Order`
    order = relationship("Order", backref="refund_ticket")

    # Adding all constraints and indexes in one __table_args__
    __table_args__ = (
        CheckConstraint(
            "amount > 0", name="check_amount_positive"
        ),  # Ensure the amount is positive
        CheckConstraint(
            "status IN ('Pending', 'Approved', 'Rejected')",
            name="check_status_valid_values",
        ),  # Ensure valid status values
        Index(
            "ix_refund_email_phone", "email", "phone_number", postgresql_using="btree"
        ),  # Index for email + phone_number with btree in PostgreSQL
    )
