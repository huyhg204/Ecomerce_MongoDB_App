import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../user/css/auth.css";
import { register, saveAuthData, googleLogin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // State quản lý ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({
        password: false,
        repassword: false,
    });

    const handleGoogleRegister = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId || clientId === "") {
            toast.error("Google Client ID chưa được cấu hình. Vui lòng thêm VITE_GOOGLE_CLIENT_ID vào file .env và restart server!");
            return;
        }

        if (!window.google?.accounts?.oauth2) {
            toast.error("Google Sign-In chưa sẵn sàng. Vui lòng thử lại sau!");
            return;
        }

        try {
            window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'email profile',
                callback: async (tokenResponse: any) => {
                    try {
                        setLoading(true);
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: {
                                Authorization: `Bearer ${tokenResponse.access_token}`
                            }
                        });
                        const googleData = await userInfoResponse.json();
                        
                        const loginResponse = await googleLogin({
                            googleId: googleData.id,
                            email: googleData.email,
                            name: googleData.name,
                            picture: googleData.picture,
                        });

                        if (loginResponse.success && loginResponse.data) {
                            saveAuthData(loginResponse.data.token, loginResponse.data.user);
                            setUser(loginResponse.data.user);
                            toast.success("Đăng ký thành công!");
                            navigate("/home");
                        } else {
                            toast.error(loginResponse.message || "Đăng ký thất bại!");
                        }
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đăng ký bằng Google!";
                        toast.error(errorMessage);
                    } finally {
                        setLoading(false);
                    }
                }
            }).requestAccessToken();
        } catch (error: any) {
            toast.error("Không thể khởi tạo Google Sign-In. Vui lòng kiểm tra cấu hình!");
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        repassword: "",
    });

    const togglePassword = (field: string) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => ({ ...prev, [id]: "" }));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (formData.password !== formData.repassword) {
            setErrors({ repassword: "Mật khẩu nhập lại không khớp" });
            toast.error("Mật khẩu nhập lại không khớp");
            setLoading(false);
            return;
        }

        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
            });

            if (response.success) {
                saveAuthData(response.data.token, response.data.user);
                setUser(response.data.user);
                toast.success("Đăng ký thành công!");
                navigate("/home");
            } else {
                if (response.errors) {
                    setErrors(response.errors as { [key: string]: string });
                }
                toast.error(response.message || "Đăng ký thất bại!");
            }
        } catch (err) {
            const axiosError = err as { response?: { data?: { message?: string; errors?: { [key: string]: string } } } };
            if (axiosError.response?.data) {
                const errorData = axiosError.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                }
                toast.error(errorData.message || "Đăng ký thất bại!");
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại sau!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="auth-bg">
                <div className="auth-modal">
                    <div className="auth-left">
                        <div className="auth-welcome">
                            <h2>Chào bạn mới!</h2>
                            <p>
                                Đăng ký tài khoản để nhận ưu đãi và trải nghiệm dịch vụ tuyệt
                                vời nhất từ chúng tôi.
                            </p>
                        </div>
                    </div>

                    <div className="auth-right">
                        <h2 className="auth-title">ĐĂNG KÝ</h2>
                        <form className="auth-form" onSubmit={handleRegister}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    placeholder="Họ và tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Địa chỉ"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                                {errors.address && <span className="error-message">{errors.address}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="Số điện thoại"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>

                            <div className="form-group password-group">
                                <input
                                    type={showPassword.password ? "text" : "password"}
                                    id="password"
                                    required
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => togglePassword("password")}
                                >
                                    <i
                                        className={
                                            showPassword.password
                                                ? "fa fa-eye-slash"
                                                : "fa fa-eye"
                                        }
                                    ></i>
                                </span>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-group password-group">
                                <input
                                    type={showPassword.repassword ? "text" : "password"}
                                    id="repassword"
                                    required
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.repassword}
                                    onChange={handleChange}
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => togglePassword("repassword")}
                                >
                                    <i
                                        className={
                                            showPassword.repassword
                                                ? "fa fa-eye-slash"
                                                : "fa fa-eye"
                                        }
                                    ></i>
                                </span>
                                {errors.repassword && <span className="error-message">{errors.repassword}</span>}
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? "Đang đăng ký..." : "Đăng ký"}
                            </button>

                            <div className="or-divider">
                                <span>Hoặc</span>
                            </div>

                            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                                <div className="social-login">
                                    <button 
                                        type="button" 
                                        className="social-btn google"
                                        onClick={handleGoogleRegister}
                                        disabled={loading}
                                    >
                                        <i className="fab fa-google"></i> Đăng ký với Google
                                    </button>
                                </div>
                            )}

                            <div className="auth-link">
                                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
