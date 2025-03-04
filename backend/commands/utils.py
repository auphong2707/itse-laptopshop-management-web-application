import json
import random 
from datetime import datetime

def generate_laptop_insert_queries(json_file_path='./backend/data/tgdd_data.json', 
                                 sql_output_path='./backend/commands/data_sample.sql'):
    """
    Generate insert queries from JSON data file
    """
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

    try:
        with open(json_file_path, 'r') as file:
            laptops = json.load(file)
        values = []
        for laptop in laptops:
            value_tuple = (
                convert_value(laptop['brand']),
                convert_value(laptop['name']),
                convert_value(laptop['cpu']),
                convert_value(laptop['vga']),
                laptop['ram_amount'],
                convert_value(laptop['ram_type']),
                laptop['storage_amount'],
                convert_value(laptop['storage_type']),
                convert_value(laptop['webcam_resolution']),
                laptop['screen_size'],
                convert_value(laptop['screen_resolution']),
                laptop['screen_refresh_rate'],
                laptop['screen_brightness'],
                laptop['battery_capacity'],
                convert_value(laptop['battery_cells']),
                convert_value(laptop['weight']),
                convert_value(laptop['default_os']),
                convert_value(laptop['warranty']),
                laptop['price'],
                laptop['width'],
                laptop['depth'],
                laptop['height'],
                laptop['number_usb_a_ports'],
                laptop['number_usb_c_ports'],
                laptop['number_hdmi_ports'],
                laptop['number_ethernet_ports'],
                laptop['number_audio_jacks'],
                'NULL'  # image_base64 = NULL 
            )
            values.append(f"({', '.join(value_tuple)})")

        insert_query += ', '.join(values) + ";"

        with open(sql_output_path, 'a') as sql_file:
            sql_file.write(insert_query + "\n")

        print(f"INSERT queries successfully written to {sql_output_path}")

    except FileNotFoundError:
        print(f"Error: JSON file not found at {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

def generate_reviews(sql_output_path='./backend/commands/data_sample.sql', num_reviews=20):
    laptop_ids = list(range(1, 100))
    user_names = ['Phong', 'PhongPhong', 'PhongPhongPhong', 'PhongPhongPhongPhongPhong', 'P']
    ratings = [1, 2, 3, 4, 5]
    review_texts = [
        'Great laptop!', 'Average performance.', 'Very satisfied.', 'Not bad.', 'Disappointing.'
    ]
    values = []
    for _ in range(num_reviews):
        laptop_id = random.choice(laptop_ids)
        user_name = random.choice(user_names)
        rating = random.choice(ratings)
        review_text = random.choice(review_texts)
        
        values.append(f"({laptop_id}, '{user_name}', {rating}, '{review_text}')")

    # Create and write the INSERT query
    insert_query = "INSERT INTO reviews (laptop_id, user_name, rating, review_text) VALUES "
    insert_query += ', '.join(values) + ";"

    with open(sql_output_path, 'a') as sql_file:
        sql_file.write(insert_query + "\n")

def generate_subscriptions(sql_output_path='./backend/commands/data_sample.sql', num_subs=20):
    names = ['Phong', 'PhongPhong', 'PhongPhongPhong', 'PhongPhongPhongPhongPhong', 'P']
    domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
    values = []
    used_emails = set() 
    while len(values) < num_subs:
        name = random.choice(names)
        domain = random.choice(domains)
        email = f"{name.lower()}@{domain}"
        if email not in used_emails:  
            used_emails.add(email)
            values.append(f"('{email}')")

    insert_query = "INSERT INTO newsletter_subscriptions (email) VALUES "
    insert_query += ', '.join(values) + ";"

    with open(sql_output_path, 'a') as sql_file:
        sql_file.write(insert_query + "\n")

if __name__ == "__main__":
    # generate_laptop_insert_queries()
    generate_reviews()
    generate_subscriptions()