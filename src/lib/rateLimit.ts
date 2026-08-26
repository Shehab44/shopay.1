import { LRUCache } from 'lru-cache';

/**
 * ⚠️ ملاحظة هامة حول التصميم (In-Memory Caveat):
 * هذا الحل يعتمد على الذاكرة المؤقتة (In-Memory LRU Cache) لحماية مسارات OTP وتسجيل الدخول.
 * - إيجابياته: سريع جداً، ولا يرهق قاعدة البيانات، ومثالي لبيئة Node.js/SQLite الحالية (VPS/Local).
 * - محدداته: يتم تفريغ الذاكرة وتصفير العدادات تلقائياً عند إعادة تشغيل السيرفر (Server Restart)
 *   أو عند النشر (Deployment).
 * - المستقبل: عند الانتقال لبيئة استضافة سحابية موزعة (Serverless) أو قاعدة بيانات خارجية،
 *   يجب استبدال هذا الحل بـ Redis أو جدول RateLimit داخل قاعدة البيانات لضمان استمرار الحماية عبر الخوادم المتعددة.
 */

const options = {
  max: 5000, // Maximum number of IPs/Phones to track
  ttl: 15 * 60 * 1000, // 15 minutes window
};

// Cache for OTP requests (Max 3 per 15 mins)
export const otpCache = new LRUCache<string, number>(options);

// Cache for Login attempts (Max 5 per 15 mins)
export const loginCache = new LRUCache<string, number>(options);

export function checkRateLimit(cache: LRUCache<string, number>, key: string, limit: number): { success: boolean, current: number } {
  const currentCount = cache.get(key) || 0;
  
  if (currentCount >= limit) {
    return { success: false, current: currentCount };
  }
  
  cache.set(key, currentCount + 1);
  return { success: true, current: currentCount + 1 };
}

export function resetRateLimit(cache: LRUCache<string, number>, key: string) {
  cache.delete(key);
}
