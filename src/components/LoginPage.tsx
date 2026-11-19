import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import logoTdu from '../assets/images/logo_tdu.jpg';
import { FULL_PERSONNEL_245 } from '../data/fullPersonnel245';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '982263119129-t48l28gbvtkp3c4thtgjk91f2cnbrn7d.apps.googleusercontent.com';

  // Hàm xử lý hoàn tất đăng nhập khi có thông tin hồ sơ Google
  const handleLoginWithGoogleProfile = async (
    profile: { email: string; name?: string; picture?: string; sub?: string },
    credentialToken: string
  ) => {
    const email = (profile.email || '').toLowerCase().trim();
    if (!email) {
      setErrorMsg('Không thể đọc địa chỉ email từ tài khoản Google!');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let data: any = null;

      // 1. Gửi token đến Backend Express API nếu server đang chạy
      try {
        const res = await fetch('/api/auth/google-sso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: credentialToken }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Backend server chưa phản hồi, dùng client matching dữ liệu cán bộ...', e);
      }

      // 2. Client fallback nếu Backend offline hoặc chạy trên Vercel standalone
      if (!data || !data.success) {
        const found = FULL_PERSONNEL_245.find(
          (p) => (p.email || '').toLowerCase().trim() === email
        );

        let role = 'GIANG_VIEN';
        let roleName = 'Giảng viên';
        if (
          email === 'mnlong@tdu.edu.vn' ||
          email.includes('mainhutlong') ||
          (found && found.hoTen.toLowerCase().includes('mai nhựt long')) ||
          email === 'lvlinh@tdu.edu.vn' ||
          (found && found.hoTen.toLowerCase().includes('lê vũ linh'))
        ) {
          role = 'SUPER_ADMIN';
          roleName = 'Quản trị hệ thống';
        } else if (found?.donVi.toLowerCase().includes('ban giám hiệu') || found?.donVi.toLowerCase().includes('hội đồng trường')) {
          role = 'BAN_GIAM_HIEU';
          roleName = 'Ban Giám hiệu';
        } else if (found?.donVi.toLowerCase().includes('đào tạo')) {
          role = 'PHONG_QUAN_LY_DAO_TAO';
          roleName = 'Phòng Quản lý Đào tạo';
        } else if (found?.donVi.toLowerCase().includes('khoa học') || found?.donVi.toLowerCase().includes('qlkh')) {
          role = 'PHONG_QLKH_HTQT';
          roleName = 'Phòng Quản lý khoa học và Hợp tác quốc tế';
        } else if (found?.donVi.toLowerCase().includes('tài chính') || found?.donVi.toLowerCase().includes('kế hoạch')) {
          role = 'PHONG_TAI_CHINH_KE_HOACH';
          roleName = 'Phòng Tài chính - Kế hoạch';
        }

        const fallbackUser = {
          id: found ? found.stt : 999,
          maNhanSu: found ? found.maNhanSu : 'TDU00128',
          hoTen: found ? found.hoTen : (profile.name || email.split('@')[0]),
          email: email,
          chucVu: found ? found.chucVu : 'Giảng viên',
          donVi: found ? found.donVi : 'Trường Đại học Tây Đô',
          avatar: profile.picture || '',
          roles: role === 'SUPER_ADMIN' ? ['QUAN_TRI_VIEN_HE_THONG', 'PHONG_CONG_NGHE_THONG_TIN', 'GIANG_VIEN'] : [role],
          roleNames: role === 'SUPER_ADMIN' ? ['Quản trị viên hệ thống', 'Phòng Công nghệ thông tin', 'Giảng viên'] : [roleName],
          permissions: ['SYSTEM_MANAGE', 'FINANCE_VIEW'],
        };

        data = { success: true, user: fallbackUser, token: credentialToken || 'token-' + Date.now() };
      }

      if (data && data.success) {
        localStorage.setItem('tdu_token', data.token);
        localStorage.setItem('tdu_auth_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data?.message || 'Đăng nhập Google thất bại');
      }
    } catch (err: any) {
      setErrorMsg('Không thể xử lý đăng nhập Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Khởi tạo Google Identity Services & Render nút Google chính thức
  useEffect(() => {
    let checkInterval: any = null;

    const setupGoogleGsi = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            ux_mode: 'popup',
            callback: async (response: any) => {
              if (!response?.credential) return;
              try {
                // Giải mã payload JWT ID token từ Google
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                await handleLoginWithGoogleProfile(
                  {
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    sub: payload.sub,
                  },
                  response.credential
                );
              } catch (e: any) {
                console.error('Lỗi giải mã token Google:', e);
                setErrorMsg('Không thể giải mã dữ liệu đăng nhập Google');
              }
            },
          });

          const btnContainer = document.getElementById('google-sso-native-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            const btnWidth = typeof window !== 'undefined' ? Math.min(300, Math.max(250, window.innerWidth - 80)) : 280;
            // @ts-ignore
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              width: btnWidth,
              text: 'signin_with',
              logo_alignment: 'left',
              locale: 'vi',
            });
            setIsGsiLoaded(true);

            if (checkInterval) clearInterval(checkInterval);
          }
        } catch (e) {
          console.warn('GSI render error:', e);
        }
      }
    };

    setupGoogleGsi();
    checkInterval = setInterval(setupGoogleGsi, 300);
    const stopTimer = setTimeout(() => {
      if (checkInterval) clearInterval(checkInterval);
    }, 4000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearTimeout(stopTimer);
    };
  }, [googleClientId]);

  // Xử lý khi nhấn nút Google dự phòng nếu nút native chưa hiển thị
  const handleFallbackButtonClick = () => {
    // 1. Thử dùng Google OAuth2 Token Client nếu có để mở trực tiếp cửa sổ chọn tài khoản Google
    // @ts-ignore
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        // @ts-ignore
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                await handleLoginWithGoogleProfile(profile, tokenResponse.access_token);
              } catch (err: any) {
                setErrorMsg('Lỗi lấy thông tin Google: ' + err.message);
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn('Lỗi mở Token Client:', e);
      }
    }

    // 2. Thử gọi One Tap prompt
    // @ts-ignore
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        // @ts-ignore
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Lỗi gọi GSI prompt:', e);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 sm:py-12 select-none">
      <div className="w-full max-w-[500px] sm:max-w-[520px] bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl border border-slate-200/90 p-8 sm:p-14 flex flex-col items-center text-center animate-fadeIn">
        {/* Logo Trường Đại học Tây Đô */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-3.5 mb-6 overflow-hidden">
          <img src={logoTdu} alt="TDU Logo" className="w-full h-full object-contain" />
        </div>

        {/* Tiêu đề Đăng nhập */}
        <h1 className="text-[30px] sm:text-[34px] font-black text-slate-900 tracking-tight">
          Đăng nhập
        </h1>
        <p className="text-[16px] sm:text-[17px] font-medium text-slate-500 mt-2.5 mb-8 sm:mb-10">
          Hệ thống thanh toán giờ giảng TDU
        </p>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="w-full mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] text-left flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-slate-600 text-[14px] mb-5">
            <RefreshCw className="w-4.5 h-4.5 animate-spin text-[#005325]" />
            <span>Đang xác thực thông tin...</span>
          </div>
        )}

        {/* Nút đăng nhập Google chính thức: Tự động mở giao diện chọn tài khoản Google chuẩn */}
        <div className="w-full flex flex-col items-center justify-center min-h-[72px] py-2 overflow-visible">
          {/* Nút chuẩn của Google Identity Services: Tăng tỉ lệ scale để nút cao to, chữ to rõ nét */}
          <div
            id="google-sso-native-container"
            style={{ transform: 'scale(1.25)', transformOrigin: 'center' }}
            className="flex items-center justify-center min-h-[54px] w-full"
          ></div>

          {/* Nút bấm hiển thị dự phòng kích thước to rõ */}
          {!isGsiLoaded && (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleFallbackButtonClick}
              className="w-full max-w-[400px] h-15 px-6 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-[17.5px] flex items-center justify-center gap-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
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
          )}
        </div>
      </div>
    </div>
  );
};
