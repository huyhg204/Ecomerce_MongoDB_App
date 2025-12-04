import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number | string | { $numberDecimal?: string };
  oldPrice?: number | string | { $numberDecimal?: string };
  salePercent?: number;
  tag?: string | null;
}

interface ProductCardProps {
  product: Product;
  toNumber: (value: number | string | { $numberDecimal?: string } | undefined) => number;
  formatPrice: (price: number | string | { $numberDecimal?: string } | undefined) => string;
  calculateSalePercent: (product: Product) => number;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  toNumber,
  formatPrice,
  calculateSalePercent,
  className,
}) => {
  const navigate = useNavigate();
  const salePercent = calculateSalePercent(product);
  const price = toNumber(product.price);
  const oldPrice = toNumber(product.oldPrice);
  // Hiển thị giá gốc/giảm nếu có salePercent > 0 hoặc oldPrice > price
  const hasRealSale = (oldPrice > price && oldPrice > 0) || salePercent > 0;

  const cardClass = className
    ? `product-card ${className}`.trim()
    : "product-card";

  return (
    <div className={cardClass}>
      {/* SALE badge nằm trên đầu card/slider-item */}
      {salePercent > 0 && (
        <span className="product-sale">Giảm {salePercent}%</span>
      )}

      <div className="product-img-wrap">
        <Link to={`/product/${product._id}`} className="product-img-link">
          <img
            src={
              product.image?.startsWith("http")
                ? product.image
                : `http://localhost:5000/${product.image?.replace(/^\/?/, "") || ""}`
            }
            alt={product.name}
            onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
          />
        </Link>
      </div>

      <div className="product-info">
        <Link
          to={`/product/${product._id}`}
          className="product-name"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="prod-price">
          {hasRealSale ? (
            <div className="price-row">
              <div className="price-col sale">
                <span className="price-value sale">{formatPrice(price)}</span>
              </div>
              <div className="price-col old">
                <span className="price-value old">{formatPrice(oldPrice)}</span>
              </div>
            </div>
          ) : (
            <div className="price-single">{formatPrice(price)}</div>
          )}
        </div>
      </div>

      {/* Button Xem chi tiết */}
      <div className="product-actions-bottom">
        <Link
          to={`/product/${product._id}`}
          className="btn-view-detail"
        >
          <i className="fa-solid fa-eye"></i>
          <span>Xem chi tiết</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

