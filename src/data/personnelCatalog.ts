/**
 * Danh mục cơ cấu tổ chức & danh bạ nhân sự chuẩn Trường Đại học Tây Đô (TDU)
 * Gồm 4 Khối chính thức theo quy chế tổ chức nhà trường:
 * 1. Khối Phòng ban (8 đơn vị)
 * 2. Khối Khoa (9 đơn vị)
 * 3. Khối Trung tâm / Ban (5 đơn vị)
 * 4. Khối Đảng – Đoàn thể (3 đơn vị)
 */

export type UnitBlockCategory =
  | 'khoi_phong_ban'
  | 'khoi_khoa'
  | 'khoi_tt_ban'
  | 'khoi_dang_doan'
  | 'toan_truong';

export interface OrganizationUnit {
  id: string; // Mã định danh đơn vị
  name: string; // Tên hiển thị đầy đủ
  shortName: string; // Tên rút gọn
  category: UnitBlockCategory;
  blockName: string; // Tên khối tiếng Việt
  mappedDeptUnit?: 'dao_tao' | 'khao_thi' | 'nckh' | 'tuyen_sinh' | 'co_van_hoc_tap' | 'cong_tac_khac' | 'all';
  aliases: string[]; // Các biến thể tên gọi không dấu để tìm kiếm & so khớp
}

export interface PersonnelDirectoryItem {
  maNhanSu: string;
  hoTen: string; // Họ tên chuẩn (đã bỏ học hàm / học vị)
  donViId: string; // Khóa ngoại trỏ đến OrganizationUnit.id
  donVi: string; // Tên đơn vị công tác
  chucVu?: string;
  hocVi?: string;
}

