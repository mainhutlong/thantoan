import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCw,
  ArrowUpDown,
  Trash2,
  Eye,
  Check,
  X,
  Plus
} from 'lucide-react';
import { TeachingRecord, AppMode, UserRole, PeriodStatus, DepartmentUnit, VbccRecord, DataQuality } from '../types';
import { stripAcademicTitle } from '../utils/excelTemplateGenerator';

export interface ColumnFilters {
  hoTen: string;
  ngaySinh: string;
  soCCCD: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  nguoiThucHien: string;
}

export interface LecturerSummaryRow {
  key: string;
  maGV: string;
  hoTen: string;
  hocHamHocVi?: string;
  khoaBoMon?: string;
  trangThai?: string;
  // 1. Giờ giảng dạy
  tongSoMon: number;
  tongSoSinhVien: number;
  tongSoTiet: number;
  tongGioGiangDay: number;
  // 2. Nghiên cứu khoa học
  tongSoBaiNCKH: number;
  tongSoTietQuyDoiNCKH: number;
  // 3. Khảo thí (Coi thi, Chấm thi, Ra đề)
  soCaCoiThi: number;
  soBaiChamThi: number;
  soDeRa: number;
  tongTietQCKhaoThi: number;
  // 4. Đồ án & Khóa luận tốt nghiệp
  soDeTaiHuongDan: number;
  soLuotChamHoiDong: number;
  tongTietQCDoAn: number;
  // 5. Cố vấn học tập
  soLopCVHT: number;
  tongSoSVCVHT: number;
  xepLoaiCVHT: string;
  tongTietQCCVHT: number;
  // 6. Tuyển sinh
  soNgayCongTac: number;
  diaBanTuyenSinh: string;
  tongTietQCTuyenSinh: number;
  // 7. Kiêm nhiệm & ĐBCL
  soNhiemVuKiemNhiem: number;
  chiTietNhiemVu: string;
  tongTietQCKiemNhiem: number;
  records: TeachingRecord[];
  primaryRecord: TeachingRecord;
}

