/**
 * i18n 国际化核心模块
 * 支持中文(zh-CN)和英文(en)，按需扩展
 */
import zhCN from '../locales/zh-CN.json'
import en from '../locales/en.json'

const LANGS = { 'zh-CN': zhCN, en }
const LANG_KEY = 'clawpanel_lang'
const FALLBACK = 'zh-CN'

let _lang = FALLBACK
let _dict = zhCN
let _listeners = []

/**
 * 翻译函数
 * @param {string} key - 点分隔路径，如 'sidebar.dashboard'
 * @param {object} [params] - 插值参数，如 { count: 3 } 替换 {count}
 * @returns {string}
 */
export function t(key, params) {
  let val = _resolve(_dict, key)
  if (val === undefined) {
    // fallback 到中文
    val = _resolve(zhCN, key)
  }
  if (val === undefined) return key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return val
}

function _resolve(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

/** 获取当前语言 */
export function getLang() { return _lang }

/** 获取所有可用语言 */
export function getAvailableLangs() {
  return [
    { code: 'zh-CN', label: '简体中文' },
    { code: 'en', label: 'English' },
  ]
}

/** 切换语言 */
export function setLang(lang) {
  if (!LANGS[lang]) return
  _lang = lang
  _dict = LANGS[lang]
  localStorage.setItem(LANG_KEY, lang)
  _listeners.forEach(fn => { try { fn(lang) } catch {} })
}

/** 监听语言变化 */
export function onLangChange(fn) {
  _listeners.push(fn)
  return () => { _listeners = _listeners.filter(cb => cb !== fn) }
}

/** 初始化：localStorage > navigator.language > fallback */
export function initI18n() {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved && LANGS[saved]) {
    _lang = saved
    _dict = LANGS[saved]
    return
  }
  // 自动检测浏览器语言
  const nav = navigator.language || navigator.languages?.[0] || ''
  if (nav.startsWith('zh')) {
    _lang = 'zh-CN'
  } else if (nav.startsWith('en')) {
    _lang = 'en'
  }
  _dict = LANGS[_lang] || zhCN
}
