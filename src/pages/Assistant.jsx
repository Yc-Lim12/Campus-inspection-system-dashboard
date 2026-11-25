import React from 'react';
import DashboardPage from '../DashboardPage.jsx';
import { DemoCtx } from '../ctx.js';
import { translateDashboard, useDashboardLocale } from '../dashboardLocale.js';
import { prefersReducedMotion } from '../preferences.js';
import { campusTime, limitsForCheckpoint } from '../dashboardState.js';
import { sampleInspectionRecords } from '../inspectionRecords.js';
import { campusDayLabel } from '../campusDates.js';

const languages = { auto: 'Auto', en: 'EN', ms: 'BM', zh: '中文' };
const prompts = {
  en: ['Air at CP2 today', 'Show open incidents', 'Latest water leak', 'How many incidents this week?'],
  ms: ['Bacaan udara di CP2 hari ini', 'Tunjukkan insiden terbuka', 'Kebocoran air terkini', 'Berapa banyak insiden minggu ini?'],
  zh: ['查看 CP2 今天的空气质量', '查看未解决事件', '最近的漏水事件', '本周有多少起事件？'],
};
const copy = {
  en: {
    help: 'Ask about open incidents, the latest water leak, PM2.5 at a checkpoint, or incident totals.',
    missing: 'There are no matching sample records.',
    controls: 'Use the robot controls on Overview or Camera.',
    sent: 'Command accepted by the robot simulator.', cancel: 'Command cancelled.',
    unavailable: 'The command is unavailable. Check that the destination is active and allows entry.',
    open: count => count + ' unresolved incident(s).',
    count: (count, date) => count + ' incident(s) recorded for the week ending with the latest sample date, ' + date + '.',
    top: (checkpoint, count) => checkpoint + ' has the most matching alerts (' + count + ').',
    leak: item => 'Latest water leak: ' + campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.checkpoint + ' · ' + item.room + '.',
    air: (item, limit) => campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.location + ' · ' + item.temperature + ' °C · ' + item.humidity + '% humidity · PM2.5 ' + item.pm25 + ' µg/m³ (' + (item.pm25 > limit ? 'above' : 'within') + ' limit).',
  },
  ms: {
    help: 'Tanya tentang insiden terbuka, kebocoran air terkini, PM2.5 di pusat pemeriksaan atau jumlah insiden.',
    missing: 'Tiada rekod sampel yang sepadan.',
    controls: 'Gunakan kawalan robot pada halaman Gambaran keseluruhan atau Kamera.',
    sent: 'Simulator robot menerima arahan.', cancel: 'Arahan dibatalkan.',
    unavailable: 'Arahan tidak tersedia. Pastikan destinasi aktif dan kemasukan dibenarkan.',
    open: count => count + ' insiden belum diselesaikan.',
    count: (count, date) => count + ' insiden direkodkan dalam minggu berakhir pada tarikh sampel terkini, ' + date + '.',
    top: (checkpoint, count) => checkpoint + ' mempunyai amaran sepadan terbanyak (' + count + ').',
    leak: item => 'Kebocoran air terkini: ' + campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.checkpoint + ' · ' + item.room + '.',
    air: (item, limit) => campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.location + ' · ' + item.temperature + ' °C · kelembapan ' + item.humidity + '% · PM2.5 ' + item.pm25 + ' µg/m³ (' + (item.pm25 > limit ? 'melebihi had' : 'dalam had') + ').',
  },
  zh: {
    help: '可以查询未解决事件、最近的漏水事件、检查点的 PM2.5 或事件总数。',
    missing: '没有符合条件的样本记录。',
    controls: '请在概览或摄像头页面操作机器人。',
    sent: '机器人模拟器已接受指令。', cancel: '已取消指令。',
    unavailable: '无法执行该指令。请检查目标地点是否启用并允许进入。',
    open: count => '有 ' + count + ' 起未解决事件。',
    count: (count, date) => '截至最新样本日期 ' + date + ' 的一周内有 ' + count + ' 起事件。',
    top: (checkpoint, count) => checkpoint + ' 的匹配警报最多，共 ' + count + ' 起。',
    leak: item => '最近的漏水事件：' + campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.checkpoint + ' · ' + item.room + '。',
    air: (item, limit) => campusDayLabel(item.day) + ', ' + (item.time || '—') + ' · ' + item.location + ' · ' + item.temperature + ' °C · 湿度 ' + item.humidity + '% · PM2.5 ' + item.pm25 + ' µg/m³（' + (item.pm25 > limit ? '超标' : '未超标') + '）。',
  },
};

