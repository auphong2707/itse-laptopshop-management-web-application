from sqlalchemy import Column, Integer, String, DECIMAL
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Laptop(Base):
    __tablename__ = "laptops"

    id = Column(Integer, primary_key=True, index=True)
    inserted_at = Column(String, nullable=False)
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
    screen_size = Column(DECIMAL(5,2))
    screen_resolution = Column(String)
    screen_refresh_rate = Column(Integer)
    screen_brightness = Column(Integer)
    battery_capacity = Column(DECIMAL(5,2))
    battery_cells = Column(Integer)
    weight = Column(String)
    default_os = Column(String)
    warranty = Column(Integer)
    width = Column(DECIMAL(5,2))
    depth = Column(DECIMAL(5,2))
    height = Column(DECIMAL(5,2))
    number_usb_a_ports = Column(Integer)
    number_usb_c_ports = Column(Integer)
    number_hdmi_ports = Column(Integer)
    number_ethernet_ports = Column(Integer)
    number_audio_jacks = Column(Integer)
    product_image_mini = Column(String)
    quantity = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=False)
    sale_price = Column(Integer, nullable=False)
    rate = Column(DECIMAL(3,2))
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