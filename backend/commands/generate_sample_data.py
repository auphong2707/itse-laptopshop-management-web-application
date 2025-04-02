import json
import random
import os
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm

NUM_LAPTOPS = 0
NUM_POSTS = 0

def get_sub_brand(brand, name):
    if brand == 'asus':
        sub_brands = ['rog', 'tuf', 'zenbook', 'vivobook']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == 'lenovo':
        sub_brands = ['legion', 'loq', 'thinkpad', 'thinkbook', 'yoga','ideapad']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == 'acer':
        sub_brands = ['predator', 'nitro', 'swift', 'aspire']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == 'dell':
        sub_brands = ['alienware', 'gaming g', 'xps', 'inspiron', 'latitude', 'precision']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                if sub_brand == 'gaming g':
                    return 'g series'
                return sub_brand

    elif brand == 'hp':
        sub_brands = ['omen', 'victus', 'spectre', 'envy', 'pavilion', 'elitebook']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == 'msi':
        sub_brands = ['stealth', 'katana', 'prestigate', 'creator', 'modern']
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand
    
    return 'n/a'

def clear_old_commands():
    with open('./backend/commands/insert_sample_data.sql', 'w') as sql_file:
        sql_file.write("")
    print("Old commands cleared")

def generate_laptop_insert_queries(json_data_directory='./backend/data/', 
                                 sql_output_path='./backend/commands/insert_sample_data.sql'):
    """
    Generate insert queries from JSON data file
    """
    insert_query = """INSERT INTO laptops (brand, sub_brand, name, cpu, vga, ram_amount, ram_type, storage_amount, 
        storage_type, webcam_resolution, screen_size, screen_resolution, screen_refresh_rate, screen_brightness, 
        battery_capacity, battery_cells, weight, default_os, warranty, width, depth, height, 
        number_usb_a_ports, number_usb_c_ports, number_hdmi_ports, number_ethernet_ports, number_audio_jacks, product_image_mini, quantity, original_price, sale_price) VALUES """

    def convert_value(value):
        if isinstance(value, str) and value.lower() == 'n/a':
            return 'NULL'
        if value == 'n/a' or value == 'N/A':  
            return 'NULL'
        elif value is None:  
            return 'NULL'
        return f"'{value}'" if isinstance(value, str) else str(value)

    try:
        laptops = []
        json_file_paths = [os.path.join(json_data_directory, file) for file in os.listdir(json_data_directory) if file.endswith('.json')]
        for json_file_path in json_file_paths:
            with open(json_file_path, 'r') as file:
                data = json.load(file)
                laptops.extend(data)
        global NUM_LAPTOPS
        values = []
        for laptop in laptops:
            if laptop['price'] == 'n/a':
                continue
            NUM_LAPTOPS += 1
            value_tuple = (
                convert_value(laptop['brand']),
                convert_value(get_sub_brand(laptop['brand'], laptop['name'])),
                convert_value(laptop['name']),
                convert_value(laptop['cpu']),
                convert_value(laptop['vga']),
                convert_value(laptop['ram_amount']),
                convert_value(laptop['ram_type']),
                convert_value(laptop['storage_amount']),
                convert_value(laptop['storage_type']),
                convert_value(laptop['webcam_resolution']),
                convert_value(laptop['screen_size']),
                convert_value(laptop['screen_resolution']),
                convert_value(laptop['screen_refresh_rate']),
                convert_value(laptop['screen_brightness']),
                convert_value(laptop['battery_capacity']),
                convert_value(laptop['battery_cells']),
                convert_value(laptop['weight']),
                convert_value(laptop['default_os']),
                convert_value(laptop['warranty']),
                convert_value(laptop['width']),
                convert_value(laptop['depth']),
                convert_value(laptop['height']),
                convert_value(laptop['number_usb_a_ports']),
                convert_value(laptop['number_usb_c_ports']),
                convert_value(laptop['number_hdmi_ports']),
                convert_value(laptop['number_ethernet_ports']),
                convert_value(laptop['number_audio_jacks']),
                convert_value(json.dumps([
        f"/static/laptop_images/{NUM_LAPTOPS}_img1.jpg",
        f"/static/laptop_images/{NUM_LAPTOPS}_img2.jpg",
        f"/static/laptop_images/{NUM_LAPTOPS}_img3.jpg"])),
                str(random.randint(0, 20)),
                convert_value(laptop['price']),
                convert_value(laptop['price'] - random.randint(0, 20)/100 * laptop['price'])
            )

            values.append(f"({', '.join(value_tuple)})")

        insert_query += ', '.join(values) + ";"

        with open(sql_output_path, 'a') as sql_file:
            sql_file.write(insert_query + "\n")

        print(f"INSERT laptop queries successfully written to {sql_output_path}")

    except FileNotFoundError:
        print(f"Error: JSON file not found at {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

def generate_reviews(sql_output_path='./backend/commands/insert_sample_data.sql', num_reviews=10000):
    global NUM_LAPTOPS
    laptop_ids = list(range(1, NUM_LAPTOPS + 1))
    user_names = [
    'Nguyen Van An', 
    'Tran Thi Binh', 
    'Le Minh Chi', 
    'Pham Duc Duy', 
    'Hoang Thi Em', 
    'Vu Quang Phat', 
    'Bui Tuan Ga', 
    'Doan Huyen Ha'
    ]
    ratings = [1, 2, 3, 4, 5]
    review_texts = [
    'Sản phẩm thực sự xuất sắc! Tôi đã sử dụng laptop này trong hơn một tháng và rất ấn tượng với hiệu năng mạnh mẽ, pin trâu và thiết kế tinh tế. Màn hình hiển thị sắc nét, bàn phím gõ rất êm, phù hợp cho cả công việc văn phòng lẫn chơi game nhẹ. Giao hàng nhanh, đóng gói cẩn thận, đáng giá từng đồng!',
    'Máy có hiệu năng khá tốt, đáp ứng được nhu cầu làm việc hàng ngày của tôi như lướt web, soạn thảo văn bản và xem video. Tuy nhiên, loa âm thanh hơi nhỏ, đôi lúc phải dùng tai nghe để trải nghiệm tốt hơn. Nhìn chung, với mức giá này thì đây là lựa chọn ổn, không có gì để phàn nàn quá nhiều.',
    'Sản phẩm ở mức trung bình. Tôi mua để làm việc từ xa, cấu hình đủ dùng nhưng tốc độ khởi động hơi chậm so với kỳ vọng. Màn hình màu sắc tạm ổn, không quá nổi bật. Điểm cộng là trọng lượng nhẹ, dễ mang theo, nhưng tôi mong nhà sản xuất cải thiện thêm về phần mềm đi kèm.',
    'Thành thật mà nói, tôi không hài lòng lắm. Máy chạy ổn trong tuần đầu, nhưng sau đó bắt đầu có hiện tượng giật lag khi mở nhiều ứng dụng cùng lúc. Pin tụt khá nhanh, chỉ dùng được khoảng 3-4 tiếng dù quảng cáo là 6 tiếng. Đóng gói giao hàng thì ổn, nhưng chất lượng sản phẩm cần được xem xét lại.',
    'Rất thất vọng với chiếc laptop này. Tôi mua để chỉnh sửa ảnh và video nhưng máy quá yếu, không thể xử lý các phần mềm nặng dù cấu hình quảng cáo là đủ dùng. Quạt tản nhiệt kêu to, nóng máy sau khoảng 1 tiếng sử dụng. Tôi đã liên hệ đổi trả nhưng chưa nhận được phản hồi thỏa đáng từ cửa hàng.',
    'Tuyệt vời! Đây là lần đầu tiên tôi mua laptop online mà hài lòng đến vậy. Máy chạy mượt mà, thiết kế sang trọng, phù hợp với công việc lập trình của tôi. Đặc biệt, pin dùng được hơn 8 tiếng liên tục, rất tiện khi phải di chuyển nhiều. Đội ngũ hỗ trợ khách hàng cũng rất nhiệt tình, cho 5 sao không suy nghĩ!',
    'Sản phẩm tốt trong tầm giá. Tôi dùng để học online và làm việc nhóm, máy đáp ứng ổn mọi nhu cầu cơ bản. Điểm trừ nhỏ là vỏ máy dễ bám vân tay, phải lau thường xuyên để giữ sạch sẽ. Giao hàng đúng hẹn, nhân viên tư vấn nhiệt tình, tôi khá hài lòng với trải nghiệm mua sắm lần này.',
    'Máy tạm ổn, không quá đặc biệt. Hiệu năng đủ để lướt web, xem phim và làm việc nhẹ, nhưng khi chạy đa nhiệm thì hơi đuối. Màn hình có góc nhìn hẹp, ngồi lệch một chút là màu sắc bị biến đổi. Với giá tiền này, tôi nghĩ có thể tìm được lựa chọn tốt hơn trên thị trường.'
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

    print(f"INSERT review queries successfully written to {sql_output_path}")

def generate_subscriptions(sql_output_path='./backend/commands/insert_sample_data.sql', num_subs=20):
    names = [
    'NguyenVanAn', 
    'TranThiBinh', 
    'LeMinhChi', 
    'PhamDucDuy', 
    'HoangThiEm', 
    'VuQuangPhat', 
    'BuiTuanGa', 
    'DoanHuyenHa'
    ]
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

    print(f"INSERT subscription queries successfully written to {sql_output_path}")

import random
from datetime import datetime, timedelta

def generate_posts(sql_output_path='./backend/commands/insert_sample_data.sql', num_posts=20):
    global NUM_POSTS
    NUM_POSTS = num_posts

    descriptions = [
        "Khám phá những chiếc laptop chơi game mới nhất!",
        "Nâng cấp góc làm việc của bạn với những phụ kiện tuyệt vời.",
        "Tìm hiểu về những chiếc laptop giá rẻ đáng mua nhất.",
        "Dòng ultrabook mới vừa ra mắt!",
        "Tương lai của máy tính đang ở đây!",
        "10 mẹo giúp bạn làm việc hiệu quả hơn với laptop.",
        "Tối ưu thời lượng pin với những bước đơn giản.",
        "Chơi game di động: Những laptop gaming tốt nhất để mang theo.",
    ]
    
    image_urls = [
        "https://example.com/images/laptop1.jpg",
        "https://example.com/images/laptop2.jpg",
        "https://example.com/images/laptop3.jpg",
        "https://example.com/images/laptop4.jpg",
    ]
    
    links = [
        "https://example.com/bai-viet-1",
        "https://example.com/bai-viet-2",
        "https://example.com/bai-viet-3",
        "https://example.com/bai-viet-4",
    ]
    
    values = []  

    for _ in range(num_posts):  # Không kiểm tra trùng lặp
        description = random.choice(descriptions)
        image_url = random.choice(image_urls)
        link = random.choice(links)
        
        # Sinh ngày ngẫu nhiên trong 365 ngày gần nhất
        days_ago = random.randint(0, 365)
        created_at = (datetime.now() - timedelta(days=days_ago)).date()
        
        values.append(f"('{image_url}', '{description}', '{link}', '{created_at}')")

    insert_query = "INSERT INTO posts (image_url, description, link, created_at) VALUES "
    insert_query += ', '.join(values) + ";"

    with open(sql_output_path, 'a') as sql_file:
        sql_file.write(insert_query + "\n")

    print(f"INSERT post queries successfully written to {sql_output_path}")

def generate_images(template_dir='./backend/static/templates',
                    output_dir='./backend/static/laptop_images'):
    global NUM_LAPTOPS

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        font = ImageFont.truetype("arial.ttf", 150)
    except:
        font = ImageFont.load_default()

    for laptop_id in tqdm(range(1, NUM_LAPTOPS + 1), desc="Generating laptop images"):
        for i in range(1, 4):  # 3 images per laptop
            src_path = os.path.join(template_dir, f'laptop{i}.jpg')
            dest_path = os.path.join(output_dir, f"{laptop_id}_img{i}.jpg")

            if not os.path.exists(src_path):
                print(f"[WARN] Template image {src_path} not found, skipping")
                continue

            with Image.open(src_path) as img:
                draw = ImageDraw.Draw(img)
                draw.text((30, 30), f"ID: {laptop_id}", font=font, fill="black", stroke_fill="white", stroke_width=3)
                img.save(dest_path)

    print(f"Generated mock images for {NUM_LAPTOPS} laptops.")

def generate_post_images(num_posts=20,
                         template_path='./backend/static/templates/posts.jpg',
                         output_dir='./backend/static/post_images'):
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        font = ImageFont.truetype("arial.ttf", size=100)
    except:
        font = ImageFont.load_default()

    for i in tqdm(range(1, num_posts + 1), desc="Generating post images"):
        if not os.path.exists(template_path):
            print(f"[WARN] Template image not found at: {template_path}")
            break

        with Image.open(template_path) as img:
            draw = ImageDraw.Draw(img)
            text = f"Post #{i}"
            draw.text(
                (50, 50),
                text,
                font=font,
                fill="black",
                stroke_width=4,
                stroke_fill="white"
            )

            output_path = os.path.join(output_dir, f"post_{i}.jpg")
            img.save(output_path)

    print(f"Generated {num_posts} post images in '{output_dir}'")

if __name__ == "__main__":
    clear_old_commands()
    generate_laptop_insert_queries()
    generate_images()
    generate_reviews()
    generate_subscriptions()
    generate_posts()
    generate_post_images(num_posts=NUM_POSTS)