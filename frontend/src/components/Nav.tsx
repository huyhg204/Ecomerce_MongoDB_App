import React from "react";
import { Link } from "react-router-dom";
import "./style.css";
import "./product-list.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Nav: React.FC = () => {
    return (
        <nav className="main-nav">
            <ul>
                <li><Link to="/home">Trang Chủ</Link></li>
                <li><Link to="/products">Sản Phẩm</Link></li>
                <li><Link to="/news">TIN TỨC & KHUYẾN MÃI</Link></li>
                <li><Link to="/contact">Liên Hệ</Link></li>
                <li><Link to="/about">Giới Thiệu</Link></li>
            </ul>
        </nav>
    );
};

export default Nav;
