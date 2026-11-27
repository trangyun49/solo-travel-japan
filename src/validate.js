'use strict';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v, { field, min = 0, max = 200, required = false } = {}) {
  const s = typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
  if (required && !s) throw new HttpError(400, `${field}を入力してください。`);
  if (s && s.length < min) throw new HttpError(400, `${field}は${min}文字以上で入力してください。`);
  if (s.length > max) throw new HttpError(400, `${field}は${max}文字以内で入力してください。`);
  return s;
}

function email(v) {
  const s = str(v, { field: 'メールアドレス', max: 254, required: true }).toLowerCase();
  if (!EMAIL_RE.test(s)) throw new HttpError(400, 'メールアドレスの形式が正しくありません。');
  return s;
}

function password(v, field = 'パスワード') {
  const s = typeof v === 'string' ? v : '';
  if (s.length < 8) throw new HttpError(400, `${field}は8文字以上で入力してください。`);
  if (s.length > 128) throw new HttpError(400, `${field}は128文字以内で入力してください。`);
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) throw new HttpError(400, `${field}には英字と数字を両方含めてください。`);
  return s;
}

function oneOf(v, allowed, field, fallback) {
  if ((v === undefined || v === null || v === '') && fallback !== undefined) return fallback;
  if (!allowed.includes(v)) throw new HttpError(400, `${field}の値が正しくありません。`);
  return v;
}

function isoDate(v, field = '日付') {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, `${field}の形式が正しくありません。`);
  const d = new Date(v + 'T00:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) throw new HttpError(400, `${field}が正しくありません。`);
  return v;
}

module.exports = { HttpError, str, email, password, oneOf, isoDate };
