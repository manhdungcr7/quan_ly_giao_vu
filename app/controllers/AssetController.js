const Asset = require('../models/Asset');

const STATUS_META = {
  all: {
    label: 'Tất cả',
    tone: 'neutral',
    description: 'Toàn bộ tài sản đang theo dõi'
  },
  available: {
    label: 'Sẵn sàng',
    tone: 'success',
    description: 'Có thể bàn giao hoặc sử dụng ngay'
  },
  in_use: {
    label: 'Đang sử dụng',
    tone: 'primary',
    description: 'Đang được phân công cho đơn vị'
  },
  maintenance: {
    label: 'Bảo trì',
    tone: 'warning',
    description: 'Đang sửa chữa hoặc kiểm tra định kỳ'
  },
  retired: {
    label: 'Thu hồi',
    tone: 'muted',
    description: 'Đã ngừng sử dụng hoặc thanh lý'
  }
};

class AssetController {
  constructor() {
    this.assetModel = new Asset();
  }

  buildFilterLinks({ search }) {
    const baseParams = new URLSearchParams();
    if (search) {
      baseParams.set('q', search);
    }

    const links = {};
    Object.keys(STATUS_META).forEach((statusKey) => {
      const params = new URLSearchParams(baseParams);
      if (statusKey !== 'all') {
        params.set('status', statusKey);
      } else {
        params.delete('status');
      }
      links[statusKey] = params.toString() ? `?${params.toString()}` : '';
    });

    return links;
  }

  buildSummary(stats = {}) {
    const totalAssets = Number(stats.total_assets) || 0;
    const availableCount = Number(stats.available_count) || 0;
    const inUseCount = Number(stats.in_use_count) || 0;
    const maintenanceCount = Number(stats.maintenance_count) || 0;
    const retiredCount = Number(stats.retired_count) || 0;
    const totalValue = Number(stats.total_value) || 0;
    const averageValue = Number(stats.avg_value) || 0;

    return {
      cards: [
        {
          key: 'total_assets',
          label: 'Tổng số tài sản',
          value: totalAssets,
          tone: 'primary',
          description: 'Tổng hợp tất cả tài sản đang quản lý.'
        },
        {
          key: 'in_use',
          label: 'Đang sử dụng',
          value: inUseCount,
          tone: 'info',
          description: 'Đã bàn giao cho đơn vị/nhân sự.'
        },
        {
          key: 'maintenance',
          label: 'Đang bảo trì',
          value: maintenanceCount,
          tone: 'warning',
          description: 'Ưu tiên kiểm tra để tránh gián đoạn.'
        },
        {
          key: 'retired',
          label: 'Đã thu hồi',
          value: retiredCount,
          tone: 'muted',
          description: 'Chờ thanh lý hoặc xử lý tiếp theo.'
        }
      ],
      valueSummary: {
        totalValue,
        averageValue,
        availableCount,
        retiredCount
      }
    };
  }