interface DataTableProps {
  appMode: AppMode;
  selectedDepartment?: DepartmentUnit;
  vbccData?: VbccRecord[];
  teachingData: TeachingRecord[];
  columnFilters: ColumnFilters;
  onColumnFilterChange: (filters: ColumnFilters) => void;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onRefresh: () => void;
  onOpenSettings?: () => void;
  onEditRecord?: (record: TeachingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewRecordDetail?: (record: TeachingRecord) => void;
  onViewTeachingSchedule?: (maGV: string) => void;
  onViewResearchSchedule?: (maGV: string) => void;
  onRequestFeedback?: (record: TeachingRecord) => void;
  periodStatus: PeriodStatus;
  currentRole: UserRole;
  isAddingInline?: boolean;
  onCancelAddInline?: () => void;
  onSaveInlineRecord?: (record: TeachingRecord) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  selectedDepartment = 'all',
  teachingData,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onRefresh,
  onEditRecord,
  onDeleteRecord,
  onViewRecordDetail,
  onViewTeachingSchedule,
  onViewResearchSchedule,
  periodStatus,
  isAddingInline = false,
  onCancelAddInline,
  onSaveInlineRecord,
}) => {
  const [sortField, setSortField] = useState<string>('tt');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Known unique lecturers for auto-filling inline new row
  const knownLecturers = useMemo(() => {
    const map = new Map<string, {
      maGV: string;
      hoTen: string;
      hocHamHocVi: string;
      khoaBoMon: string;
    }>();
    teachingData.forEach((r) => {
      if (r.maGV && !map.has(r.maGV.trim())) {
        map.set(r.maGV.trim(), {
          maGV: r.maGV.trim(),
          hoTen: r.hoTen,
          hocHamHocVi: r.hocHamHocVi || 'ThS',
          khoaBoMon: r.khoaBoMon || 'Khoa Công nghệ thông tin',
        });
      }
    });
    return Array.from(map.values());
  }, [teachingData]);

  // Department flags
  const isResearch = selectedDepartment === 'nckh';
  const isExam = selectedDepartment === 'khao_thi';
  const isThesis = selectedDepartment === 'do_an';
  const isAdvisor = selectedDepartment === 'co_van_hoc_tap';
  const isAdmission = selectedDepartment === 'tuyen_sinh';
  const isOther = selectedDepartment === 'cong_tac_khac';
  const isTeaching = !isResearch && !isExam && !isThesis && !isAdvisor && !isAdmission && !isOther;

  // Initial draft values for inline new row
  const createInitialDraft = () => ({
    maGV: '',
    hoTen: '',
    khoaBoMon: 'Khoa Công nghệ thông tin',
    hocHamHocVi: 'ThS',
    trangThai: 'da_so_hoa' as DataQuality,
    // 1. Giờ giảng
    tongSoMon: 1,
    tongSoSinhVien: 60,
    tongSoTiet: 45,
    tongGioGiangDay: 45,
    // 2. NCKH
    tongSoBaiNCKH: 1,
    tongSoTietQuyDoiNCKH: 60,
    // 3. Khảo thí
    soCaCoiThi: 4,
    soBaiChamThi: 120,
    soDeRa: 2,
    tongTietQCKhaoThi: 30,
    // 4. Đồ án & Khóa luận
    soDeTaiHuongDan: 2,
    soLuotChamHoiDong: 2,
    tongTietQCDoAn: 24,
    // 5. Cố vấn học tập
    soLopCVHT: 1,
    tongSoSVCVHT: 65,
    xepLoaiCVHT: 'Hoàn thành tốt',
    tongTietQCCVHT: 20,
    // 6. Tuyển sinh
    soNgayCongTac: 3,
    diaBanTuyenSinh: 'Cụm trường THPT Hậu Giang & Sóc Trăng',
    tongTietQCTuyenSinh: 7.5,
    // 7. Kiêm nhiệm
    soNhiemVuKiemNhiem: 1,
    chiTietNhiemVu: 'Quản lý phòng thí nghiệm',
    tongTietQCKiemNhiem: 40,
  });

  const [draftRow, setDraftRow] = useState(createInitialDraft);

  // Reset draft whenever isAddingInline opens
  useEffect(() => {
    if (isAddingInline) {
      setDraftRow(createInitialDraft());
    }
  }, [isAddingInline]);

  const handleDraftChange = (field: string, value: any) => {
    setDraftRow((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'maGV' && typeof value === 'string') {
        const found = knownLecturers.find(
          (l) => l.maGV.toLowerCase() === value.trim().toLowerCase()
        );
        if (found) {
          updated.hoTen = found.hoTen || updated.hoTen;
          if (found.khoaBoMon) updated.khoaBoMon = found.khoaBoMon;
          if (found.hocHamHocVi) updated.hocHamHocVi = found.hocHamHocVi;
        }
      }
      return updated;
    });
  };

  const handleSaveDraft = () => {
    if (!draftRow.hoTen.trim() && !draftRow.maGV.trim()) {
      alert('Vui lòng nhập Mã GV hoặc Họ tên giảng viên!');
      return;
    }

    if (isResearch) {
      const tongBai = Number(draftRow.tongSoBaiNCKH) || 1;
      const tongQCNCKH = Number(draftRow.tongSoTietQuyDoiNCKH) || 60;

      const newRec: TeachingRecord = {
        id: `rec-inline-nckh-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'TS',
        khoaBoMon: 'Khoa Công nghệ thông tin',
        phongBanQuanLy: 'nckh',
        loaiHoatDong: 'Nghiên cứu khoa học',
        tenHocPhan: `Nghiên cứu khoa học (${tongBai} bài báo/đề tài)`,
        maLopHocPhan: 'NCKH_TDU_' + Math.floor(100 + Math.random() * 900),
        noiDungNCKH: `Nghiên cứu khoa học (${tongBai} bài báo/đề tài)`,
        theLoaiNCKH: 'Bài báo khoa học / Đề tài',
        soGioQCNCKH: tongQCNCKH,
        dinhMucNCKH: 150,
        mucDoHoanThanhNCKH: 'hoan_thanh',
        soTinChi: 0,
        soTietLT: tongQCNCKH,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: tongQCNCKH,
        soGioQuyChuan: tongQCNCKH,
        donGiaTiet: 180000,
        tongTienThuLao: tongQCNCKH * 180000,
        thueTNCN: Math.round(tongQCNCKH * 180000 * 0.1),
        thucNhan: Math.round(tongQCNCKH * 180000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Phòng QL NCKH TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    if (isExam) {
      const ca = Number(draftRow.soCaCoiThi) || 4;
      const bai = Number(draftRow.soBaiChamThi) || 120;
      const de = Number(draftRow.soDeRa) || 2;
      const qc = Number(draftRow.tongTietQCKhaoThi) || 30;

      const newRec: TeachingRecord = {
        id: `rec-inline-kt-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'TS',
        khoaBoMon: 'Khoa Công nghệ thông tin',
        phongBanQuanLy: 'khao_thi',
        loaiHoatDong: 'Coi thi, Chấm thi, Ra đề',
        tenHocPhan: `Công tác khảo thí (${ca} ca coi thi, ${bai} bài chấm, ${de} đề)`,
        maLopHocPhan: 'KT_TDU_' + Math.floor(100 + Math.random() * 900),
        nhomCongViec: 'Khảo thí & ĐBCL',
        maCV: 'CV_KHAO_THI',
        tenCongViec: 'Coi thi, Chấm thi, Ra đề',
        soLuong: ca + de,
        tongSoGioTheoCV: qc,
        soTinChi: 0,
        soTietLT: qc,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: qc,
        donGiaTiet: 180000,
        tongTienThuLao: Math.round(qc * 180000),
        thueTNCN: Math.round(qc * 180000 * 0.1),
        thucNhan: Math.round(qc * 180000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Trung tâm Khảo thí TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    if (isThesis) {
      const dt = Number(draftRow.soDeTaiHuongDan) || 2;
      const hd = Number(draftRow.soLuotChamHoiDong) || 2;
      const qc = Number(draftRow.tongTietQCDoAn) || 24;

      const newRec: TeachingRecord = {
        id: `rec-inline-da-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'TS',
        khoaBoMon: 'Khoa Công nghệ thông tin',
        phongBanQuanLy: 'do_an',
        loaiHoatDong: 'Đồ án & Khóa luận tốt nghiệp',
        tenHocPhan: `Hướng dẫn & Chấm ${dt} đề tài khóa luận`,
        maLopHocPhan: 'DA_TDU_' + Math.floor(100 + Math.random() * 900),
        soDeTaiHuongDan: dt,
        soLuotChamHoiDong: hd,
        soTinChi: 0,
        soTietLT: qc,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: qc,
        donGiaTiet: 180000,
        tongTienThuLao: Math.round(qc * 180000),
        thueTNCN: Math.round(qc * 180000 * 0.1),
        thucNhan: Math.round(qc * 180000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Phòng Đào tạo & Khoa TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    if (isAdvisor) {
      const lop = Number(draftRow.soLopCVHT) || 1;
      const sv = Number(draftRow.tongSoSVCVHT) || 65;
      const qc = Number(draftRow.tongTietQCCVHT) || 20;

      const newRec: TeachingRecord = {
        id: `rec-inline-cvht-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'ThS',
        khoaBoMon: 'Khoa Công nghệ thông tin',
        phongBanQuanLy: 'co_van_hoc_tap',
        loaiHoatDong: 'Cố vấn học tập (CVHT)',
        tenHocPhan: `Cố vấn học tập ${lop} lớp sinh viên`,
        maLopHocPhan: 'CVHT_TDU_' + Math.floor(100 + Math.random() * 900),
        soSinhVien: sv,
        soLopCVHT: lop,
        xepLoaiCVHT: draftRow.xepLoaiCVHT || 'Hoàn thành tốt',
        soTinChi: 0,
        soTietLT: qc,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: qc,
        donGiaTiet: 140000,
        tongTienThuLao: Math.round(qc * 140000),
        thueTNCN: Math.round(qc * 140000 * 0.1),
        thucNhan: Math.round(qc * 140000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Phòng Công tác Sinh viên TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    if (isAdmission) {
      const ngay = Number(draftRow.soNgayCongTac) || 3;
      const qc = Number(draftRow.tongTietQCTuyenSinh) || (ngay * 2.5);

      const newRec: TeachingRecord = {
        id: `rec-inline-ts-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'ThS',
        khoaBoMon: 'Khoa Kinh tế - Quản trị kinh doanh',
        phongBanQuanLy: 'tuyen_sinh',
        loaiHoatDong: 'Công tác tuyển sinh & Truyền thông',
        tenHocPhan: `Tư vấn hướng nghiệp tuyển sinh (${ngay} ngày)`,
        maLopHocPhan: 'TS_TDU_' + Math.floor(100 + Math.random() * 900),
        soNgayCongTac: ngay,
        diaBanTuyenSinh: draftRow.diaBanTuyenSinh || 'Trường THPT ĐBSCL',
        soTinChi: 0,
        soTietLT: qc,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: qc,
        donGiaTiet: 140000,
        tongTienThuLao: Math.round(qc * 140000),
        thueTNCN: Math.round(qc * 140000 * 0.1),
        thucNhan: Math.round(qc * 140000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Phòng Tuyển sinh & Truyền thông TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    if (isOther) {
      const nv = Number(draftRow.soNhiemVuKiemNhiem) || 1;
      const qc = Number(draftRow.tongTietQCKiemNhiem) || 40;

      const newRec: TeachingRecord = {
        id: `rec-inline-other-${Date.now()}`,
        tt: 1,
        maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
        hoTen: draftRow.hoTen.trim(),
        ngaySinh: '—',
        soCCCD: '—',
        hocHamHocVi: 'ThS',
        khoaBoMon: 'Khoa Công nghệ thông tin',
        phongBanQuanLy: 'cong_tac_khac',
        loaiHoatDong: draftRow.chiTietNhiemVu || 'Công tác kiêm nhiệm & ĐBCL',
        tenHocPhan: draftRow.chiTietNhiemVu || 'Quản lý phòng thí nghiệm',
        maLopHocPhan: 'KN_TDU_' + Math.floor(100 + Math.random() * 900),
        soNhiemVuKiemNhiem: nv,
        nhiemVuKiemNhiem: draftRow.chiTietNhiemVu || 'Quản lý phòng thí nghiệm',
        soTinChi: 0,
        soTietLT: qc,
        soTietTH: 0,
        heSoLop: 1.0,
        tongTietQC: qc,
        donGiaTiet: 140000,
        tongTienThuLao: Math.round(qc * 140000),
        thueTNCN: Math.round(qc * 140000 * 0.1),
        thucNhan: Math.round(qc * 140000 * 0.9),
        soTaiKhoan: '—',
        nganHang: 'Vietcombank',
        dotThanhToan: 'Học kỳ 1 2026-2027',
        nguoiThucHien: 'Trung tâm Khảo thí & ĐBCL TDU',
        trangThai: 'hop_le',
      };

      if (onSaveInlineRecord) {
        onSaveInlineRecord(newRec);
      }
      return;
    }

    const tongMon = Number(draftRow.tongSoMon) || 1;
    const tongSV = Number(draftRow.tongSoSinhVien) || 0;
    const tongTiet = Number(draftRow.tongSoTiet) || 0;
    const tongGio = Number(draftRow.tongGioGiangDay) || tongTiet;

    const newRec: TeachingRecord = {
      id: `rec-inline-${Date.now()}`,
      tt: 1,
      maGV: draftRow.maGV.trim() || 'TDU' + Math.floor(1000 + Math.random() * 9000),
      hoTen: draftRow.hoTen.trim(),
      ngaySinh: '—',
      soCCCD: '—',
      hocHamHocVi: draftRow.hocHamHocVi || 'ThS',
      khoaBoMon: draftRow.khoaBoMon || 'Khoa Công nghệ thông tin',
      phongBanQuanLy: 'dao_tao',
      loaiHoatDong: 'Giờ giảng dạy',
      tenHocPhan: `Giảng dạy ${tongMon} môn học`,
      maLopHocPhan: 'HP_TDU_' + Math.floor(100 + Math.random() * 900),
      soTinChi: 3,
      soSinhVien: tongSV,
      soNhom: 1,
      soGioMonHoc: tongTiet,
      soGioThucGiang: tongGio,
      soTietLT: Math.round(tongTiet * 0.7),
      soTietTH: tongTiet - Math.round(tongTiet * 0.7),
      heSoLop: 1.0,
      heSoLopNhom: 1.0,
      heSoTinChi: 1.0,
      tongTietQC: tongGio,
      soGioQuyChuan: tongGio,
      donGiaTiet: 150000,
      tongTienThuLao: tongGio * 150000,
      thueTNCN: Math.round(tongGio * 150000 * 0.1),
      thucNhan: Math.round(tongGio * 150000 * 0.9),
      soTaiKhoan: '—',
      nganHang: 'Vietcombank',
      dotThanhToan: 'Học kỳ 1 2026-2027',
      nguoiThucHien: 'Phòng Đào tạo TDU',
      trangThai: (draftRow.trangThai as DataQuality) || 'da_so_hoa',
      phanLoaiGiangDay: 'ly_thuyet',
    };

    if (onSaveInlineRecord) {
      onSaveInlineRecord(newRec);
    }
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveDraft();
    } else if (e.key === 'Escape' && onCancelAddInline) {
      e.preventDefault();
      onCancelAddInline();
    }
  };

  // Group teaching records by lecturer: Mỗi người chỉ đúng 1 hàng dữ liệu
  const lecturerSummaries: LecturerSummaryRow[] = useMemo(() => {
    const map = new Map<string, TeachingRecord[]>();
    teachingData.forEach((rec) => {
      const key = (rec.maGV || rec.hoTen || rec.id).trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rec);
    });

    return Array.from(map.entries()).map(([key, recs]) => {
      const primary = recs[0];
      const uniqueSubjects = new Set(
        recs
          .map((r) => (r.tenHocPhan || r.noiDungNCKH || r.tenCongViec || '').trim())
          .filter(Boolean)
      );
      // 1. Giờ giảng dạy
      const tongSoMon = uniqueSubjects.size || recs.length;
      const tongSoSinhVien = recs.reduce((sum, r) => sum + (Number(r.soSinhVien) || 0), 0);
      const tongSoTiet = recs.reduce(
        (sum, r) =>
          sum +
          ((Number(r.soTietLT) || 0) + (Number(r.soTietTH) || 0) ||
            Number(r.soGioMonHoc) ||
            Number(r.tongTietQC) ||
            0),
        0
      );
      const tongGioGiangDay = recs.reduce(
        (sum, r) =>
          sum +
          (Number(r.soGioThucGiang) ||
            ((Number(r.soTietLT) || 0) + (Number(r.soTietTH) || 0)) ||
            Number(r.tongTietQC) ||
            0),
        0
      );

      // 2. NCKH: Tổng số bài báo / đề tài và Tổng số tiết quy đổi
      const tongSoBaiNCKH = recs.length;
      const tongSoTietQuyDoiNCKH = recs.reduce(
        (sum, r) => sum + (Number(r.soGioQCNCKH) || Number(r.tongTietQC) || 0),
        0
      );

      // 3. Khảo thí (Coi thi, Chấm thi, Ra đề)
      const soCaCoiThi = recs.reduce((sum, r) => {
        const isCoi = (r.loaiHoatDong || '').toLowerCase().includes('coi') || (r.maCV || '').includes('CT');
        return isCoi ? sum + (Number(r.soLuong) || 1) : sum;
      }, 0);
      const soBaiChamThi = recs.reduce((sum, r) => {
        const isCham = (r.loaiHoatDong || '').toLowerCase().includes('chấm') || (r.maCV || '').includes('CB');
        return isCham ? sum + (Number(r.soLuong) || 0) : sum;
      }, 0);
      const soDeRa = recs.reduce((sum, r) => {
        const isRa = (r.loaiHoatDong || '').toLowerCase().includes('đề') || (r.maCV || '').includes('RD');
        return isRa ? sum + (Number(r.soLuong) || 1) : sum;
      }, 0);
      const tongTietQCKhaoThi = recs.reduce(
        (sum, r) => sum + (Number(r.tongSoGioTheoCV) || Number(r.tongTietQC) || 0),
        0
      );

      // 4. Đồ án & Khóa luận tốt nghiệp
      const soDeTaiHuongDan = recs.reduce(
        (sum, r) => sum + (Number(r.soDeTaiHuongDan) || (r.loaiHoatDong?.toLowerCase().includes('hướng dẫn') ? Number(r.soLuong || 1) : 0)),
        0
      );
      const soLuotChamHoiDong = recs.reduce(
        (sum, r) => sum + (Number(r.soLuotChamHoiDong) || (!r.loaiHoatDong?.toLowerCase().includes('hướng dẫn') ? Number(r.soLuong || 1) : 0)),
        0
      );
      const tongTietQCDoAn = recs.reduce(
        (sum, r) => sum + (Number(r.tongSoGioTheoCV) || Number(r.tongTietQC) || 0),
        0
      );

      // 5. Cố vấn học tập
      const cvhtClasses = Array.from(new Set(recs.map((r) => r.lopCVHT || r.maLopHocPhan || '').filter(Boolean)));
      const soLopCVHT = cvhtClasses.length || 1;
      const tongSoSVCVHT = recs.reduce((sum, r) => sum + (Number(r.soSinhVien) || 60), 0);
      const xepLoaiCVHT = recs[0]?.xepLoaiCVHT || 'Hoàn thành tốt';
      const tongTietQCCVHT = recs.reduce(
        (sum, r) => sum + (Number(r.tongTietQC) || 0),
        0
      );

      // 6. Tuyển sinh
      const soNgayCongTac = recs.reduce(
        (sum, r) => sum + (Number(r.soNgayCongTac) || Number(r.soLuong) || 3),
        0
      );
      const diaBanTuyenSinh = recs.map((r) => r.diaBanTuyenSinh || r.ghiChuThongTin || '').filter(Boolean)[0] || 'Trường THPT ĐBSCL';
      const tongTietQCTuyenSinh = recs.reduce(
        (sum, r) => sum + (Number(r.tongTietQC) || 0),
        0
      );

      // 7. Kiêm nhiệm & ĐBCL
      const soNhiemVuKiemNhiem = recs.length;
      const chiTietNhiemVu = recs.map((r) => r.nhiemVuKiemNhiem || r.loaiHoatDong || r.tenHocPhan || '').filter(Boolean).slice(0, 2).join('; ') || 'Nhiệm vụ ĐBCL & Khoa';
      const tongTietQCKiemNhiem = recs.reduce(
        (sum, r) => sum + (Number(r.tongTietQC) || 0),
        0
      );

      return {
        key,
        maGV: primary.maGV,
        hoTen: primary.hoTen,
        hocHamHocVi: primary.hocHamHocVi || (primary as any).hocVi || 'ThS',
        khoaBoMon: primary.khoaBoMon || (primary as any).khoa || 'Khoa Công nghệ thông tin',
        trangThai: primary.trangThai || 'da_so_hoa',
        tongSoMon,
        tongSoSinhVien,
        tongSoTiet,
        tongGioGiangDay,
        tongSoBaiNCKH,
        tongSoTietQuyDoiNCKH,
        soCaCoiThi,
        soBaiChamThi,
        soDeRa,
        tongTietQCKhaoThi,
        soDeTaiHuongDan,
        soLuotChamHoiDong,
        tongTietQCDoAn,
        soLopCVHT,
        tongSoSVCVHT,
        xepLoaiCVHT,
        tongTietQCCVHT,
        soNgayCongTac,
        diaBanTuyenSinh,
        tongTietQCTuyenSinh,
        soNhiemVuKiemNhiem,
        chiTietNhiemVu,
        tongTietQCKiemNhiem,
        records: recs,
        primaryRecord: primary,
      };
    });
  }, [teachingData]);

  // Sort lecturers
  const sortedLecturers = useMemo(() => {
    const list = [...lecturerSummaries];
    list.sort((a, b) => {
      let aVal: any = a[sortField as keyof LecturerSummaryRow];
      let bVal: any = b[sortField as keyof LecturerSummaryRow];
      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';
      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      if (typeof aVal === 'number') {
        return sortAsc ? aVal - (bVal as number) : (bVal as number) - aVal;
      }
      return 0;
    });
    return list;
  }, [lecturerSummaries, sortField, sortAsc]);

  // Grand totals for tfoot
  const grandTotals = useMemo(() => {
    return sortedLecturers.reduce(
      (acc, cur) => ({
        tongSoMon: acc.tongSoMon + cur.tongSoMon,
        tongSoSinhVien: acc.tongSoSinhVien + cur.tongSoSinhVien,
        tongSoTiet: acc.tongSoTiet + cur.tongSoTiet,
        tongGioGiangDay: acc.tongGioGiangDay + cur.tongGioGiangDay,
        tongSoBaiNCKH: acc.tongSoBaiNCKH + (cur.tongSoBaiNCKH || 0),
        tongSoTietQuyDoiNCKH: acc.tongSoTietQuyDoiNCKH + (cur.tongSoTietQuyDoiNCKH || 0),
        soCaCoiThi: acc.soCaCoiThi + (cur.soCaCoiThi || 0),
        soBaiChamThi: acc.soBaiChamThi + (cur.soBaiChamThi || 0),
        soDeRa: acc.soDeRa + (cur.soDeRa || 0),
        tongTietQCKhaoThi: acc.tongTietQCKhaoThi + (cur.tongTietQCKhaoThi || 0),
        soDeTaiHuongDan: acc.soDeTaiHuongDan + (cur.soDeTaiHuongDan || 0),
        soLuotChamHoiDong: acc.soLuotChamHoiDong + (cur.soLuotChamHoiDong || 0),
        tongTietQCDoAn: acc.tongTietQCDoAn + (cur.tongTietQCDoAn || 0),
        soLopCVHT: acc.soLopCVHT + (cur.soLopCVHT || 0),
        tongSoSVCVHT: acc.tongSoSVCVHT + (cur.tongSoSVCVHT || 0),
        tongTietQCCVHT: acc.tongTietQCCVHT + (cur.tongTietQCCVHT || 0),
        soNgayCongTac: acc.soNgayCongTac + (cur.soNgayCongTac || 0),
        tongTietQCTuyenSinh: acc.tongTietQCTuyenSinh + (cur.tongTietQCTuyenSinh || 0),
        soNhiemVuKiemNhiem: acc.soNhiemVuKiemNhiem + (cur.soNhiemVuKiemNhiem || 0),
        tongTietQCKiemNhiem: acc.tongTietQCKiemNhiem + (cur.tongTietQCKiemNhiem || 0),
      }),
      {
        tongSoMon: 0,
        tongSoSinhVien: 0,
        tongSoTiet: 0,
        tongGioGiangDay: 0,
        tongSoBaiNCKH: 0,
        tongSoTietQuyDoiNCKH: 0,
        soCaCoiThi: 0,
        soBaiChamThi: 0,
        soDeRa: 0,
        tongTietQCKhaoThi: 0,
        soDeTaiHuongDan: 0,
        soLuotChamHoiDong: 0,
        tongTietQCDoAn: 0,
        soLopCVHT: 0,
        tongSoSVCVHT: 0,
        tongTietQCCVHT: 0,
        soNgayCongTac: 0,
        tongTietQCTuyenSinh: 0,
        soNhiemVuKiemNhiem: 0,
        tongTietQCKiemNhiem: 0,
      }
    );
  }, [sortedLecturers]);

  // Unique faculties count for tfoot and stats
  const uniqueFacultiesCount = useMemo(() => {
    return (
      new Set(
        sortedLecturers
          .map((l) => (l.khoaBoMon || l.primaryRecord.khoaBoMon || '').trim())
          .filter(Boolean)
      ).size || (sortedLecturers.length > 0 ? 8 : 0)
    );
  }, [sortedLecturers]);

  const isAllSelected =
    sortedLecturers.length > 0 &&
    sortedLecturers.every((l) => l.records.some((r) => selectedIds.includes(r.id)));

  return (
    <div className="w-full min-w-0 bg-white select-none flex flex-col flex-1 h-full min-h-0 overflow-hidden">
      {/* Scrollable table container */}
      <div
        id="main-datatable-scroll-container"
        className="w-full min-w-0 overflow-auto relative border-t border-b border-slate-200 flex-1 h-full"
      >
        <table className="w-max min-w-full text-left border-separate border-spacing-0 font-sans">
          {/* Table Header: 4 cột cố định (Checkbox, TT, Mã GV, Họ và tên) + Các cột số liệu tùy theo Chuyên mục */}
          <thead>
            <tr className="bg-[#f8fafc] text-[#1e293b] text-[12px] font-semibold h-[38px]">
              {/* Col 0: Checkbox + Refresh */}
              <th className="sticky top-0 z-10 w-[54px] min-w-[54px] max-w-[54px] px-2 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc]">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 rounded-sm border-gray-300 text-black focus:ring-0 cursor-pointer"
                    title="Chọn tất cả"
                  />
                  <button
                    onClick={onRefresh}
                    title="Làm mới dữ liệu"
                    className="text-black hover:text-black p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </th>

              {/* Col 1: TT */}
              <th className="sticky top-0 z-10 w-[54px] min-w-[54px] max-w-[54px] px-2 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] text-[#1e293b] font-semibold">
                TT
              </th>

              {/* Col 2: Mã GV */}
              <th
                onClick={() => handleSort('maGV')}
                className="sticky top-0 z-10 w-[115px] min-w-[115px] max-w-[115px] px-2.5 border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold"
              >
                <div className="flex items-center justify-between">
                  <span>Mã GV</span>
                  <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                </div>
              </th>

              {/* Col 3: Họ và tên Giảng viên */}
              <th
                onClick={() => handleSort('hoTen')}
                className="sticky top-0 z-10 min-w-[220px] px-3 border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold"
              >
                <div className="flex items-center justify-between">
                  <span>Họ và tên</span>
                  <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                </div>
              </th>

              {/* CỘT TÙY BIẾN THEO CHUYÊN MỤC */}
              {isResearch ? (
                <>
                  {/* Col 4 (NCKH): Tổng số bài */}
                  <th
                    onClick={() => handleSort('tongSoBaiNCKH')}
                    className="sticky top-0 z-10 min-w-[150px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tổng số bài</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (NCKH): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongSoTietQuyDoiNCKH')}
                    className="sticky top-0 z-10 min-w-[180px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : isExam ? (
                <>
                  {/* Col 4 (Khảo thí): Số ca coi thi */}
                  <th
                    onClick={() => handleSort('soCaCoiThi')}
                    className="sticky top-0 z-10 min-w-[125px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số ca coi thi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (Khảo thí): Số bài chấm thi */}
                  <th
                    onClick={() => handleSort('soBaiChamThi')}
                    className="sticky top-0 z-10 min-w-[135px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số bài chấm thi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (Khảo thí): Số đề ra */}
                  <th
                    onClick={() => handleSort('soDeRa')}
                    className="sticky top-0 z-10 min-w-[110px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số đề ra</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 7 (Khảo thí): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongTietQCKhaoThi')}
                    className="sticky top-0 z-10 min-w-[160px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : isThesis ? (
                <>
                  {/* Col 4 (Đồ án): Số đề tài / SV hướng dẫn */}
                  <th
                    onClick={() => handleSort('soDeTaiHuongDan')}
                    className="sticky top-0 z-10 min-w-[145px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số đề tài/SV</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (Đồ án): Số lượt chấm / Hội đồng */}
                  <th
                    onClick={() => handleSort('soLuotChamHoiDong')}
                    className="sticky top-0 z-10 min-w-[145px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số lượt chấm/HĐ</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (Đồ án): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongTietQCDoAn')}
                    className="sticky top-0 z-10 min-w-[160px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : isAdvisor ? (
                <>
                  {/* Col 4 (CVHT): Số lớp CVHT */}
                  <th
                    onClick={() => handleSort('soLopCVHT')}
                    className="sticky top-0 z-10 min-w-[115px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số lớp CVHT</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (CVHT): Tổng số sinh viên */}
                  <th
                    onClick={() => handleSort('tongSoSVCVHT')}
                    className="sticky top-0 z-10 min-w-[130px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tổng số sinh viên</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (CVHT): Xếp loại CVHT */}
                  <th
                    onClick={() => handleSort('xepLoaiCVHT')}
                    className="sticky top-0 z-10 min-w-[145px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Xếp loại CVHT</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 7 (CVHT): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongTietQCCVHT')}
                    className="sticky top-0 z-10 min-w-[160px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : isAdmission ? (
                <>
                  {/* Col 4 (Tuyển sinh): Số ngày công tác */}
                  <th
                    onClick={() => handleSort('soNgayCongTac')}
                    className="sticky top-0 z-10 min-w-[135px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số ngày công tác</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (Tuyển sinh): Địa bàn / Trường THPT */}
                  <th
                    onClick={() => handleSort('diaBanTuyenSinh')}
                    className="sticky top-0 z-10 min-w-[240px] px-3 border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between">
                      <span>Địa bàn / Trường THPT</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (Tuyển sinh): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongTietQCTuyenSinh')}
                    className="sticky top-0 z-10 min-w-[160px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : isOther ? (
                <>
                  {/* Col 4 (Kiêm nhiệm & ĐBCL): Số nhiệm vụ */}
                  <th
                    onClick={() => handleSort('soNhiemVuKiemNhiem')}
                    className="sticky top-0 z-10 min-w-[130px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số nhiệm vụ</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (Kiêm nhiệm & ĐBCL): Nhiệm vụ chính */}
                  <th
                    onClick={() => handleSort('chiTietNhiemVu')}
                    className="sticky top-0 z-10 min-w-[240px] px-3 border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between">
                      <span>Nhiệm vụ chính</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (Kiêm nhiệm & ĐBCL): Tổng số tiết quy đổi */}
                  <th
                    onClick={() => handleSort('tongTietQCKiemNhiem')}
                    className="sticky top-0 z-10 min-w-[160px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết quy đổi</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              ) : (
                <>
                  {/* Col 4 (Giờ giảng): Khoa / Bộ môn */}
                  <th
                    onClick={() => handleSort('khoaBoMon')}
                    className="sticky top-0 z-10 min-w-[170px] px-3 border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between">
                      <span>Khoa / Bộ môn</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 5 (Giờ giảng): Học vị */}
                  <th
                    onClick={() => handleSort('hocHamHocVi')}
                    className="sticky top-0 z-10 w-[85px] min-w-[85px] px-2 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Học vị</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 6 (Giờ giảng): Tổng số môn */}
                  <th
                    onClick={() => handleSort('tongSoMon')}
                    className="sticky top-0 z-10 min-w-[110px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tổng số môn</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 7 (Giờ giảng): Tổng số sinh viên */}
                  <th
                    onClick={() => handleSort('tongSoSinhVien')}
                    className="sticky top-0 z-10 min-w-[130px] px-3 text-center border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tổng số sinh viên</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 8 (Giờ giảng): Tổng số tiết */}
                  <th
                    onClick={() => handleSort('tongSoTiet')}
                    className="sticky top-0 z-10 min-w-[130px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng số tiết</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>

                  {/* Col 9 (Giờ giảng): Tổng giờ giảng dạy */}
                  <th
                    onClick={() => handleSort('tongGioGiangDay')}
                    className="sticky top-0 z-10 min-w-[150px] px-3 text-right border-b border-r border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:bg-slate-200/60 transition-colors text-[#1e293b] font-semibold whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tổng giờ giảng dạy</span>
                      <ArrowUpDown className="w-3 h-3 text-[#1e293b] shrink-0" />
                    </div>
                  </th>
                </>
              )}

              {/* Col Thao tác */}
              <th className="sticky top-0 z-10 w-[84px] min-w-[84px] px-2 border-b border-[#cbd5e1] bg-[#f8fafc] text-center text-[#1e293b] font-semibold whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>

          {/* Table Body: Mỗi giảng viên 1 dòng duy nhất */}
          <tbody className="text-[12px] font-sans font-normal text-slate-600">
            {/* INLINE NEW ROW DRAFT */}
            {isAddingInline && (
              <tr
                onKeyDown={handleDraftKeyDown}
                className="bg-white border-b border-slate-300 h-[40px] transition-colors shadow-2xs"
              >
                {/* Col đầu (Cột 0 + 1 gộp): Hủy và Lưu */}
                <td
                  colSpan={2}
                  className="w-[108px] min-w-[108px] max-w-[108px] px-1.5 py-1 text-center border-b border-r border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {onCancelAddInline && (
                      <button
                        type="button"
                        onClick={onCancelAddInline}
                        title="Hủy bỏ thêm mới (Esc)"
                        className="h-[26px] px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-rose-600 text-[11.5px] font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hủy</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      title="Lưu dòng giảng viên này (Enter)"
                      className="h-[26px] px-2.5 rounded bg-[#005325] hover:bg-[#00421e] text-white text-[11.5px] font-sans font-medium flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu</span>
                    </button>
                  </div>
                </td>

                {/* Col 2: Mã GV */}
                <td className="w-[115px] min-w-[115px] max-w-[115px] p-1 border-b border-r border-slate-200 bg-white">
                  <input
                    type="text"
                    list="lecturers-datalist"
                    value={draftRow.maGV}
                    onChange={(e) => handleDraftChange('maGV', e.target.value)}
                    placeholder="Mã GV"
                    className="w-full h-[28px] px-2 text-[12px] font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none placeholder:text-slate-400 transition-colors"
                    autoFocus
                  />
                  <datalist id="lecturers-datalist">
                    {knownLecturers.map((l) => (
                      <option key={l.maGV} value={l.maGV}>
                        {l.maGV} — {stripAcademicTitle(l.hoTen)}
                      </option>
                    ))}
                  </datalist>
                </td>

                {/* Col 3: Họ và tên Giảng viên */}
                <td className="min-w-[220px] p-1 border-b border-r border-slate-200 bg-white">
                  <input
                    type="text"
                    value={draftRow.hoTen}
                    onChange={(e) => handleDraftChange('hoTen', e.target.value)}
                    placeholder="Họ và tên GV..."
                    className="w-full h-[28px] px-2 text-[12px] font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none placeholder:text-slate-400 transition-colors"
                  />
                </td>

                {isResearch ? (
                  <>
                    <td className="min-w-[150px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="1"
                        value={draftRow.tongSoBaiNCKH}
                        onChange={(e) => handleDraftChange('tongSoBaiNCKH', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số bài"
                      />
                    </td>
                    <td className="min-w-[180px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draftRow.tongSoTietQuyDoiNCKH}
                        onChange={(e) => handleDraftChange('tongSoTietQuyDoiNCKH', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : isExam ? (
                  <>
                    <td className="min-w-[125px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.soCaCoiThi}
                        onChange={(e) => handleDraftChange('soCaCoiThi', e.target.value)}
                        className="w-[75px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số ca"
                      />
                    </td>
                    <td className="min-w-[135px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.soBaiChamThi}
                        onChange={(e) => handleDraftChange('soBaiChamThi', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số bài"
                      />
                    </td>
                    <td className="min-w-[110px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.soDeRa}
                        onChange={(e) => handleDraftChange('soDeRa', e.target.value)}
                        className="w-[70px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số đề"
                      />
                    </td>
                    <td className="min-w-[160px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongTietQCKhaoThi}
                        onChange={(e) => handleDraftChange('tongTietQCKhaoThi', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : isThesis ? (
                  <>
                    <td className="min-w-[145px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.soDeTaiHuongDan}
                        onChange={(e) => handleDraftChange('soDeTaiHuongDan', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số đề tài"
                      />
                    </td>
                    <td className="min-w-[145px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.soLuotChamHoiDong}
                        onChange={(e) => handleDraftChange('soLuotChamHoiDong', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số lượt HĐ"
                      />
                    </td>
                    <td className="min-w-[160px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongTietQCDoAn}
                        onChange={(e) => handleDraftChange('tongTietQCDoAn', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : isAdvisor ? (
                  <>
                    <td className="min-w-[115px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="1"
                        value={draftRow.soLopCVHT}
                        onChange={(e) => handleDraftChange('soLopCVHT', e.target.value)}
                        className="w-[75px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số lớp"
                      />
                    </td>
                    <td className="min-w-[130px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.tongSoSVCVHT}
                        onChange={(e) => handleDraftChange('tongSoSVCVHT', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số SV"
                      />
                    </td>
                    <td className="min-w-[145px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="text"
                        value={draftRow.xepLoaiCVHT}
                        onChange={(e) => handleDraftChange('xepLoaiCVHT', e.target.value)}
                        className="w-full h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none placeholder:text-slate-400 transition-colors"
                        placeholder="Xếp loại"
                      />
                    </td>
                    <td className="min-w-[160px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongTietQCCVHT}
                        onChange={(e) => handleDraftChange('tongTietQCCVHT', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : isAdmission ? (
                  <>
                    <td className="min-w-[135px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="1"
                        value={draftRow.soNgayCongTac}
                        onChange={(e) => handleDraftChange('soNgayCongTac', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số ngày"
                      />
                    </td>
                    <td className="min-w-[240px] p-1 border-b border-r border-slate-200 bg-white">
                      <input
                        type="text"
                        value={draftRow.diaBanTuyenSinh}
                        onChange={(e) => handleDraftChange('diaBanTuyenSinh', e.target.value)}
                        className="w-full h-[28px] px-2 font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none placeholder:text-slate-400 transition-colors"
                        placeholder="Địa bàn / Trường THPT..."
                      />
                    </td>
                    <td className="min-w-[160px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongTietQCTuyenSinh}
                        onChange={(e) => handleDraftChange('tongTietQCTuyenSinh', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : isOther ? (
                  <>
                    <td className="min-w-[130px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="1"
                        value={draftRow.soNhiemVuKiemNhiem}
                        onChange={(e) => handleDraftChange('soNhiemVuKiemNhiem', e.target.value)}
                        className="w-[85px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Số nhiệm vụ"
                      />
                    </td>
                    <td className="min-w-[240px] p-1 border-b border-r border-slate-200 bg-white">
                      <input
                        type="text"
                        value={draftRow.chiTietNhiemVu}
                        onChange={(e) => handleDraftChange('chiTietNhiemVu', e.target.value)}
                        className="w-full h-[28px] px-2 font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none placeholder:text-slate-400 transition-colors"
                        placeholder="Nhiệm vụ chính..."
                      />
                    </td>
                    <td className="min-w-[160px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongTietQCKiemNhiem}
                        onChange={(e) => handleDraftChange('tongTietQCKiemNhiem', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block placeholder:text-slate-400 transition-colors"
                        placeholder="Tiết quy đổi"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    {/* Col 4 (Giờ giảng): Khoa / Bộ môn */}
                    <td className="min-w-[170px] p-1 border-b border-r border-slate-200 bg-white">
                      <select
                        value={draftRow.khoaBoMon}
                        onChange={(e) => handleDraftChange('khoaBoMon', e.target.value)}
                        className="w-full h-[28px] px-2 font-sans text-[11.5px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none transition-colors"
                      >
                        <option value="Khoa Công nghệ thông tin">Khoa CNTT</option>
                        <option value="Khoa Dược - Điều dưỡng">Khoa Dược - Điều dưỡng</option>
                        <option value="Khoa Quản trị kinh doanh - Du lịch">Khoa QTKD - Du lịch</option>
                        <option value="Khoa Kế toán - Tài chính - Ngân hàng">Khoa KT - TC - NH</option>
                        <option value="Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông">Khoa NN - XHNV & TT</option>
                        <option value="Khoa Kỹ thuật công nghệ">Khoa Kỹ thuật công nghệ</option>
                        <option value="Khoa Sinh học ứng dụng">Khoa Sinh học ứng dụng</option>
                        <option value="Khoa Luật">Khoa Luật</option>
                        <option value="Khoa Đào tạo Sau đại học">Khoa Đào tạo Sau ĐH</option>
                        <option value="Khoa Cơ bản">Khoa Cơ bản</option>
                      </select>
                    </td>

                    {/* Col 5 (Giờ giảng): Học vị */}
                    <td className="w-[85px] min-w-[85px] p-1 border-b border-r border-slate-200 bg-white">
                      <select
                        value={draftRow.hocHamHocVi}
                        onChange={(e) => handleDraftChange('hocHamHocVi', e.target.value)}
                        className="w-full h-[28px] px-1 text-center font-sans text-[11.5px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none transition-colors"
                      >
                        <option value="ThS">ThS</option>
                        <option value="TS">TS</option>
                        <option value="PGS.TS">PGS.TS</option>
                        <option value="GS.TS">GS.TS</option>
                        <option value="CN">CN</option>
                        <option value="KS">KS</option>
                        <option value="BS.CKI">BS.CKI</option>
                        <option value="BS.CKII">BS.CKII</option>
                      </select>
                    </td>

                    {/* Col 6 (Giờ giảng): Tổng số môn */}
                    <td className="min-w-[110px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="1"
                        value={draftRow.tongSoMon}
                        onChange={(e) => handleDraftChange('tongSoMon', e.target.value)}
                        className="w-[80px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block transition-colors"
                      />
                    </td>

                    {/* Col 7 (Giờ giảng): Tổng số sinh viên */}
                    <td className="min-w-[130px] p-1 text-center border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.tongSoSinhVien}
                        onChange={(e) => handleDraftChange('tongSoSinhVien', e.target.value)}
                        className="w-[90px] h-[28px] px-2 text-center font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none mx-auto block transition-colors"
                      />
                    </td>

                    {/* Col 8 (Giờ giảng): Tổng số tiết */}
                    <td className="min-w-[130px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        value={draftRow.tongSoTiet}
                        onChange={(e) => handleDraftChange('tongSoTiet', e.target.value)}
                        className="w-[90px] h-[28px] px-2 text-right font-sans text-[12px] text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block transition-colors"
                      />
                    </td>

                    {/* Col 9 (Giờ giảng): Tổng giờ giảng dạy */}
                    <td className="min-w-[150px] p-1 text-right border-b border-r border-slate-200 bg-white">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftRow.tongGioGiangDay}
                        onChange={(e) => handleDraftChange('tongGioGiangDay', e.target.value)}
                        className="w-[100px] h-[28px] px-2 text-right font-sans font-medium text-slate-800 bg-white border border-slate-300 rounded focus:border-[#005325] focus:ring-1 focus:ring-[#005325] focus:outline-none ml-auto block transition-colors"
                      />
                    </td>
                  </>
                )}

                {/* Col Thao tác */}
                <td className="w-[84px] min-w-[84px] p-1 border-b border-slate-200 bg-white text-center text-slate-400 text-[12px] font-normal">
                  —
                </td>
              </tr>
            )}

            {/* Dữ liệu Giảng viên: Mỗi người đúng 1 dòng dữ liệu */}
            {sortedLecturers.length === 0 && !isAddingInline ? (
              <tr>
                <td
                  colSpan={isResearch ? 7 : (isThesis || isAdmission || isOther || isAdvisor) ? 8 : 11}
                  className="py-12 text-center text-slate-500 border-b border-[#e2e8f0]"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-[13px] font-normal text-slate-600">
                      Chưa có dữ liệu kê khai trong đợt này
                    </span>
                    <span className="text-[11.5px] text-slate-400 font-normal">
                      Bấm &quot;+ Thêm mới&quot; hoặc &quot;Nạp dữ liệu mẫu&quot; để hiển thị danh sách.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedLecturers.map((lecturer, index) => {
                const isSelected = lecturer.records.some((r) => selectedIds.includes(r.id));
                const isPeriodLocked = periodStatus === 'locked';

                return (
                  <tr
                    key={lecturer.key}
                    className={`group h-[40px] transition-colors ${
                      isSelected ? 'bg-[#f1f5f9]' : 'bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    {/* Col 0: Checkbox */}
                    <td className="w-[54px] min-w-[54px] max-w-[54px] px-2 text-center border-b border-r border-[#e2e8f0]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(lecturer.primaryRecord.id)}
                        className="w-3.5 h-3.5 rounded-sm border-gray-300 text-black focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Col 1: TT */}
                    <td className="w-[54px] min-w-[54px] max-w-[54px] px-2 text-center font-mono text-slate-500 border-b border-r border-[#e2e8f0] whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* Col 2: Mã GV */}
                    <td className="w-[115px] min-w-[115px] max-w-[115px] px-2.5 font-mono font-medium text-slate-700 border-b border-r border-[#e2e8f0] whitespace-nowrap">
                      {lecturer.maGV || '—'}
                    </td>

                    {/* Col 3: Họ và tên Giảng viên */}
                    <td className="min-w-[220px] px-3 text-slate-700 border-b border-r border-[#e2e8f0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onViewRecordDetail && lecturer.primaryRecord) {
                              onViewRecordDetail(lecturer.primaryRecord);
                            } else if (
                              selectedDepartment === 'nckh' &&
                              onViewResearchSchedule &&
                              lecturer.maGV
                            ) {
                              onViewResearchSchedule(lecturer.maGV);
                            } else if (onViewTeachingSchedule && lecturer.maGV) {
                              onViewTeachingSchedule(lecturer.maGV);
                            }
                          }}
                          className="font-medium text-slate-800 hover:text-[#005325] hover:underline cursor-pointer text-left truncate"
                          title="Bấm để xem chi tiết bảng kê"
                        >
                          {stripAcademicTitle(lecturer.hoTen)}
                        </button>
                      </div>
                    </td>

                    {/* CỘT SỐ LIỆU TÙY THEO CHUYÊN MỤC */}
                    {isResearch ? (
                      <>
                        {/* Col 4 (NCKH): Tổng số bài */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12.5px] font-semibold min-w-[36px]">
                            {lecturer.tongSoBaiNCKH} bài
                          </span>
                        </td>

                        {/* Col 5 (NCKH): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongSoTietQuyDoiNCKH.toFixed(1)} tiết
                        </td>
                      </>
                    ) : isExam ? (
                      <>
                        {/* Col 4 (Khảo thí): Số ca coi thi */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soCaCoiThi} ca
                          </span>
                        </td>

                        {/* Col 5 (Khảo thí): Số bài chấm thi */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[12px] font-medium min-w-[48px]">
                            {lecturer.soBaiChamThi} bài
                          </span>
                        </td>

                        {/* Col 6 (Khảo thí): Số đề ra */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soDeRa} đề
                          </span>
                        </td>

                        {/* Col 7 (Khảo thí): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongTietQCKhaoThi.toFixed(1)} tiết
                        </td>
                      </>
                    ) : isThesis ? (
                      <>
                        {/* Col 4 (Đồ án): Số đề tài/SV */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soDeTaiHuongDan} đề tài
                          </span>
                        </td>

                        {/* Col 5 (Đồ án): Số lượt chấm/HĐ */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[12px] font-medium min-w-[36px]">
                            {lecturer.soLuotChamHoiDong} lượt
                          </span>
                        </td>

                        {/* Col 6 (Đồ án): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongTietQCDoAn.toFixed(1)} tiết
                        </td>
                      </>
                    ) : isAdvisor ? (
                      <>
                        {/* Col 4 (CVHT): Số lớp CVHT */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soLopCVHT} lớp
                          </span>
                        </td>

                        {/* Col 5 (CVHT): Tổng số sinh viên */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[12px] font-medium min-w-[48px]">
                            {lecturer.tongSoSVCVHT} SV
                          </span>
                        </td>

                        {/* Col 6 (CVHT): Xếp loại CVHT */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                            {lecturer.xepLoaiCVHT}
                          </span>
                        </td>

                        {/* Col 7 (CVHT): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongTietQCCVHT.toFixed(1)} tiết
                        </td>
                      </>
                    ) : isAdmission ? (
                      <>
                        {/* Col 4 (Tuyển sinh): Số ngày công tác */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soNgayCongTac} ngày
                          </span>
                        </td>

                        {/* Col 5 (Tuyển sinh): Địa bàn / Trường THPT */}
                        <td className="px-3 text-slate-700 border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="truncate block max-w-[230px]" title={lecturer.diaBanTuyenSinh}>
                            {lecturer.diaBanTuyenSinh}
                          </span>
                        </td>

                        {/* Col 6 (Tuyển sinh): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongTietQCTuyenSinh.toFixed(1)} tiết
                        </td>
                      </>
                    ) : isOther ? (
                      <>
                        {/* Col 4 (Kiêm nhiệm): Số nhiệm vụ */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.soNhiemVuKiemNhiem} NV
                          </span>
                        </td>

                        {/* Col 5 (Kiêm nhiệm): Nhiệm vụ chính */}
                        <td className="px-3 text-slate-700 border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="truncate block max-w-[230px]" title={lecturer.chiTietNhiemVu}>
                            {lecturer.chiTietNhiemVu}
                          </span>
                        </td>

                        {/* Col 6 (Kiêm nhiệm): Tổng số tiết quy đổi */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums text-[13px]">
                          {lecturer.tongTietQCKiemNhiem.toFixed(1)} tiết
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Col 4 (Giờ giảng): Khoa / Bộ môn */}
                        <td className="min-w-[170px] px-3 text-slate-700 border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="truncate block max-w-[200px]" title={lecturer.khoaBoMon || 'Khoa Công nghệ thông tin'}>
                            {lecturer.khoaBoMon || 'Khoa Công nghệ thông tin'}
                          </span>
                        </td>

                        {/* Col 5 (Giờ giảng): Học vị */}
                        <td className="w-[85px] min-w-[85px] px-2 text-center font-medium text-slate-700 border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11.5px]">
                            {lecturer.hocHamHocVi || 'ThS'}
                          </span>
                        </td>

                        {/* Col 6 (Giờ giảng): Tổng số môn */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[12px] font-semibold min-w-[36px]">
                            {lecturer.tongSoMon}
                          </span>
                        </td>

                        {/* Col 7 (Giờ giảng): Tổng số sinh viên */}
                        <td className="px-3 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[12px] font-medium min-w-[48px]">
                            {lecturer.tongSoSinhVien.toLocaleString('vi-VN')}
                          </span>
                        </td>

                        {/* Col 8 (Giờ giảng): Tổng số tiết */}
                        <td className="px-3 text-right font-mono font-medium text-slate-800 border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums">
                          {lecturer.tongSoTiet.toLocaleString('vi-VN')}
                        </td>

                        {/* Col 9 (Giờ giảng): Tổng giờ giảng dạy */}
                        <td className="px-3 text-right font-mono font-bold text-[#005325] border-b border-r border-[#f1f5f9] whitespace-nowrap tabular-nums">
                          {lecturer.tongGioGiangDay.toFixed(1)}
                        </td>
                      </>
                    )}

                    {/* Col Thao tác */}
                    <td className="w-[84px] min-w-[84px] px-2 text-center border-b border-[#f1f5f9] whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {/* 1. Xem chi tiết (Bảng kê chuẩn) */}
                        <button
                          onClick={() => {
                            if (onViewRecordDetail && lecturer.primaryRecord) {
                              onViewRecordDetail(lecturer.primaryRecord);
                            } else if (
                              selectedDepartment === 'nckh' &&
                              onViewResearchSchedule &&
                              lecturer.maGV
                            ) {
                              onViewResearchSchedule(lecturer.maGV);
                            } else if (onViewTeachingSchedule && lecturer.maGV) {
                              onViewTeachingSchedule(lecturer.maGV);
                            }
                          }}
                          title="Xem chi tiết bảng kê"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200/70 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Xóa */}
                        <button
                          onClick={() => onDeleteRecord(lecturer.primaryRecord.id)}
                          disabled={isPeriodLocked}
                          title={isPeriodLocked ? 'Kỳ thanh toán đã khóa' : 'Xóa bản ghi này'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isPeriodLocked
                              ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                              : 'bg-rose-50 hover:bg-rose-100/90 text-rose-700 border border-rose-200/70 cursor-pointer shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer: Dòng tổng cộng */}
          {sortedLecturers.length > 0 && (
            <tfoot className="bg-[#f8fafc] text-[12px] font-sans font-semibold text-slate-800 border-t-2 border-[#cbd5e1] sticky bottom-0 z-20">
              <tr className="h-[40px]">
                {/* Col 0, 1, 2, 3 merged: TỔNG CỘNG */}
                <td
                  colSpan={4}
                  className="px-4 text-left font-bold text-slate-900 border-r border-[#cbd5e1] bg-[#f8fafc] whitespace-nowrap"
                >
                  TỔNG CỘNG ({sortedLecturers.length} Giảng viên)
                </td>

                {isResearch ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap text-[12.5px]">
                      {grandTotals.tongSoBaiNCKH} bài
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongSoTietQuyDoiNCKH.toFixed(1)} tiết
                    </td>
                  </>
                ) : isExam ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soCaCoiThi} ca
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-slate-800 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soBaiChamThi.toLocaleString('vi-VN')} bài
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-amber-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soDeRa} đề
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongTietQCKhaoThi.toFixed(1)} tiết
                    </td>
                  </>
                ) : isThesis ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soDeTaiHuongDan} đề tài
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-purple-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soLuotChamHoiDong} lượt
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongTietQCDoAn.toFixed(1)} tiết
                    </td>
                  </>
                ) : isAdvisor ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soLopCVHT} lớp
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-slate-800 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.tongSoSVCVHT.toLocaleString('vi-VN')} SV
                    </td>
                    <td className="px-3 text-center text-slate-400 border-r border-[#cbd5e1] whitespace-nowrap">
                      —
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongTietQCCVHT.toFixed(1)} tiết
                    </td>
                  </>
                ) : isAdmission ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soNgayCongTac} ngày
                    </td>
                    <td className="px-3 text-left text-slate-400 border-r border-[#cbd5e1] whitespace-nowrap">
                      Toàn đợt
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongTietQCTuyenSinh.toFixed(1)} tiết
                    </td>
                  </>
                ) : isOther ? (
                  <>
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.soNhiemVuKiemNhiem} NV
                    </td>
                    <td className="px-3 text-left text-slate-400 border-r border-[#cbd5e1] whitespace-nowrap">
                      Toàn trường
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums text-[13px]">
                      {grandTotals.tongTietQCKiemNhiem.toFixed(1)} tiết
                    </td>
                  </>
                ) : (
                  <>
                    {/* Col 4 (Giờ giảng): Khoa */}
                    <td className="px-3 text-center font-bold text-slate-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {uniqueFacultiesCount} Khoa
                    </td>

                    {/* Col 5 (Giờ giảng): Học vị */}
                    <td className="px-2 text-center text-slate-400 border-r border-[#cbd5e1] whitespace-nowrap">
                      —
                    </td>

                    {/* Col 6 (Giờ giảng): Tổng số môn */}
                    <td className="px-3 text-center font-mono font-bold text-blue-700 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.tongSoMon}
                    </td>

                    {/* Col 7 (Giờ giảng): Tổng số sinh viên */}
                    <td className="px-3 text-center font-mono font-bold text-slate-800 border-r border-[#cbd5e1] whitespace-nowrap">
                      {grandTotals.tongSoSinhVien.toLocaleString('vi-VN')}
                    </td>

                    {/* Col 8 (Giờ giảng): Tổng số tiết */}
                    <td className="px-3 text-right font-mono font-bold text-slate-900 border-r border-[#cbd5e1] whitespace-nowrap tabular-nums">
                      {grandTotals.tongSoTiet.toLocaleString('vi-VN')}
                    </td>

                    {/* Col 9 (Giờ giảng): Tổng giờ giảng dạy */}
                    <td className="px-3 text-right font-mono font-bold text-[#005325] border-r border-[#cbd5e1] whitespace-nowrap tabular-nums">
                      {grandTotals.tongGioGiangDay.toFixed(1)}
                    </td>
                  </>
                )}

                {/* Col Thao tác */}
                <td className="px-2 text-center text-slate-400 font-normal">
                  —
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
