import React, { useState, useEffect } from 'react';
import { X, LogIn, ShieldCheck, Mail, AlertCircle, CheckCircle2, User } from 'lucide-react';
import logoTdu from '../assets/images/logo_tdu.jpg';

interface TduSsoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const TduSsoLoginModal: React.FC<TduSsoLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successUser, setSuccessUser] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setSuccessUser(null);
      return;
    }

    // Khởi tạo Google Identity Services nếu có Client ID
    try {
      /* global google */
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: 'your-google-client-id.apps.googleusercontent.com',
          callback: async (response: any) => {
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
                setSuccessUser(data.user);
                setTimeout(() => {
                  onLoginSuccess(data.user);
                  onClose();
                }, 1000);
              } else {
                setErrorMsg(data.message || 'Đăng nhập SSO thất bại');
              }
            } catch (err: any) {
              setErrorMsg('Không thể kết nối đến máy chủ xác thực: ' + err.message);
            } finally {
              setIsLoading(false);
            }
          },
        });

        const btnContainer = document.getElementById('google-sso-btn');
        if (btnContainer) {
          // @ts-ignore
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 320,
          });
        }
      }
    } catch (e) {
      console.warn('Google GSI chưa sẵn sàng:', e);
    }
  }, [isOpen]);

  // Xử lý đăng nhập bằng Email cán bộ TDU (Gọi API Backend kiểm tra CSDL MySQL)
  const handleEmailLogin = async (targetEmail: string) => {
    const email = targetEmail.trim().toLowerCase();
    if (!email) {
      setErrorMsg('Vui lòng nhập địa chỉ email cán bộ!');
      return;
    }

    if (!email.endsWith('@tdu.edu.vn')) {
      setErrorMsg('Email đăng nhập bắt buộc phải có đuôi trường @tdu.edu.vn!');
      return;
    }

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
        setSuccessUser(data.user);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Không tìm thấy tài khoản trong CSDL MySQL!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối API Server: ' + err.message + '. Hãy đảm bảo server Express cổng 5000 đang chạy.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[480px] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-b from-slate-50 to-white px-6 pt-7 pb-4 text-center border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={logoTdu}
            alt="Đại học Tây Đô"
            className="h-16 mx-auto mb-3 object-contain drop-shadow-2xs"
          />

          <h3 className="font-bold text-[18px] text-slate-800 tracking-tight">
            CỔNG ĐĂNG NHẬP SSO EMAIL
          </h3>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Hệ thống Quản lý Thanh toán Thù lao & Giờ giảng TDU
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successUser && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[13.5px]">Đăng nhập thành công!</div>
                <div className="text-[12px] text-emerald-700">
                  Chào mừng <b>{successUser.hoTen}</b> ({successUser.chucVu})
                </div>
              </div>
            </div>
          )}

          {/* Option 1: Nút Google SSO chính thức */}
          <div className="space-y-2.5 text-center">
            <div className="flex justify-center" id="google-sso-btn"></div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">
              HOẶC ĐĂNG NHẬP TRỰC TIẾP
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Option 2: Nhập email trường */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailLogin(emailInput);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">
                Email Cán bộ / Giảng viên TDU
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ví dụ: mnlong@tdu.edu.vn"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-[#005325] hover:bg-[#00421e] disabled:opacity-50 text-white font-medium text-[13px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Đang xác thực...' : 'Xác thực & Đăng nhập'}</span>
            </button>
          </form>

          {/* Danh sách tài khoản thử nghiệm nhanh trong CSDL */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11.5px] font-semibold uppercase text-slate-400 mb-2">
              Tài khoản mẫu trong CSDL MySQL (Bấm để thử ngay):
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => handleEmailLogin('mnlong@tdu.edu.vn')}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800 truncate">Mai Như Long</div>
                <div className="text-[11px] text-slate-500 font-mono">Quản trị hệ thống</div>
              </button>
              <button
                type="button"
                onClick={() => handleEmailLogin('nvhoa@tdu.edu.vn')}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800 truncate">TS. Nguyễn Văn Hòa</div>
                <div className="text-[11px] text-slate-500 font-mono">Phòng Đào tạo</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo mật nội bộ bởi Trung tâm CNTT - Trường Đại học Tây Đô</span>
        </div>
      </div>
    </div>
  );
};
