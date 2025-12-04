import React from "react";
import { Link } from "react-router-dom";
import "../user/css/style.css";
import "../user/css/contact.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Contact: React.FC = () => {
    return (
        <div className="contact-main">
            <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> &gt; <span>Liên hệ</span>
            </div>

            <div className="contact-header">
                <h1>Liên hệ với chúng tôi</h1>
                <p>
                    Tiến Thành Store luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của
                    bạn. Hãy liên hệ để được hỗ trợ nhanh nhất!
                </p>
            </div>

            <div className="contact-content">
                {/* FORM */}
                <div className="contact-form-wrap">
                    <div className="contact-title">Gửi thông tin liên hệ</div>
                    <form className="contact-form">
                        <input type="text" placeholder="Họ và tên" required />
                        <input type="email" placeholder="Email" required />
                        <input type="text" placeholder="Số điện thoại" />
                        <textarea rows={4} placeholder="Nội dung liên hệ" required></textarea>
                        <button type="submit" className="contact-btn-send">
                            <i className="fa fa-paper-plane"></i> Gửi liên hệ
                        </button>
                    </form>
                </div>

                {/* THÔNG TIN LIÊN HỆ + MAP */}
                <div className="contact-info-wrap">
                    <div className="contact-title">Thông tin liên hệ</div>
                    <div className="contact-info-list">
                        <div>
                            <i className="fa fa-map-marker-alt"></i> 1081-1083 Trần Hưng Đạo,
                            Phường An Đông, TP.HCM
                        </div>
                        <div>
                            <i className="fa fa-phone"></i> 1900 5360
                        </div>
                        <div>
                            <i className="fa fa-envelope"></i> cskh@maytinhbienhoa.vn
                        </div>
                        <div>
                            <i className="fa fa-clock"></i> 8:30 - 20:30 (T2 - CN)
                        </div>
                        <div className="contact-social">
                            <a href="#">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#">
                                <i className="fab fa-tiktok"></i>
                            </a>
                            <a href="#">
                                <i className="fab fa-youtube"></i>
                            </a>
                            <a href="#">
                                <i className="fab fa-twitter"></i>
                            </a>
                        </div>
                    </div>
                    <div className="contact-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3908713083186!2d106.70042321411607!3d10.776373392322237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f195affeced%3A0xa12b7e9d15d3a6a9!2zQ8O0bmcgVHkgQ8O0bmcgTmdoaeG7h3AgSMOgIE3hu5ljLCBUaMOgbmggc-G7nywgUXXhuq1uIDEsIEjDoCBO4buZaSBDaMOtbmgsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1626248439051!5m2!1svi!2s"
                            width="100%"
                            height="180"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
