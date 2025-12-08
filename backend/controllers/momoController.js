const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");

// Cấu hình MOMO (nên lưu vào .env)
const MOMO_CONFIG = {
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/order-success",
  ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:5000/api/momo/ipn",
};

// Hàm tạo signature
const createSignature = (rawHash, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(rawHash).digest("hex");
};

// Hàm gửi POST request
const execPostRequest = async (url, data) => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return JSON.stringify(response.data);
  } catch (error) {
    console.error("execPostRequest error:", error);
    throw error;
  }
};

// ===== TẠO PAYMENT URL =====
const createMomoPayment = async (req, res) => {
  try {
    const { total_momo, orderId } = req.body;

    // Validate và chuyển đổi total_momo thành số
    const amount = Number(total_momo);
    
    if (!total_momo || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Số tiền thanh toán không hợp lệ. Giá trị nhận được: ${total_momo}`,
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Mã đơn hàng không được để trống.",
      });
    }
    const orderInfo = "Thanh toán qua ATM MoMo";
    const requestId = Date.now().toString();
    const requestType = "payWithATM";
    const extraData = "";

    // Tạo rawHash để ký
    const rawHash =
      `accessKey=${MOMO_CONFIG.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${MOMO_CONFIG.ipnUrl}` +
      `&orderId=${orderId || requestId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${MOMO_CONFIG.partnerCode}` +
      `&redirectUrl=${MOMO_CONFIG.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    // Tạo signature
    const signature = createSignature(rawHash, MOMO_CONFIG.secretKey);

    // Tạo data để gửi
    const data = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId || requestId,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang: "vi",
      extraData: extraData,
      requestType: requestType,
      signature: signature,
    };

    // Gửi request đến MOMO
    const result = await execPostRequest(MOMO_CONFIG.endpoint, data);
    const jsonResult = JSON.parse(result);

    if (jsonResult.payUrl) {
      return res.json({
        success: true,
        payUrl: jsonResult.payUrl,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: jsonResult.message || "Không thể tạo link thanh toán MOMO",
      });
    }
  } catch (error) {
    console.error("createMomoPayment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo thanh toán MOMO",
      error: error.message,
    });
  }
};

// ===== XỬ LÝ CALLBACK TỪ MOMO =====
const momoCallback = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.query;

    // Kiểm tra resultCode
    if (resultCode !== "0") {
      const frontendUrl = MOMO_CONFIG.redirectUrl.replace('/checkout', '/order-success');
      return res.redirect(
        `${frontendUrl}?error=${encodeURIComponent(message || "Thanh toán thất bại")}`
      );
    }

    // Tạo rawHash để verify signature
    const rawHash =
      `accessKey=${MOMO_CONFIG.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData || ""}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    // Verify signature
    const verifySignature = createSignature(rawHash, MOMO_CONFIG.secretKey);

    if (verifySignature !== signature) {
      console.error("MOMO signature verification failed");
      const frontendUrl = MOMO_CONFIG.redirectUrl.replace('/checkout', '/order-success');
      return res.redirect(
        `${frontendUrl}?error=${encodeURIComponent("Xác thực chữ ký thất bại")}`
      );
    }

    // Tìm và cập nhật đơn hàng (tìm bằng code hoặc _id)
    const order = await Order.findOne({ 
      $or: [
        { code: orderId },
        { _id: orderId }
      ]
    });
    if (order) {
      // Cập nhật trạng thái thanh toán
      order.paymentStatus = "paid";
      order.statusHistory.push({
        status: order.status,
        note: `Thanh toán MOMO thành công. Mã giao dịch: ${transId}`,
        updatedBy: "system",
        updatedAt: new Date(),
      });
      await order.save();
      
      // Redirect về trang order success với _id
      const frontendUrl = MOMO_CONFIG.redirectUrl.replace('/checkout', '/order-success');
      return res.redirect(
        `${frontendUrl}?orderId=${order._id}&transId=${transId}`
      );
    }

    // Nếu không tìm thấy order, redirect về order success với orderId từ query
    const frontendUrl = MOMO_CONFIG.redirectUrl.replace('/checkout', '/order-success');
    return res.redirect(
      `${frontendUrl}?orderId=${orderId}&transId=${transId}`
    );
  } catch (error) {
    console.error("momoCallback error:", error);
    const frontendUrl = MOMO_CONFIG.redirectUrl.replace('/checkout', '/order-success');
    return res.redirect(
      `${frontendUrl}?error=${encodeURIComponent("Lỗi xử lý callback từ MOMO")}`
    );
  }
};

// ===== IPN (Instant Payment Notification) =====
const momoIPN = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Tạo rawHash để verify signature
    const rawHash =
      `accessKey=${MOMO_CONFIG.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData || ""}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    // Verify signature
    const verifySignature = createSignature(rawHash, MOMO_CONFIG.secretKey);

    if (verifySignature !== signature) {
      return res.status(400).json({
      resultCode: -1,
      message: "Invalid signature",
    });
    }

    // Xử lý thanh toán thành công
    if (resultCode === "0") {
      const order = await Order.findOne({ 
        $or: [
          { code: orderId },
          { _id: orderId }
        ]
      });
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.statusHistory.push({
          status: order.status,
          note: `Thanh toán MOMO thành công qua IPN. Mã giao dịch: ${transId}`,
          updatedBy: "system",
          updatedAt: new Date(),
        });
        await order.save();
      }
    }

    // Trả về response cho MOMO
    return res.json({
      resultCode: 0,
      message: "Success",
    });
  } catch (error) {
    console.error("momoIPN error:", error);
    return res.status(500).json({
      resultCode: -1,
      message: "Internal error",
    });
  }
};

module.exports = {
  createMomoPayment,
  momoCallback,
  momoIPN,
};
