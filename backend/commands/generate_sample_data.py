import json
import random
import os
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal, ROUND_HALF_UP
import string

NUM_LAPTOPS = 0
NUM_POSTS = 0


def get_sub_brand(brand, name):
    if brand == "asus":
        sub_brands = ["rog", "tuf", "zenbook", "vivobook"]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == "lenovo":
        sub_brands = ["legion", "loq", "thinkpad", "thinkbook", "yoga", "ideapad"]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == "acer":
        sub_brands = ["predator", "nitro", "swift", "aspire"]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == "dell":
        sub_brands = [
            "alienware",
            "gaming g",
            "xps",
            "inspiron",
            "latitude",
            "precision",
        ]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                if sub_brand == "gaming g":
                    return "g series"
                return sub_brand

    elif brand == "hp":
        sub_brands = ["omen", "victus", "spectre", "envy", "pavilion", "elitebook"]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    elif brand == "msi":
        sub_brands = ["stealth", "katana", "prestigate", "creator", "modern"]
        for sub_brand in sub_brands:
            if sub_brand in name.lower():
                return sub_brand

    return "n/a"


def clear_old_commands():
    with open("./backend/commands/insert_sample_data.sql", "w") as sql_file:
        sql_file.write("")
    print("Old commands cleared")


def generate_laptop_insert_queries(
    json_data_directory="./backend/data/",
    sql_output_path="./backend/commands/insert_sample_data.sql",
):
    """
    Generate insert queries from JSON data file AND store data for orders.
    Handles value formatting inline.
    """
    global NUM_LAPTOPS, LAPTOP_DATA_FOR_ORDERS
    NUM_LAPTOPS = 0
    LAPTOP_DATA_FOR_ORDERS = []

    insert_query_base = """INSERT INTO laptops (brand, sub_brand, name, cpu, vga, ram_amount, ram_type, storage_amount,
        storage_type, webcam_resolution, screen_size, screen_resolution, screen_refresh_rate, screen_brightness,
        battery_capacity, battery_cells, weight, default_os, warranty, width, depth, height,
        number_usb_a_ports, number_usb_c_ports, number_hdmi_ports, number_ethernet_ports, number_audio_jacks, product_image_mini, quantity, original_price, sale_price) VALUES """

    all_values = []

    try:
        # --- Load JSON data (keep as is) ---
        laptops = []
        json_file_paths = [
            os.path.join(json_data_directory, file)
            for file in os.listdir(json_data_directory)
            if file.endswith(".json")
        ]
        print(f"Found {len(json_file_paths)} JSON files for laptops.")
        for json_file_path in json_file_paths:
            with open(json_file_path, "r") as file:
                laptops.extend(json.load(file))
        print(f"Loaded {len(laptops)} potential laptop records.")

        temp_id_counter = 0
        for laptop_raw in laptops:
            # --- Price validation and calculation (keep as is) ---
            if not laptop_raw.get("price") or laptop_raw["price"] == "n/a":
                continue
            try:
                original_price_decimal = Decimal(laptop_raw["price"])
            except TypeError:
                print(f"Skipping invalid price: {laptop_raw.get('name')}")
                continue
            temp_id_counter += 1
            current_laptop_id = temp_id_counter
            sale_discount_percent = Decimal(random.randint(0, 20)) / Decimal(100)
            sale_price_decimal = (
                original_price_decimal * (Decimal(1) - sale_discount_percent)
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            LAPTOP_DATA_FOR_ORDERS.append(
                {
                    "id": current_laptop_id,
                    "original_price": original_price_decimal,
                    "generated_sale_price": sale_price_decimal,
                    "name": laptop_raw.get("name", "Unknown Laptop"),
                }
            )

            # --- Inline Formatting Helper ---
            def format_sql(value):
                if isinstance(value, str) and value.lower() == "n/a":
                    return "NULL"
                if value == "n/a" or value == "N/A":
                    return "NULL"
                if value is None:
                    return "NULL"
                if isinstance(value, str):
                    # --- Previous Fix Applied ---
                    escaped_value = value.replace("'", "''")
                    return f"'{escaped_value}'"
                if isinstance(value, (int, float, Decimal)):
                    return str(value)
                return "NULL"

            # --- FIX for JSON String Formatting ---
            image_paths_list = [
                f"/static/laptop_images/{current_laptop_id}_img{i}.jpg"
                for i in range(1, 4)
            ]
            image_paths_json = json.dumps(image_paths_list)
            escaped_image_paths_json = image_paths_json.replace("'", "''")
            image_paths_sql_string = f"'{escaped_image_paths_json}'"
            # --- END FIX ---

            # Prepare values tuple using inline formatting
            value_tuple = (
                format_sql(laptop_raw.get("brand")),
                format_sql(
                    get_sub_brand(laptop_raw.get("brand"), laptop_raw.get("name"))
                ),
                format_sql(laptop_raw.get("name")),
                format_sql(laptop_raw.get("cpu")),
                format_sql(laptop_raw.get("vga")),
                format_sql(laptop_raw.get("ram_amount")),
                format_sql(laptop_raw.get("ram_type")),
                format_sql(laptop_raw.get("storage_amount")),
                format_sql(laptop_raw.get("storage_type")),
                format_sql(laptop_raw.get("webcam_resolution")),
                format_sql(laptop_raw.get("screen_size")),
                format_sql(laptop_raw.get("screen_resolution")),
                format_sql(laptop_raw.get("screen_refresh_rate")),
                format_sql(laptop_raw.get("screen_brightness")),
                format_sql(laptop_raw.get("battery_capacity")),
                format_sql(laptop_raw.get("battery_cells")),
                format_sql(laptop_raw.get("weight")),
                format_sql(laptop_raw.get("default_os")),
                format_sql(laptop_raw.get("warranty")),
                format_sql(laptop_raw.get("width")),
                format_sql(laptop_raw.get("depth")),
                format_sql(laptop_raw.get("height")),
                format_sql(laptop_raw.get("number_usb_a_ports")),
                format_sql(laptop_raw.get("number_usb_c_ports")),
                format_sql(laptop_raw.get("number_hdmi_ports")),
                format_sql(laptop_raw.get("number_ethernet_ports")),
                format_sql(laptop_raw.get("number_audio_jacks")),
                image_paths_sql_string,
                str(random.randint(5, 50)),
                str(int(original_price_decimal)),
                str(int(sale_price_decimal)),
            )
            all_values.append(f"({', '.join(value_tuple)})")

        NUM_LAPTOPS = temp_id_counter
        print(f"Processed {NUM_LAPTOPS} valid laptop records for insertion.")

        # --- Write SQL (keep as is) ---
        if all_values:
            chunk_size = 500
            with open(sql_output_path, "a") as sql_file:
                sql_file.write("-- Sample Laptop Data --\n")
                for i in range(0, len(all_values), chunk_size):
                    chunk = all_values[i : i + chunk_size]
                    insert_query = insert_query_base + ",\n".join(chunk) + ";\n"
                    sql_file.write(insert_query)
            print(f"INSERT laptop queries successfully written to {sql_output_path}")
        else:
            print("No valid laptop data found to generate SQL.")

    except FileNotFoundError:
        print(f"Error: JSON directory not found at {json_data_directory}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format: {e}")
    except Exception as e:
        print(f"Error occurred during laptop generation: {str(e)}")
        import traceback

        traceback.print_exc()


def generate_reviews(
    sql_output_path="./backend/commands/insert_sample_data.sql", num_reviews=10000
):
    global NUM_LAPTOPS
    laptop_ids = list(range(1, NUM_LAPTOPS + 1))
    user_names = [
        "Nguyen Van An",
        "Tran Thi Binh",
        "Le Minh Chi",
        "Pham Duc Duy",
        "Hoang Thi Em",
        "Vu Quang Phat",
        "Bui Tuan Ga",
        "Doan Huyen Ha",
    ]
    ratings = [1, 2, 3, 4, 5]
    review_texts = [
        "Sản phẩm thực sự xuất sắc! Tôi đã sử dụng laptop này trong hơn một tháng và rất ấn tượng với hiệu năng mạnh mẽ, pin trâu và thiết kế tinh tế. Màn hình hiển thị sắc nét, bàn phím gõ rất êm, phù hợp cho cả công việc văn phòng lẫn chơi game nhẹ. Giao hàng nhanh, đóng gói cẩn thận, đáng giá từng đồng!",
        "Máy có hiệu năng khá tốt, đáp ứng được nhu cầu làm việc hàng ngày của tôi như lướt web, soạn thảo văn bản và xem video. Tuy nhiên, loa âm thanh hơi nhỏ, đôi lúc phải dùng tai nghe để trải nghiệm tốt hơn. Nhìn chung, với mức giá này thì đây là lựa chọn ổn, không có gì để phàn nàn quá nhiều.",
        "Sản phẩm ở mức trung bình. Tôi mua để làm việc từ xa, cấu hình đủ dùng nhưng tốc độ khởi động hơi chậm so với kỳ vọng. Màn hình màu sắc tạm ổn, không quá nổi bật. Điểm cộng là trọng lượng nhẹ, dễ mang theo, nhưng tôi mong nhà sản xuất cải thiện thêm về phần mềm đi kèm.",
        "Thành thật mà nói, tôi không hài lòng lắm. Máy chạy ổn trong tuần đầu, nhưng sau đó bắt đầu có hiện tượng giật lag khi mở nhiều ứng dụng cùng lúc. Pin tụt khá nhanh, chỉ dùng được khoảng 3-4 tiếng dù quảng cáo là 6 tiếng. Đóng gói giao hàng thì ổn, nhưng chất lượng sản phẩm cần được xem xét lại.",
        "Rất thất vọng với chiếc laptop này. Tôi mua để chỉnh sửa ảnh và video nhưng máy quá yếu, không thể xử lý các phần mềm nặng dù cấu hình quảng cáo là đủ dùng. Quạt tản nhiệt kêu to, nóng máy sau khoảng 1 tiếng sử dụng. Tôi đã liên hệ đổi trả nhưng chưa nhận được phản hồi thỏa đáng từ cửa hàng.",
        "Tuyệt vời! Đây là lần đầu tiên tôi mua laptop online mà hài lòng đến vậy. Máy chạy mượt mà, thiết kế sang trọng, phù hợp với công việc lập trình của tôi. Đặc biệt, pin dùng được hơn 8 tiếng liên tục, rất tiện khi phải di chuyển nhiều. Đội ngũ hỗ trợ khách hàng cũng rất nhiệt tình, cho 5 sao không suy nghĩ!",
        "Sản phẩm tốt trong tầm giá. Tôi dùng để học online và làm việc nhóm, máy đáp ứng ổn mọi nhu cầu cơ bản. Điểm trừ nhỏ là vỏ máy dễ bám vân tay, phải lau thường xuyên để giữ sạch sẽ. Giao hàng đúng hẹn, nhân viên tư vấn nhiệt tình, tôi khá hài lòng với trải nghiệm mua sắm lần này.",
        "Máy tạm ổn, không quá đặc biệt. Hiệu năng đủ để lướt web, xem phim và làm việc nhẹ, nhưng khi chạy đa nhiệm thì hơi đuối. Màn hình có góc nhìn hẹp, ngồi lệch một chút là màu sắc bị biến đổi. Với giá tiền này, tôi nghĩ có thể tìm được lựa chọn tốt hơn trên thị trường.",
    ]
    values = []
    for _ in range(num_reviews):
        laptop_id = random.choice(laptop_ids)
        user_name = random.choice(user_names)
        rating = random.choice(ratings)
        review_text = random.choice(review_texts)

        values.append(f"({laptop_id}, '{user_name}', {rating}, '{review_text}')")

    # Create and write the INSERT query
    insert_query = (
        "INSERT INTO reviews (laptop_id, user_name, rating, review_text) VALUES "
    )
    insert_query += ", ".join(values) + ";"

    with open(sql_output_path, "a") as sql_file:
        sql_file.write(insert_query + "\n")

    print(f"INSERT review queries successfully written to {sql_output_path}")


def generate_subscriptions(
    sql_output_path="./backend/commands/insert_sample_data.sql", num_subs=20
):
    names = [
        "NguyenVanAn",
        "TranThiBinh",
        "LeMinhChi",
        "PhamDucDuy",
        "HoangThiEm",
        "VuQuangPhat",
        "BuiTuanGa",
        "DoanHuyenHa",
    ]
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
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
    insert_query += ", ".join(values) + ";"

    with open(sql_output_path, "a") as sql_file:
        sql_file.write(insert_query + "\n")

    print(f"INSERT subscription queries successfully written to {sql_output_path}")


def generate_posts(
    sql_output_path="./backend/commands/insert_sample_data.sql", num_posts=20
):
    global NUM_POSTS
    NUM_POSTS = num_posts  # store for image generation

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

    links = [
        "https://example.com/bai-viet-1",
        "https://example.com/bai-viet-2",
        "https://example.com/bai-viet-3",
        "https://example.com/bai-viet-4",
    ]

    values = []

    for i in tqdm(range(1, num_posts + 1), desc="Generating post SQL"):
        description = random.choice(descriptions)
        link = random.choice(links)

        # Use generated image path
        image_url = f"/static/post_images/post_{i}.jpg"

        # Random created_at
        days_ago = random.randint(0, 365)
        created_at = (datetime.now() - timedelta(days=days_ago)).date()

        values.append(f"('{image_url}', '{description}', '{link}', '{created_at}')")

    insert_query = (
        "INSERT INTO posts (image_url, description, link, created_at) VALUES "
    )
    insert_query += ", ".join(values) + ";"

    with open(sql_output_path, "a") as sql_file:
        sql_file.write(insert_query + "\n")

    print(f"INSERT post queries written for {num_posts} posts to {sql_output_path}")


def generate_laptop_images(
    template_dir="./backend/static/templates",
    output_dir="./backend/static/laptop_images",
):
    global NUM_LAPTOPS

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        font = ImageFont.truetype("arial.ttf", 150)
    except:
        font = ImageFont.load_default()

    def generate_image(laptop_id, i):
        src_path = os.path.join(template_dir, f"laptop{i}.jpg")
        dest_path = os.path.join(output_dir, f"{laptop_id}_img{i}.jpg")

        if not os.path.exists(src_path):
            print(f"[WARN] Template image {src_path} not found, skipping")
            return

        with Image.open(src_path) as img:
            draw = ImageDraw.Draw(img)
            draw.text(
                (30, 30),
                f"ID: {laptop_id}",
                font=font,
                fill="black",
                stroke_fill="white",
                stroke_width=3,
            )
            img.save(dest_path)

    with ThreadPoolExecutor() as executor:
        tasks = [
            executor.submit(generate_image, laptop_id, i)
            for laptop_id in range(1, NUM_LAPTOPS + 1)
            for i in range(1, 4)  # 3 images per laptop
        ]
        for task in tqdm(tasks, desc="Generating laptop images"):
            task.result()

    print(f"Generated mock images for {NUM_LAPTOPS} laptops.")


def generate_post_images(
    num_posts=20,
    template_path="./backend/static/templates/posts.jpg",
    output_dir="./backend/static/post_images",
):

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
                stroke_fill="white",
            )

            output_path = os.path.join(output_dir, f"post_{i}.jpg")
            img.save(output_path)

    print(f"Generated {num_posts} post images in '{output_dir}'")


