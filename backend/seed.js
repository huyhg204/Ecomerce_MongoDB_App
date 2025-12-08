const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Counter = require('./models/Counter');
const News = require('./models/News');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Banner = require('./models/Banner');

// Kết nối database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB kết nối thành công!');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

// Dữ liệu mẫu
const seedData = async () => {
  try {
    console.log('\n🔄 Bắt đầu seed dữ liệu...\n');

    // Xóa dữ liệu cũ (tùy chọn - comment nếu muốn giữ dữ liệu cũ)
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await News.deleteMany({});
    await Coupon.deleteMany({});
    await Counter.deleteMany({});
    await Banner.deleteMany({});
    console.log('✅ Đã xóa dữ liệu cũ!\n');

    // Helper function để tạo slug từ name
    const createSlug = (name) => {
      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-") // Thay ký tự đặc biệt bằng dấu gạch ngang
        .replace(/^-+|-+$/g, ""); // Loại bỏ dấu gạch ngang ở đầu và cuối
    };

    // 1. Tạo Categories
    console.log('📁 Đang tạo Categories...');
    const categoryData = [
      {
        name: 'Laptop',
        description: 'Laptop và máy tính xách tay các loại',
        image: 'banner.jpg',
        slug: 'laptop',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Máy tính để bàn',
        description: 'PC Desktop và các linh kiện máy tính',
        image: 'banner.jpg',
        slug: 'may-tinh-de-ban',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Phụ kiện',
        description: 'Chuột, bàn phím, tai nghe và các phụ kiện khác',
        image: 'banner.jpg',
        slug: 'phu-kien',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Màn hình',
        description: 'Màn hình máy tính các loại',
        image: 'banner.jpg',
        slug: 'man-hinh',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Linh kiện',
        description: 'RAM, Ổ cứng, Card đồ họa và các linh kiện khác',
        image: 'banner.jpg',
        slug: 'linh-kien',
        isActive: true,
        sortOrder: 5
      }
    ];
    
    // Insert từng category để đảm bảo slug được tạo đúng
    const categories = [];
    for (const catData of categoryData) {
      const category = await Category.create(catData);
      categories.push(category);
    }
    console.log(`✅ Đã tạo ${categories.length} categories\n`);

    // 2. Tạo Brands
    console.log('🏷️  Đang tạo Brands...');
    const brandData = [
      {
        name: 'Dell',
        description: 'Thương hiệu laptop và máy tính hàng đầu',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Apple',
        description: 'Thương hiệu công nghệ cao cấp',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'ASUS',
        description: 'Thương hiệu laptop gaming và công nghệ',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'HP',
        description: 'Thương hiệu máy tính và in ấn',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Lenovo',
        description: 'Thương hiệu laptop doanh nhân',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Acer',
        description: 'Thương hiệu laptop giá rẻ',
        isActive: true,
        sortOrder: 6
      },
      {
        name: 'MSI',
        description: 'Thương hiệu laptop gaming chuyên nghiệp',
        isActive: true,
        sortOrder: 7
      }
    ];

    // Tạo slug cho brands
    brandData.forEach(brand => {
      brand.slug = createSlug(brand.name);
    });

    const brands = await Brand.insertMany(brandData);
    console.log(`✅ Đã tạo ${brands.length} brands\n`);

    // Tạo map brand name -> ObjectId
    const brandMap = {};
    brands.forEach(brand => {
      brandMap[brand.name] = brand._id;
    });

    // 3. Tạo Users
    console.log('👥 Đang tạo Users...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const now = new Date(); // Dùng chung cho users và orders
    
    // Tạo nhiều users hơn với các ngày đăng ký khác nhau
    const userNames = [
      { name: 'Nguyễn Văn Admin', email: 'admin@example.com', role: 'admin' },
      { name: 'Trần Thị Bình', email: 'user1@example.com', role: 'user' },
      { name: 'Lê Văn Cường', email: 'user2@example.com', role: 'user' },
      { name: 'Phạm Thị Dung', email: 'user3@example.com', role: 'user' },
      { name: 'Hoàng Văn Em', email: 'user4@example.com', role: 'user' },
      { name: 'Võ Thị Phương', email: 'user5@example.com', role: 'user' },
      { name: 'Đỗ Văn Giang', email: 'user6@example.com', role: 'user' },
      { name: 'Bùi Thị Hoa', email: 'user7@example.com', role: 'user' },
      { name: 'Ngô Văn Hùng', email: 'user8@example.com', role: 'user' },
      { name: 'Lý Thị Lan', email: 'user9@example.com', role: 'user' },
      { name: 'Trương Văn Minh', email: 'user10@example.com', role: 'user' },
      { name: 'Vũ Thị Nga', email: 'user11@example.com', role: 'user' },
      { name: 'Đinh Văn Oanh', email: 'user12@example.com', role: 'user' },
      { name: 'Lương Thị Phượng', email: 'user13@example.com', role: 'user' },
      { name: 'Phan Văn Quang', email: 'user14@example.com', role: 'user' },
      { name: 'Hoàng Thị Rinh', email: 'user15@example.com', role: 'user' },
      { name: 'Nguyễn Văn Sơn', email: 'user16@example.com', role: 'user' },
      { name: 'Trần Thị Tuyết', email: 'user17@example.com', role: 'user' },
      { name: 'Lê Văn Uyên', email: 'user18@example.com', role: 'user' },
      { name: 'Phạm Thị Vân', email: 'user19@example.com', role: 'user' },
      { name: 'Hoàng Văn Xuyên', email: 'user20@example.com', role: 'user' },
      { name: 'Võ Thị Yến', email: 'user21@example.com', role: 'user' },
      { name: 'Đỗ Văn Anh', email: 'user22@example.com', role: 'user' },
      { name: 'Bùi Thị Bích', email: 'user23@example.com', role: 'user' },
      { name: 'Ngô Văn Cường', email: 'user24@example.com', role: 'user' },
      { name: 'Lý Thị Dung', email: 'user25@example.com', role: 'user' }
    ];
    
    const users = [];
    for (let i = 0; i < userNames.length; i++) {
      // Tạo users với các ngày đăng ký khác nhau (trong 60 ngày qua)
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      const user = await User.create({
        ...userNames[i],
        password: hashedPassword,
        phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        address: `${Math.floor(Math.random() * 999) + 1} Đường ${String.fromCharCode(65 + i)}${String.fromCharCode(65 + i + 1)}${String.fromCharCode(65 + i + 2)}, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        createdAt,
        updatedAt: createdAt
      });
      users.push(user);
    }
    console.log(`✅ Đã tạo ${users.length} users\n`);

    // 4. Tạo Products
    console.log('📦 Đang tạo Products...');
    
    // Helper function để tạo product data với code và colorStocks
    // price: giá bán (sau khi giảm nếu có salePercent)
    // salePercent: phần trăm giảm giá (0-100)
    // oldPrice sẽ được tự động tính bởi Product model middleware
    // tag: single tag "sale", "new", "featured" hoặc null
    // images: mảng các ảnh phụ (optional)
    // color: màu sắc sản phẩm (optional)
    const createProduct = (name, originalPrice, salePercent, brandName, image, categoryId, tag = null, images = [], color = "") => {
      const brandCode = brandName.substring(0, 3).toUpperCase();
      const productCode = `${brandCode}-${name.substring(name.length - 3).toUpperCase().replace(/\s/g, '')}-${Math.floor(Math.random() * 1000)}`;
      // Thêm đường dẫn img/ vào trước tên file hình ảnh
      const imagePath = image.startsWith('img/') || image.startsWith('http') ? image : `img/${image}`;
      
      // Xử lý mảng ảnh phụ
      const imagesArray = images.map(img => 
        img.startsWith('img/') || img.startsWith('http') ? img : `img/${img}`
      );
      
      // Tính giá bán (price) từ giá gốc và phần trăm giảm
      // Nếu có salePercent, price = originalPrice * (1 - salePercent/100)
      // Nếu không có salePercent, price = originalPrice
      const priceValue = salePercent > 0 
        ? Math.round(originalPrice * (1 - salePercent / 100))
        : originalPrice;
      
      // Tính oldPrice (giá gốc) từ price và salePercent
      // Nếu có salePercent > 0, oldPrice = price / (1 - salePercent/100)
      // Nếu không có salePercent, oldPrice = price
      const oldPriceValue = salePercent > 0 && priceValue > 0
        ? Math.round(priceValue / (1 - salePercent / 100))
        : originalPrice;
      
      // Tự động gán màu ngẫu nhiên nếu không có màu được truyền vào
      // color có thể là string (comma-separated) hoặc array
      let productColors = [];
      if (color) {
        if (typeof color === 'string') {
          productColors = color.split(',').map(c => c.trim()).filter(c => c.length > 0);
        } else if (Array.isArray(color)) {
          productColors = color;
        }
      }
      
      // Nếu không có màu, tự động gán 2-4 màu ngẫu nhiên
      if (productColors.length === 0) {
        const allColors = ['Đen', 'Trắng', 'Xám', 'Bạc', 'Vàng', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Hồng', 'Tím'];
        const numColors = Math.floor(Math.random() * 3) + 2; // 2-4 màu
        const shuffled = [...allColors].sort(() => Math.random() - 0.5);
        productColors = shuffled.slice(0, numColors);
      }
      
      // Tạo colorStocks với số lượng ngẫu nhiên cho mỗi màu (10-100 mỗi màu)
      const colorStocks = productColors.map(colorName => ({
        name: colorName,
        stock: Math.floor(Math.random() * 91) + 10 // 10-100
      }));
      
      // Tính stock tổng từ colorStocks
      const totalStock = colorStocks.reduce((sum, cs) => sum + cs.stock, 0);
      
      return {
        name,
        code: productCode,
        price: priceValue.toString(), // Giá bán (sau khi giảm)
        oldPrice: oldPriceValue.toString(), // Giá gốc (tính từ price và salePercent)
        salePercent: salePercent || 0,
        brand: brandMap[brandName],
        image: imagePath,
        images: imagesArray, // Mảng các ảnh phụ
        category: categoryId,
        inStock: totalStock > 0,
        stock: totalStock, // Tự động tính từ colorStocks
        isActive: true, // Trạng thái hoạt động
        tag: tag || null, // Chỉ 1 tag
        color: productColors, // Mảng màu sắc (backward compatibility)
        colorStocks: colorStocks // Mảng màu với số lượng riêng
      };
    };
    
    // Danh sách màu sắc mẫu
    const colors = ['Đen', 'Trắng', 'Xám', 'Bạc', 'Vàng', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Hồng', 'Tím'];
    
    // Danh sách hình ảnh mẫu từ Unsplash (laptop images)
    const productImages = [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', // Dell XPS
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', // MacBook
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop', // ASUS Gaming
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop', // HP
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', // Lenovo
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop', // Acer
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', // MSI
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&h=600&fit=crop', // Laptop 8
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', // Laptop 9
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop', // Laptop 10
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop', // Laptop 11
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', // Laptop 12
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop', // Laptop 13
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', // Laptop 14
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&h=600&fit=crop', // Laptop 15
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', // Laptop 16
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop', // Laptop 17
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop', // Laptop 18
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', // Laptop 19
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop', // Laptop 20
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', // Laptop 21
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&h=600&fit=crop', // Laptop 22
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', // Laptop 23
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop', // Laptop 24
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop', // Laptop 25
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', // Laptop 26
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop', // Laptop 27
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', // Laptop 28
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&h=600&fit=crop', // Laptop 29
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'  // Laptop 30
    ];

    // Tạo products với giá gốc (originalPrice) và salePercent
    // Hàm createProduct sẽ tự động tính price (giá bán) từ originalPrice và salePercent
    // Middleware của Product model sẽ tự động tính oldPrice từ price và salePercent
    // Tag: "sale" (khuyến mãi), "new" (mới nhất), "featured" (nổi bật) - chỉ 1 tag
    // Images: mảng các ảnh phụ (tối đa 10 ảnh)
    const products = await Product.insertMany([
      // Laptop Dell
      createProduct('Laptop Dell XPS 13', 25990000, 10, 'Dell', productImages[0], categories[0]._id, 'featured', [productImages[1], productImages[2]]),
      createProduct('Laptop Dell Inspiron 15', 17990000, 7, 'Dell', productImages[7], categories[0]._id, 'sale', [productImages[8], productImages[9]]),
      createProduct('Laptop Dell Latitude 5520', 20990000, 0, 'Dell', productImages[21], categories[0]._id, 'new', [productImages[22], productImages[23]]),
      createProduct('Laptop Dell G15 Gaming', 21990000, 12, 'Dell', productImages[28], categories[0]._id, 'sale', [productImages[29], productImages[0]]),
      createProduct('Laptop Dell Alienware M15', 49990000, 10, 'Dell', productImages[14], categories[0]._id, 'sale', [productImages[15], productImages[16], productImages[17]]),
      // Laptop Apple
      createProduct('MacBook Pro M2 14 inch', 45990000, 5, 'Apple', productImages[1], categories[0]._id, 'featured', [productImages[2], productImages[3], productImages[4]]),
      createProduct('MacBook Air M1', 29990000, 0, 'Apple', productImages[8], categories[0]._id, 'new', [productImages[9], productImages[10]]),
      createProduct('MacBook Pro M3 16 inch', 54990000, 0, 'Apple', productImages[15], categories[0]._id, 'new', [productImages[16], productImages[17], productImages[18]]),
      createProduct('MacBook Air M2', 32990000, 0, 'Apple', productImages[22], categories[0]._id, 'featured', [productImages[23], productImages[24]]),
      // Laptop ASUS
      createProduct('Laptop ASUS ROG Strix G15', 32990000, 15, 'ASUS', productImages[2], categories[0]._id, 'sale', [productImages[3], productImages[4], productImages[5]]),
      createProduct('Laptop ASUS VivoBook S15', 16990000, 10, 'ASUS', productImages[9], categories[0]._id, 'sale', [productImages[10], productImages[11]]),
      createProduct('Laptop ASUS ZenBook 14', 22990000, 8, 'ASUS', productImages[16], categories[0]._id, 'new', [productImages[17], productImages[18], productImages[19]]),
      createProduct('Laptop ASUS TUF Gaming F15', 23990000, 10, 'ASUS', productImages[23], categories[0]._id, 'sale', [productImages[24], productImages[25]]),
      createProduct('Laptop ASUS ProArt StudioBook', 39990000, 0, 'ASUS', productImages[29], categories[0]._id, 'featured', [productImages[0], productImages[1], productImages[2]]),
      // Laptop HP
      createProduct('Laptop HP Pavilion 15', 18990000, 0, 'HP', productImages[3], categories[0]._id, 'new', [productImages[4], productImages[5]]),
      createProduct('Laptop HP EliteBook 840', 23990000, 5, 'HP', productImages[10], categories[0]._id, 'sale', [productImages[11], productImages[12], productImages[13]]),
      createProduct('Laptop HP Omen 16', 28990000, 12, 'HP', productImages[17], categories[0]._id, 'sale', [productImages[18], productImages[19]]),
      createProduct('Laptop HP Spectre x360', 29990000, 0, 'HP', productImages[24], categories[0]._id, 'featured', [productImages[25], productImages[26], productImages[27]]),
      // Laptop Lenovo
      createProduct('Laptop Lenovo ThinkPad X1', 21990000, 8, 'Lenovo', productImages[4], categories[0]._id, 'new', [productImages[5], productImages[6], productImages[7]]),
      createProduct('Laptop Lenovo Yoga 9i', 24990000, 0, 'Lenovo', productImages[11], categories[0]._id, 'new', [productImages[12], productImages[13]]),
      createProduct('Laptop Lenovo Legion 5', 26990000, 0, 'Lenovo', productImages[18], categories[0]._id, 'featured', [productImages[19], productImages[20], productImages[21]]),
      createProduct('Laptop Lenovo IdeaPad 3', 14990000, 15, 'Lenovo', productImages[25], categories[0]._id, 'sale', [productImages[26], productImages[27]]),
      // Laptop Acer
      createProduct('Laptop Acer Aspire 5', 15990000, 12, 'Acer', productImages[5], categories[0]._id, 'sale', [productImages[6], productImages[7], productImages[8]]),
      createProduct('Laptop Acer Nitro 5', 19990000, 15, 'Acer', productImages[12], categories[0]._id, 'sale', [productImages[13], productImages[14]]),
      createProduct('Laptop Acer Predator Helios', 31990000, 20, 'Acer', productImages[19], categories[0]._id, 'featured', [productImages[20], productImages[21], productImages[22]]),
      createProduct('Laptop Acer Swift 3', 17990000, 8, 'Acer', productImages[26], categories[0]._id, 'new', [productImages[27], productImages[28]]),
      // Laptop MSI
      createProduct('Laptop MSI Gaming GF63', 27990000, 0, 'MSI', productImages[6], categories[0]._id, 'new', [productImages[7], productImages[8], productImages[9]]),
      createProduct('Laptop MSI Creator Z16', 34990000, 0, 'MSI', productImages[13], categories[0]._id, 'featured', [productImages[14], productImages[15]]),
      createProduct('Laptop MSI Stealth 15M', 37990000, 5, 'MSI', productImages[20], categories[0]._id, 'new', [productImages[21], productImages[22], productImages[23]]),
      createProduct('Laptop MSI Modern 14', 19990000, 10, 'MSI', productImages[27], categories[0]._id, 'sale', [productImages[28], productImages[29]])
    ]);
    console.log(`✅ Đã tạo ${products.length} products\n`);

    // 5. Tạo Carts
    // Không tạo cart với items mặc định - để user tự thêm vào giỏ hàng
    console.log('🛒 Đang tạo Carts...');
    const carts = []; // Không tạo carts, để user tự thêm vào giỏ hàng
    // const carts = await Cart.insertMany([
    //   {
    //     userId: users[0]._id.toString(),
    //     items: [
    //       {
    //         productId: products[0]._id,
    //         quantity: 2
    //       },
    //       {
    //         productId: products[5]._id,
    //         quantity: 1
    //       }
    //     ]
    //   },
    //   {
    //     userId: users[1]._id.toString(),
    //     items: [
    //       {
    //         productId: products[2]._id,
    //         quantity: 1
    //       },
    //       {
    //         productId: products[3]._id,
    //         quantity: 3
    //       },
    //       {
    //         productId: products[4]._id,
    //         quantity: 1
    //       }
    //     ]
    //   },
    //   {
    //     userId: users[2]._id.toString(),
    //     items: [
    //       {
    //         productId: products[6]._id,
    //         quantity: 2
    //       },
    //       {
    //         productId: products[7]._id,
    //         quantity: 1
    //       }
    //     ]
    //   },
    //   {
    //     userId: users[3]._id.toString(),
    //     items: [
    //       {
    //         productId: products[10]._id,
    //         quantity: 1
    //       }
    //     ]
    //   }
    // ]);
    // console.log(`✅ Đã tạo ${carts.length} carts\n`);
    console.log(`✅ Đã bỏ qua tạo carts (để user tự thêm vào giỏ hàng)\n`);

    // 6. Tạo Orders với các ngày khác nhau
    console.log('📦 Đang tạo Orders...');
    const orderStatuses = ['pending', 'processing', 'handover_to_carrier', 'shipping', 'delivered', 'received', 'cancelled'];
    const paymentMethods = ['cod', 'bank_transfer', 'momo', 'zalopay'];
    const paymentStatuses = ['unpaid', 'paid'];
    
    const orders = [];
    
    // Lọc users có role là 'user' (dùng chung cho Orders và Reviews)
    const userUsers = users.filter(u => u.role === 'user');
    
    // Tạo khoảng 80-100 orders trong 30 ngày qua
    const numOrders = 90;
    
    for (let i = 0; i < numOrders; i++) {
      // Random ngày trong 30 ngày qua
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      // Random user
      const user = userUsers[Math.floor(Math.random() * userUsers.length)];
      
      // Random 1-4 sản phẩm
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();
      
      for (let j = 0; j < numItems; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (usedProductIds.has(product._id.toString()));
        usedProductIds.add(product._id.toString());
        
        const price = parseFloat(product.price.toString());
        const oldPrice = product.oldPrice ? parseFloat(product.oldPrice.toString()) : price;
        
        selectedProducts.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: price, // Giá giảm (sau sale)
          oldPrice: oldPrice, // Giá gốc
          quantity: Math.floor(Math.random() * 3) + 1
        });
      }
      
      // Tính tổng theo logic mới
      // Tổng tiền gốc (để tính tiết kiệm)
      const originalTotal = selectedProducts.reduce((sum, item) => {
        const hasSale = item.oldPrice > item.price && item.oldPrice > 0;
        return sum + (hasSale ? item.oldPrice : item.price) * item.quantity;
      }, 0);
      
      // Tạm tính (tổng tiền giá giảm)
      const subTotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Thành tiền (giá giảm - trước voucher)
      const total = subTotal;
      
      // Tiết kiệm
      const savings = originalTotal - total;
      
      const shippingFee = Math.random() > 0.5 ? 30000 : 0;
      const discount = Math.random() > 0.7 ? Math.floor(total * 0.1) : 0;
      const grandTotal = total + shippingFee - discount;
      
      // Random status (tỷ lệ: nhiều delivered/received, ít cancelled)
      let status;
      const rand = Math.random();
      if (rand < 0.05) status = 'pending';
      else if (rand < 0.15) status = 'processing';
      else if (rand < 0.25) status = 'handover_to_carrier';
      else if (rand < 0.35) status = 'shipping';
      else if (rand < 0.7) status = 'delivered';
      else if (rand < 0.95) status = 'received';
      else status = 'cancelled';
      
      // Payment method và status
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'cancelled' ? 'unpaid' : (Math.random() > 0.3 ? 'paid' : 'unpaid');
      
      // Shipping info
      const shippingInfo = {
        fullName: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        city: 'TP.HCM',
        district: `Quận ${Math.floor(Math.random() * 12) + 1}`,
        ward: `Phường ${Math.floor(Math.random() * 20) + 1}`,
        note: Math.random() > 0.7 ? 'Giao hàng vào buổi sáng' : ''
      };
      
      // Status history
      const statusHistory = [
        {
          status: 'pending',
          note: 'Đơn hàng được tạo thành công',
          updatedBy: user._id.toString(),
          updatedAt: createdAt
        }
      ];
      
      // Thêm các status tiếp theo nếu đơn đã qua pending
      if (status !== 'pending') {
        const statusOrder = ['pending', 'processing', 'handover_to_carrier', 'shipping', 'delivered', 'received'];
        const currentIndex = statusOrder.indexOf(status);
        for (let k = 1; k <= currentIndex; k++) {
          const statusDate = new Date(createdAt);
          statusDate.setDate(statusDate.getDate() + k);
          statusHistory.push({
            status: statusOrder[k],
            note: `Cập nhật trạng thái: ${statusOrder[k]}`,
            updatedBy: 'admin',
            updatedAt: statusDate
          });
        }
      }
      
      const order = await Order.create({
        userId: user._id.toString(),
        items: selectedProducts,
        shippingInfo,
        paymentMethod,
        paymentStatus,
        status,
        totals: {
          subTotal, // Tạm tính (giá giảm)
          total, // Thành tiền (giá giảm - trước voucher)
          savings, // Tiết kiệm
          shippingFee,
          discount,
          grandTotal
        },
        statusHistory,
        createdAt,
        updatedAt: createdAt
      });
      
      orders.push(order);
    }
    console.log(`✅ Đã tạo ${orders.length} orders\n`);

    // 7. Tạo/Update Counters
    console.log('🔢 Đang tạo/Update Counters...');
    const counterData = [
      { _id: 'productId', seq: products.length },
      { _id: 'order', seq: orders.length },
      { _id: 'userId', seq: users.length },
      { _id: 'categoryId', seq: categories.length }
    ];
    
    const counters = [];
    for (const counterInfo of counterData) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: counterInfo._id },
        { $set: { seq: counterInfo.seq } },
        { new: true, upsert: true }
      );
      counters.push(counter);
    }
    console.log(`✅ Đã tạo/update ${counters.length} counters\n`);

    // 8. Tạo News
    console.log('📰 Đang tạo News...');
    const newsData = [
      {
        title: '🔥 Chào đón mùa tựu trường – Ưu đãi đặc biệt cho học sinh, sinh viên và Quý thầy cô!',
        summary: 'Chương trình ưu đãi đặc biệt dành cho học sinh, sinh viên và giáo viên với mức giảm giá lên đến 20%',
        content: `Chào đón mùa tựu trường 2025!

Nhân dịp mùa tựu trường, chúng tôi xin gửi đến Quý khách hàng chương trình ưu đãi đặc biệt dành riêng cho học sinh, sinh viên và giáo viên.

🎁 Ưu đãi hấp dẫn:

• Giảm giá trực tiếp 15-20% cho tất cả sản phẩm laptop, máy tính
• Tặng kèm phụ kiện: Chuột không dây, túi đựng laptop, balo
• Bảo hành mở rộng thêm 6 tháng
• Hỗ trợ trả góp 0% lãi suất trong 6 tháng đầu

📋 Điều kiện áp dụng:

Xuất trình thẻ học sinh/sinh viên hoặc thẻ giáo viên khi mua hàng.

Thời gian áp dụng: Từ 01/09/2025 đến 30/09/2025`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: true,
        views: 0
      },
      {
        title: '⚡ SALE SẬP SÀN – GIÁ CHỈ TỪ 19K!',
        summary: 'Chương trình khuyến mãi lớn nhất năm với hàng ngàn sản phẩm giảm giá sâu',
        content: `SALE SẬP SÀN - Không thể bỏ lỡ!

Chương trình khuyến mãi lớn nhất trong năm với hàng ngàn sản phẩm được giảm giá sâu lên đến 70%.

🔥 Sản phẩm nổi bật:

• Phụ kiện máy tính: Từ 19.000đ
• Chuột, bàn phím: Giảm đến 50%
• Tai nghe, loa: Giảm đến 40%
• Ổ cứng, USB: Giảm đến 35%

Thời gian: Từ 15/11/2025 đến 30/11/2025

Áp dụng: Tất cả chi nhánh và website`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: true,
        views: 0
      },
      {
        title: '💻 MUA LAPTOP – GIẢM THÊM TỚI 500.000Đ + QUÀ TẶNG CAO CẤP',
        summary: 'Mua laptop được giảm thêm 500.000đ và nhận ngay quà tặng cao cấp',
        content: `Chương trình mua laptop siêu ưu đãi!

Khi mua bất kỳ laptop nào tại cửa hàng, bạn sẽ nhận được:

🎁 Ưu đãi:

• Giảm thêm 500.000đ trên giá đã giảm
• Tặng ngay balo laptop cao cấp
• Tặng chuột không dây Logitech
• Tặng túi chống sốc
• Bảo hành mở rộng 12 tháng

📱 Áp dụng cho:

Tất cả các dòng laptop: Dell, HP, Asus, Lenovo, Acer, MSI...

Lưu ý: Chương trình có giới hạn số lượng, áp dụng cho khách hàng đầu tiên.`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: false,
        views: 0
      },
      {
        title: '🛠️ DỊCH VỤ SỬA CHỮA – GIẢM ĐẾN 15% TOÀN HÓA ĐƠN',
        summary: 'Giảm giá dịch vụ sửa chữa máy tính, laptop lên đến 15%',
        content: `Dịch vụ sửa chữa chuyên nghiệp

Đội ngũ kỹ thuật viên chuyên nghiệp, giàu kinh nghiệm sẵn sàng phục vụ bạn.

🔧 Dịch vụ:

• Sửa chữa laptop, máy tính để bàn
• Thay thế linh kiện chính hãng
• Vệ sinh, bảo dưỡng máy tính
• Cài đặt phần mềm, hệ điều hành
• Khôi phục dữ liệu

💰 Ưu đãi:

Giảm 15% cho toàn bộ hóa đơn dịch vụ sửa chữa. Áp dụng từ 01/10/2025 đến 31/12/2025.`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: true,
        views: 0
      },
      {
        title: '🎉 KHAI TRƯƠNG CHI NHÁNH MỚI – NHIỀU ƯU ĐÃI HẤP DẪN',
        summary: 'Khai trương chi nhánh mới với nhiều ưu đãi đặc biệt cho khách hàng',
        content: `Khai trương chi nhánh mới!

Chúng tôi vui mừng thông báo khai trương chi nhánh mới tại trung tâm thành phố.

🎁 Ưu đãi khai trương:

• Giảm giá 20% cho 100 khách hàng đầu tiên
• Tặng voucher 500.000đ cho đơn hàng trên 5 triệu
• Rút thăm may mắn nhận laptop cao cấp
• Buffet miễn phí cho khách hàng đến tham quan

Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM

Thời gian: 08:00 - 22:00 hàng ngày`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: false,
        views: 0
      },
      {
        title: '📦 CHÍNH SÁCH ĐỔI TRẢ MỚI – LINH HOẠT HƠN',
        summary: 'Cập nhật chính sách đổi trả linh hoạt, dễ dàng hơn cho khách hàng',
        content: `Chính sách đổi trả mới

Chúng tôi luôn đặt lợi ích khách hàng lên hàng đầu, vì vậy chúng tôi đã cập nhật chính sách đổi trả linh hoạt hơn.

✅ Quy định mới:

• Đổi trả trong vòng 30 ngày (tăng từ 7 ngày)
• Miễn phí đổi trả nếu sản phẩm lỗi do nhà sản xuất
• Hỗ trợ đổi trả tại nhà (áp dụng cho đơn hàng trên 2 triệu)
• Hoàn tiền 100% nếu không hài lòng

Điều kiện: Sản phẩm còn nguyên seal, chưa sử dụng, còn đầy đủ phụ kiện.`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: false,
        views: 0
      },
      {
        title: '💳 TRẢ GÓP 0% LÃI SUẤT – MUA NGAY KHÔNG CẦN CHỜ',
        summary: 'Chương trình trả góp 0% lãi suất cho tất cả sản phẩm',
        content: `Trả góp 0% lãi suất

Mua sắm ngay hôm nay, trả góp không lo lãi suất!

💳 Ưu đãi:

• Trả góp 0% lãi suất trong 6-12 tháng
• Áp dụng cho tất cả sản phẩm từ 3 triệu đồng
• Thủ tục đơn giản, duyệt nhanh trong 15 phút
• Hỗ trợ nhiều ngân hàng: Vietcombank, Techcombank, VPBank...

Điều kiện: Có CMND/CCCD và thu nhập ổn định`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: true,
        views: 0
      },
      {
        title: '🎮 GAMING GEAR SALE – GIẢM ĐẾN 40%',
        summary: 'Sale lớn cho các sản phẩm gaming: chuột, bàn phím, tai nghe',
        content: `Gaming Gear Sale

Dành cho các game thủ! Giảm giá lớn cho tất cả phụ kiện gaming.

🎮 Sản phẩm:

• Chuột gaming: Giảm 30-40%
• Bàn phím cơ: Giảm 25-35%
• Tai nghe gaming: Giảm 30%
• Webcam, mic: Giảm 20-30%

Thương hiệu: Logitech, Razer, Corsair, SteelSeries, HyperX...`,
        image: 'img/new1.jpg',
        author: 'Tiến Thành Team',
        isActive: true,
        isFeatured: false,
        views: 0
      }
    ];

    const news = [];
    for (const newsItem of newsData) {
      const createdNews = await News.create(newsItem);
      news.push(createdNews);
    }
    console.log(`✅ Đã tạo ${news.length} news articles\n`);

    // 9. Tạo Coupons
    console.log('🎫 Đang tạo Coupons...');
    const couponData = [
      {
        code: 'WELCOME10',
        type: 'percent',
        value: 10,
        maxUses: 100,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 ngày trước
        validTo: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 ngày sau
        minOrderValue: 500000,
        isActive: true
      },
      {
        code: 'SALE20',
        type: 'percent',
        value: 20,
        maxUses: 50,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 ngày trước
        validTo: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 ngày sau
        minOrderValue: 1000000,
        isActive: true
      },
      {
        code: 'FREESHIP',
        type: 'fixed',
        value: 30000,
        maxUses: 200,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước
        validTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 ngày sau
        minOrderValue: 500000,
        isActive: true
      },
      {
        code: 'VIP50K',
        type: 'fixed',
        value: 50000,
        maxUses: null, // Không giới hạn
        usedCount: 0,
        validFrom: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 ngày trước
        validTo: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 ngày sau
        minOrderValue: 2000000,
        isActive: true
      },
      {
        code: 'NEWUSER',
        type: 'percent',
        value: 15,
        maxUses: 1000,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 ngày trước
        validTo: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 ngày sau
        minOrderValue: 300000,
        isActive: true
      },
      {
        code: 'BIGSALE',
        type: 'percent',
        value: 30,
        maxUses: 20,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
        validTo: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
        minOrderValue: 5000000,
        isActive: true
      },
      {
        code: 'EXPIRED',
        type: 'percent',
        value: 25,
        maxUses: 10,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 ngày trước
        validTo: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước (đã hết hạn)
        minOrderValue: 1000000,
        isActive: true
      },
      {
        code: 'INACTIVE',
        type: 'fixed',
        value: 100000,
        maxUses: 50,
        usedCount: 0,
        validFrom: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        minOrderValue: 3000000,
        isActive: false // Không kích hoạt
      }
    ];

    const coupons = await Coupon.insertMany(couponData);
    console.log(`✅ Đã tạo ${coupons.length} coupons\n`);

    // 10. Tạo Banners
    console.log('🖼️  Đang tạo Banners...');
    const bannerData = [
      {
        title: 'Khuyến mãi mùa tựu trường',
        subtitle: 'Giảm giá lên đến 20% cho học sinh, sinh viên',
        discountText: 'Giảm 20%',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=400&fit=crop',
        link: '/products?category=laptop',
        isActive: true,
        sortOrder: 1
      },
      {
        title: 'Sale sập sàn - Giá chỉ từ 19K',
        subtitle: 'Hàng ngàn sản phẩm giảm giá sâu lên đến 70%',
        discountText: 'Giảm 70%',
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=400&fit=crop',
        link: '/products?tag=sale',
        isActive: true,
        sortOrder: 2
      },
      {
        title: 'Mua laptop - Giảm thêm 500K + Quà tặng',
        subtitle: 'Giảm thêm 500.000đ và nhận ngay quà tặng cao cấp',
        discountText: 'Giảm 500K',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=400&fit=crop',
        link: '/products?category=laptop',
        isActive: true,
        sortOrder: 3
      }
    ];

    const banners = await Banner.insertMany(bannerData);
    console.log(`✅ Đã tạo ${banners.length} banners\n`);

    // 11. Tạo Reviews
    console.log('⭐ Đang tạo Reviews...');
    const reviews = [];
    
    // Tạo reviews cho một số sản phẩm
    const reviewComments = [
      'Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!',
      'Chất lượng tốt, giá cả hợp lý. Sẽ mua lại lần sau.',
      'Sản phẩm đúng như mô tả, màn hình đẹp, hiệu năng tốt.',
      'Giao hàng nhanh, nhân viên tư vấn nhiệt tình. Sản phẩm chất lượng.',
      'Rất hài lòng với sản phẩm này. Đáng giá tiền bỏ ra.',
      'Sản phẩm tốt nhưng giá hơi cao. Nhìn chung là ổn.',
      'Màn hình đẹp, pin tốt, hiệu năng ổn định. Recommend!',
      'Đóng gói cẩn thận, sản phẩm mới 100%. Rất hài lòng!',
      'Chất lượng tốt, thiết kế đẹp. Phù hợp với nhu cầu sử dụng.',
      'Sản phẩm đúng như mong đợi. Giao hàng đúng hẹn.',
      'Tốt nhưng có một số điểm nhỏ cần cải thiện. Nhìn chung là ổn.',
      'Rất hài lòng! Sản phẩm chất lượng, giá cả hợp lý.',
      'Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm như mô tả.',
      'Chất lượng tốt, hiệu năng ổn định. Đáng mua!',
      'Sản phẩm tốt, nhân viên tư vấn nhiệt tình. Recommend!'
    ];

    // Tạo reviews cho khoảng 30-40 sản phẩm
    const numReviews = 35;
    const reviewedProducts = new Set();
    
    for (let i = 0; i < numReviews; i++) {
      // Chọn ngẫu nhiên sản phẩm chưa được review
      let product;
      let attempts = 0;
      do {
        product = products[Math.floor(Math.random() * products.length)];
        attempts++;
        if (attempts > 50) break; // Tránh vòng lặp vô hạn
      } while (reviewedProducts.has(product._id.toString()) && attempts <= 50);
      
      if (attempts > 50) continue; // Bỏ qua nếu không tìm được sản phẩm mới
      
      reviewedProducts.add(product._id.toString());
      
      // Chọn ngẫu nhiên user
      const user = userUsers[Math.floor(Math.random() * userUsers.length)];
      
      // Random rating từ 3-5 (chủ yếu tích cực)
      const rating = Math.random() < 0.7 ? (Math.floor(Math.random() * 2) + 4) : (Math.floor(Math.random() * 2) + 3);
      
      // Random comment
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      
      // Random ngày tạo (trong 60 ngày qua)
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      const review = await Review.create({
        productId: product._id,
        userId: user._id,
        rating,
        comment,
        images: [],
        isVisible: true,
        createdAt,
        updatedAt: createdAt
      });
      
      reviews.push(review);
    }
    
    // Thêm một số reviews có admin reply
    if (reviews.length > 0) {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        // Chọn 5-8 reviews để admin reply
        const numReplies = Math.min(8, Math.floor(reviews.length / 4));
        const adminReplyTexts = [
          'Cảm ơn bạn đã đánh giá! Chúng tôi rất vui khi bạn hài lòng với sản phẩm.',
          'Cảm ơn phản hồi của bạn! Chúng tôi sẽ tiếp tục cải thiện chất lượng dịch vụ.',
          'Rất vui được phục vụ bạn! Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.',
          'Cảm ơn bạn đã tin tưởng và lựa chọn sản phẩm của chúng tôi!',
          'Chúng tôi rất trân trọng phản hồi của bạn. Hy vọng sẽ được phục vụ bạn lần sau!',
          'Cảm ơn đánh giá tích cực của bạn! Chúng tôi sẽ cố gắng phục vụ tốt hơn nữa.',
          'Rất vui khi bạn hài lòng với sản phẩm! Chúc bạn sử dụng tốt!',
          'Cảm ơn bạn đã dành thời gian đánh giá. Chúng tôi rất trân trọng!'
        ];
        
        for (let i = 0; i < numReplies; i++) {
          const review = reviews[Math.floor(Math.random() * reviews.length)];
          if (!review.adminReply || !review.adminReply.text) {
            const replyDate = new Date(review.createdAt);
            replyDate.setDate(replyDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 ngày sau
            
            review.adminReply = {
              text: adminReplyTexts[Math.floor(Math.random() * adminReplyTexts.length)],
              repliedBy: adminUser._id,
              repliedAt: replyDate
            };
            await review.save();
          }
        }
      }
    }
    
    console.log(`✅ Đã tạo ${reviews.length} reviews\n`);

    console.log('═══════════════════════════════════════');
    console.log('✅ SEED DỮ LIỆU THÀNH CÔNG!');
    console.log('═══════════════════════════════════════\n');
    console.log('📊 Tổng kết:');
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${brands.length} Brands`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${carts.length} Carts`);
    console.log(`   - ${orders.length} Orders`);
    console.log(`   - ${news.length} News`);
    console.log(`   - ${coupons.length} Coupons`);
    console.log(`   - ${banners.length} Banners`);
    console.log(`   - ${reviews.length} Reviews`);
    console.log(`   - ${counters.length} Counters\n`);
    console.log('🔐 Thông tin đăng nhập:');
    console.log('   👨‍💼 Admin:');
    console.log('      Email: admin@example.com');
    console.log('      Password: 123456');
    console.log('      Role: admin');
    console.log('   👤 Users:');
    console.log('      Email: user1@example.com - user5@example.com');
    console.log('      Password: 123456');
    console.log('      Role: user');
    console.log('   (Tất cả users đều dùng password: 123456)\n');

  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
    process.exit(0);
  }
};

// Chạy seed
connectDB().then(() => {
  seedData();
});

