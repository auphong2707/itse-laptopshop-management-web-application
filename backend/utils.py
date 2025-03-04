### temporary throwaway code to generate data

import json

with open('backend/data/tgdd_data.json', 'r') as file:
    laptops = json.load(file)

insert_query = """INSERT INTO laptops (brand, name, cpu, vga, ram_amount, ram_type, storage_amount, 
    storage_type, webcam_resolution, screen_size, screen_resolution, screen_refresh_rate, screen_brightness, 
    battery_capacity, battery_cells, weight, default_os, warranty, price, width, depth, height, 
    number_usb_a_ports, number_usb_c_ports, number_hdmi_ports, number_ethernet_ports, number_audio_jacks, image_base64) VALUES """

def convert_value(value):
    if isinstance(value, str) and value.lower() == 'n/a':
        return 'NULL'
    if value == 'n/a' or value == 'N/A':  
        return 'NULL'
    elif value is None:  
        return 'NULL'
    return f"'{value}'" if isinstance(value, str) else str(value)

values = []
for laptop in laptops:
    values.append(f"({convert_value(laptop['brand'])}, {convert_value(laptop['name'])}, {convert_value(laptop['cpu'])}, {convert_value(laptop['vga'])}, {laptop['ram_amount']}, {convert_value(laptop['ram_type'])}, {laptop['storage_amount']}, {convert_value(laptop['storage_type'])}, {convert_value(laptop['webcam_resolution'])}, {laptop['screen_size']}, {convert_value(laptop['screen_resolution'])}, {laptop['screen_refresh_rate']}, {laptop['screen_brightness']}, {laptop['battery_capacity']}, {convert_value(laptop['battery_cells'])}, {convert_value(laptop['weight'])}, {convert_value(laptop['default_os'])}, {convert_value(laptop['warranty'])}, {laptop['price']}, {laptop['width']}, {laptop['depth']}, {laptop['height']}, {laptop['number_usb_a_ports']}, {laptop['number_usb_c_ports']}, {laptop['number_hdmi_ports']}, {laptop['number_ethernet_ports']}, {laptop['number_audio_jacks']}, NULL)")

insert_query += ', '.join(values) + ";"

with open('./backend/commands.sql', 'a') as sql_file:
    sql_file.write(insert_query + "\n")