const detectLanguage = question => /[\u3400-\u9fff]/.test(question) ? 'zh'
  : /\b(berapa|insiden|kebocoran|pergi|udara|hari|mulakan|kembali|henti|rondaan|tunjukkan|yang|bilik)\b/i.test(question) ? 'ms' : 'en';

function answer(question, responseLanguage, incidents, configuration) {
  const strings = copy[responseLanguage];
  const describe = title => translateDashboard(responseLanguage, title);
  const query = question.toLowerCase();
  const target = configuration.checkpoints.find(item => query.match(/\bcp\d+\b/g)?.includes(item.id.toLowerCase()) ||
    query.includes(item.room.toLowerCase()));
  const command = /return to dock|kembali ke dok|返回充电站|回充电站/.test(query) ? 'return'
    : /start patrol|mulakan rondaan|开始巡逻/.test(query) ? 'start'
    : /stop (the )?robot|henti|停止机器人/.test(query) ? 'stop'
    : /\b(go to|send|dispatch|pergi|hantar)\b|前往|派|去/.test(query) ? 'send' : null;

  if (command) return { text: strings.controls, links: [['Overview', '#overview'], ['Camera', '#camera']] };

  if (/open incidents?|unresolved|insiden terbuka|未解决/.test(query)) {
    const open = incidents.filter(item => item.status !== 'resolved');
    return { text: strings.open(open.length), links: open.map(item => [item.id + ' · ' + describe(item.title), '#alerts/' + item.id]) };
  }

  const leaks = /water|leak|kebocoran|漏水/.test(query);
  if (/most|paling|最多|最常/.test(query)) {
    const counts = new Map();
    for (const item of incidents.filter(item => !leaks || /leak/i.test(item.title))) {
      counts.set(item.checkpoint, (counts.get(item.checkpoint) || 0) + 1);
    }
    const sorted = [...counts].sort((left, right) => right[1] - left[1]);
    const count = sorted[0]?.[1];
    const checkpoints = sorted.filter(item => item[1] === count).map(([id]) => id).join(', ');
    return count ? { text: strings.top(checkpoints, count), links: [['Reports', '#reports/incidents']] } : { text: strings.missing };
  }
  if (leaks) {
    const leak = incidents.find(item => /leak/i.test(item.title));
    return leak ? { text: strings.leak(leak), links: [[leak.id, '#alerts/' + leak.id]] } : { text: strings.missing };
  }
  if (/air|pm2|udara|空气|温度|湿度/.test(query)) {
    const latest = sampleInspectionRecords[0].day;
    const previous = new Date(latest + 'T00:00:00Z');
    previous.setUTCDate(previous.getUTCDate() - 1);
    const day = /yesterday|semalam|昨天/.test(query) ? previous.toISOString().slice(0, 10) : latest;
    const readings = sampleInspectionRecords.filter(item => item.day === day && (!target || item.checkpoint === target.id));
    const reading = /\bhigh\b|tinggi|超标/.test(query)
      ? [...readings].sort((left, right) => right.pm25 - left.pm25)[0] : readings[0];
    return reading ? { text: strings.air(reading, limitsForCheckpoint(configuration, reading.checkpoint).pm25), links: [[reading.id, '#records/' + reading.id]] } : { text: strings.missing };
  }
  if (/how many|ber[a]?pa|多少|insiden|incidents|事件/.test(query)) {
    const latest = incidents.map(item => item.day).reduce((current, day) => day > current ? day : current);
    const start = new Date(latest + 'T00:00:00Z');
    start.setUTCDate(start.getUTCDate() - 6);
    return { text: strings.count(incidents.filter(item => item.day >= start.toISOString().slice(0, 10)).length, campusDayLabel(latest)),
      links: [['Reports', '#reports/incidents']] };
  }
  return { text: strings.help };
}

