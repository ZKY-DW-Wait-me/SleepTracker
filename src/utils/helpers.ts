/**
 * SleepTracker - 通用工具函数
 * 提供各种辅助功能
 */

// ==================== 字符串工具 ====================

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @returns 唯一ID字符串
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * 截断字符串
 * @param str 原字符串
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 转换为驼峰命名
 * @param str 字符串
 * @returns 驼峰命名字符串
 */
export const toCamelCase = (str: string): string => {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
};

/**
 * 转换为帕斯卡命名
 * @param str 字符串
 * @returns 帕斯卡命名字符串
 */
export const toPascalCase = (str: string): string => {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// ==================== 数组工具 ====================

/**
 * 数组去重
 * @param array 数组
 * @param keyFn 获取唯一键的函数
 * @returns 去重后的数组
 */
export const uniqueArray = <T>(array: T[], keyFn?: (item: T) => string): T[] => {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set<string>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * 数组分组
 * @param array 数组
 * @param keyFn 分组键函数
 * @returns 分组后的对象
 */
export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * 数组排序
 * @param array 数组
 * @param keyFn 排序键函数
 * @param direction 排序方向
 * @returns 排序后的数组
 */
export const sortBy = <T>(
  array: T[],
  keyFn: (item: T) => number | string,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    
    if (keyA < keyB) return direction === 'asc' ? -1 : 1;
    if (keyA > keyB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * 分块数组
 * @param array 数组
 * @param size 块大小
 * @returns 分块后的数组
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ==================== 对象工具 ====================

/**
 * 深度克隆对象
 * @param obj 对象
 * @returns 克隆后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * 深合并对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
};

/**
 * 挑选对象属性
 * @param obj 对象
 * @param keys 属性键数组
 * @returns 挑选后的对象
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * 排除对象属性
 * @param obj 对象
 * @param keys 要排除的属性键数组
 * @returns 排除后的对象
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// ==================== 数字工具 ====================

/**
 * 数字范围限制
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * 数字取整
 * @param value 值
 * @param decimals 小数位数
 * @returns 取整后的值
 */
export const round = (value: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * 格式化数字为千分位
 * @param value 值
 * @returns 格式化后的字符串
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('zh-CN');
};

/**
 * 格式化百分比
 * @param value 值 (0-1)
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ==================== 验证工具 ====================

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证URL格式
 * @param url URL
 * @returns 是否有效
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证是否为数字
 * @param value 值
 * @returns 是否数字
 */
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// ==================== 防抖节流 ====================

/**
 * 防抖函数
 * @param fn 函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 节流函数
 * @param fn 函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// ==================== 存储工具 ====================

/**
 * 本地存储包装
 */
export const storage = {
  /**
   * 设置存储项
   * @param key 键
   * @param value 值
   */
  set: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  /**
   * 获取存储项
   * @param key 键
   * @param defaultValue 默认值
   * @returns 值
   */
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  /**
   * 删除存储项
   * @param key 键
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  /**
   * 清空存储
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

// ==================== 导出默认对象 ====================

export default {
  generateId,
  truncateString,
  capitalize,
  toCamelCase,
  toPascalCase,
  uniqueArray,
  groupBy,
  sortBy,
  chunkArray,
  deepClone,
  deepMerge,
  pick,
  omit,
  clamp,
  round,
  formatNumber,
  formatPercent,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isNumeric,
  debounce,
  throttle,
  storage,
};
