import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../store/authStore'
import api from '../utils/axios'
import type { LoginResponse, User } from '../types/user'
import GoogleSignInButton from '../components/GoogleSignInButton'
import '../style/login.css'

export default function LoginRoute() {
  const navigate = useNavigate()
  const { login, setLoading, setError, clearError, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleGoogleSuccess = async (credential: string) => {
    console.log('Google ID Token:', credential)
    // TODO: Gửi credential lên backend để xác thực
    // await api.post("/auth/google", {
    //   credential,
    // });
  }

  const handleNormalLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      clearError();
      setLocalError(null);
      
      const response = await api.post<LoginResponse>("/auth/login", values);
      const userData = response.data;

      const enhancedUserData: User = {
        id: userData.id || userData.userId || "",
        username: userData.username || values.email.split("@")[0],
        email: userData.email || values.email,
        fullName: userData.fullName || userData.fullname || "",
        role: (userData.role as 'Student' | 'Lecturer' | 'Admin') || "Student",
        token: userData.token || userData.accessToken || "",
        avatar: userData.avatar || "",
        phone: userData.phone || "",
        isEmailVerified: userData.enabled || userData.isEmailVerified || false,
        lastLogin: new Date().toISOString(),
        loginMethod: "normal",
        createdAt: userData.createdAt || userData.createAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
      };

      login(enhancedUserData);
      
      console.log("Login successful, user data:", enhancedUserData);
      
      // Redirect dựa trên role
      // Đây là tạm thời, chưa tạo UI chuyên biệt từng role
      switch (enhancedUserData.role) {
        case "Admin":
          navigate("/dashboard");
          break;
        case "Lecturer":
          navigate("/courses");
          break;
        case "Student":
        default:
          navigate("/");
          break;
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      setLocalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (showForgotPassword) {
      // Xử lý quên mật khẩu
      setLoading(true)
      // TODO: Implement forgot password logic
      setTimeout(() => {
        setLoading(false)
        alert("Đã gửi email đặt lại mật khẩu!");
      }, 1000)
    } else {
      // Xử lý đăng nhập
      handleNormalLogin(formData);
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-brand">
            <img 
              src="/Logo_AWS_FCJ.png" 
              alt="LMS FCJ Logo" 
              className="login-logo"
            />
          </div>
        </div>

        <div className="login-body">
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              <h2>Đăng nhập</h2>
              <p className="form-subtitle">Đăng nhập vào tài khoản của bạn</p>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-input">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {localError && (
                <div className="error-message" style={{ 
                  color: '#ef4444', 
                  fontSize: '14px', 
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: '#fee2e2',
                  borderRadius: '4px'
                }}>
                  {localError}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="google-signin-wrapper" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                <GoogleSignInButton 
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setLocalError('Đăng nhập Google thất bại. Vui lòng thử lại.');
                  }}
                  showOneTap={true}
                />
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <h2>Quên mật khẩu?</h2>
              <p className="form-subtitle">Nhập email của bạn để đặt lại mật khẩu</p>

              <div className="form-group">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit"
              >
                Gửi liên kết đặt lại
              </button>

              <button 
                type="button"
                className="btn-back"
                onClick={() => setShowForgotPassword(false)}
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