const interfaceCopy = {
  'Reply language': ['Bahasa jawapan', '回复语言'],
  'Match question': ['Ikut soalan', '跟随提问'], 'New chat': ['Sembang baharu', '新对话'],
  'How can I help?': ['Bagaimanakah saya boleh membantu?', '有什么可以帮您？'],
  'Ask about campus incidents and inspection readings.': ['Tanya tentang insiden kampus dan bacaan pemeriksaan.', '可查询校园事件和巡检读数。'],
  'Suggested questions': ['Soalan cadangan', '推荐问题'], Messages: ['Mesej', '消息'],
  'Ask the assistant': ['Tanya pembantu', '向助手提问'], 'Ask about an incident or inspection…': ['Tanya tentang insiden atau pemeriksaan…', '询问事件或检查情况…'],
  Send: ['Hantar', '发送'], 'You': ['Anda', '您'], 'Stop robot': ['Hentikan robot', '停止机器人'],
  'Assistant notice': ['Notis pembantu', '助手声明'],
  'Chat history': ['Sejarah sembang', '聊天记录'],
  'Show history': ['Papar sejarah', '显示记录'], 'Hide history': ['Sembunyikan sejarah', '隐藏记录'],
  'Your conversations in this demo session appear here.': ['Perbualan dalam sesi demo ini dipaparkan di sini.', '当前演示会话中的对话会显示在这里。'],
};

function AssistantMark({ small = false }) {
  return <span className={'chat-mark' + (small ? ' chat-mark-small' : '')} aria-hidden="true">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v3m-2-3h4M6 8h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5l-4 3v-3H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      <path d="M9 13h.01M15 13h.01" strokeWidth="2.5" />
    </svg>
  </span>;
}

