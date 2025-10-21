const segmentLabels = {
  dashboard: {
    label: 'Trang chủ',
    icon: 'fa-home',
    url: '/dashboard'
  },
  documents: {
    label: 'Quản lý văn bản',
    icon: 'fa-file-alt'
  },
  'legal-documents': {
    label: 'Văn bản pháp lý',
    icon: 'fa-balance-scale'
  },
  staff: {
    label: 'Quản lý cán bộ',
    icon: 'fa-users'
  },
  examination: {
    label: 'Công tác khảo thí',
    icon: 'fa-clipboard-check'
  },
  schedule: {
    label: 'Lịch công tác',
    icon: 'fa-calendar'
  },
  reminders: {
    label: 'Nhắc việc',
    icon: 'fa-bell'
  },
  research: {
    label: 'Tổng quan nghiên cứu',
    icon: 'fa-chart-line'
  },
  assets: {
    label: 'Quản lý tài sản',
    icon: 'fa-box'
  },
  departments: {
    label: 'Quản lý khoa',
    icon: 'fa-sitemap'
  },
  workbook: {
    label: 'Sổ tay công tác',
    icon: 'fa-book'
  },
  users: {
    label: 'Người dùng',
    icon: 'fa-user'
  },
  reports: {
    label: 'Báo cáo',
    icon: 'fa-chart-pie'
  },
  auth: {
    label: 'Tài khoản',
    icon: 'fa-lock'
  },
  api: {
    label: 'API',
    icon: 'fa-plug'
  }
};

const actionLabels = {
  incoming: {
    label: 'Văn bản đến',
    icon: 'fa-inbox'
  },
  outgoing: {
    label: 'Văn bản đi',
    icon: 'fa-paper-plane'
  },
  create: {
    label: 'Thêm mới',
    icon: 'fa-plus-circle'
  },
  edit: {
    label: 'Chỉnh sửa',
    icon: 'fa-pen-to-square'
  },
  history: {
    label: 'Lịch sử',
    icon: 'fa-clock-rotate-left'
  },
  manage: {
    label: 'Quản lý',
    icon: 'fa-gears'
  },
  export: {
    label: 'Xuất dữ liệu',
    icon: 'fa-file-export'
  },
  find: {
    label: 'Tìm kiếm',
    icon: 'fa-search'
  },
  detail: {
    label: 'Chi tiết',
    icon: 'fa-circle-info'
  }
};

function titleCase(value) {
  return value
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isIdSegment(value) {
  return /^\d+$/.test(value);
}

function buildBreadcrumb(reqPath) {
  if (!reqPath || typeof reqPath !== 'string') {
    return [segmentLabels.dashboard];
  }

  let normalized = reqPath.trim();
  if (normalized === '/') {
    normalized = '/dashboard';
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  const segments = normalized.split('/').filter(Boolean);
  const items = [];
  let currentUrl = '';

  segments.forEach((segment, index) => {
    currentUrl += `/${segment}`;
    const lower = segment.toLowerCase();
    const isLast = index === segments.length - 1;

    let labelConfig = null;
    if (index === 0 && segmentLabels[lower]) {
      labelConfig = segmentLabels[lower];
    } else if (actionLabels[lower]) {
      labelConfig = actionLabels[lower];
    } else if (segmentLabels[lower]) {
      labelConfig = segmentLabels[lower];
    }

    const label = labelConfig
      ? labelConfig.label
      : isIdSegment(segment)
        ? `Mục #${segment}`
        : titleCase(segment);
    const icon = labelConfig?.icon || (isIdSegment(segment) ? 'fa-circle-info' : 'fa-chevron-right');

    items.push({
      label,
      url: currentUrl,
      icon
    });
  });

  if (!items.length || items[0].url !== '/dashboard') {
    items.unshift({ label: 'Trang chủ', url: '/dashboard', icon: 'fa-home' });
  }

  return items;
}

module.exports = {
  buildBreadcrumb
};