// 4 KHỐI ĐƠN VỊ CHUẨN TRƯỜNG ĐẠI HỌC TÂY ĐÔ
export const TDU_ORGANIZATION_UNITS: OrganizationUnit[] = [
  // ========================================================
  // 1. KHỐI PHÒNG BAN (8 đơn vị)
  // ========================================================
  {
    id: 'pb_to_chuc_hanh_chinh',
    name: 'Phòng Tổ chức - Hành chính',
    shortName: 'Phòng TC - HC',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'phong to chuc hanh chinh',
      'phong to chuc - hanh chinh',
      'phong tchc',
      'to chuc hanh chinh',
      'tchc',
      'p.tchc',
    ],
  },
  {
    id: 'pb_tuyen_sinh_truyen_thong',
    name: 'Phòng Tuyển sinh và Truyền thông',
    shortName: 'Phòng Tuyển sinh',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'tuyen_sinh',
    aliases: [
      'phong tuyen sinh va truyen thong',
      'phong tuyen sinh & truyen thong',
      'phong tuyen sinh',
      'tuyen sinh va truyen thong',
      'tuyen sinh',
      'truyen thong',
      'tuyen_sinh',
    ],
  },
  {
    id: 'pb_dao_tao',
    name: 'Phòng Đào tạo',
    shortName: 'Phòng Đào tạo',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'phong dao tao',
      'phong quan ly dao tao',
      'dao tao',
      'p qldt',
      'qldt',
      'p.qldt',
      'dao_tao',
    ],
  },
  {
    id: 'pb_ctct_qlsv',
    name: 'Phòng Công tác Chính trị - Quản lý Sinh viên',
    shortName: 'Phòng CTCT - QLSV',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'co_van_hoc_tap',
    aliases: [
      'phong cong tac chinh tri - quan ly sinh vien',
      'phong cong tac chinh tri quan ly sinh vien',
      'phong cong tac sinh vien',
      'phong ctsv',
      'ctsv',
      'ctct-qlsv',
      'ctct qlsv',
      'co_van_hoc_tap',
      'cvht',
    ],
  },
  {
    id: 'pb_tai_chinh_ke_hoach',
    name: 'Phòng Tài chính kế hoạch',
    shortName: 'Phòng TCKH',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'phong tai chinh ke hoach',
      'phong ke toan',
      'tai chinh ke hoach',
      'tckh',
      'p.tckh',
    ],
  },
  {
    id: 'pb_quan_tri_thiet_bi',
    name: 'Phòng Quản trị thiết bị',
    shortName: 'Phòng QTTB',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'phong quan tri thiet bi',
      'quan tri thiet bi',
      'qttb',
      'p.qttb',
    ],
  },
  {
    id: 'pb_qlkh_htqt',
    name: 'Phòng Quản lý khoa học – Hợp tác quốc tế',
    shortName: 'Phòng QLKH - HTQT',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'nckh',
    aliases: [
      'phong quan ly khoa hoc hop tac quoc te',
      'phong quan ly khoa hoc - hop tac quoc te',
      'phong quan ly khoa hoc & sau dai hoc',
      'phong nckh',
      'nckh',
      'qlkh-htqt',
      'qlkh',
      'htqt',
    ],
  },
  {
    id: 'pb_cong_nghe_thong_tin',
    name: 'Phòng Công nghệ thông tin',
    shortName: 'Phòng CNTT',
    category: 'khoi_phong_ban',
    blockName: 'Khối Phòng ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'phong cong nghe thong tin',
      'phong cntt',
      'cntt',
      'p.cntt',
    ],
  },

  // ========================================================
  // 2. KHỐI KHOA (9 đơn vị)
  // ========================================================
  {
    id: 'khoa_duoc_dieu_duong',
    name: 'Khoa Dược - Điều dưỡng',
    shortName: 'Khoa Dược - ĐD',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa duoc - dieu duong',
      'khoa duoc dieu duong',
      'khoa duoc',
      'duoc',
      'dieu duong',
      'khoa_duoc',
    ],
  },
  {
    id: 'khoa_qtkd_du_lich',
    name: 'Khoa Quản trị kinh doanh - Du lịch',
    shortName: 'Khoa QTKD - Du lịch',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa quan tri kinh doanh - du lich',
      'khoa quan tri kinh doanh du lich',
      'khoa quan tri kinh doanh',
      'qtkd',
      'du lich',
      'khoa kinh te',
      'khoa_kt_qtkd',
    ],
  },
  {
    id: 'khoa_kt_tc_nh',
    name: 'Khoa Kế toán - Tài chính - Ngân hàng',
    shortName: 'Khoa KT - TC - NH',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa ke toan - tai chinh - ngan hang',
      'khoa ke toan tai chinh ngan hang',
      'khoa tai chinh ngan hang',
      'ke toan',
      'tai chinh ngan hang',
      'tcnh',
    ],
  },
  {
    id: 'khoa_nn_xhnv_tt',
    name: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    shortName: 'Khoa NN - XHNV & TT',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa ngoai ngu - xa hoi nhan van va truyen thong',
      'khoa ngoai ngu xa hoi nhan van va truyen thong',
      'khoa ngoai ngu',
      'ngoai ngu',
      'ngon ngu anh',
      'xhnv',
      'khoa_ngoai_ngu',
    ],
  },
  {
    id: 'khoa_ky_thuat_cong_nghe',
    name: 'Khoa Kỹ thuật công nghệ',
    shortName: 'Khoa Kỹ thuật CN',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa ky thuat cong nghe',
      'khoa ky thuat - cong nghe',
      'khoa ky thuat',
      'ky thuat cong nghe',
      'khoa_ky_thuat',
    ],
  },
  {
    id: 'khoa_sinh_hoc_ung_dung',
    name: 'Khoa Sinh học ứng dụng',
    shortName: 'Khoa Sinh học UD',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa sinh hoc ung dung',
      'sinh hoc ung dung',
      'sinh hoc',
      'khoa_sinh_hoc',
    ],
  },
  {
    id: 'khoa_luat',
    name: 'Khoa Luật',
    shortName: 'Khoa Luật',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: ['khoa luat', 'luat', 'luat hoc', 'luat kinh te'],
  },
  {
    id: 'khoa_sau_dai_hoc',
    name: 'Khoa Đào tạo Sau đại học',
    shortName: 'Khoa Sau đại học',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: [
      'khoa dao tao sau dai hoc',
      'khoa sau dai hoc',
      'sau dai hoc',
      'sdh',
    ],
  },
  {
    id: 'khoa_co_ban',
    name: 'Khoa Cơ bản',
    shortName: 'Khoa Cơ bản',
    category: 'khoi_khoa',
    blockName: 'Khối Khoa',
    mappedDeptUnit: 'dao_tao',
    aliases: ['khoa co ban', 'bo mon co ban', 'co ban', 'khoa hoc co ban'],
  },

  // ========================================================
  // 3. KHỐI TRUNG TÂM / BAN (5 đơn vị)
  // ========================================================
  {
    id: 'tt_khao_thi_dbcl',
    name: 'Trung tâm Khảo thí và Đảm bảo chất lượng',
    shortName: 'TT Khảo thí & ĐBCL',
    category: 'khoi_tt_ban',
    blockName: 'Khối Trung tâm / Ban',
    mappedDeptUnit: 'khao_thi',
    aliases: [
      'trung tam khao thi va dam bao chat luong',
      'trung tam khao thi & dam bao chat luong',
      'trung tam khao thi & dbcl',
      'trung tam khao thi',
      'khao thi',
      'dbcl',
      'ttkt',
      'khao_thi',
    ],
  },
  {
    id: 'tt_ngoai_ngu_tin_hoc',
    name: 'Trung tâm Ngoại ngữ - Tin học',
    shortName: 'TT Ngoại ngữ - Tin học',
    category: 'khoi_tt_ban',
    blockName: 'Khối Trung tâm / Ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'trung tam ngoai ngu - tin hoc',
      'trung tam ngoai ngu tin hoc',
      'tt nn-th',
      'ngoai ngu tin hoc',
      'ttnnth',
    ],
  },
  {
    id: 'ban_phap_che_kiem_tra',
    name: 'Ban Pháp chế kiểm tra',
    shortName: 'Ban Pháp chế KT',
    category: 'khoi_tt_ban',
    blockName: 'Khối Trung tâm / Ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'ban phap che kiem tra',
      'phap che kiem tra',
      'ban thanh tra',
      'phap che',
      'pckt',
    ],
  },
  {
    id: 'thu_vien_dien_tu',
    name: 'Thư viện điện tử',
    shortName: 'Thư viện điện tử',
    category: 'khoi_tt_ban',
    blockName: 'Khối Trung tâm / Ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: ['thu vien dien tu', 'thu vien', 'trung tam hoc lieu', 'tvdt'],
  },
  {
    id: 'tt_khoi_nghiep_dmst',
    name: 'Trung tâm Khởi nghiệp - Đổi mới sáng tạo - Hỗ trợ sinh viên và Hợp tác doanh nghiệp',
    shortName: 'TT Khởi nghiệp & ĐMST',
    category: 'khoi_tt_ban',
    blockName: 'Khối Trung tâm / Ban',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'trung tam khoi nghiep - doi moi sang tao - ho tro sinh vien va hop tac doanh nghiep',
      'trung tam khoi nghiep doi moi sang tao ho tro sinh vien va hop tac doanh nghiep',
      'trung tam khoi nghiep doi moi sang tao',
      'trung tam khoi nghiep & doi moi sang tao',
      'trung tam ho tro sinh vien',
      'khoi nghiep',
      'dmst',
    ],
  },

  // ========================================================
  // 4. KHỐI ĐẢNG – ĐOÀN THỂ (3 đơn vị)
  // ========================================================
  {
    id: 'dang_uy',
    name: 'Đảng ủy',
    shortName: 'Đảng ủy',
    category: 'khoi_dang_doan',
    blockName: 'Khối Đảng – Đoàn thể',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: ['dang uy', 'dang bo', 'van phong dang uy'],
  },
  {
    id: 'cong_doan_co_so',
    name: 'Công đoàn cơ sở',
    shortName: 'Công đoàn cơ sở',
    category: 'khoi_dang_doan',
    blockName: 'Khối Đảng – Đoàn thể',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: ['cong doan co so', 'cong doan', 'ban chap hanh cong doan'],
  },
  {
    id: 'doan_thanh_nien_hoi_sv',
    name: 'Đoàn thanh niên - Hội sinh viên',
    shortName: 'Đoàn TN - Hội SV',
    category: 'khoi_dang_doan',
    blockName: 'Khối Đảng – Đoàn thể',
    mappedDeptUnit: 'cong_tac_khac',
    aliases: [
      'doan thanh nien - hoi sinh vien',
      'doan thanh nien hoi sinh vien',
      'doan thanh nien',
      'hoi sinh vien',
      'doan - hoi',
      'doan hoi',
    ],
  },

  // ========================================================
  // 5. LỰA CHỌN TOÀN TRƯỜNG (Tổng hợp)
  // ========================================================
  {
    id: 'all',
    name: 'Tất cả đơn vị (Toàn trường)',
    shortName: 'Toàn trường',
    category: 'toan_truong',
    blockName: 'Toàn trường',
    mappedDeptUnit: 'all',
    aliases: ['tat ca don vi', 'toan truong', 'tat ca', 'all'],
  },
];

