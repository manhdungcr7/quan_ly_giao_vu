/**
 * Examination Management Enhanced
 * File upload with preview functionality
 * Modern modal design
 */

// API URL Helper (fix SSL protocol issues)
const apiBaseUrl = (() => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Force HTTP if on localhost HTTPS to avoid SSL errors
  if (protocol === 'https:' && hostname === 'localhost') {
    return `http://${hostname}${port ? ':' + port : ''}`;
  }
  
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
})();

function buildApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

// File upload manager
class ExaminationFileManager {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.files = [];
    this.uploadedFiles = [];
  }

  async loadFiles() {
    try {
      const response = await fetch(buildApiUrl(`/api/examination/${this.sessionId}/files`));
      const data = await response.json();
      
      if (data.success) {
        this.uploadedFiles = data.files || [];
        return this.uploadedFiles;
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
    return [];
  }

  async uploadFile(file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      const response = await fetch(buildApiUrl(`/api/examination/${this.sessionId}/upload`), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        this.uploadedFiles.push(data.file);
        return data.file;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const response = await fetch(buildApiUrl(`/api/examination/file/${fileId}`), {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  async setPrimaryFile(fileId) {
    try {
      const response = await fetch(buildApiUrl(`/api/examination/file/${fileId}/primary`), {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        this.uploadedFiles.forEach(f => {
          f.is_primary = f.id === fileId ? 1 : 0;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Set primary error:', error);
      return false;
    }
  }

  getFileIcon(fileType, fileExtension) {
    if (fileType && fileType.includes('pdf')) {
      return '<i class="fas fa-file-pdf text-danger"></i>';
    } else if (fileExtension === '.doc' || fileExtension === '.docx') {
      return '<i class="fas fa-file-word text-primary"></i>';
    } else if (fileType && fileType.includes('image')) {
      return '<i class="fas fa-file-image text-success"></i>';
    } else {
      return '<i class="fas fa-file text-secondary"></i>';
    }
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Enhanced Modal Manager
class ExaminationModalManager {
  constructor() {
    this.currentSession = null;
    this.fileManager = null;
    this.modal = null;
    this.initModal();
  }

  initModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="examinationModal" class="exam-modal">
        <div class="exam-modal-content">
          <div class="exam-modal-header">
            <h3 class="exam-modal-title">
              <i class="fas fa-clipboard-check"></i>
              <span id="modalTitle">Tạo ca thi</span>
            </h3>
            <button class="exam-modal-close" onclick="examinationModalManager.close()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="exam-modal-body">
            <form id="examinationForm">
              <div class="exam-form-grid">
                <!-- Left Column: Basic Information -->
                <div class="exam-form-section">
                  <h4 class="section-title">
                    <i class="fas fa-info-circle"></i>
                    Thông tin cơ bản
                  </h4>
                  
                  <div class="form-group">
                    <label>Mã ca thi <span class="required">*</span></label>
                    <input type="text" name="exam_code" class="form-control" required>
                  </div>

                  <div class="form-group">
                    <label>Làm đề <span class="required">*</span></label>
                    <input type="text" name="exam_name" class="form-control" placeholder="Nhập tên ca thi hoặc giảng viên ra đề" required>
                    <small class="form-hint">Dùng để nhận biết đề thi và giảng viên chịu trách nhiệm.</small>
                  </div>

                  <div class="form-group">
                    <label>Kỳ thi <span class="required">*</span></label>
                    <input type="text" name="period_name" class="form-control combo-input" 
                           list="periodsList" placeholder="Nhập hoặc chọn kỳ thi" required>
                    <datalist id="periodsList"></datalist>
                    <input type="hidden" name="period_id">
                    <small class="form-hint">Có thể nhập thủ công hoặc chọn từ danh sách</small>
                  </div>

                  <div class="form-group">
                    <label>Học phần <span class="required">*</span></label>
                    <input type="text" name="subject_name" class="form-control combo-input" 
                           list="subjectsList" placeholder="Nhập hoặc chọn học phần" required>
                    <datalist id="subjectsList"></datalist>
                    <input type="hidden" name="subject_id">
                    <small class="form-hint">Có thể nhập thủ công hoặc chọn từ danh sách</small>
                  </div>

                  <div class="form-group">
                    <label>Tín chỉ</label>
                    <input type="number" name="subject_credits" class="form-control" min="0" max="10" step="1" placeholder="Ví dụ: 3">
                    <small class="form-hint">Tùy chọn: nhập số tín chỉ của học phần để đồng bộ báo cáo.</small>
                  </div>

                  <div class="form-group">
                    <label>Lớp học</label>
                    <input type="text" name="class_name" class="form-control combo-input" 
                           list="classesList" placeholder="Nhập hoặc chọn lớp học">
                    <datalist id="classesList"></datalist>
                    <input type="hidden" name="class_id">
                    <small class="form-hint">Có thể nhập thủ công hoặc chọn từ danh sách</small>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Ngày thi <span class="required">*</span></label>
                      <input type="date" name="exam_date" class="form-control" required>
                    </div>
                    <div class="form-group">
                      <label>Giờ thi <span class="required">*</span></label>
                      <input type="time" name="exam_time" class="form-control" required>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Thời lượng (phút)</label>
                      <input type="number" name="duration" class="form-control" value="90" min="30" max="240">
                    </div>
                    <div class="form-group">
                      <label>Số lượng SV</label>
                      <input type="number" name="student_count" class="form-control" value="0" min="0">
                    </div>
                  </div>
                </div>

                <!-- Right Column: Details & Files -->
                <div class="exam-form-section">
                  <h4 class="section-title">
                    <i class="fas fa-cogs"></i>
                    Chi tiết & Tài liệu
                  </h4>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Phòng thi</label>
                      <input type="text" name="room" class="form-control">
                    </div>
                    <div class="form-group">
                      <label>Tòa nhà</label>
                      <input type="text" name="building" class="form-control">
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Dự kiến số bản in</label>
                    <input type="number" name="expected_copies" class="form-control" min="0">
                  </div>

                      <div class="form-group">
                        <label><i class="fas fa-user-check"></i> CBCT1</label>
                        <input type="text" name="grader_name" class="form-control combo-input" 
                               list="gradersList" placeholder="Nhập hoặc chọn cán bộ">
                        <datalist id="gradersList"></datalist>
                        <input type="hidden" name="grader_id">
                        <small class="form-hint">Có thể nhập thủ công hoặc chọn từ danh sách</small>
                      </div>

                      <div class="form-group">
                        <label><i class="fas fa-user-friends"></i> CBCT2</label>
                        <input type="text" name="grader2_name" class="form-control combo-input" 
                               list="gradersList" placeholder="Nhập hoặc chọn cán bộ thứ hai">
                        <input type="hidden" name="grader2_id">
                        <small class="form-hint">Tùy chọn: nhập thủ công hoặc chọn cán bộ hỗ trợ</small>
                      </div>

                  <div class="form-group">
                    <label><i class="fas fa-calendar-times"></i> Hạn chấm bài</label>
                    <input type="date" name="grading_deadline" class="form-control">
                  </div>

                  <div class="form-group">
                    <label>Hình thức thi</label>
                    <select name="exam_type" class="form-control">
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Link thi online</label>
                    <input type="url" name="link" class="form-control" placeholder="https://...">
                  </div>

                  <div class="form-group">
                    <label>Trạng thái</label>
                    <select name="status" class="form-control">
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="in_progress">Đang thi</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Hủy</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea name="notes" class="form-control" rows="2"></textarea>
                  </div>
                </div>
              </div>

              <!-- File Upload Section (Full Width) -->
              <div class="exam-files-section">
                <h4 class="section-title">
                  <i class="fas fa-paperclip"></i>
                  Tài liệu đính kèm
                  <span class="file-count-badge" id="fileCountBadge">0</span>
                </h4>

                <div class="file-upload-zone" id="fileUploadZone">
                  <input type="file" id="fileInput" accept=".pdf,.doc,.docx" multiple style="display: none;">
                  <div class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Kéo thả file hoặc click để chọn</p>
                    <small>Hỗ trợ: PDF, Word (.doc, .docx) - Tối đa 10MB</small>
                  </div>
                  <button type="button" class="btn-upload" onclick="document.getElementById('fileInput').click()">
                    <i class="fas fa-plus"></i> Thêm file
                  </button>
                </div>

                <div class="uploaded-files-list" id="uploadedFilesList">
                  <!-- Files will be listed here -->
                </div>
              </div>
            </form>
          </div>

          <div class="exam-modal-footer">
            <button type="button" class="btn btn-secondary" onclick="examinationModalManager.close()">
              <i class="fas fa-times"></i> Hủy
            </button>
            <button type="button" class="btn btn-primary" onclick="examinationModalManager.save()">
              <i class="fas fa-save"></i> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div id="filePreviewModal" class="exam-modal preview-modal">
        <div class="preview-modal-content">
          <div class="preview-modal-header">
            <h3 id="previewFileName">Preview</h3>
            <button class="exam-modal-close" onclick="examinationModalManager.closePreview()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="preview-modal-body" id="previewContent">
            <div class="preview-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    this.modal = document.getElementById('examinationModal');
    this.previewModal = document.getElementById('filePreviewModal');
    
    this.initFileUpload();
    this.initComboFieldHandlers();
  }

  initFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('fileUploadZone');

    // File input change
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      await this.handleFiles(files);
      fileInput.value = ''; // Reset input
    });

    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files);
      await this.handleFiles(files);
    });
  }

  initComboFieldHandlers() {
    const form = document.getElementById('examinationForm');
    if (!form) return;

    const setupReferenceField = (inputName, hiddenName, datalistId) => {
      const inputEl = form.querySelector(`[name="${inputName}"]`);
      const hiddenEl = hiddenName ? form.querySelector(`[name="${hiddenName}"]`) : null;
      const datalistEl = datalistId ? document.getElementById(datalistId) : null;

      if (!inputEl || !hiddenEl) {
        return;
      }

      const syncFromDatalist = () => {
        if (!datalistEl) {
          return;
        }
        const value = inputEl.value.trim();
        const option = Array.from(datalistEl.options).find(opt => opt.value === value) || null;
        hiddenEl.value = option ? (option.dataset.id || '') : '';
      };

      inputEl.addEventListener('change', syncFromDatalist);
      inputEl.addEventListener('blur', syncFromDatalist);
      inputEl.addEventListener('input', () => {
        hiddenEl.value = '';
      });
    };

    const subjectInput = form.querySelector('[name="subject_name"]');
    const subjectIdInput = form.querySelector('[name="subject_id"]');
    const subjectCreditsInput = form.querySelector('[name="subject_credits"]');

    if (subjectCreditsInput) {
      subjectCreditsInput.dataset.autoFilled = 'pending';
      subjectCreditsInput.addEventListener('input', () => {
        subjectCreditsInput.dataset.autoFilled = 'manual';
      });
    }

    if (subjectInput) {
      const syncSubject = () => {
        this.syncSubjectFields(subjectInput.value, subjectIdInput, subjectCreditsInput);
      };

      subjectInput.addEventListener('change', syncSubject);
      subjectInput.addEventListener('blur', syncSubject);
      subjectInput.addEventListener('input', () => {
        if (subjectIdInput) subjectIdInput.value = '';
        if (subjectCreditsInput) {
          subjectCreditsInput.value = '';
          subjectCreditsInput.dataset.autoFilled = 'pending';
        }
      });
    }

    setupReferenceField('period_name', 'period_id', 'periodsList');
    setupReferenceField('class_name', 'class_id', 'classesList');
    setupReferenceField('grader_name', 'grader_id', 'gradersList');
    setupReferenceField('grader2_name', 'grader2_id', 'gradersList');
  }

  syncSubjectFields(inputValue, subjectIdInput, subjectCreditsInput, forceAutoFill = false) {
    if (!inputValue) {
      if (subjectIdInput) subjectIdInput.value = '';
      if (subjectCreditsInput && (forceAutoFill || subjectCreditsInput.dataset.autoFilled === 'auto')) {
        subjectCreditsInput.value = '';
        subjectCreditsInput.dataset.autoFilled = 'pending';
      }
      return;
    }

    const subject = this.findSubjectByInput(inputValue);

    if (subject) {
      if (subjectIdInput) subjectIdInput.value = subject.id;

      if (subjectCreditsInput) {
        const state = subjectCreditsInput.dataset.autoFilled || 'pending';
        const shouldAutoFill = forceAutoFill || (state !== 'manual' && (subjectCreditsInput.value === '' || state === 'auto'));
        if (shouldAutoFill) {
          if (typeof subject.credits !== 'undefined' && subject.credits !== null) {
            subjectCreditsInput.value = subject.credits;
            subjectCreditsInput.dataset.autoFilled = 'auto';
          } else if (state === 'auto' || forceAutoFill) {
            subjectCreditsInput.value = '';
            subjectCreditsInput.dataset.autoFilled = 'auto';
          }
        }
      }
    } else {
      if (subjectIdInput) subjectIdInput.value = '';
      if (subjectCreditsInput && (forceAutoFill || subjectCreditsInput.dataset.autoFilled === 'auto')) {
        subjectCreditsInput.value = '';
        subjectCreditsInput.dataset.autoFilled = 'pending';
      }
    }
  }

  findSubjectByInput(inputValue) {
    if (!inputValue || !this.referenceData?.subjects) return null;

    const subjectId = this.findIdByName(this.referenceData.subjects, inputValue, 'name', 'code');
    if (!subjectId) return null;

    return this.referenceData.subjects.find(subject => subject.id == subjectId) || null;
  }

  async handleFiles(files) {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
        alert(`File ${file.name} không được hỗ trợ`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      
      return true;
    });

    for (const file of validFiles) {
      try {
        const uploadedFile = await this.fileManager.uploadFile(file);
        this.renderFilesList();
        
        // Show success notification
        this.showNotification(`File ${file.name} đã được upload thành công`, 'success');
      } catch (error) {
        this.showNotification(`Lỗi upload file ${file.name}: ${error.message}`, 'error');
      }
    }
  }

  renderFilesList() {
    const container = document.getElementById('uploadedFilesList');
    const files = this.fileManager.uploadedFiles;

    if (files.length === 0) {
      container.innerHTML = '<p class="no-files-message">Chưa có file nào được upload</p>';
      document.getElementById('fileCountBadge').textContent = '0';
      return;
    }

    document.getElementById('fileCountBadge').textContent = files.length;

    const filesHTML = files.map(file => `
      <div class="file-item ${file.is_primary ? 'primary-file' : ''}">
        <div class="file-icon">
          ${this.fileManager.getFileIcon(file.file_type, file.file_extension)}
        </div>
        <div class="file-info">
          <div class="file-name">
            ${file.file_name}
            ${file.is_primary ? '<span class="primary-badge">Chính</span>' : ''}
          </div>
          <div class="file-meta">
            ${this.fileManager.formatFileSize(file.file_size)} • 
            ${new Date(file.uploaded_at).toLocaleString('vi-VN')}
          </div>
          ${file.description ? `<div class="file-description">${file.description}</div>` : ''}
        </div>
        <div class="file-actions">
          <button type="button" class="btn-icon" title="Xem trước" 
                  onclick="examinationModalManager.previewFile(${file.id}, '${file.file_name}', '${file.file_path}', '${file.file_type}')">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn-icon" title="Tải xuống"
                  onclick="examinationModalManager.downloadFile(${file.id}, '${file.file_path}')">
            <i class="fas fa-download"></i>
          </button>
          ${!file.is_primary ? `
            <button type="button" class="btn-icon" title="Đặt làm file chính"
                    onclick="examinationModalManager.setPrimaryFile(${file.id})">
              <i class="fas fa-star"></i>
            </button>
          ` : ''}
          <button type="button" class="btn-icon btn-danger" title="Xóa"
                  onclick="examinationModalManager.deleteFile(${file.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = filesHTML;
  }

  async open(sessionId = null) {
    this.currentSession = sessionId;
    
    // Load reference data first
    await this.loadReferenceData();
    
    if (sessionId) {
      // Load session data
      await this.loadSession(sessionId);
      document.getElementById('modalTitle').textContent = 'Chỉnh sửa ca thi';
      const form = document.getElementById('examinationForm');
      if (form) {
        this.syncSubjectFields(
          form.querySelector('[name="subject_name"]').value,
          form.querySelector('[name="subject_id"]'),
          form.querySelector('[name="subject_credits"]'),
          false
        );
      }
      
      // Initialize file manager
      this.fileManager = new ExaminationFileManager(sessionId);
      await this.fileManager.loadFiles();
      this.renderFilesList();
    } else {
  document.getElementById('modalTitle').textContent = 'Tạo ca thi';
      this.clearForm();
    }
    
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.clearForm();
  }

  async loadReferenceData() {
    try {
      // Load periods, subjects, classes, graders for datalists
      const [periods, subjects, classes, graders] = await Promise.all([
        fetch(buildApiUrl('/api/examination/periods')).then(r => r.json()),
        fetch(buildApiUrl('/api/examination/subjects')).then(r => r.json()),
        fetch(buildApiUrl('/api/examination/classes')).then(r => r.json()),
        fetch(buildApiUrl('/api/examination/graders')).then(r => r.json())
      ]);

      // Populate datalists
      this.populateDatalist('periodsList', periods.data || [], 'id', 'name');
      this.populateDatalist('subjectsList', subjects.data || [], 'id', item => `${item.code} - ${item.name}`);
      this.populateDatalist('classesList', classes.data || [], 'id', item => `${item.code} - ${item.name}`);
      this.populateDatalist('gradersList', graders.data || [], 'id', item => `${item.full_name} (${item.email})`);

      // Store reference data for later use
      this.referenceData = {
        periods: periods.data || [],
        subjects: subjects.data || [],
        classes: classes.data || [],
        graders: graders.data || []
      };
    } catch (error) {
      console.error('Error loading reference data:', error);
      // Continue without reference data (manual input still works)
    }
  }

  populateDatalist(datalistId, items, valueField, labelField) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;

    datalist.innerHTML = items.map(item => {
      const label = typeof labelField === 'function' ? labelField(item) : item[labelField];
      return `<option value="${label}" data-id="${item[valueField]}"></option>`;
    }).join('');
  }

  async loadSession(sessionId) {
    try {
      const response = await fetch(buildApiUrl(`/api/examination/${sessionId}`));
      const data = await response.json();
      
      if (data.success && data.session) {
        this.fillForm(data.session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  fillForm(session) {
    const form = document.getElementById('examinationForm');
    Object.keys(session).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'date' && session[key]) {
          input.value = new Date(session[key]).toISOString().split('T')[0];
        } else if (input.type === 'time' && session[key]) {
          input.value = session[key].substring(0, 5);
        } else {
          input.value = session[key] || '';
        }
      }
    });

    // Fill combo inputs with names (not IDs)
    if (session.period_name) {
      form.querySelector('[name="period_name"]').value = session.period_name;
      form.querySelector('[name="period_id"]').value = session.period_id || '';
    }
    if (session.subject_name) {
      const subjectInput = form.querySelector('[name="subject_name"]');
      const subject = this.referenceData?.subjects?.find(s => s.id == session.subject_id);
      subjectInput.value = subject ? `${subject.code} - ${subject.name}` : session.subject_name;
      form.querySelector('[name="subject_id"]').value = session.subject_id || '';
      const subjectCreditsInput = form.querySelector('[name="subject_credits"]');
      if (subjectCreditsInput) {
        if (typeof session.subject_credits !== 'undefined' && session.subject_credits !== null) {
          subjectCreditsInput.value = session.subject_credits;
          subjectCreditsInput.dataset.autoFilled = 'manual';
        } else {
          this.syncSubjectFields(subjectInput.value, form.querySelector('[name="subject_id"]'), subjectCreditsInput, true);
        }
      }
    }
    const subjectCreditsInputFallback = form.querySelector('[name="subject_credits"]');
    if (subjectCreditsInputFallback && !subjectCreditsInputFallback.dataset.autoFilled) {
      subjectCreditsInputFallback.dataset.autoFilled = 'pending';
    }
    if (session.class_name) {
      const classInput = form.querySelector('[name="class_name"]');
      const classItem = this.referenceData?.classes?.find(c => c.id == session.class_id);
      classInput.value = classItem ? `${classItem.code} - ${classItem.name}` : session.class_name;
      form.querySelector('[name="class_id"]').value = session.class_id || '';
    }
    const graderInput = form.querySelector('[name="grader_name"]');
    const graderIdInput = form.querySelector('[name="grader_id"]');
    if (graderInput && graderIdInput) {
      if (session.grader_name) {
        const grader = this.referenceData?.graders?.find(g => g.id == session.grader_id);
        graderInput.value = grader ? `${grader.full_name} (${grader.email})` : session.grader_name;
        graderIdInput.value = session.grader_id || '';
      } else if (session.grader_manual_name) {
        graderInput.value = session.grader_manual_name;
        graderIdInput.value = '';
      } else {
        graderInput.value = '';
        graderIdInput.value = '';
      }
    }

    const grader2Input = form.querySelector('[name="grader2_name"]');
    const grader2IdInput = form.querySelector('[name="grader2_id"]');
    if (grader2Input && grader2IdInput) {
      if (session.grader2_name) {
        const grader2 = this.referenceData?.graders?.find(g => g.id == session.grader2_id);
        grader2Input.value = grader2 ? `${grader2.full_name} (${grader2.email})` : session.grader2_name;
        grader2IdInput.value = session.grader2_id || '';
      } else if (session.grader2_manual_name) {
        grader2Input.value = session.grader2_manual_name;
        grader2IdInput.value = '';
      } else {
        grader2Input.value = '';
        grader2IdInput.value = '';
      }
    }
  }

  clearForm() {
    document.getElementById('examinationForm').reset();
    document.getElementById('uploadedFilesList').innerHTML = '';
    document.getElementById('fileCountBadge').textContent = '0';
    const subjectCreditsInput = document.querySelector('[name="subject_credits"]');
    if (subjectCreditsInput) {
      subjectCreditsInput.dataset.autoFilled = 'pending';
    }
  }

  async save() {
    const form = document.getElementById('examinationForm');
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Extract IDs from combo inputs or use manual input
    const periodName = data.period_name;
    const periodId = data.period_id || this.findIdByName(this.referenceData?.periods, periodName, 'name');
    
    const subjectName = data.subject_name;
    const subjectId = data.subject_id || this.findIdByName(this.referenceData?.subjects, subjectName, 'name', 'code');
    
    const className = data.class_name;
    const classId = data.class_id || this.findIdByName(this.referenceData?.classes, className, 'name', 'code');
    
  const graderName = data.grader_name;
  const graderId = data.grader_id || this.findIdByName(this.referenceData?.graders, graderName, 'full_name');
  const grader2Name = data.grader2_name;
  const grader2Id = data.grader2_id || this.findIdByName(this.referenceData?.graders, grader2Name, 'full_name');

    // Build final data object
    const finalData = {
      ...data,
      period_id: periodId || null,
      period_name: periodName,
      subject_id: subjectId || null,
      subject_name: subjectName,
      class_id: classId || null,
      class_name: className,
  grader_id: graderId || null,
  grader_name: graderName,
  grader2_id: grader2Id || null,
  grader2_name: grader2Name
    };

  // Keep *_name fields so backend can create missing refs when *_id not provided
  // (Controller will ignore these when persisting actual columns)

    if (typeof finalData.grader_name === 'string') {
      finalData.grader_name = finalData.grader_name.trim();
    }
    if (finalData.grader_id === '' || Number.isNaN(Number(finalData.grader_id))) {
      finalData.grader_id = null;
    } else if (finalData.grader_id !== null) {
      finalData.grader_id = Number(finalData.grader_id);
    }

    if (typeof finalData.grader2_name === 'string') {
      finalData.grader2_name = finalData.grader2_name.trim();
    }
    if (finalData.grader2_id === '' || Number.isNaN(Number(finalData.grader2_id))) {
      finalData.grader2_id = null;
    } else if (finalData.grader2_id !== null) {
      finalData.grader2_id = Number(finalData.grader2_id);
    }

  // Convert empty date strings to null to avoid MySQL errors
    if (finalData.exam_date === '') finalData.exam_date = null;
    if (finalData.grading_deadline === '') finalData.grading_deadline = null;

  // Coerce numeric fields to numbers where applicable
  if (typeof finalData.duration !== 'undefined') finalData.duration = finalData.duration === '' ? null : parseInt(finalData.duration, 10);
  if (typeof finalData.student_count !== 'undefined') finalData.student_count = finalData.student_count === '' ? null : parseInt(finalData.student_count, 10);
  if (typeof finalData.expected_copies !== 'undefined') finalData.expected_copies = finalData.expected_copies === '' ? null : parseInt(finalData.expected_copies, 10);
  if (typeof finalData.subject_credits !== 'undefined') {
    const parsedCredits = finalData.subject_credits === '' ? null : parseInt(finalData.subject_credits, 10);
    finalData.subject_credits = Number.isNaN(parsedCredits) ? null : parsedCredits;
  }

    console.log('💾 Saving examination session:', finalData);

    try {
      const url = this.currentSession 
        ? buildApiUrl(`/api/examination/${this.currentSession}`)
        : buildApiUrl('/api/examination');
      
      const method = this.currentSession ? 'PUT' : 'POST';

      console.log('📤 Request:', method, url);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (result.success) {
        this.showNotification('Lưu thành công!', 'success');
        
        // Log để debug
        console.log('✅ Save successful, redirecting to list in 1.2 seconds...');
        console.log('📍 Current URL:', window.location.href);
        
        setTimeout(() => {
          console.log('🔄 Redirect to /examination');
          // Use cache-busting param to avoid stale cache
          window.location.href = '/examination?t=' + Date.now();
        }, 1200);
      } else {
        this.showNotification('Lỗi: ' + result.message, 'error');
      }
    } catch (error) {
      this.showNotification('Lỗi khi lưu dữ liệu', 'error');
      console.error('❌ Save error:', error);
    }
  }

  findIdByName(dataArray, inputValue, nameField, codeField) {
    if (!dataArray || !inputValue) return null;

    // Try exact match first
    let match = dataArray.find(item => {
      if (codeField) {
        // For items with code (subjects, classes)
        return `${item[codeField]} - ${item[nameField]}` === inputValue;
      }
      return item[nameField] === inputValue;
    });

    // Try partial match
    if (!match) {
      match = dataArray.find(item => {
        const name = item[nameField].toLowerCase();
        const input = inputValue.toLowerCase();
        return name.includes(input) || input.includes(name);
      });
    }

    return match ? match.id : null;
  }

  async previewFile(fileId, fileName, filePath, fileType) {
    const previewModal = this.previewModal;
    const previewContent = document.getElementById('previewContent');
    const fileNameEl = document.getElementById('previewFileName');

    fileNameEl.textContent = fileName;
    previewContent.innerHTML = '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i><p>Đang tải...</p></div>';
    
    previewModal.style.display = 'flex';

    try {
      const downloadUrl = buildApiUrl(`/api/examination/file/${fileId}/download`);
      
      if (fileType && fileType.includes('pdf')) {
        // PDF Preview with PDF.js
        previewContent.innerHTML = `<iframe src="${downloadUrl}" style="width:100%;height:100%;border:none;"></iframe>`;
      } else if (fileName.match(/\.(doc|docx)$/i)) {
        // Word Preview - use Google Docs Viewer or Office Online
        const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`;
        previewContent.innerHTML = `<iframe src="${viewerUrl}" style="width:100%;height:100%;border:none;"></iframe>`;
      } else {
        previewContent.innerHTML = '<div class="preview-error"><i class="fas fa-exclamation-triangle"></i><p>Không thể xem trước file này</p></div>';
      }
    } catch (error) {
      previewContent.innerHTML = '<div class="preview-error"><i class="fas fa-exclamation-triangle"></i><p>Lỗi khi tải file</p></div>';
    }
  }

  closePreview() {
    this.previewModal.style.display = 'none';
  }

  async downloadFile(fileId, filePath) {
    window.open(buildApiUrl(`/api/examination/file/${fileId}/download`), '_blank');
  }

  async deleteFile(fileId) {
    if (!confirm('Bạn có chắc muốn xóa file này?')) return;

    const success = await this.fileManager.deleteFile(fileId);
    if (success) {
      this.renderFilesList();
      this.showNotification('Đã xóa file', 'success');
    } else {
      this.showNotification('Lỗi khi xóa file', 'error');
    }
  }

  async setPrimaryFile(fileId) {
    const success = await this.fileManager.setPrimaryFile(fileId);
    if (success) {
      this.renderFilesList();
      this.showNotification('Đã đặt làm file chính', 'success');
    } else {
      this.showNotification('Lỗi khi đặt file chính', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `exam-notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize global modal manager
class ExaminationExportManager {
  constructor(modalElement) {
    this.modal = modalElement;
    this.confirmButton = modalElement ? modalElement.querySelector('[data-action="confirm-export-pdf"]') : null;
    this.closeButtons = modalElement ? modalElement.querySelectorAll('[data-action="close-export-modal"]') : [];
    this.fieldList = modalElement ? modalElement.querySelector('[data-export-field-list]') : null;
    this.defaultButtonHtml = this.confirmButton ? this.confirmButton.innerHTML : '';
    this.loading = false;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.modal) {
      return;
    }

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });

    if (this.fieldList) {
      this.fieldList.addEventListener('change', () => this.updateConfirmState());
    }

    if (this.confirmButton) {
      this.confirmButton.addEventListener('click', () => this.export());
    }
  }

  getDefaultFields() {
    if (!this.modal) {
      return [];
    }
    const raw = this.modal.dataset.defaultFields || '';
    if (!raw) {
      return [];
    }
    return raw.split(',').map((value) => value.trim()).filter(Boolean);
  }

  applyDefaultSelection() {
    if (!this.fieldList) {
      return;
    }
    const checkboxes = Array.from(this.fieldList.querySelectorAll('input[type="checkbox"]'));
    const hasChecked = checkboxes.some((input) => input.checked);
    if (hasChecked) {
      return;
    }
    const defaults = this.getDefaultFields();
    checkboxes.forEach((input) => {
      input.checked = defaults.includes(input.value);
    });
  }

  collectSelectedFields() {
    if (!this.fieldList) {
      return [];
    }
    return Array.from(this.fieldList.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
  }

  collectFilters() {
    const form = document.querySelector('.filter-form');
    if (!form) {
      return {};
    }

    const readValue = (name) => {
      const element = form.querySelector(`[name="${name}"]`);
      if (!element) {
        return undefined;
      }
      const value = element.value ? element.value.trim() : '';
      return value.length ? value : undefined;
    };

    return {
      period_id: readValue('period_id'),
      status: readValue('status'),
      search: readValue('search'),
      grader: readValue('grader')
    };
  }

  getOrientation() {
    if (!this.modal) {
      return 'portrait';
    }
    const input = this.modal.querySelector('input[name="exportOrientation"]:checked');
    return input ? input.value : 'portrait';
  }

  updateConfirmState() {
    if (!this.confirmButton) {
      return;
    }
    if (this.loading) {
      this.confirmButton.disabled = true;
      return;
    }
    this.confirmButton.disabled = this.collectSelectedFields().length === 0;
  }

  setLoading(isLoading) {
    if (!this.confirmButton) {
      return;
    }
    this.loading = Boolean(isLoading);
    if (this.loading) {
      this.confirmButton.disabled = true;
      this.confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
    } else {
      this.confirmButton.innerHTML = this.defaultButtonHtml || '<i class="fas fa-download"></i> Xuất PDF';
      this.updateConfirmState();
    }
  }

  open() {
    if (!this.modal) {
      return;
    }
    this.applyDefaultSelection();
    this.modal.style.display = 'flex';
    this.updateConfirmState();
  }

  close() {
    if (!this.modal) {
      return;
    }
    this.modal.style.display = 'none';
    this.setLoading(false);
  }

  async export() {
    const fields = this.collectSelectedFields();
    if (!fields.length) {
      alert('Vui lòng chọn ít nhất một trường để xuất PDF.');
      this.updateConfirmState();
      return;
    }

    const payload = {
      fields,
      filters: this.collectFilters(),
      layout: {
        orientation: this.getOrientation()
      }
    };

    this.setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/examination/export/pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf'
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || !contentType.includes('application/pdf')) {
        let message = 'Không thể xuất PDF. Vui lòng thử lại sau.';

        if (contentType.includes('application/json')) {
          const errorPayload = await response.json();
          message = errorPayload.message || message;
        } else {
          const text = await response.text();
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      link.href = url;
      link.download = `lich-thi-${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.close();
    } catch (error) {
      alert(error.message || 'Không thể xuất PDF. Vui lòng thử lại.');
      this.setLoading(false);
    }
  }
}

async function importExaminationExcel(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(buildApiUrl('/api/examination/import'), {
    method: 'POST',
    body: formData
  });

  const contentType = response.headers.get('content-type') || '';
  let payload = null;

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    throw new Error('Máy chủ trả về phản hồi không hợp lệ.');
  }

  if (!response.ok || !payload?.success) {
    throw new Error((payload && payload.message) || 'Nhập dữ liệu thất bại.');
  }

  return payload;
}

let examinationModalManager;
let examinationExportManager;

document.addEventListener('DOMContentLoaded', () => {
  examinationModalManager = new ExaminationModalManager();
  const importInput = document.getElementById('examImportInput');
  const importButton = document.querySelector('[data-action="import-excel"]');
  const templateButton = document.querySelector('[data-action="download-template"]');

  if (importInput && importButton) {
    importButton.addEventListener('click', () => {
      importInput.value = '';
      importInput.click();
    });

    importInput.addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }

      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
        alert('Vui lòng chọn file Excel (.xlsx hoặc .xls).');
        importInput.value = '';
        return;
      }

      const confirmed = confirm(`Nhập dữ liệu lịch thi từ file "${file.name}"?`);
      if (!confirmed) {
        importInput.value = '';
        return;
      }

      const originalLabel = importButton.innerHTML;
      importButton.disabled = true;
      importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang nhập...';

      try {
        const result = await importExaminationExcel(file);
        const stats = result.stats || {};
        let summary = `Đã xử lý ${stats.processed || 0}/${stats.totalRows || 0} dòng. Thêm mới: ${stats.inserted || 0}. Bỏ qua: ${stats.skipped || 0}.`;

        if (Array.isArray(stats.errors) && stats.errors.length) {
          const details = stats.errors.slice(0, 3).map((item) => `- Dòng ${item.row}: ${item.message}`);
          summary += `\n\nCảnh báo:\n${details.join('\n')}`;
          if (stats.errors.length > 3) {
            summary += `\n... (${stats.errors.length - 3} cảnh báo khác)`;
          }
        }

        alert(`${result.message || 'Hoàn tất nhập liệu.'}\n\n${summary}`);

        if ((stats.inserted || 0) > 0) {
          // Force reload without cache after a delay to ensure DB commit
          setTimeout(() => {
            window.location.href = `/examination?t=${Date.now()}`;
          }, 500);
        }
      } catch (error) {
        alert(error.message || 'Nhập dữ liệu thất bại.');
      } finally {
        importButton.disabled = false;
        importButton.innerHTML = originalLabel;
        importInput.value = '';
      }
    });
  }

  if (templateButton) {
    templateButton.addEventListener('click', async () => {
      const originalLabel = templateButton.innerHTML;
      templateButton.disabled = true;
      templateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';

      try {
        const response = await fetch(buildApiUrl('/api/examination/import/template'), {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải file mẫu. Vui lòng thử lại.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mau-nhap-lich-thi.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        alert(error.message || 'Không thể tải file mẫu.');
      } finally {
        templateButton.disabled = false;
        templateButton.innerHTML = originalLabel;
      }
    });
  }

  const exportModalElement = document.getElementById('examExportModal');
  const exportTrigger = document.querySelector('[data-action="export-pdf"]');

  if (exportModalElement && exportTrigger) {
    examinationExportManager = new ExaminationExportManager(exportModalElement);
    window.examinationExportManager = examinationExportManager;

    exportTrigger.addEventListener('click', () => {
      examinationExportManager.open();
    });
  }
  
  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target.id === 'examinationModal') {
      examinationModalManager.close();
    }
    if (e.target.id === 'filePreviewModal') {
      examinationModalManager.closePreview();
    }
    if (e.target.id === 'examExportModal' && examinationExportManager) {
      examinationExportManager.close();
    }
  });
});
