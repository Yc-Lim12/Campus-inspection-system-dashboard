import React from 'react';
import { DemoCtx } from './ctx.js';
import { dashboardMessages } from './dashboardMessages.js';

export const dashboardLanguages = { en: 'English', ms: 'Bahasa Melayu', zh: '中文' };

const shared = {
  Overview: ['Gambaran keseluruhan', '概览'], Camera: ['Kamera', '摄像头'], Alerts: ['Amaran', '警报'],
  Records: ['Rekod', '记录'], Reports: ['Laporan', '报告'], Assistant: ['Pembantu', '助手'],
  Admin: ['Pentadbir', '管理'], Settings: ['Tetapan', '设置'], Guidebook: ['Panduan', '指南'],
  Manage: ['Urus', '管理'], Main: ['Utama', '主导航'], Search: ['Cari', '搜索'],
  'Search everything': ['Cari semua', '搜索全部'], 'Demo session': ['Sesi demo', '演示会话'],
  Administrator: ['Pentadbir', '管理员'], 'Facility staff': ['Kakitangan fasiliti', '设施员工'],
  'Skip to main content': ['Langkau ke kandungan utama', '跳至主要内容'],
  'Privacy Notice': ['Notis Privasi', '隐私声明'], 'Terms of Use': ['Terma Penggunaan', '使用条款'],
  'Camera and Image Policy': ['Dasar Kamera dan Imej', '摄像头与图像政策'],
  Accessibility: ['Kebolehcapaian', '无障碍'], Legal: ['Dasar dan terma', '政策与条款'],
  Cancel: ['Batal', '取消'], Checkpoint: ['Titik pemeriksaan', '检查点'],
  Status: ['Status', '状态'], Date: ['Tarikh', '日期'], Resolved: ['Selesai', '已解决'],
  Unresolved: ['Belum selesai', '未解决'], Detected: ['Dikesan', '已发现'],
  High: ['Tinggi', '高'], Medium: ['Sederhana', '中'], Low: ['Rendah', '低'],
  'On patrol': ['Sedang meronda', '巡逻中'], 'En route': ['Dalam perjalanan', '前往途中'],
  'Returning to dock': ['Kembali ke dok', '返回充电站中'], Stopped: ['Dihentikan', '已停止'],
  'At checkpoint': ['Di titik pemeriksaan', '已到检查点'], Docked: ['Di dok', '已停靠'],
  'Patrol paused': ['Rondaan dijeda', '巡逻已暂停'], 'At charging dock': ['Di dok pengecasan', '位于充电站'],
  'Heading to the charging dock': ['Menuju ke dok pengecasan', '正前往充电站'], 'Heading to': ['Menuju ke', '正前往'],
};

const hasKey = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function dashboardLanguage(value) {
  return hasKey(dashboardLanguages, value) ? value : 'en';
}

export function translateDashboard(language, key, values, copy = {}) {
  const column = language === 'ms' ? 0 : language === 'zh' ? 1 : -1;
  const messages = hasKey(copy, key) ? copy : hasKey(dashboardMessages, key) ? dashboardMessages : shared;
  const message = (hasKey(messages, key) && messages[key][column]) || key;
  return values ? message.replace(/\{(\w+)\}/g, (token, name) => hasKey(values, name) ? values[name] : token) : message;
}

export function useDashboardLocale(copy) {
  const { preferences } = React.useContext(DemoCtx);
  const language = dashboardLanguage(preferences.dashboardLanguage);
  const t = (key, values) => translateDashboard(language, key, values, copy);
  return { language, t };
}
