const SEMESTER_DEFINITIONS = [
  {
    code: 'HK1',
    label: 'Học kỳ I',
    startMonth: 8,
    startDay: 1,
    endMonth: 12,
    endDay: 31
  },
  {
    code: 'HK2',
    label: 'Học kỳ II',
    startMonth: 1,
    startDay: 1,
    endMonth: 5,
    endDay: 31
  },
  {
    code: 'HK3',
    label: 'Học kỳ hè',
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 31
  }
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const pad = (value, length = 2) => String(value).padStart(length, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getCurrentAcademicYearCode(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 8 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

function normalizeAcademicYearCode(code) {
  if (!code) return null;
  const match = /^(\d{4})[-/](\d{4})$/.exec(code.trim());
  if (!match) return null;
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (Number.isNaN(startYear) || Number.isNaN(endYear) || endYear !== startYear + 1) {
    return null;
  }
  return `${startYear}-${endYear}`;
}

function getAcademicYearRange(code, options = {}) {
  const normalized = normalizeAcademicYearCode(code) || getCurrentAcademicYearCode(options.referenceDate);
  const [startYearText, endYearText] = normalized.split('-');
  const startYear = Number(startYearText);
  const endYear = Number(endYearText);
  const startDate = startOfDay(new Date(startYear, 7, 1)); // August 1st
  const endDate = endOfDay(new Date(endYear, 6, 31)); // July 31st
  return {
    code: normalized,
    label: `Năm học ${normalized}`,
    startDate,
    endDate,
    kind: 'academic_year'
  };
}

function getSemesterDefinition(code) {
  return SEMESTER_DEFINITIONS.find((item) => item.code === code) || SEMESTER_DEFINITIONS[0];
}

function getSemesterRange({ academicYearCode, semesterCode, referenceDate = new Date() }) {
  const academicYear = getAcademicYearRange(academicYearCode, { referenceDate });
  const definition = getSemesterDefinition(semesterCode);
  const [startYearText, endYearText] = academicYear.code.split('-');
  const startYear = Number(startYearText);
  const endYear = Number(endYearText);

  const startYearForSemester = definition.startMonth >= 8 ? startYear : endYear;
  const endYearForSemester = definition.endMonth >= 8 ? startYear : endYear;

  const startDate = startOfDay(new Date(startYearForSemester, definition.startMonth - 1, definition.startDay));
  const endDate = endOfDay(new Date(endYearForSemester, definition.endMonth - 1, definition.endDay));

  return {
    code: definition.code,
    label: `${definition.label} · Năm học ${academicYear.code}`,
    startDate,
    endDate,
    academicYear: academicYear.code,
    kind: 'semester'
  };
}

function getCalendarYearRange(year, options = {}) {
  let numericYear = Number(year);
  if (Number.isNaN(numericYear)) {
    const reference = options.referenceDate ? new Date(options.referenceDate) : new Date();
    numericYear = reference.getFullYear();
  }
  const startDate = startOfDay(new Date(numericYear, 0, 1));
  const endDate = endOfDay(new Date(numericYear, 11, 31));
  return {
    code: String(numericYear),
    label: `Năm ${numericYear}`,
    startDate,
    endDate,
    kind: 'calendar_year'
  };
}

function parseScopeParam(scopeParam) {
  if (!scopeParam || typeof scopeParam !== 'string') {
    return null;
  }
  const parts = scopeParam.split('|').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const mode = parts[0];
  if (mode === 'academic_year' && parts.length >= 2) {
    return { mode, academicYear: normalizeAcademicYearCode(parts[1]) };
  }
  if (mode === 'semester' && parts.length >= 3) {
    return {
      mode,
      academicYear: normalizeAcademicYearCode(parts[1]),
      semester: parts[2]
    };
  }
  if (mode === 'calendar_year' && parts.length >= 2) {
    return { mode, calendarYear: Number(parts[1]) };
  }
  return null;
}

function resolveScope(scopeConfig, options = {}) {
  const referenceDate = options.referenceDate ? new Date(options.referenceDate) : new Date();
  if (!scopeConfig) {
    return resolveScope({ mode: 'academic_year', academicYear: getCurrentAcademicYearCode(referenceDate) }, { referenceDate });
  }

  if (scopeConfig.mode === 'academic_year') {
    const range = getAcademicYearRange(scopeConfig.academicYear, { referenceDate });
    return {
      mode: 'academic_year',
      academicYear: range.code,
      label: range.label,
      startDate: range.startDate,
      endDate: range.endDate,
      selectionValue: `academic_year|${range.code}`,
      kind: range.kind
    };
  }

  if (scopeConfig.mode === 'semester') {
    const range = getSemesterRange({
      academicYearCode: scopeConfig.academicYear,
      semesterCode: scopeConfig.semester,
      referenceDate
    });
    return {
      mode: 'semester',
      academicYear: range.academicYear,
      semester: range.code,
      label: range.label,
      startDate: range.startDate,
      endDate: range.endDate,
      selectionValue: `semester|${range.academicYear}|${range.code}`,
      kind: range.kind
    };
  }

  const range = getCalendarYearRange(scopeConfig.calendarYear, { referenceDate });
  return {
    mode: 'calendar_year',
    calendarYear: range.code,
    label: range.label,
    startDate: range.startDate,
    endDate: range.endDate,
    selectionValue: `calendar_year|${range.code}`,
    kind: range.kind
  };
}

function buildScopeOptions(referenceDate = new Date(), options = {}) {
  const academicYearsToGenerate = options.academicYears || 3;
  const calendarYearsToGenerate = options.calendarYears || 3;
  const academicYears = [];
  const semesters = [];

  let currentAcademicYearCode = getCurrentAcademicYearCode(referenceDate);
  let [startYear] = currentAcademicYearCode.split('-').map(Number);

  for (let i = 0; i < academicYearsToGenerate; i += 1) {
    const code = `${startYear - i}-${startYear - i + 1}`;
    const range = getAcademicYearRange(code, { referenceDate });
    academicYears.push({
      mode: 'academic_year',
      value: `academic_year|${range.code}`,
      label: range.label,
      startDate: range.startDate,
      endDate: range.endDate
    });

    SEMESTER_DEFINITIONS.forEach((definition) => {
      const semesterRange = getSemesterRange({
        academicYearCode: range.code,
        semesterCode: definition.code,
        referenceDate
      });
      semesters.push({
        mode: 'semester',
        value: `semester|${range.code}|${definition.code}`,
        label: semesterRange.label,
        startDate: semesterRange.startDate,
        endDate: semesterRange.endDate
      });
    });
  }

  const calendarYears = [];
  let currentYear = new Date(referenceDate).getFullYear();
  for (let i = 0; i < calendarYearsToGenerate; i += 1) {
    const value = currentYear - i;
    const range = getCalendarYearRange(value, { referenceDate });
    calendarYears.push({
      mode: 'calendar_year',
      value: `calendar_year|${range.code}`,
      label: range.label,
      startDate: range.startDate,
      endDate: range.endDate
    });
  }

  return [
    {
      mode: 'academic_year',
      label: 'Theo năm học',
      options: academicYears
    },
    {
      mode: 'semester',
      label: 'Theo học kỳ',
      options: semesters
    },
    {
      mode: 'calendar_year',
      label: 'Theo năm dương lịch',
      options: calendarYears
    }
  ];
}

module.exports = {
  SEMESTER_DEFINITIONS,
  getCurrentAcademicYearCode,
  normalizeAcademicYearCode,
  getAcademicYearRange,
  getSemesterRange,
  getCalendarYearRange,
  parseScopeParam,
  resolveScope,
  buildScopeOptions,
  formatDateTime
};