// Danh bạ nhân sự chuẩn của Trường Đại học Tây Đô (TDU)
export const TDU_PERSONNEL_DIRECTORY: PersonnelDirectoryItem[] = [
  // Cán bộ Phòng Đào tạo
  {
    maNhanSu: 'TDU00901',
    hoTen: 'Nguyễn Văn An',
    donViId: 'pb_dao_tao',
    donVi: 'Phòng Đào tạo',
    chucVu: 'Chuyên viên Quản lý đào tạo',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00902',
    hoTen: 'Trần Thị Mai',
    donViId: 'pb_dao_tao',
    donVi: 'Phòng Đào tạo',
    chucVu: 'Chuyên viên Kế hoạch đào tạo',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00903',
    hoTen: 'Lê Hoàng Giang',
    donViId: 'pb_dao_tao',
    donVi: 'Phòng Đào tạo',
    chucVu: 'Phó Trưởng phòng Đào tạo',
    hocVi: 'Tiến sĩ',
  },

  // Cán bộ Trung tâm Khảo thí và Đảm bảo chất lượng
  {
    maNhanSu: 'TDU00911',
    hoTen: 'Lê Văn Bình',
    donViId: 'tt_khao_thi_dbcl',
    donVi: 'Trung tâm Khảo thí và Đảm bảo chất lượng',
    chucVu: 'Giám đốc Trung tâm Khảo thí và ĐBCL',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00912',
    hoTen: 'Phạm Thị Thu Thảo',
    donViId: 'tt_khao_thi_dbcl',
    donVi: 'Trung tâm Khảo thí và Đảm bảo chất lượng',
    chucVu: 'Chuyên viên Khảo thí',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00913',
    hoTen: 'Huỳnh Quốc Bảo',
    donViId: 'tt_khao_thi_dbcl',
    donVi: 'Trung tâm Khảo thí và Đảm bảo chất lượng',
    chucVu: 'Chuyên viên Đảm bảo chất lượng',
    hocVi: 'Cử nhân',
  },

  // Cán bộ Phòng Quản lý khoa học – Hợp tác quốc tế
  {
    maNhanSu: 'TDU00931',
    hoTen: 'Hoàng Đình Trọng',
    donViId: 'pb_qlkh_htqt',
    donVi: 'Phòng Quản lý khoa học – Hợp tác quốc tế',
    chucVu: 'Trưởng phòng QLKH - HTQT',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00932',
    hoTen: 'Trịnh Thanh Thủy',
    donViId: 'pb_qlkh_htqt',
    donVi: 'Phòng Quản lý khoa học – Hợp tác quốc tế',
    chucVu: 'Chuyên viên Quản lý Nghiên cứu khoa học',
    hocVi: 'Thạc sĩ',
  },

  // Cán bộ Phòng Tuyển sinh và Truyền thông
  {
    maNhanSu: 'TDU00921',
    hoTen: 'Đỗ Minh Quân',
    donViId: 'pb_tuyen_sinh_truyen_thong',
    donVi: 'Phòng Tuyển sinh và Truyền thông',
    chucVu: 'Trưởng phòng Tuyển sinh và Truyền thông',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00922',
    hoTen: 'Võ Thị Kim Ngân',
    donViId: 'pb_tuyen_sinh_truyen_thong',
    donVi: 'Phòng Tuyển sinh và Truyền thông',
    chucVu: 'Chuyên viên Tư vấn Tuyển sinh',
    hocVi: 'Cử nhân',
  },

  // Cán bộ Phòng Công tác Chính trị - Quản lý Sinh viên
  {
    maNhanSu: 'TDU00941',
    hoTen: 'Bùi Văn Toàn',
    donViId: 'pb_ctct_qlsv',
    donVi: 'Phòng Công tác Chính trị - Quản lý Sinh viên',
    chucVu: 'Phó Trưởng phòng CTCT - QLSV',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00942',
    hoTen: 'Dương Mỹ Hạnh',
    donViId: 'pb_ctct_qlsv',
    donVi: 'Phòng Công tác Chính trị - Quản lý Sinh viên',
    chucVu: 'Chuyên viên Quản lý sinh viên & CVHT',
    hocVi: 'Cử nhân',
  },

  // Cán bộ Phòng Công nghệ thông tin
  {
    maNhanSu: 'TDU00128',
    hoTen: 'Mai Như Long',
    donViId: 'pb_cong_nghe_thong_tin',
    donVi: 'Phòng Công nghệ thông tin',
    chucVu: 'Phụ trách Phòng CNTT',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00215',
    hoTen: 'Nguyễn Văn Hải',
    donViId: 'pb_cong_nghe_thong_tin',
    donVi: 'Phòng Công nghệ thông tin',
    chucVu: 'Chuyên viên Quản trị hệ thống',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00216',
    hoTen: 'Lê Hoàng Anh',
    donViId: 'pb_cong_nghe_thong_tin',
    donVi: 'Phòng Công nghệ thông tin',
    chucVu: 'Chuyên viên Phát triển phần mềm',
    hocVi: 'Thạc sĩ',
  },

  // Cán bộ Phòng Tổ chức - Hành chính
  {
    maNhanSu: 'TDU00961',
    hoTen: 'Nguyễn Thanh Tùng',
    donViId: 'pb_to_chuc_hanh_chinh',
    donVi: 'Phòng Tổ chức - Hành chính',
    chucVu: 'Trưởng phòng Tổ chức - Hành chính',
    hocVi: 'Thạc sĩ',
  },

  // Cán bộ Phòng Tài chính kế hoạch
  {
    maNhanSu: 'TDU00971',
    hoTen: 'Lâm Thị Ngọc Mai',
    donViId: 'pb_tai_chinh_ke_hoach',
    donVi: 'Phòng Tài chính kế hoạch',
    chucVu: 'Trưởng phòng Tài chính kế hoạch',
    hocVi: 'Thạc sĩ',
  },

  // Cán bộ Phòng Quản trị thiết bị
  {
    maNhanSu: 'TDU00951',
    hoTen: 'Trương Văn Hưng',
    donViId: 'pb_quan_tri_thiet_bi',
    donVi: 'Phòng Quản trị thiết bị',
    chucVu: 'Phó Trưởng phòng Quản trị thiết bị',
    hocVi: 'Thạc sĩ',
  },

  // Giảng viên Khoa Dược - Điều dưỡng
  {
    maNhanSu: 'TDU00245',
    hoTen: 'Trần Quốc Hùng',
    donViId: 'khoa_duoc_dieu_duong',
    donVi: 'Khoa Dược - Điều dưỡng',
    chucVu: 'Phó Trưởng Khoa',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00089',
    hoTen: 'Trần Thanh Dũng',
    donViId: 'khoa_duoc_dieu_duong',
    donVi: 'Khoa Dược - Điều dưỡng',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00267',
    hoTen: 'Võ Minh Trí',
    donViId: 'khoa_duoc_dieu_duong',
    donVi: 'Khoa Dược - Điều dưỡng',
    chucVu: 'Phó Trưởng Bộ môn Điều dưỡng',
    hocVi: 'Bác sĩ CKII',
  },

  // Giảng viên Khoa Quản trị kinh doanh - Du lịch
  {
    maNhanSu: 'TDU00104',
    hoTen: 'Lê Thị Bích',
    donViId: 'khoa_qtkd_du_lich',
    donVi: 'Khoa Quản trị kinh doanh - Du lịch',
    chucVu: 'Phó Trưởng Bộ môn',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00318',
    hoTen: 'Nguyễn Thị Cẩm Tú',
    donViId: 'khoa_qtkd_du_lich',
    donVi: 'Khoa Quản trị kinh doanh - Du lịch',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00342',
    hoTen: 'Lê Hoàng Nam',
    donViId: 'khoa_qtkd_du_lich',
    donVi: 'Khoa Quản trị kinh doanh - Du lịch',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Thạc sĩ',
  },

  // Giảng viên Khoa Kế toán - Tài chính - Ngân hàng
  {
    maNhanSu: 'TDU00351',
    hoTen: 'Hồ Quốc Bảo',
    donViId: 'khoa_kt_tc_nh',
    donVi: 'Khoa Kế toán - Tài chính - Ngân hàng',
    chucVu: 'Trưởng Khoa',
    hocVi: 'Tiến sĩ',
  },

  // Giảng viên Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông
  {
    maNhanSu: 'TDU00312',
    hoTen: 'Trần Thị Kim Cúc',
    donViId: 'khoa_nn_xhnv_tt',
    donVi: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Thạc sĩ',
  },
  {
    maNhanSu: 'TDU00512',
    hoTen: 'Đặng Thị Hồng Nhung',
    donViId: 'khoa_nn_xhnv_tt',
    donVi: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Thạc sĩ',
  },

  // Giảng viên Khoa Kỹ thuật công nghệ
  {
    maNhanSu: 'TDU00601',
    hoTen: 'Ngô Thanh Sơn',
    donViId: 'khoa_ky_thuat_cong_nghe',
    donVi: 'Khoa Kỹ thuật công nghệ',
    chucVu: 'Trưởng Khoa',
    hocVi: 'Tiến sĩ',
  },

  // Giảng viên Khoa Sinh học ứng dụng
  {
    maNhanSu: 'TDU00701',
    hoTen: 'Vũ Thị Phương Thảo',
    donViId: 'khoa_sinh_hoc_ung_dung',
    donVi: 'Khoa Sinh học ứng dụng',
    chucVu: 'Phó Trưởng Khoa',
    hocVi: 'Tiến sĩ',
  },

  // Giảng viên Khoa Luật
  {
    maNhanSu: 'TDU00188',
    hoTen: 'Huỳnh Thanh Toàn',
    donViId: 'khoa_luat',
    donVi: 'Khoa Luật',
    chucVu: 'Trưởng Khoa Luật',
    hocVi: 'Tiến sĩ',
  },
  {
    maNhanSu: 'TDU00409',
    hoTen: 'Lê Hoàng Minh',
    donViId: 'khoa_luat',
    donVi: 'Khoa Luật',
    chucVu: 'Giảng viên cơ hữu',
    hocVi: 'Thạc sĩ',
  },

  // Khoa Đào tạo Sau đại học
  {
    maNhanSu: 'TDU00801',
    hoTen: 'Đỗ Hải Đăng',
    donViId: 'khoa_sau_dai_hoc',
    donVi: 'Khoa Đào tạo Sau đại học',
    chucVu: 'Trưởng Khoa Sau đại học',
    hocVi: 'Phó Giáo sư Tiến sĩ',
  },

  // Khoa Cơ bản
  {
    maNhanSu: 'TDU00811',
    hoTen: 'Bùi Thị Thanh Tâm',
    donViId: 'khoa_co_ban',
    donVi: 'Khoa Cơ bản',
    chucVu: 'Trưởng Bộ môn Toán - Lý',
    hocVi: 'Thạc sĩ',
  },
];

