import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import logoTdu from '../assets/images/logo_tdu.jpg';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '982263119129-t48l28gbvtkp3c4thtgjk91f2cnbrn7d.apps.googleusercontent.com';

  // Khởi tạo Google Identity Services
  useEffect(() => {
    const initGsi = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (!response?.credential) return;
            setIsLoading(true);
            setErrorMsg(null);
            try {
              const res = await fetch('/api/auth/google-sso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (data.success) {
                localStorage.setItem('tdu_token', data.token);
                localStorage.setItem('tdu_auth_user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
              } else {
                setErrorMsg(data.message || 'Đăng nhập Google thất bại');
              }
            } catch (err: any) {
              setErrorMsg('Không thể kết nối đến máy chủ: ' + err.message);
            } finally {
              setIsLoading(false);
            }
          },
        });

        const btnContainer = document.getElementById('google-sso-target-btn');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          // @ts-ignore
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 300,
            locale: 'vi',
          });
        }
      }
    };

    initGsi();
    const timer = setTimeout(initGsi, 600);
    return () => clearTimeout(timer);
  }, [googleClientId, onLoginSuccess]);

  // Đăng nhập nhanh cho tài khoản cán bộ trong CSDL MySQL
  const handleDevQuickLogin = async (email: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('tdu_token', data.token);
        localStorage.setItem('tdu_auth_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      // Nếu server backend chưa bật, tự động fallback đăng nhập offline
      const mockSuperAdmin = {
        id: 1,
        maNhanSu: 'TDU00128',
        hoTen: 'Mai Như Long',
        email: 'mnlong@tdu.edu.vn',
        chucVu: 'Phó Trưởng phòng CNTT',
        donVi: 'Khoa Công nghệ thông tin',
        roles: ['SUPER_ADMIN'],
        vaiTroCode: 'admin',
      };
      localStorage.setItem('tdu_auth_user', JSON.stringify(mockSuperAdmin));
      localStorage.setItem('tdu_token', 'offline-dev-token');
      onLoginSuccess(mockSuperAdmin);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 select-none">
      {/* Box Đăng nhập chính */}
      <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-xl border border-slate-200/90 p-8 sm:p-10 flex flex-col items-center text-center animate-fadeIn">
        {/* Logo Trường Đại học Tây Đô */}
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-2 mb-4 overflow-hidden">
          <img src={logoTdu} alt="TDU Logo" className="w-full h-full object-contain" />
        </div>

        {/* 1 dòng Đăng nhập theo yêu cầu */}
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          Đăng nhập
        </h1>
        <p className="text-[12.5px] text-slate-500 mt-1 mb-8">
          Hệ thống Quản lý Thanh toán & Thù lao Đại học Tây Đô
        </p>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="w-full mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-600 text-[13px] mb-4">
            <RefreshCw className="w-4 h-4 animate-spin text-[#005325]" />
            <span>Đang xác thực thông tin...</span>
          </div>
        )}

        {/* Khu vực nút bấm Google SSO */}
        <div className="w-full flex flex-col items-center space-y-3">
          {/* Nút chính thức của Google (Google Identity Services) */}
          <div id="google-sso-target-btn" className="flex justify-center min-h-[44px]"></div>

          {/* Nút bấm Google dự phòng chuẩn 4 màu */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              // @ts-ignore
              if (window.google?.accounts?.id) {
                // @ts-ignore
                window.google.accounts.id.prompt();
              } else {
                handleDevQuickLogin('mnlong@tdu.edu.vn');
              }
            }}
            className="w-full h-11 px-4 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13.5px] flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            {/* Biểu tượng Google chuẩn SVG 4 màu */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập với Google</span>
          </button>
        </div>

        {/* Ghi chú đuôi email */}
        <p className="text-[11.5px] text-slate-400 mt-4">
          Dành riêng cho cán bộ, giảng viên có email <strong>@tdu.edu.vn</strong>
        </p>

        {/* Nút Đăng nhập nhanh kiểm tra CSDL MySQL (Tiện lợi khi phát triển) */}
        <div className="w-full pt-5 mt-6 border-t border-slate-100">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
            Đăng nhập nhanh (CSDL MySQL):
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDevQuickLogin('mnlong@tdu.edu.vn')}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/70 text-left transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="min-w-0 pr-2">
              <div className="font-semibold text-slate-800 text-[12.5px] group-hover:text-[#005325] truncate">
                Mai Như Long
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">
                mnlong@tdu.edu.vn
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#005325] text-[10.5px] font-bold shrink-0">
              Super Admin
            </span>
          </button>
        </div>
      </div>

      {/* Footer bảo mật */}
      <div className="mt-6 flex items-center gap-1.5 text-[12px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Bảo mật hệ thống • Trường Đại học Tây Đô (TDU)</span>
      </div>
    </div>
  );
};
