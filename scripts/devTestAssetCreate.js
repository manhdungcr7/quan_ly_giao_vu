const AssetController = require('../app/controllers/AssetController');

(async () => {
  const controller = new AssetController();
  const req = {
    body: {
      asset_code: 'TEST-12345',
      name: 'Thiết bị kiểm thử',
      category_id: '1',
      serial_number: 'SERIAL-TEST-123',
      model: 'Model Z',
      brand: 'Brand Y',
      purchase_date: '2024-01-01',
      purchase_price: '1000000',
      current_value: '900000',
      warranty_expiry: '2026-01-01',
      status: 'available',
      condition_rating: 'good',
      location: 'Kho 01',
      assigned_to: '',
      notes: 'Ghi chú kiểm thử'
    },
    session: { user: { id: 1 } }
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      console.log('status:', this.statusCode || 200);
      console.log(payload);
    }
  };

  try {
    await controller.store(req, res);
  } catch (err) {
    console.error('Store error:', err);
  } finally {
    process.exit(0);
  }
})();
