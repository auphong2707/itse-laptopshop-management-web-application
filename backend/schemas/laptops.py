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
    weight: str
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
    image_base64: Optional[str]  # Optional field

class LaptopResponse(LaptopCreate):
    id: int 

    class Config:
        orm_mode = True  