def generate_orders(
    sql_output_path="./backend/commands/insert_sample_data.sql",
    num_orders=50,
    max_items_per_order=5,
    max_quantity_per_item=3,
):
    """Generates sample orders and order items SQL using inline formatting."""
    global NUM_LAPTOPS, LAPTOP_DATA_FOR_ORDERS
    print(f"\nStarting order generation for {num_orders} orders...")
    if NUM_LAPTOPS == 0 or not LAPTOP_DATA_FOR_ORDERS:
        print("Skipping order generation: No valid laptop data.")
        return

    # --- Generate Fake User Data (keep as before) ---
    fake_users = []
    # ... (user generation lists and logic) ...
    first_names = ["An", "Binh", "Chi", "Duy", "Em", "Phat", "Ga", "Ha", "Khoa", "Lan"]
    last_names = [
        "Nguyen",
        "Tran",
        "Le",
        "Pham",
        "Hoang",
        "Vu",
        "Bui",
        "Doan",
        "Dang",
        "Ngo",
    ]
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]
    countries = ["VN", "US", "SG", "KR", "JP"]
    statuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
    ]

    def generate_fake_uid(length=28):
        real_uid = "UXXB26VXsZdin2QRTDvQtKW8HiI2"
        return random.choice([real_uid, "".join(random.choices(string.ascii_letters + string.digits, k=length))])

    for i in range(num_orders):
        first = random.choice(first_names)
        last = random.choice(last_names)
        email = f"{first.lower()}.{last.lower()}{random.randint(1,99)}@{random.choice(domains)}"
        fake_users.append(
            {
                "user_id": generate_fake_uid(),
                "first_name": first,
                "last_name": last,
                "user_name": f"{first} {last}",
                "user_email": email,
                "shipping_address": f"{random.randint(1, 100)} {random.choice(['Main St', 'High St', 'Elm St'])}, {random.choice(['Hanoi', 'HCMC', 'Danang'])}",
                "phone_number": f"+84{random.randint(900000000, 999999999)}",
                "company": random.choice(
                    [None, "TechCorp", "Innovate Ltd", "Sample Co"]
                ),
                "country": random.choice(countries),
                "zip_code": str(random.randint(10000, 99999)),
            }
        )

    # --- Prepare SQL Statements (keep as before) ---
    order_inserts = []
    order_item_inserts = []
    current_order_id = 0
    laptop_price_map = {laptop["id"]: laptop for laptop in LAPTOP_DATA_FOR_ORDERS}

    # --- Proactive Fix for Inline Formatting Helper within this function ---
    def format_sql_local(value):
        if isinstance(value, str) and value.lower() == "n/a":
            return "NULL"
        if value == "n/a" or value == "N/A":
            return "NULL"
        if value is None:
            return "NULL"
        if isinstance(value, str):
            # --- Apply same fix as above ---
            escaped_value = value.replace("'", "''")
            return f"'{escaped_value}'"
        if isinstance(value, datetime):
            return f"'{value.strftime('%Y-%m-%d %H:%M:%S')}'"
        if isinstance(value, Decimal):
            return f"'{value.quantize(Decimal('0.01'))}'"
        if isinstance(value, (int, float)):
            return str(value)
        return "NULL"

    # --- End Proactive Fix ---

    for i in tqdm(range(num_orders), desc="Generating order SQL"):
        # --- Order and Item Generation Logic (keep as before) ---
        current_order_id += 1
        user_data = random.choice(fake_users)
        num_items = random.randint(1, max_items_per_order)
        order_total_price = Decimal("0.00")
        order_status = random.choice(statuses)
        days_ago = random.randint(1, 365)
        created_at_dt = datetime.now() - timedelta(days=days_ago)
        current_order_items = []
        laptops_in_this_order = set()
        for _ in range(num_items):
            available_laptop_ids = list(
                set(laptop_price_map.keys()) - laptops_in_this_order
            )
            if not available_laptop_ids:
                break
            laptop_id = random.choice(available_laptop_ids)
            laptops_in_this_order.add(laptop_id)
            laptop_info = laptop_price_map.get(laptop_id)
            if not laptop_info:
                continue
            quantity = random.randint(1, max_quantity_per_item)
            price_at_purchase = laptop_info["generated_sale_price"]
            order_total_price += price_at_purchase * quantity
            current_order_items.append((laptop_id, quantity, price_at_purchase))

        # Generate ORDER INSERT using the fixed inline helper
        order_values = (
            format_sql_local(user_data["user_id"]),
            format_sql_local(user_data["first_name"]),
            format_sql_local(user_data["last_name"]),
            format_sql_local(user_data["user_name"]),
            format_sql_local(user_data["user_email"]),
            format_sql_local(user_data["shipping_address"]),
            format_sql_local(user_data["phone_number"]),
            format_sql_local(user_data["company"]),
            format_sql_local(user_data["country"]),
            format_sql_local(user_data["zip_code"]),
            format_sql_local(order_total_price),
            format_sql_local(order_status),
            format_sql_local(created_at_dt),
            format_sql_local(created_at_dt),
        )
        order_inserts.append(f"({', '.join(order_values)})")

        # Generate ORDER ITEM INSERTS using the fixed inline helper
        for item_tuple in current_order_items:
            item_values = (
                str(current_order_id),
                str(item_tuple[0]),
                str(item_tuple[1]),
                format_sql_local(item_tuple[2]),  # price_at_purchase
            )
            order_item_inserts.append(f"({', '.join(item_values)})")

    # --- Write SQL to File (keep as before) ---
    # ... (SQL writing logic) ...
    with open(sql_output_path, "a") as sql_file:
        sql_file.write("\n-- Sample Order Data --\n")
        if order_inserts:
            order_cols = "(user_id, first_name, last_name, user_name, user_email, shipping_address, phone_number, company, country, zip_code, total_price, status, created_at, updated_at)"
            chunk_size = 100
            for i in range(0, len(order_inserts), chunk_size):
                chunk = order_inserts[i : i + chunk_size]
                sql_file.write(
                    f"INSERT INTO orders {order_cols} VALUES\n"
                    + ",\n".join(chunk)
                    + ";\n"
                )
        else:
            sql_file.write("-- No orders generated --\n")
        sql_file.write("\n-- Sample Order Item Data --\n")
        if order_item_inserts:
            item_cols = "(order_id, product_id, quantity, price_at_purchase)"
            chunk_size = 500
            for i in range(0, len(order_item_inserts), chunk_size):
                chunk = order_item_inserts[i : i + chunk_size]
                sql_file.write(
                    f"INSERT INTO order_items {item_cols} VALUES\n"
                    + ",\n".join(chunk)
                    + ";\n"
                )
        else:
            sql_file.write("-- No order items generated --\n")
    print(
        f"INSERT queries for {num_orders} orders and their items written to {sql_output_path}"
    )
    print(
        "IMPORTANT: Assumed Order IDs start from 1. Ensure sequence alignment if needed."
    )

