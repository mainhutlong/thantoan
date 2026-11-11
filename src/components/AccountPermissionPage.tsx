import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  UserCheck,
  CheckCircle2,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Megaphone,
  FlaskConical,
  Briefcase,
  DollarSign,
  Building,
  Check,
  X
} from 'lucide-react';
import { UserAccount, AccountRoleType } from '../types';

interface AccountPermissionPageProps {
  accounts: UserAccount[];
  currentUsername?: string;
  onSwitchUser?: (account: UserAccount) => void;
  onUpdateAccounts?: (accounts: UserAccount[]) => void;
  onNavigateToModule?: (moduleKey: string) => void;
}

export const AccountPermissionPage: React.FC<AccountPermissionPageProps> = ({
  accounts: initialAccounts,
  currentUsername = 'admin',
  onSwitchUser,
  onNavigateToModule,
}) => {
  const [accountList, setAccountList] = useState<UserAccount[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);

  // New account form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AccountRoleType>('upload_dao_tao');
  const [newDepartment, setNewDepartment] = useState('Phòng Đào tạo');

  // Filtered accounts
  const filteredAccounts = accountList.filter((acc) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        acc.username.toLowerCase().includes(q) ||
        acc.fullName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.departmentName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter !== 'all' && acc.role !== roleFilter) {
      return false;
    }
    return true;
  });

  const getRoleBadge = (role: AccountRoleType) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-purple-100 text-black border border-purple-200">
            <Shield className="w-3 h-3 text-black" />
            Quản trị viên (Admin)
          </span>
        );
      case 'upload_dao_tao':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-blue-100 text-black border border-blue-200">
            <BookOpen className="w-3 h-3 text-black" />
            Upload: Giờ giảng
          </span>
        );
      case 'upload_khao_thi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-sky-100 text-black border border-sky-200">
            <GraduationCap className="w-3 h-3 text-black" />
            Upload: Coi thi chấm thi
          </span>
        );
      case 'upload_tuyen_sinh':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-amber-100 text-black border border-amber-200">
            <Megaphone className="w-3 h-3 text-black" />
            Upload: Tuyển sinh
          </span>
        );
      case 'upload_nckh':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-violet-100 text-black border border-violet-200">
            <FlaskConical className="w-3 h-3 text-black" />
            Upload: NCKH
          </span>
        );
      case 'upload_cong_tac_khac':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-teal-100 text-black border border-teal-200">
            <Briefcase className="w-3 h-3 text-black" />
            Upload: Công tác khác
          </span>
        );
      case 'tai_chinh':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-100 text-black border border-emerald-300">
            <DollarSign className="w-3 h-3 text-black" />
            Tài chính - Kế hoạch (Chi trả)
          </span>
        );
      case 'giang_vien':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-black border border-slate-300">
            <UserCheck className="w-3 h-3 text-black" />
            Giảng viên (Tra cứu & Xác nhận)
          </span>
        );
      default:
        return null;
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullName) return;

    let defaultModule = 'Kê khai dữ liệu';
    if (newRole === 'upload_dao_tao') defaultModule = 'Thanh toán giờ giảng';
    else if (newRole === 'upload_khao_thi') defaultModule = 'Coi thi chấm thi ra đề';
    else if (newRole === 'upload_tuyen_sinh') defaultModule = 'Công tác tuyển sinh';
    else if (newRole === 'upload_nckh') defaultModule = 'Nghiên cứu khoa học';
    else if (newRole === 'upload_cong_tac_khac') defaultModule = 'Công tác khác';
    else if (newRole === 'tai_chinh') defaultModule = 'Chi trả tài chính & Lệnh UNC';
    else if (newRole === 'admin') defaultModule = 'Toàn quyền quản trị';
    else if (newRole === 'giang_vien') defaultModule = 'Tra cứu & Xác nhận';

    const newAcc: UserAccount = {
      id: `acc-${Date.now()}`,
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      email: newEmail.trim() || `${newUsername}@tdu.edu.vn`,
      role: newRole,
      departmentName: newDepartment,
      assignedModule: defaultModule,
      status: 'active',
      lastLogin: 'Chưa đăng nhập',
    };

    setAccountList((prev) => [...prev, newAcc]);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-black border border-slate-300">
                Phân quyền trách nhiệm TDU
              </span>
              <span className="text-xs text-black font-normal">
                Admin · 5 Ban upload · Tài chính · Giảng viên
              </span>
            </div>
            <h1 className="text-xl font-normal text-black mt-1 flex items-center gap-2">
              <Shield className="w-5 h-5 text-black" />
              Quản lý tài khoản & phân quyền hệ thống
            </h1>
            <p className="text-xs text-black mt-0.5 font-normal">
              Phân chia quyền hạn rõ ràng: 5 tài khoản phụ trách upload độc lập 5 mảng, Kế toán phụ trách chi trả, và Giảng viên vào tra cứu & xác nhận đồng ý/phản hồi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005325] hover:bg-[#00421d] text-white rounded text-xs font-normal cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm tài khoản mới</span>
            </button>
          </div>
        </div>

        {/* 4 Role Group Summaries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              1. Quản trị hệ thống (Admin)
            </div>
            <div className="text-sm font-normal text-black mt-1">
              Toàn quyền hệ thống
            </div>
            <div className="text-[10.5px] text-black mt-0.5 font-normal">
              Cấu hình định mức, mở/khóa kỳ, xem mọi báo cáo
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              2. 5 tài khoản kê khai (Upload)
            </div>
            <div className="text-sm font-normal text-black mt-1">
              5 Ban / Phòng chuyên môn
            </div>
            <div className="text-[10.5px] text-black mt-0.5 font-normal">
              Mỗi đơn vị phụ trách upload đúng 1 phần của mình
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              3. Phòng Tài chính - Kế hoạch
            </div>
            <div className="text-sm font-normal text-black mt-1">
              Chi trả & Lệnh chuyển khoản
            </div>
            <div className="text-[10.5px] text-black mt-0.5 font-normal">
              Nhận danh sách GV đã xác nhận và lập lệnh chi
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              4. Tài khoản giảng viên (GV)
            </div>
            <div className="text-sm font-normal text-black mt-1">
              Tra cứu & phản hồi cá nhân
            </div>
            <div className="text-[10.5px] text-black mt-0.5 font-normal">
              Rà soát 5 mục, bấm "Đồng ý" hoặc "Khiếu nại"
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="Tìm theo tên đăng nhập, họ tên cán bộ, đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-black focus:outline-hidden bg-white text-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-black" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-black focus:outline-hidden"
            >
              <option value="all">Tất cả nhóm quyền</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="upload_dao_tao">Upload: Giờ giảng (Đào tạo)</option>
              <option value="upload_khao_thi">Upload: Khảo thí & Coi thi</option>
              <option value="upload_tuyen_sinh">Upload: Tuyển sinh</option>
              <option value="upload_nckh">Upload: NCKH</option>
              <option value="upload_cong_tac_khac">Upload: Công tác khác</option>
              <option value="tai_chinh">Tài chính - Kế hoạch</option>
              <option value="giang_vien">Giảng viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {/* Account Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-black font-normal text-left border-b border-slate-300">
                <th className="w-[42px] px-2 py-2.5 text-center border-r border-slate-200 font-normal">STT</th>
                <th className="px-3 py-2.5 border-r border-slate-200 w-[130px] font-normal">Tài khoản</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[170px] font-normal">Họ và tên cán bộ</th>
                <th className="px-3 py-2.5 border-r border-slate-200 w-[180px] font-normal">Nhóm quyền phân công</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[180px] font-normal">Đơn vị công tác</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[200px] font-normal">Mảng đảm nhận upload / xử lý</th>
                <th className="px-2.5 py-2.5 text-center border-r border-slate-200 w-[95px] font-normal">Trạng thái</th>
                <th className="px-3 py-2.5 text-center w-[160px] font-normal">Chuyển vai trò thử nghiệm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-black font-normal">
              {filteredAccounts.map((acc, idx) => {
                const isCurrent = acc.username === currentUsername;
                return (
                  <tr
                    key={acc.id}
                    className={`hover:bg-slate-50 transition-colors font-normal ${
                      isCurrent ? 'bg-slate-50' : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-center font-mono text-black border-r border-slate-100 font-normal">
                      {idx + 1}
                    </td>

                    {/* Username */}
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap text-black font-normal">
                      <div className="font-mono font-normal text-black flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-black" />
                        {acc.username}
                      </div>
                      <div className="text-[10px] text-black font-normal">{acc.email}</div>
                    </td>

                    {/* Full Name */}
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap text-black font-normal">
                      <span className="font-normal text-black block">
                        {acc.fullName}
                      </span>
                      {acc.maGV && (
                        <span className="text-[10px] font-mono text-black font-normal">
                          Mã GV: {acc.maGV}
                        </span>
                      )}
                    </td>

                    {/* Role badge */}
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap text-black font-normal">
                      {getRoleBadge(acc.role)}
                    </td>

                    {/* Department */}
                    <td className="px-3 py-2 text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[180px]" title={acc.departmentName}>
                        {acc.departmentName}
                      </span>
                    </td>

                    {/* Assigned Module */}
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap text-black font-normal">
                      <span className="font-normal text-black">
                        {acc.assignedModule}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-2.5 py-2 text-center border-r border-slate-100 whitespace-nowrap text-black font-normal">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-100 text-black">
                        <Check className="w-2.5 h-2.5 text-black" /> Hoạt động
                      </span>
                    </td>

                    {/* Quick Switch Button */}
                    <td className="px-3 py-2 text-center whitespace-nowrap font-normal">
                      {isCurrent ? (
                        <span className="px-2.5 py-1 rounded bg-[#005325] text-white text-[11px] font-normal shadow-2xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          Đang kích hoạt
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (onSwitchUser) onSwitchUser(acc);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 hover:border-black text-black rounded text-[11px] font-normal cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>Đăng nhập thử</span>
                          <ArrowRight className="w-3 h-3 text-black" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Matrix of Role Permissions Table */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs font-normal">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-normal text-black flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-black" />
              Ma trận phân quyền chi tiết theo nghiệp vụ
            </h3>
            <span className="text-[11px] text-black font-normal">
              Chính sách bảo mật phân quyền nội bộ Đại học Tây Đô
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-black font-normal border-b border-slate-300">
                  <th className="px-3 py-2 text-left w-[200px] font-normal">Nghiệp vụ chức năng</th>
                  <th className="px-2 py-2 w-[80px] font-normal">Admin</th>
                  <th className="px-2 py-2 w-[110px] font-normal">P. Đào tạo</th>
                  <th className="px-2 py-2 w-[110px] font-normal">TT Khảo thí</th>
                  <th className="px-2 py-2 w-[110px] font-normal">P. Tuyển sinh</th>
                  <th className="px-2 py-2 w-[110px] font-normal">P. NCKH</th>
                  <th className="px-2 py-2 w-[110px] font-normal">Thanh tra/Khác</th>
                  <th className="px-2 py-2 w-[110px] font-normal">P. Tài chính</th>
                  <th className="px-2 py-2 w-[100px] font-normal">Giảng viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-black font-normal">
                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Upload & quản lý giờ giảng
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal bg-blue-50/60">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem cá nhân</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Upload & quản lý coi thi, chấm thi
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal bg-sky-50/60">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem cá nhân</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Upload & quản lý công tác tuyển sinh
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal bg-amber-50/60">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem cá nhân</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Upload & quản lý NCKH, bài báo
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal bg-purple-50/60">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem cá nhân</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Upload & quản lý công tác khác (CVHT)
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal bg-teal-50/60">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem cá nhân</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Xem bảng tổng thanh toán 5 mục
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">Xem</td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Xác nhận đồng ý / gửi phản hồi
                  </td>
                  <td className="text-black font-normal">Quản lý</td>
                  <td className="text-black font-normal">Xử lý phản hồi</td>
                  <td className="text-black font-normal">Xử lý phản hồi</td>
                  <td className="text-black font-normal">Xử lý phản hồi</td>
                  <td className="text-black font-normal">Xử lý phản hồi</td>
                  <td className="text-black font-normal">Xử lý phản hồi</td>
                  <td className="text-black font-normal">Theo dõi</td>
                  <td className="text-black font-normal bg-emerald-50">✓ (Quyền chính)</td>
                </tr>

                <tr>
                  <td className="px-3 py-2 text-left font-normal text-black">
                    Chi trả & xuất lệnh chi UNC ngân hàng
                  </td>
                  <td className="text-black font-normal">✓</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal">-</td>
                  <td className="text-black font-normal bg-emerald-50">✓ (Toàn quyền)</td>
                  <td className="text-black font-normal">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#005325] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-normal flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm tài khoản phân quyền
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-normal text-black mb-1">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: cb_daotao2, gv_lethiyen..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-black font-normal focus:ring-1 focus:ring-[#005325] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-black mb-1">
                  Họ và tên cán bộ / Giảng viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: ThS. Nguyễn Văn B"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-black font-normal focus:ring-1 focus:ring-[#005325] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-black mb-1">
                  Phân quyền vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as AccountRoleType;
                    setNewRole(r);
                    if (r === 'upload_dao_tao') setNewDepartment('Phòng Đào tạo');
                    else if (r === 'upload_khao_thi') setNewDepartment('Trung tâm Khảo thí & ĐBCL');
                    else if (r === 'upload_tuyen_sinh') setNewDepartment('Phòng Tuyển sinh & Truyền thông');
                    else if (r === 'upload_nckh') setNewDepartment('Phòng Quản lý Khoa học & HTQT');
                    else if (r === 'upload_cong_tac_khac') setNewDepartment('Ban Thanh tra & CTSV');
                    else if (r === 'tai_chinh') setNewDepartment('Phòng Tài chính - Kế hoạch');
                    else if (r === 'admin') setNewDepartment('Ban Giám hiệu');
                    else if (r === 'giang_vien') setNewDepartment('Khoa Công nghệ thông tin');
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-black font-normal focus:outline-hidden focus:ring-1 focus:ring-[#005325]"
                >
                  <option value="upload_dao_tao">Tài khoản Kê khai 1: Giờ giảng (Phòng Đào tạo)</option>
                  <option value="upload_khao_thi">Tài khoản Kê khai 2: Coi thi chấm thi (TT Khảo thí)</option>
                  <option value="upload_tuyen_sinh">Tài khoản Kê khai 3: Tuyển sinh (Phòng Tuyển sinh)</option>
                  <option value="upload_nckh">Tài khoản Kê khai 4: NCKH (Phòng QLKH)</option>
                  <option value="upload_cong_tac_khac">Tài khoản Kê khai 5: Công tác khác (Ban Thanh tra)</option>
                  <option value="tai_chinh">Phòng Tài chính - Kế hoạch (Chi trả & UNC)</option>
                  <option value="giang_vien">Giảng viên (Tra cứu & Xác nhận)</option>
                  <option value="admin">Quản trị viên (Toàn quyền)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-black mb-1">
                  Đơn vị công tác
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-black font-normal focus:ring-1 focus:ring-[#005325] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-black mb-1">
                  Email TDU
                </label>
                <input
                  type="email"
                  placeholder="canbo@tdu.edu.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-black font-normal focus:ring-1 focus:ring-[#005325] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-black font-normal hover:bg-slate-100 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421d] text-white text-xs font-normal rounded shadow-xs cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
