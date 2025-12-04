import React from "react";
import { Link } from "react-router-dom";
import "../user/css/style.css";
import "../user/css/contact.css";

const About: React.FC = () => {
    return (
        <div className="contact-main">
            <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> &gt; <span>Giới thiệu</span>
            </div>

            <div className="contact-header">
                <h1>Về Tiến Thành Store</h1>
                <p>
                    Chào mừng bạn đến với <b>Tiến Thành Store</b> – địa chỉ tin cậy chuyên cung cấp
                    các sản phẩm công nghệ, máy tính và linh kiện chính hãng với giá tốt nhất.
                </p>
            </div>

            <div className="contact-content">
                {/* GIỚI THIỆU CÔNG TY */}
                <div className="contact-form-wrap">
                    <div className="contact-title">Giới thiệu cửa hàng</div>
                    <div className="contact-description">
                        <p>
                            Được thành lập từ năm <b>2015</b>, <b>Tiến Thành Store</b> đã và đang không
                            ngừng phát triển để trở thành một trong những đơn vị cung cấp thiết bị máy
                            tính uy tín hàng đầu tại Việt Nam. Chúng tôi chuyên kinh doanh:
                        </p>
                        <ul style={{ listStyle: "disc", paddingLeft: "20px", marginTop: "12px", marginBottom: "16px" }}>
                            <li style={{ marginBottom: "8px" }}>Laptop, PC, linh kiện và phụ kiện chính hãng</li>
                            <li style={{ marginBottom: "8px" }}>Các giải pháp công nghệ dành cho doanh nghiệp</li>
                            <li style={{ marginBottom: "8px" }}>Dịch vụ bảo hành, sửa chữa và hỗ trợ kỹ thuật tận tâm</li>
                        </ul>
                        <p>
                            Với phương châm <b>“Uy tín – Chất lượng – Tận tâm”</b>, Tiến Thành Store luôn
                            đặt trải nghiệm khách hàng lên hàng đầu. Đội ngũ kỹ thuật viên chuyên nghiệp
                            và nhân viên tư vấn giàu kinh nghiệm luôn sẵn sàng hỗ trợ bạn trong mọi tình huống.
                        </p>
                    </div>
                </div>

                {/* TẦM NHÌN & SỨ MỆNH */}
                <div className="contact-info-wrap">
                    <div className="contact-title">Tầm nhìn & Sứ mệnh</div>
                    <div className="contact-description">
                        <div style={{ marginBottom: "20px" }}>
                            <p style={{ marginBottom: "8px", fontWeight: "600" }}>
                                Tầm nhìn:
                            </p>
                            <p style={{ marginLeft: "20px", color: "#666", lineHeight: "1.6" }}>
                                Trở thành hệ thống bán lẻ thiết bị công nghệ hàng đầu tại Việt Nam,
                                mang đến giá trị bền vững cho khách hàng và cộng đồng.
                            </p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <p style={{ marginBottom: "8px", fontWeight: "600" }}>
                                Sứ mệnh:
                            </p>
                            <p style={{ marginLeft: "20px", color: "#666", lineHeight: "1.6" }}>
                                Cung cấp sản phẩm chất lượng, dịch vụ chuyên nghiệp và giải pháp công nghệ tối ưu,
                                giúp khách hàng dễ dàng tiếp cận thế giới số hóa hiện đại.
                            </p>
                        </div>
                        <div>
                            <p style={{ marginBottom: "8px", fontWeight: "600" }}>
                                Giá trị cốt lõi:
                            </p>
                            <p style={{ marginLeft: "20px", color: "#666", lineHeight: "1.6" }}>
                                Uy tín – Nhiệt huyết – Sáng tạo – Phát triển bền vững.
                            </p>
                        </div>
                    </div>

                    <div className="contact-map" style={{ marginTop: "24px" }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3908713083186!2d106.70042321411607!3d10.776373392322237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f195affeced%3A0xa12b7e9d15d3a6a9!2zQ8O0bmcgVHkgQ8O0bmcgTmdoaeG7h3AgSMOgIE3hu5ljLCBUaMOgbmggc-G7nywgUXXhuq1uIDEsIEjDoCBO4buZaSBDaMOtbmgsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1626248439051!5m2!1svi!2s"
                            width="100%"
                            height="200"
                            style={{ border: 0, borderRadius: "8px" }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