def generate_refund_tickets(
    sql_output_path="./backend/commands/insert_sample_data.sql",
    num_tickets=30,
):
    statuses = ["pending", "rejected"]  # 'approved' handled via resolved_at trigger
    reasons = [
        "Sản phẩm bị lỗi phần cứng.",
        "Không đúng mô tả.",
        "Không hài lòng với chất lượng.",
        "Giao nhầm sản phẩm.",
        "Thay đổi nhu cầu sử dụng.",
        "Không tương thích với phần mềm cần thiết.",
        "Giao hàng trễ.",
        "Sản phẩm đã qua sử dụng.",
    ]

    possible_order_ids = list(range(1, 101))  # assuming 100 orders
    used_combinations = set()
    values = []

    for _ in range(num_tickets):
        # Ensure unique (email, phone) as per schema constraint
        while True:
            email = f"user{random.randint(1, 200)}@example.com"
            phone = f"+84{random.randint(900000000, 999999999)}"
            key = (email, phone)
            if key not in used_combinations:
                used_combinations.add(key)
                break

        order_id = random.choice(possible_order_ids)
        reason = random.choice(reasons)
        amount = round(random.uniform(500000, 20000000), 2)
        status = random.choice(statuses)
        created_at = datetime.utcnow() - timedelta(days=random.randint(1, 100))
        resolved_at = None
        if status == "rejected":
            resolved_at = created_at + timedelta(days=random.randint(1, 7))

        updated_at = resolved_at or (created_at + timedelta(days=random.randint(1, 3)))

        def fmt(val):
            if val is None:
                return "NULL"
            if isinstance(val, datetime):
                return f"'{val.strftime('%Y-%m-%d %H:%M:%S')}'"
            if isinstance(val, str):
                escaped = val.replace("'", "''")
                return f"'{escaped}'"
            return str(val)

        values.append(
            f"({fmt(email)}, {fmt(phone)}, {order_id}, {fmt(reason)}, {amount}, "
            f"{fmt(status)}, {fmt(created_at)}, {fmt(resolved_at)}, {fmt(updated_at)})"
        )

    if values:
        insert_query = (
            "-- Sample Refund Tickets --\n"
            "INSERT INTO refund_tickets "
            "(email, phone_number, order_id, reason, amount, status, created_at, resolved_at, updated_at)\nVALUES\n"
            + ",\n".join(values)
            + ";\n"
        )
        with open(sql_output_path, "a") as f:
            f.write("\n" + insert_query)
        print(f"[✓] Generated and wrote {num_tickets} refund tickets to {sql_output_path}")
    else:
        print("No refund tickets generated.")


if __name__ == "__main__":
    clear_old_commands()
    generate_laptop_insert_queries()
    generate_laptop_images()
    generate_reviews()
    generate_subscriptions()
    generate_posts()
    generate_post_images(num_posts=NUM_POSTS)
    generate_orders(num_orders=100)
    generate_refund_tickets(num_tickets=30)