/**
 * Chuẩn hóa chuỗi so sánh không dấu
 */
export const normalizeOrgString = (s: any): string => {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Tìm đơn vị theo id hoặc tên gọi
 */
export const findOrganizationUnit = (unitKeyOrName: string): OrganizationUnit | undefined => {
  if (!unitKeyOrName) return undefined;
  const normKey = normalizeOrgString(unitKeyOrName);

  // 1. Tìm theo exact id
  const byId = TDU_ORGANIZATION_UNITS.find(
    (u) => normalizeOrgString(u.id) === normKey
  );
  if (byId) return byId;

  // 2. Tìm theo tên hoặc aliases
  return TDU_ORGANIZATION_UNITS.find((u) => {
    if (normalizeOrgString(u.name) === normKey) return true;
    if (normalizeOrgString(u.shortName) === normKey) return true;
    return u.aliases.some((alias) => {
      const normAlias = normalizeOrgString(alias);
      return normKey === normAlias || normKey.includes(normAlias) || normAlias.includes(normKey);
    });
  });
};

/**
 * Tìm nhân sự theo Mã nhân sự (TDUxxxxx)
 */
export const findPersonnelByCode = (
  code: string
): PersonnelDirectoryItem | undefined => {
  if (!code) return undefined;
  const cleanCode = String(code).trim().toUpperCase();
  return TDU_PERSONNEL_DIRECTORY.find(
    (p) => p.maNhanSu.toUpperCase() === cleanCode
  );
};

export interface PersonnelRowValidationResult {
  isValid: boolean;
  rowNumber: number;
  maNhanSu: string;
  hoTen: string;
  donViTrongFile: string;
  donViThucTe?: string;
  selectedUnitName: string;
  reason: string;
  personnel?: PersonnelDirectoryItem;
}

/**
 * Kiểm tra tính hợp lệ của dòng dữ liệu nhân sự so với đơn vị được stick chọn:
 */
export const validatePersonnelBySelectedUnit = (
  rowNumber: number,
  maNhanSu: string,
  hoTen: string,
  donViTrongFile: string,
  selectedUnitId: string
): PersonnelRowValidationResult => {
  const cleanMa = String(maNhanSu || '').trim().toUpperCase();
  const cleanName = String(hoTen || '').trim();
  const cleanFileUnit = String(donViTrongFile || '').trim();

  const selectedUnit = findOrganizationUnit(selectedUnitId) || {
    id: selectedUnitId,
    name: selectedUnitId,
    shortName: selectedUnitId,
    category: 'khoi_phong_ban' as const,
    blockName: 'Khối Phòng ban',
    aliases: [normalizeOrgString(selectedUnitId)],
  };

  const selectedUnitName = selectedUnit.name;

  // Nếu chọn "Tất cả đơn vị" -> Luôn hợp lệ
  if (selectedUnit.id === 'all') {
    const existingP = findPersonnelByCode(cleanMa);
    return {
      isValid: true,
      rowNumber,
      maNhanSu: cleanMa || 'CHƯA_CÓ_MÃ',
      hoTen: cleanName || existingP?.hoTen || 'Chưa có họ tên',
      donViTrongFile: cleanFileUnit,
      donViThucTe: existingP?.donVi || cleanFileUnit || 'Toàn trường',
      selectedUnitName,
      reason: 'Hợp lệ (Chế độ import toàn trường)',
      personnel: existingP,
    };
  }

  // 1. Kiểm tra thiếu mã nhân sự
  if (!cleanMa) {
    return {
      isValid: false,
      rowNumber,
      maNhanSu: '(Trống)',
      hoTen: cleanName || '(Chưa có tên)',
      donViTrongFile: cleanFileUnit,
      donViThucTe: 'Không xác định',
      selectedUnitName,
      reason: `Dòng ${rowNumber} thiếu Mã nhân sự / Mã giảng viên (Bắt buộc để xác thực đơn vị).`,
    };
  }

  // 2. Tra cứu nhân sự trong danh bạ chuẩn TDU
  const personnel = findPersonnelByCode(cleanMa);

  const normSelected = normalizeOrgString(selectedUnit.name);
  const normSelectedId = normalizeOrgString(selectedUnit.id);
  const normFileUnit = normalizeOrgString(cleanFileUnit);

  const isMatchUnit = (unitNameOrId: string) => {
    const norm = normalizeOrgString(unitNameOrId);
    if (!norm) return false;
    if (norm === normSelectedId || norm === normSelected) return true;
    return selectedUnit.aliases.some((alias) => {
      const nAlias = normalizeOrgString(alias);
      return norm === nAlias || norm.includes(nAlias) || nAlias.includes(norm);
    });
  };

  // TRƯỜNG HỢP A: Mã nhân sự KHÔNG tồn tại trong danh bạ TDU
  if (!personnel) {
    if (cleanFileUnit && !isMatchUnit(cleanFileUnit)) {
      return {
        isValid: false,
        rowNumber,
        maNhanSu: cleanMa,
        hoTen: cleanName,
        donViTrongFile: cleanFileUnit,
        donViThucTe: 'Chưa có trong danh mục',
        selectedUnitName,
        reason: `Mã nhân sự "${cleanMa}" không tồn tại trong hệ thống TDU và đơn vị ghi trong file "${cleanFileUnit}" không thuộc "${selectedUnitName}".`,
      };
    }

    return {
      isValid: false,
      rowNumber,
      maNhanSu: cleanMa,
      hoTen: cleanName,
      donViTrongFile: cleanFileUnit,
      donViThucTe: 'Chưa có trong hệ thống',
      selectedUnitName,
      reason: `Mã nhân sự "${cleanMa}" không tồn tại trong danh mục nhân sự Trường ĐH Tây Đô.`,
    };
  }

  // TRƯỜNG HỢP B: Nhân sự CÓ tồn tại trong hệ thống TDU
  const actualUnitName = personnel.donVi;
  const actualUnitId = personnel.donViId;

  const isPersonnelInUnit =
    actualUnitId === selectedUnit.id ||
    isMatchUnit(actualUnitName) ||
    isMatchUnit(actualUnitId);

  // Nếu KHÔNG thuộc đơn vị được stick chọn -> BÁO LỖI
  if (!isPersonnelInUnit) {
    let extraFileNote = '';
    if (cleanFileUnit && cleanFileUnit !== actualUnitName) {
      extraFileNote = ` (Đơn vị ghi trong file: "${cleanFileUnit}")`;
    }

    return {
      isValid: false,
      rowNumber,
      maNhanSu: cleanMa,
      hoTen: personnel.hoTen || cleanName,
      donViTrongFile: cleanFileUnit || actualUnitName,
      donViThucTe: actualUnitName,
      selectedUnitName,
      reason: `Mã nhân sự "${cleanMa}" (${personnel.hoTen}) thuộc biên chế "${actualUnitName}", không thuộc đơn vị "${selectedUnitName}" đã chọn import.${extraFileNote}`,
      personnel,
    };
  }

  // TRƯỜNG HỢP C: Nhân sự thuộc đúng đơn vị, nhưng cột đơn vị ghi trong file lại sai lệch rõ ràng
  if (cleanFileUnit && !isMatchUnit(cleanFileUnit)) {
    return {
      isValid: false,
      rowNumber,
      maNhanSu: cleanMa,
      hoTen: personnel.hoTen || cleanName,
      donViTrongFile: cleanFileUnit,
      donViThucTe: actualUnitName,
      selectedUnitName,
      reason: `Đơn vị ghi trong file là "${cleanFileUnit}" không khớp với đơn vị đã chọn "${selectedUnitName}".`,
      personnel,
    };
  }

  // HỢP LỆ HOÀN TOÀN
  return {
    isValid: true,
    rowNumber,
    maNhanSu: cleanMa,
    hoTen: personnel.hoTen || cleanName,
    donViTrongFile: cleanFileUnit || actualUnitName,
    donViThucTe: actualUnitName,
    selectedUnitName,
    reason: `Hợp lệ (Thuộc đúng đơn vị ${selectedUnitName})`,
    personnel,
  };
};
