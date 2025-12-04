import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../user/css/auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { login, saveAuthData, googleLogin } from "../../services/authService";
import { clearStoredCart } from "../../services/cartStorage";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };


    const handleGoogleLogin = () => {
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
                            clearStoredCart();
                            setUser(loginResponse.data.user);
                            toast.success("Đăng nhập thành công!");
                            
                setTimeout(() => {
                    const userRole = loginResponse.data.user.role || "user";
                    navigate(userRole === "admin" ? "/admin" : "/home", { replace: true });
                }, 100);
                        } else {
                            toast.error(loginResponse.message || "Đăng nhập thất bại!");
                        }
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đăng nhập bằng Google!";
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const fieldName = id.replace("login-", "");
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: "" }));
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
            });

            if (response.success && response.data) {
                saveAuthData(response.data.token, response.data.user);
                clearStoredCart();
                setUser(response.data.user);
                toast.success("Đăng nhập thành công!");

                setTimeout(() => {
                    const userRole = response.data.user.role || "user";
                    navigate(userRole === "admin" ? "/admin" : "/home", { replace: true });
                }, 100);
            } else {
                if (response.errors) {
                    setErrors(response.errors as { [key: string]: string });
                }
                toast.error(response.message || "Đăng nhập thất bại!");
                setLoading(false);
            }
        } catch (err) {
            const axiosError = err as { response?: { data?: { message?: string; errors?: { [key: string]: string } } } };
            if (axiosError.response?.data) {
                const errorData = axiosError.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                }
                toast.error(errorData.message || "Đăng nhập thất bại!");
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại sau!");
            }
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-modal">
                <div className="auth-left">
                    <div className="auth-welcome">
                        <h2>Chào mừng trở lại</h2>
                        <p>Vui lòng đăng nhập để tiếp tục đồng hành cùng chúng tôi.</p>
                    </div>
                </div>

                <div className="auth-right">
                    <h2 className="auth-title">ĐĂNG NHẬP</h2>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="email"
                                id="login-email"
                                required
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                            {errors.general && <span className="error-message">{errors.general}</span>}
                        </div>

                        <div className="form-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="login-password"
                                required
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <span className="toggle-password" onClick={togglePassword}>
                                <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                            </span>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="forgot-link">
                            <Link to="/forgotpass">Quên mật khẩu?</Link>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>

                        <div className="or-divider">
                            <span>Hoặc</span>
                        </div>

                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <div className="social-login">
                                <button 
                                    type="button" 
                                    className="social-btn google"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <i className="fab fa-google"></i> Đăng nhập với Google
                                </button>
                            </div>
                        )}

                        <div className="auth-link">
                            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