export default function Assistant() {
  const { incidents, configuration, preferences, setPreferences, assistantHistory, setAssistantHistory } = React.useContext(DemoCtx);
  const { language, t } = useDashboardLocale(interfaceCopy);
  const [question, setQuestion] = React.useState('');
  const [historyOpen, setHistoryOpen] = React.useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const input = React.useRef(null);
  const log = React.useRef(null);
  const previousChat = React.useRef(undefined);
  const historyHeading = React.useRef(null);
  const historyId = React.useId();
  const { conversations, activeId } = assistantHistory;
  const activeChat = conversations.find(chat => chat.id === activeId);
  const assistantMessages = activeChat?.messages || [];
  const replyLanguage = preferences.assistantLanguage;
  const suggestionLanguage = replyLanguage === 'auto' ? language : replyLanguage;

  React.useLayoutEffect(() => {
    const panel = log.current;
    if (!panel) return;
    const behavior = previousChat.current === activeId && !prefersReducedMotion() ? 'smooth' : 'instant';
    panel.scrollTo({ top: panel.scrollHeight, behavior });
    previousChat.current = activeId;
  }, [activeChat, activeId]);

  function ask(value) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const questionLanguage = detectLanguage(trimmed);
    const responseLanguage = replyLanguage === 'auto' ? questionLanguage : replyLanguage;
    const updatedAt = Date.now();
    const id = activeId || (crypto.randomUUID?.() || updatedAt.toString(36) + '-' + Math.random().toString(36).slice(2));
    const message = { question: trimmed, questionLanguage, responseLanguage, ...answer(trimmed, responseLanguage, incidents, configuration) };
    setAssistantHistory(current => {
      const previous = current.conversations.find(chat => chat.id === id);
      const chat = { id, updatedAt, messages: [...(previous?.messages || []), message] };
      return { activeId: id, conversations: [chat, ...current.conversations.filter(item => item.id !== id)] };
    });
    setQuestion('');
    input.current?.focus({ preventScroll: true });
  }

  function handleComposerKey(event) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    ask(question);
  }

  function openChat(id) {
    setAssistantHistory(current => current.activeId === id ? current : {
      activeId: id,
      conversations: current.conversations,
    });
    setQuestion('');
    if (!window.matchMedia('(min-width: 1024px)').matches) setHistoryOpen(false);
    input.current?.focus({ preventScroll: true });
  }

  function toggleHistory() {
    setHistoryOpen(!historyOpen);
    if (!historyOpen && !window.matchMedia('(min-width: 1024px)').matches) {
      requestAnimationFrame(() => historyHeading.current?.focus());
    }
  }

  return (
    <DashboardPage title={t('AI Assistant')} lang={language} className="pg-assistant">
      <div className={'chat-layout' + (historyOpen ? ' chat-layout-with-history' : '')}>
        <section className="card chat-shell" aria-label={t('AI Assistant')}>
          <header className="chat-header">
            <div className="chat-identity">
              <AssistantMark />
              <h2>{t('AI Assistant')}</h2>
            </div>
            <div className="chat-header-actions">
              <label className="chat-language">{t('Reply language')}
                <select value={replyLanguage} onChange={event =>
                  setPreferences(current => ({ ...current, assistantLanguage: event.target.value }))}>
                  {Object.entries(languages).map(([id, label]) => <option key={id} value={id}>{id === 'auto' ? t('Match question') : label}</option>)}
                </select>
              </label>
              {assistantMessages.length > 0 && <button className="btn" type="button" onClick={() => openChat(null)}>{t('New chat')}</button>}
              <button className="btn" type="button" aria-expanded={historyOpen} aria-controls={historyId} onClick={toggleHistory}>
                {t(historyOpen ? 'Hide history' : 'Show history')}
              </button>
            </div>
          </header>
          <div ref={log} className="chat-scroll">
            {assistantMessages.length === 0 ? (
              <div className="chat-welcome">
                <AssistantMark />
                <h3>{t('How can I help?')}</h3>
                <p className="muted">{t('Ask about campus incidents and inspection readings.')}</p>
                <div className="chat-suggestions" aria-label={t('Suggested questions')}>
                  {prompts[suggestionLanguage].map(prompt => (
                    <button className="chat-prompt" type="button" key={prompt} lang={suggestionLanguage} onClick={() => ask(prompt)}>
                      <span>{prompt}</span><span className="chat-arrow" aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div role="log" aria-label={t('Messages')} className="chat-log">
              {assistantMessages.map((message, index) => (
                <div className="chat-turn" key={index}>
                  <div className="chat-message chat-user" lang={message.questionLanguage}>
                    <span className="sr" lang={language}>{t('You')}</span><p className="chat-bubble">{message.question}</p>
                  </div>
                  <div className="chat-message chat-answer">
                    <AssistantMark small />
                    <div className="chat-bubble">
                      <span className="sr">{t('Assistant')}</span>
                      <p lang={message.responseLanguage}>{message.text}</p>
                      {message.links?.length > 0 && <ul>{message.links.map(([label, href]) => <li key={href}><a href={href}>{t(label)}</a></li>)}</ul>}
                      {message.command && <p className="chat-command" lang={message.responseLanguage}>
                        {copy[message.responseLanguage][message.result || 'cancel']}
                      </p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-bottom">
            {assistantMessages.length > 0 && <div className="chat-shortcuts" aria-label={t('Suggested questions')}>
              {prompts[suggestionLanguage].map(prompt => <button className="btn" type="button" key={prompt}
                lang={suggestionLanguage} onClick={() => ask(prompt)}>{prompt}</button>)}
            </div>}
            <form className="chat-composer" onSubmit={event => { event.preventDefault(); ask(question); }}>
              <label className="sr" htmlFor="chat-question">{t('Ask the assistant')}</label>
              <textarea id="chat-question" ref={input} value={question} rows={1} maxLength={300}
                onChange={event => setQuestion(event.target.value)} onKeyDown={handleComposerKey}
                placeholder={t('Ask about an incident or inspection…')} />
              <button className="btn primary" type="submit" disabled={!question.trim()} aria-label={t('Send')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 19V5m-6 6 6-6 6 6" />
                </svg>
              </button>
            </form>
            <div className="chat-tools">
              <a href="#legal/ai">{t('Assistant notice')}</a>
            </div>
          </div>
        </section>
        <aside id={historyId} className="card chat-history" hidden={!historyOpen} aria-labelledby={historyId + '-heading'}>
          <h2 id={historyId + '-heading'} ref={historyHeading} tabIndex={-1}>{t('Chat history')}</h2>
          {conversations.length ? <ul>
            {conversations.map(chat => {
              const first = chat.messages[0];
              return (
                <li key={chat.id}>
                  <button className="chat-history-item" type="button" aria-current={chat.id === activeId ? 'true' : undefined}
                    onClick={() => openChat(chat.id)}>
                    <span lang={first.questionLanguage}>{first.question.replace(/\s+/g, ' ')}</span>
                    <time dateTime={new Date(chat.updatedAt).toISOString()}>{campusTime(chat.updatedAt, language)}</time>
                  </button>
                </li>
              );
            })}
          </ul> : <p className="muted">{t('Your conversations in this demo session appear here.')}</p>}
        </aside>
      </div>
    </DashboardPage>
  );
}
