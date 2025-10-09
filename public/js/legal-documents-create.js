// JS for Legal Document Create Page
(function(){
  const fileInput = document.getElementById('attachments');
  if(!fileInput){
    console.warn('[legal-documents-create] attachments input not found');
    return;
  }
  const preview = document.getElementById('file-preview');
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  function getFileIcon(filename){
    const ext = (filename.split('.').pop()||'').toLowerCase();
    const map = { pdf:'fas fa-file-pdf', doc:'fas fa-file-word', docx:'fas fa-file-word', rar:'fas fa-file-archive', zip:'fas fa-file-archive', '7z':'fas fa-file-archive' };
    return map[ext] || 'fas fa-file';
  }

  fileInput.addEventListener('change', function(){
    if(!preview) return;
    preview.innerHTML='';
    if(!this.files || !this.files.length) return;

    let overs = [];
    Array.from(this.files).forEach(f => {
      const sizeMB = (f.size/1024/1024).toFixed(2);
      const icon = getFileIcon(f.name);
      const div = document.createElement('div');
      div.className='file-preview-item';
      if(f.size>MAX_SIZE){
        overs.push(f.name);
        div.classList.add('file-error');
        div.innerHTML = `<i class="${icon}" style="color:#dc2626"></i><span class="file-name" style="color:#dc2626">${f.name}</span><span class="file-size" style="color:#dc2626">${sizeMB} MB - Quá lớn</span>`;
      } else {
        div.innerHTML = `<i class="${icon}"></i><span class="file-name">${f.name}</span><span class="file-size">${sizeMB} MB</span>`;
      }
      preview.appendChild(div);
    });
    if(overs.length){
      alert('Các file quá lớn (>10MB):\n' + overs.join('\n'));
      this.value='';
      preview.innerHTML='';
    }
  });

  function bindDateValidation(){
    const issue = document.getElementById('issue_date');
    const eff = document.getElementById('effective_date');
    const exp = document.getElementById('expiry_date');
    if(eff){
      eff.addEventListener('change', () => {
        if(issue && issue.value && eff.value && new Date(eff.value) < new Date(issue.value)){
          alert('Ngày có hiệu lực phải sau hoặc bằng ngày ban hành');
          eff.value = issue.value;
        }
      });
    }
    if(exp){
      exp.addEventListener('change', () => {
        if(eff && eff.value && exp.value && new Date(exp.value) < new Date(eff.value)){
          alert('Ngày hết hiệu lực phải sau ngày có hiệu lực');
          exp.value='';
        }
      });
    }
  }
  bindDateValidation();

  // Submit validation
  const form = document.querySelector('.document-form');
  if(form){
    form.addEventListener('submit', (e)=>{
      if(fileInput.files && fileInput.files.length){
        for(const f of fileInput.files){
          if(f.size>MAX_SIZE){
            e.preventDefault();
            alert('File '+ f.name +' vượt quá 10MB, vui lòng chọn lại');
            return false;
          }
        }
      }
    });
  }
})();