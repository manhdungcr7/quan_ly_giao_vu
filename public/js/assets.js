// Lightweight modal + form handlers for Assets page
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function createEl(tag, attrs={}){
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'class') el.className = v; else el.setAttribute(k, v);
    });
    return el;
  }

  // Modal
  function ensureModal(){
    let modal = $('#assetModal');
    if (modal) return modal;
    modal = createEl('div', { id: 'assetModal', class: 'asset-modal hidden' });
    modal.innerHTML = `
      <div class="asset-modal__backdrop"></div>
      <div class="asset-modal__dialog">
        <div class="asset-modal__header">
          <h3 class="asset-modal__title">Tài sản</h3>
          <button class="asset-modal__close" aria-label="Đóng">&times;</button>
        </div>
        <div class="asset-modal__body">
          <form id="assetForm" class="asset-form">
            <div class="asset-form__row">
              <label>Mã tài sản<input name="asset_code" required></label>
              <label>Tên tài sản<input name="name" required></label>
              <label>Nhóm<select name="category_id"></select></label>
            </div>
            <div class="asset-form__row">
              <label>Serial<input name="serial_number"></label>
              <label>Model<input name="model"></label>
              <label>Hãng SX<input name="brand"></label>
            </div>
            <div class="asset-form__row">
              <label>Ngày mua<input type="date" name="purchase_date"></label>
              <label>Giá mua<input type="number" name="purchase_price" min="0" step="0.01" max="9999999999.99" inputmode="decimal"></label>
              <label>Giá trị hiện tại<input type="number" name="current_value" min="0" step="0.01" max="9999999999.99" inputmode="decimal"></label>
            </div>
            <div class="asset-form__row">
              <label>Hết bảo hành<input type="date" name="warranty_expiry"></label>
              <label>Trạng thái<select name="status">
                <option value="available">Sẵn sàng</option>
                <option value="in_use">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
                <option value="retired">Thu hồi</option>
              </select></label>
              <label>Đánh giá tình trạng<select name="condition_rating">
                <option value="excellent">Xuất sắc</option>
                <option value="good" selected>Tốt</option>
                <option value="fair">Trung bình</option>
                <option value="poor">Cần kiểm tra</option>
                <option value="broken">Hỏng</option>
              </select></label>
            </div>
            <div class="asset-form__row">
              <label>Vị trí<input name="location"></label>
              <label>Gán cho<select name="assigned_to"></select></label>
              <label>Ghi chú<input name="notes"></label>
            </div>
            <input type="hidden" name="id">
            <div class="asset-modal__footer">
              <button type="button" class="btn btn-danger asset-modal__delete js-asset-delete is-hidden">Xoá tài sản</button>
              <div class="asset-modal__actions">
                <button type="button" class="btn btn-outline-secondary" id="btnCancelModal">Hủy</button>
                <button type="submit" class="btn btn-primary" id="btnSaveAsset">Lưu</button>
              </div>
            </div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(modal);
    // close handlers
    modal.querySelector('.asset-modal__close').addEventListener('click', hideModal);
    modal.querySelector('#btnCancelModal').addEventListener('click', hideModal);
    modal.querySelector('.js-asset-delete').addEventListener('click', handleDeleteClick);
    modal.addEventListener('click', (e)=>{ if(e.target.classList.contains('asset-modal__backdrop')) hideModal();});
    return modal;
  }

  function showModal(title){
    const modal = ensureModal();
    $('.asset-modal__title', modal).textContent = title || 'Tài sản';
    modal.classList.remove('hidden');
  }

  function hideModal(){
    const modal = $('#assetModal');
    if (modal) modal.classList.add('hidden');
  }

  async function handleDeleteClick(e){
    const btn = e.currentTarget;
    const assetId = btn?.dataset?.id;
    if (!assetId) return;

    const form = $('#assetForm');
    const assetName = (form?.name?.value || form?.asset_code?.value || '').trim();
    const label = assetName ? `"${assetName}"` : 'tài sản này';
    if (!window.confirm(`Bạn có chắc chắn muốn xoá ${label}? Hành động này không thể hoàn tác.`)) {
      return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Đang xoá...';

    try {
      await fetchJSON(`/api/assets/${assetId}`, { method: 'DELETE' });
      hideModal();
      window.location.reload();
    } catch (error) {
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Không thể xoá tài sản: ' + error.message);
    }
  }

  async function fetchJSON(url, opts={}){
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...opts
    });

    if (res.status === 401) {
      window.location.href = '/auth/login';
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    const rawBody = await res.text();
    let payload = null;

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch (parseErr) {
        console.warn('Không thể parse JSON từ phản hồi assets API:', parseErr);
      }
    }

    if (!res.ok || payload?.success === false) {
      const message = payload?.message || payload?.error || rawBody || res.statusText || 'Yêu cầu không thành công';
      throw new Error(message);
    }

    return payload ?? {};
  }

  // Load reference data into selects
  async function loadReference(){
    const { success, categories, departments } = await fetchJSON('/api/assets/reference');
    if (!success) return;
    const form = $('#assetForm');
    const selCat = form.category_id;
    const selAss = form.assigned_to;
    selCat.innerHTML = '<option value="">-- Chọn nhóm --</option>' + (categories||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
    selAss.innerHTML = '<option value="">-- Không gán --</option>' + (departments||[]).map(d=>`<option value="${d.id}">${d.full_name}</option>`).join('');
  }

  async function openCreate(){
    const form = $('#assetForm');
    form.reset();
    form.id.value = '';
    const deleteBtn = form.querySelector('.js-asset-delete');
    if (deleteBtn) {
      deleteBtn.classList.add('is-hidden');
      deleteBtn.disabled = false;
      deleteBtn.dataset.id = '';
      deleteBtn.textContent = 'Xoá tài sản';
    }
    await loadReference();
    showModal('Thêm tài sản');
  }

  async function openEdit(id){
    const form = $('#assetForm');
    form.reset();
    await loadReference();
    const { success, data } = await fetchJSON(`/api/assets/${id}`);
    if (success && data){
      Object.keys(form).forEach(()=>{});
      form.id.value = data.id;
      form.asset_code.value = data.asset_code || '';
      form.name.value = data.name || '';
      form.category_id.value = data.category_id || '';
      form.serial_number.value = data.serial_number || '';
      form.model.value = data.model || '';
      form.brand.value = data.brand || data.manufacturer || '';
      if (data.purchase_date) form.purchase_date.value = (data.purchase_date||'').slice(0,10);
      form.purchase_price.value = data.purchase_price || '';
      form.current_value.value = data.current_value || '';
      if (data.warranty_expiry) form.warranty_expiry.value = (data.warranty_expiry||'').slice(0,10);
      form.status.value = (data.status || 'available');
      form.condition_rating.value = data.condition_rating || 'good';
      form.location.value = data.location || '';
      form.assigned_to.value = data.assigned_to || '';
      form.notes.value = data.notes || '';
    }
    const deleteBtn = form.querySelector('.js-asset-delete');
    if (deleteBtn) {
      deleteBtn.classList.remove('is-hidden');
      deleteBtn.disabled = false;
      deleteBtn.dataset.id = id;
      deleteBtn.textContent = 'Xoá tài sản';
    }
    showModal('Chỉnh sửa tài sản');
  }

  async function submitForm(e){
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const id = payload.id;
    delete payload.id;
    const url = id ? `/api/assets/${id}` : '/api/assets';
    const method = id ? 'PUT' : 'POST';
    try {
      await fetchJSON(url, {
        method,
        body: JSON.stringify({
          ...payload,
          brand: payload.brand || ''
        })
      });
      // optimistic UI: reload page to reflect changes quickly
      hideModal();
      window.location.reload();
    } catch (err) {
      alert('Lỗi lưu tài sản: ' + err.message);
    }
  }

  function bindCardInlineEditors(){
    // Each asset card will have data-asset-id and an edit button
    $$('.asset-card').forEach(card => {
      let btn = card.querySelector('.asset-card__edit');
      if (!btn){
        btn = createEl('button', { class: 'asset-card__edit', type: 'button' });
        btn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        card.querySelector('.asset-card__header').appendChild(btn);
      }
      const id = card.getAttribute('data-asset-id');
      if (id) btn.addEventListener('click', ()=> openEdit(id));
    });
  }

  function bindAddButton(){
    const addBtn = document.querySelector('[data-action="asset-add"]');
    if (addBtn) addBtn.addEventListener('click', (e)=>{ e.preventDefault(); openCreate(); });
  }

  function init(){
    const form = ensureModal().querySelector('#assetForm');
    form.addEventListener('submit', submitForm);
    bindCardInlineEditors();
    bindAddButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
