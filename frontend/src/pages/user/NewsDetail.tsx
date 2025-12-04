import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../user/css/style.css";
import "../user/css/new-detail.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { getNewsById, getAllNews, type News } from "../../services/newsService";

const PLACEHOLDER_IMG = "https://via.placeholder.com/460x460/fff3f4/ee4d2d?text=No+Image";

const normalizeImageUrl = (src?: string) => {
  if (!src) return PLACEHOLDER_IMG;
  if (/^https?:\/\//i.test(src)) return src;
  const cleanPath = src.replace(/^\/+/, "").replace(/\\/g, "/");
  return `http://localhost:5000/${cleanPath}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const newsData = await getNewsById(id);
        setNews(newsData);

        // Lấy tin tức liên quan (cùng trạng thái active, khác ID)
        const allNews = await getAllNews({ isActive: true });
        const related = allNews
          .filter((item) => item._id !== id)
          .slice(0, 4);
        setRelatedNews(related);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="news-detail-main">
        <div className="breadcrumb">
          <Link to="/home">Trang chủ</Link> <span>&gt;</span> <Link to="/news">Tin tức</Link> <span>&gt;</span>{" "}
          <span className="breadcrumb-current">Đang tải...</span>
        </div>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-main">
        <div className="breadcrumb">
          <Link to="/home">Trang chủ</Link> <span>&gt;</span> <Link to="/news">Tin tức</Link> <span>&gt;</span>{" "}
          <span className="breadcrumb-current">Không tìm thấy</span>
        </div>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Không tìm thấy tin tức này.</p>
          <Link to="/news" style={{ color: "#d90019", textDecoration: "none" }}>
            ← Quay lại danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-main">
      <div className="breadcrumb">
        <Link to="/home">Trang chủ</Link> <span>&gt;</span> <Link to="/news">Tin tức</Link> <span>&gt;</span>{" "}
        <span className="breadcrumb-current">{news.title}</span>
      </div>

      <div className="news-detail-header">
        <h1>{news.title}</h1>
        <div className="news-detail-meta">
          <span>
            <i className="fa-solid fa-user"></i> {news.author || "Admin"}
          </span>
          <span>
            <i className="fa-solid fa-calendar"></i> {formatDate(news.createdAt)}
          </span>
          {news.views !== undefined && (
            <span>
              <i className="fa-solid fa-eye"></i> {news.views} lượt xem
            </span>
          )}
        </div>
      </div>

      {news.image && (
        <div className="news-detail-cover">
          <img
            src={normalizeImageUrl(news.image)}
            alt={news.title}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />
        </div>
      )}

      <div className="news-detail-content">
        {news.content.split('\n').map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '16px' }}>
            {paragraph || '\u00A0'}
          </p>
        ))}
      </div>

      {relatedNews.length > 0 && (
        <div className="news-detail-related">
          <h3>Tin tức liên quan</h3>
          <div className="news-detail-related-list">
            {relatedNews.map((item) => (
              <div key={item._id} className="news-detail-related-card">
                <Link to={`/news/${item._id}`}>
                  <img
                    src={normalizeImageUrl(item.image)}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                  />
                  <div className="news-detail-related-title">{item.title}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;

