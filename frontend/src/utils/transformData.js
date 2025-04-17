const transformLaptopData = (data) => {
  return data.map((item) => {
    return {
      productName: item.name.toUpperCase(),
      numRate: item.num_rate,
      originalPrice: item.original_price,
      imgSource: JSON.parse(item.product_image_mini || "[]").map(
        (url) => `http://localhost:8000${url}`,
      )[0],
      inStock: item.quantity > 0,
      rate: item.rate,
      salePrice: item.sale_price,
      productId: item.id,
    };
  });
};

export { transformLaptopData };
