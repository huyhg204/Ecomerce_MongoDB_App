import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { sendOTP, verifyOTP, resetPassword } from "../../services/authService";
import "../user/css/forgot-pass.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Forgotpass: React.FC = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [pwd1, setPwd1] = useState("");
    const [pwd2, setPwd2] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState("");

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Vui lòng nhập email!");
            return;
        }

        setLoading(true);
        try {
            const response = await sendOTP(email);
            if (response.success) {
                toast.success(response.message || "Mã OTP đã được gửi đến email của bạn!");
                setStep(2);
            } else {
                toast.error(response.message || "Không thể gửi OTP. Vui lòng thử lại!");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Mã OTP phải gồm 6 ký tự!");
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOTP(email, otp);
            if (response.success && response.data?.resetToken) {
                setResetToken(response.data.resetToken);
                toast.success(response.message || "Xác thực OTP thành công!");
                setStep(3);
            } else {
                toast.error(response.message || "Mã OTP không hợp lệ!");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwd1 !== pwd2) {
            toast.error("Hai mật khẩu chưa khớp!");
            return;
        }
        if (pwd1.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword(resetToken, pwd1);
            if (response.success) {
                toast.success(response.message || "Đặt lại mật khẩu thành công!");
                setStep(4);
            } else {
                toast.error(response.message || "Không thể đặt lại mật khẩu!");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const response = await sendOTP(email);
            if (response.success) {
                toast.success(response.message || "Đã gửi lại mã OTP qua email!");
            } else {
                toast.error(response.message || "Không thể gửi lại OTP!");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-main">
            <div className="forgot-wrap">
                <h1>Quên mật khẩu?</h1>

                {step === 1 && (
                    <div className="forgot-step">
                        <p>
                            Nhập email tài khoản của bạn, chúng tôi sẽ gửi mã xác thực (OTP)
                            đến email này.
                        </p>
                        <form className="forgot-form" onSubmit={handleEmailSubmit}>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="forgot-btn" disabled={loading}>
                                {loading ? "Đang gửi..." : <><i className="fa fa-envelope"></i> Gửi mã OTP</>}
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="forgot-step">
                        <p>
                            Nhập mã OTP đã gửi về email <b>{email}</b>.
                        </p>
                        <form className="forgot-form" onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                placeholder="Nhập mã OTP"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button type="submit" className="forgot-btn" disabled={loading}>
                                {loading ? "Đang xác thực..." : <><i className="fa fa-key"></i> Xác nhận mã OTP</>}
                            </button>
                        </form>
                        <div className="forgot-otp-actions">
                            <button type="button" className="forgot-link" onClick={handleResendOtp} disabled={loading}>
                                <i className="fa fa-sync"></i> {loading ? "Đang gửi..." : "Gửi lại mã"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="forgot-step">
                        <p>
                            Nhập mật khẩu mới cho tài khoản <b>{email}</b>.
                        </p>
                        <form className="forgot-form" onSubmit={handleResetSubmit}>
                            <input
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={pwd1}
                                onChange={(e) => setPwd1(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={pwd2}
                                onChange={(e) => setPwd2(e.target.value)}
                                required
                            />
                            <button type="submit" className="forgot-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : <><i className="fa fa-lock"></i> Đổi mật khẩu</>}
                            </button>
                        </form>
                    </div>
                )}

                {step === 4 && (
                    <div className="forgot-step forgot-step-success">
                        <div className="forgot-success">
                            <i className="fa fa-check-circle"></i> Đổi mật khẩu thành công!{" "}
                            <Link to="/login" className="forgot-link">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                )}

                <div className="forgot-back">
                    <Link to="/login">
                        <i className="fa fa-arrow-left"></i> Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Forgotpass;
