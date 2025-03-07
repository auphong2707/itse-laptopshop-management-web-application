import json
import random 
from datetime import datetime


def clear_old_commands():
    with open('./backend/commands/insert_sample_data.sql', 'w') as sql_file:
        sql_file.write("")
    print("Old commands cleared")

def generate_laptop_insert_queries(json_file_path='./backend/data/tgdd_data.json', 
                                 sql_output_path='./backend/commands/insert_sample_data.sql'):
    """
    Generate insert queries from JSON data file
    """
    insert_query = """INSERT INTO laptops (brand, name, cpu, vga, ram_amount, ram_type, storage_amount, 
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
        with open(json_file_path, 'r') as file:
            laptops = json.load(file)
        values = []
        for laptop in laptops:
            value_tuple = (
                convert_value(laptop['brand']),
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
                'NULL',
                str(random.randint(0, 20)),
                convert_value(laptop['price']),
                convert_value(laptop['price'] - random.randint(0, 20)/100 * laptop['price'])
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

def generate_reviews(sql_output_path='./backend/commands/insert_sample_data.sql', num_reviews=30):
    laptop_ids = list(range(1, 200))
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

if __name__ == "__main__":
    # Clear the existing content of the SQL file
    clear_old_commands()
    generate_laptop_insert_queries()
    generate_reviews()
    generate_subscriptions()