/**
 * Date Formatting Utilities for Expense Tracker
 * Purpose: Centralized date formatting, parsing, and manipulation functions
 * Constitutional Requirements: Internationalization support, accessibility, error handling
 */

/**
 * Default locale settings
 */
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Format date to display string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format type: 'short', 'medium', 'long', 'full', 'relative', 'custom'
 * @param {string} options.locale - Locale for formatting
 * @param {string} options.timeZone - Timezone for formatting
 * @param {string} options.customFormat - Custom format string
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const {
    format = 'medium',
    locale = DEFAULT_LOCALE,
    timeZone = DEFAULT_TIMEZONE,
    customFormat = null
  } = options;

  try {
    // Parse date if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    // Handle relative formatting
    if (format === 'relative') {
      return formatRelativeDate(dateObj, locale);
    }

    // Handle custom formatting
    if (format === 'custom' && customFormat) {
      return formatCustomDate(dateObj, customFormat);
    }

    // Standard Intl.DateTimeFormat options
    const formatOptions = getDateFormatOptions(format, timeZone);
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Format date for display in expense lists
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export function formatExpenseDate(date, locale = DEFAULT_LOCALE) {
  return formatDate(date, { format: 'short', locale });
}

/**
 * Format date for form inputs (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
}

/**
 * Format relative date (e.g., "2 days ago", "yesterday", "today")
 * @param {Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Relative date string
 */
export function formatRelativeDate(date, locale = DEFAULT_LOCALE) {
  try {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Use Intl.RelativeTimeFormat for modern browsers
    if (typeof Intl.RelativeTimeFormat !== 'undefined') {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      if (diffDays > 0) {
        return rtf.format(-diffDays, 'day');
      } else if (diffHours > 0) {
        return rtf.format(-diffHours, 'hour');
      } else if (diffMinutes > 0) {
        return rtf.format(-diffMinutes, 'minute');
      } else {
        return 'just now';
      }
    }

    // Fallback for older browsers
    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) {
          return 'just now';
        }
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      }
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(date, { format: 'short', locale });
    }
  } catch (error) {
    return formatDate(date, { format: 'short', locale });
  }
}

/**
 * Format custom date using format string
 * @param {Date} date - Date to format
 * @param {string} format - Format string (YYYY, MM, DD, etc.)
 * @returns {string} Formatted date string
 */
export function formatCustomDate(date, format) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

/**
 * Get date range for period (week, month, year)
 * @param {string} period - Period type: 'week', 'month', 'year'
 * @param {Date} referenceDate - Reference date (default: today)
 * @returns {Object} Object with start and end dates
 */
export function getDateRange(period, referenceDate = new Date()) {
  const date = new Date(referenceDate);
  let start, end;

  switch (period) {
    case 'week':
      // Start of week (Sunday)
      start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      
      // End of week (Saturday)
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case 'month':
      // Start of month
      start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      
      // End of month
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'year':
      // Start of year
      start = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
      
      // End of year
      end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    default:
      throw new Error(`Unsupported period: ${period}`);
  }

  return { start, end };
}

/**
 * Get days in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Check if date is this week
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is this week
 */
export function isThisWeek(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const { start, end } = getDateRange('week');
  
  return dateObj >= start && dateObj <= end;
}

/**
 * Check if date is this month
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is this month
 */
export function isThisMonth(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getFullYear() === today.getFullYear() &&
         dateObj.getMonth() === today.getMonth();
}

/**
 * Parse date from various string formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  try {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00.000Z');
      return isNaN(date.getTime()) ? null : date;
    }

    // Try other common formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
}

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date with days added
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to date
 * @param {Date} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date with months added
 */
export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get start and end of day
 * @param {Date} date - Reference date
 * @returns {Object} Object with startOfDay and endOfDay
 */
export function getStartAndEndOfDay(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

/**
 * Get week days for date picker
 * @param {string} locale - Locale for day names
 * @returns {Array} Array of week day names
 */
export function getWeekDays(locale = DEFAULT_LOCALE) {
  const date = new Date();
  const weekDays = [];
  
  // Start from Sunday (0) to Saturday (6)
  for (let i = 0; i < 7; i++) {
    date.setDate(date.getDate() - date.getDay() + i);
    weekDays.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
    );
  }
  
  return weekDays;
}

/**
 * Get month names for date picker
 * @param {string} locale - Locale for month names
 * @returns {Array} Array of month names
 */
export function getMonthNames(locale = DEFAULT_LOCALE) {
  const monthNames = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2023, i, 1);
    monthNames.push(
      new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
    );
  }
  
  return monthNames;
}

/**
 * Get date format options for Intl.DateTimeFormat
 * @param {string} format - Format type
 * @param {string} timeZone - Timezone
 * @returns {Object} Options object for Intl.DateTimeFormat
 */
function getDateFormatOptions(format, timeZone) {
  const baseOptions = { timeZone };
  
  switch (format) {
    case 'short':
      return { ...baseOptions, dateStyle: 'short' };
    case 'medium':
      return { ...baseOptions, dateStyle: 'medium' };
    case 'long':
      return { ...baseOptions, dateStyle: 'long' };
    case 'full':
      return { ...baseOptions, dateStyle: 'full' };
    default:
      return { ...baseOptions, year: 'numeric', month: 'short', day: 'numeric' };
  }
}