  decorateAsset(record) {
    if (!record) return null;

    const statusKey = (record.status || '').toLowerCase();
    const statusMeta = STATUS_META[statusKey] || {
      label: 'Chưa rõ',
      tone: 'neutral',
      description: 'Trạng thái chưa xác định'
    };

    const initials = (record.name || record.asset_code || '?')
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      id: record.id,
      assetCode: record.asset_code || '---',
      name: record.name || 'Chưa đặt tên',
      category: record.category_name || 'Chưa phân loại',
      status: statusKey,
      statusMeta,
      conditionRating: record.condition_rating || 'unknown',
      location: record.location || 'Chưa cập nhật',
      assignedTo: record.assigned_to_name || 'Chưa phân công',
      purchaseDate: record.purchase_date,
      currentValue: record.current_value,
      initials
    };
  }

  computeStatusOverview(stats = {}) {
    return {
      available: Number(stats.available_count) || 0,
      in_use: Number(stats.in_use_count) || 0,
      maintenance: Number(stats.maintenance_count) || 0,
      retired: Number(stats.retired_count) || 0
    };
  }

  async index(req, res) {
  const page = Number.parseInt(req.query.page || '1', 10) || 1;
  const limit = 12;
    const rawStatus = (req.query.status || 'all').toLowerCase();
    const searchQuery = (req.query.q || '').trim();

    const filters = {};
    if (rawStatus && rawStatus !== 'all') {
      filters.status = rawStatus;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }

    try {
      const [assetsResult, stats] = await Promise.all([
        this.assetModel.getAssetsWithFilters(page, limit, filters),
        this.assetModel.getStats()
      ]);

      const pagination = assetsResult?.pagination || {
        page,
        limit,
        total: assetsResult?.data?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const summary = this.buildSummary(stats);
      const statusOverview = this.computeStatusOverview(stats);
      const filterLinks = this.buildFilterLinks({ search: searchQuery });
      const assets = Array.isArray(assetsResult?.data)
        ? assetsResult.data.map((item) => this.decorateAsset(item)).filter(Boolean)
        : [];

      res.render('assets/index', {
        title: 'Quản lý tài sản',
        user: req.session.user,
        assets,
        pagination,
        summary,
        statusOverview,
        activeStatus: rawStatus,
        statusMeta: STATUS_META,
        filterLinks,
        searchQuery,
        hasFilters: rawStatus !== 'all' || searchQuery.length > 0
      });
    } catch (error) {
      console.error('AssetController.index error:', error);
      res.status(500).render('error', {
        status: 500,
        title: 'Không thể tải danh sách tài sản',
        message: 'Hệ thống gặp sự cố khi truy xuất dữ liệu. Bạn hãy thử lại sau ít phút.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // ===== API: reference data for selects =====
  async getReferenceData(req, res) {
    try {
      const [catR, depR] = await Promise.allSettled([
        this.assetModel.getCategories(),
        this.assetModel.getDepartments()
      ]);
      const categories = catR.status === 'fulfilled' ? catR.value : [];
      const departments = depR.status === 'fulfilled' ? depR.value : [];
      res.json({ success: true, categories, departments });
    } catch (error) {
      console.error('AssetController.getReferenceData error:', error);
      // Dù có lỗi bất thường vẫn trả rỗng để form hoạt động
      res.json({ success: true, categories: [], departments: [] });
    }
  }

  // ===== API: get single asset =====
  async getOne(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: 'Thiếu ID tài sản' });
      let asset = null;
      try {
        asset = await this.assetModel.getById(id);
      } catch (inner) {
        console.warn('getById failed, falling back to minimal query:', inner?.message);
        // Fallback an toàn: chỉ lấy từ bảng assets, tránh join gây lỗi
        if (this.assetModel?.db?.findOne) {
          asset = await this.assetModel.db.findOne('SELECT * FROM assets WHERE id = ?', [id]);
        }
      }
      if (!asset) return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản' });
      res.json({ success: true, data: asset });
    } catch (error) {
      console.error('AssetController.getOne error:', error);
      res.status(500).json({ success: false, message: 'Không tải được tài sản' });
    }
  }

  // ===== API: create asset =====
  async store(req, res) {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ' });
      }

      const payload = req.body || {};
      const assetCode = (payload.asset_code || '').trim();
      const name = (payload.name || '').trim();

      if (!assetCode || !name) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã và tên tài sản' });
      }

      const toNullableId = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      };

      const MAX_CURRENCY = 9999999999.99;
      const parseCurrency = (value, fieldLabel) => {
        if (value === null || value === undefined || value === '') return 0;

        let numericValue = value;
        if (typeof numericValue === 'string') {
          const trimmed = numericValue.trim();
          if (!trimmed) return 0;
          // Chuẩn hoá các định dạng 1.234.567 hoặc 1,234,567.89
          const normalized = trimmed
            .replace(/\s+/g, '')
            .replace(/\.(?=\d{3}(?:\D|$))/g, '')
            .replace(',', '.');
          numericValue = normalized;
        }

        const parsed = Number(numericValue);

        if (!Number.isFinite(parsed)) {
          throw new Error(`${fieldLabel} không hợp lệ.`);
        }

        if (Math.abs(parsed) > MAX_CURRENCY) {
          throw new RangeError(`${fieldLabel} vượt quá giới hạn cho phép (tối đa ${MAX_CURRENCY.toLocaleString('vi-VN')}).`);
        }

        return parsed;
      };

      const purchasePrice = parseCurrency(payload.purchase_price, 'Giá mua');
      const currentValue = parseCurrency(payload.current_value, 'Giá trị hiện tại');

      const brand = (payload.brand ?? payload.manufacturer ?? '').trim();

      const newAssetData = {
        asset_code: assetCode,
        name,
        category_id: toNullableId(payload.category_id),
        serial_number: payload.serial_number?.trim() || null,
        model: payload.model?.trim() || null,
        brand: brand || null,
        purchase_date: payload.purchase_date || null,
  purchase_price: purchasePrice,
  current_value: currentValue,
        warranty_expiry: payload.warranty_expiry || null,
        status: (payload.status || 'available').trim() || 'available',
        condition_rating: (payload.condition_rating || 'good').trim() || 'good',
        location: payload.location?.trim() || null,
        assigned_to: toNullableId(payload.assigned_to),
        notes: payload.notes?.trim() || null,
        created_by: userId
      };

      const insertResult = await this.assetModel.create(newAssetData);
      const newId = insertResult?.insertId || insertResult?.id || insertResult;

      res.status(201).json({ success: true, id: newId, message: 'Đã tạo tài sản mới' });
    } catch (error) {
      console.error('AssetController.store error:', error);
      if (error instanceof RangeError) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error instanceof Error && /không hợp lệ/.test(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error?.errno === 1264) {
        return res.status(400).json({ success: false, message: 'Giá trị nhập vào vượt quá giới hạn được phép.' });
      }
      if (error?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Mã tài sản đã tồn tại. Vui lòng chọn mã khác.'
        });
      }

      res.status(500).json({ success: false, message: 'Không thể tạo tài sản', detail: error.message });
    }
  }

  // ===== API: update asset =====
  async updateOne(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: 'Thiếu ID tài sản' });
      const payload = req.body || {};
      const toNullableId = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      };

      const MAX_CURRENCY = 9999999999.99;
      const parseCurrency = (value, fieldLabel) => {
        if (value === null || value === undefined || value === '') return 0;

        let numericValue = value;
        if (typeof numericValue === 'string') {
          const trimmed = numericValue.trim();
          if (!trimmed) return 0;
          const normalized = trimmed
            .replace(/\s+/g, '')
            .replace(/\.(?=\d{3}(?:\D|$))/g, '')
            .replace(',', '.');
          numericValue = normalized;
        }

        const parsed = Number(numericValue);

        if (!Number.isFinite(parsed)) {
          throw new Error(`${fieldLabel} không hợp lệ.`);
        }

        if (Math.abs(parsed) > MAX_CURRENCY) {
          throw new RangeError(`${fieldLabel} vượt quá giới hạn cho phép (tối đa ${MAX_CURRENCY.toLocaleString('vi-VN')}).`);
        }

        return parsed;
      };

      const assetCode = (payload.asset_code || '').trim();
      const name = (payload.name || '').trim();

      if (!assetCode || !name) {
        return res.status(400).json({ success: false, message: 'Mã và tên tài sản không được để trống' });
      }

      const purchasePrice = parseCurrency(payload.purchase_price, 'Giá mua');
      const currentValue = parseCurrency(payload.current_value, 'Giá trị hiện tại');

      const brand = (payload.brand ?? payload.manufacturer ?? '').trim();

      await this.assetModel.update(id, {
        asset_code: assetCode,
        name,
        category_id: toNullableId(payload.category_id),
        serial_number: payload.serial_number?.trim() || null,
        model: payload.model?.trim() || null,
        brand: brand || null,
        purchase_date: payload.purchase_date || null,
        purchase_price: purchasePrice,
        current_value: currentValue,
        warranty_expiry: payload.warranty_expiry || null,
        status: (payload.status || 'available').trim() || 'available',
        condition_rating: (payload.condition_rating || 'good').trim() || 'good',
        location: payload.location?.trim() || null,
        assigned_to: toNullableId(payload.assigned_to),
        notes: payload.notes?.trim() || null
      });
      res.json({ success: true, message: 'Đã cập nhật tài sản' });
    } catch (error) {
      console.error('AssetController.updateOne error:', error);
      if (error instanceof RangeError) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error instanceof Error && /không hợp lệ/.test(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error?.errno === 1264) {
        return res.status(400).json({ success: false, message: 'Giá trị nhập vào vượt quá giới hạn được phép.' });
      }
      if (error?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Mã tài sản đã tồn tại. Vui lòng chọn mã khác.'
        });
      }

      res.status(500).json({ success: false, message: 'Không thể cập nhật tài sản', detail: error.message });
    }
  }

  // ===== API: delete asset =====
  async destroy(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Thiếu ID tài sản' });
      }

      const result = await this.assetModel.delete(id);
      const affected = result?.affectedRows ?? result;

      if (!affected) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản để xoá' });
      }

      res.json({ success: true, message: 'Đã xoá tài sản' });
    } catch (error) {
      console.error('AssetController.destroy error:', error);
      res.status(500).json({ success: false, message: 'Không thể xoá tài sản', detail: error.message });
    }
  }
}

module.exports = AssetController;
