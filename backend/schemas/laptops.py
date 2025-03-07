from pydantic import BaseModel
from typing import Optional

class LaptopCreate(BaseModel):
    brand: str
    name: str
    cpu: str
    vga: str
    ram_amount: int
    ram_type: str
    storage_amount: int
    storage_type: str
    webcam_resolution: str
    screen_size: float
    screen_resolution: str
    screen_refresh_rate: int
    screen_brightness: int
    battery_capacity: float
    battery_cells: int
    weight: float
    default_os: str
    warranty: int
    price: int
    width: float
    depth: float
    height: float
    number_usb_a_ports: int
    number_usb_c_ports: int
    number_hdmi_ports: int
    number_ethernet_ports: int
    number_audio_jacks: int
    product_image_mini: str

class LaptopUpdate(BaseModel):
    brand: Optional[str] = None
    name: Optional[str] = None
    cpu: Optional[str] = None
    vga: Optional[str] = None
    ram_amount: Optional[int] = None
    ram_type: Optional[str] = None
    storage_amount: Optional[int] = None
    storage_type: Optional[str] = None
    webcam_resolution: Optional[str] = None
    screen_size: Optional[float] = None
    screen_resolution: Optional[str] = None
    screen_refresh_rate: Optional[int] = None
    screen_brightness: Optional[int] = None
    battery_capacity: Optional[float] = None
    battery_cells: Optional[int] = None
    weight: Optional[float] = None
    default_os: Optional[str] = None
    warranty: Optional[int] = None
    price: Optional[int] = None
    width: Optional[float] = None
    depth: Optional[float] = None
    height: Optional[float] = None
    number_usb_a_ports: Optional[int] = None
    number_usb_c_ports: Optional[int] = None
    number_hdmi_ports: Optional[int] = None
    number_ethernet_ports: Optional[int] = None
    number_audio_jacks: Optional[int] = None
    product_image_mini: Optional[str] = None

class LaptopResponse(LaptopCreate):
    id: int  

    class Config:
        orm_mode = True  