const AssetController = require('../app/controllers/AssetController');

(async () => {
  const controller = new AssetController();
  const req = {
    params: { id: '2' },
    body: {
      asset_code: 'ccccc',
      name: 'Laptop HP ProBook 450 G9',
      category_id: '1',
      serial_number: 'HP450G9-2024-002',
      model: 'xzxzxzx',
      brand: 'Test Brand',
      purchase_date: '2024-02-19',
      purchase_price: '28000000.00',
      current_value: '26500000.00',
      warranty_expiry: '2027-02-19',
      status: 'available',
      condition_rating: 'excellent',
      location: 'Kho thiết bị IT',
      assigned_to: '',
      notes: 'Sẵn sàng cấp phát'
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
    await controller.updateOne(req, res);
  } catch (err) {
    console.error('Update error:', err);
  } finally {
    process.exit(0);
  }
})();
