'use client';
import { useState } from 'react';
import Cropper from './Cropper';
import { api } from '@/lib/client';

const DEPTHS = [
  ['精簡解答', '直接給答案與關鍵重點,快速核對。'],
  ['標準詳解', '用少量步驟說清楚主要解法。'],
  ['深度解析', '完整推導,並補充易錯點與延伸觀念。'],
];
const DOT_COLORS = ['#34D399', '#60A5FA', '#F5B93B', '#F87171', '#A78BFA', '#2DD4BF', '#FB923C', '#F472B6'];

export default function Home({ subjects, remains, locked, onSolve }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [crops, setCrops] = useState({});
  const [depth, setDepth] = useState('標準詳解');
  const [subject, setSubject] = useState('');
  const [ref, setRef] = useState('');
  const [warn, setWarn] = useState('');
  const [bug, setBug] = useState('');
  const [bugMsg, setBugMsg] = useState('');

  function addFiles(e) {
    const list = [...e.target.files].slice(0, 5 - files.length).map((f) => ({
      id: Math.random().toString(36).slice(2), url: URL.createObjectURL(f),
    }));
    setFiles((p) => [...p, ...list]);
    e.target.value = '';
  }
  function removeFile(id) {
    setFiles((p) => p.filter((f) => f.id !== id));
    setCrops((p) => { const n = { ...p }; delete n[id]; return n; });
  }
  function clearAll() { setText(''); setFiles([]); setCrops({}); setRef(''); setWarn(''); }

  function submit() {
    setWarn('');
    if (remains !== '無限' && remains <= 0) return setWarn('今日解題額度已用完,請明日再試!');
    const images = files.map((f) => crops[f.id]).filter(Boolean);
    if (!text.trim() && !images.length) return setWarn('請輸入文字題目或上傳題目圖片!');
    onSolve({ text, images, subject: subject || subjects[0], depth, refAnswer: ref });
  }

  async function sendBug() {
    try {
      await api('/api/bugs', { method: 'POST', body: { message: bug } });
      setBug(''); setBugMsg('已送出,感謝你的回報!');
    } catch (e) { setBugMsg(e.message); }
  }

  return (
    <div className="stack">
      <div className="stephead"><span className="step">1</span>輸入文字題目或上傳圖片</div>
      <label>文字題目描述(可直接貼上題目文字、觀念問題)
        <textarea rows={5} value={text} disabled={locked} onChange={(e) => setText(e.target.value)}
          placeholder="例如:請幫我解釋氧化還原反應中,氧化劑與還原劑的判斷方式..." />
      </label>
      <label>上傳題目圖片(選填,最多 5 張)
        <input type="file" accept="image/png,image/jpeg" multiple disabled={locked || files.length >= 5} onChange={addFiles} />
      </label>

      {files.length > 0 && <h4>圖片裁切預覽(拖曳選取要解的範圍)</h4>}
      {files.map((f, i) => (
        <div key={f.id} className="card">
          <div className="row between"><b>圖片 {i + 1}</b><button type="button" className="sec small" onClick={() => removeFile(f.id)}>移除</button></div>
          <Cropper src={f.url} onChange={(b64) => setCrops((p) => ({ ...p, [f.id]: b64 }))} />
        </div>
      ))}

      <div className="stephead"><span className="step">2</span>設定解說深度與科目資訊</div>
      <div className="field-label">科目</div>
      <div className="chips">
        {subjects.map((sub, i) => (
          <button
            key={sub}
            type="button"
            className={`chip ${(subject || subjects[0]) === sub ? 'on' : ''}`}
            style={{ '--c': DOT_COLORS[i % DOT_COLORS.length] }}
            disabled={locked}
            onClick={() => setSubject(sub)}
          >
            <span className="dot" />{sub}
          </button>
        ))}
      </div>

      <div className="field-label">解說深度</div>
      <div className="depths">
        {DEPTHS.map(([k]) => (
          <button key={k} type="button" className={`depth ${depth === k ? 'on' : ''}`} disabled={locked} onClick={() => setDepth(k)}>
            {depth === k && <span aria-hidden="true">✓ </span>}{k}
          </button>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 14 }}>{DEPTHS.find(([k]) => k === depth)[1]}</div>

      <label>標準參考答案(選填)
        <input value={ref} disabled={locked} onChange={(e) => setRef(e.target.value)} placeholder="例如 B、ACD、2.5 mol..." />
      </label>

      {warn && <div className="alert bad">{warn}</div>}
      <div className="row">
        <button style={{ flex: 3 }} disabled={locked} onClick={submit}>開始解題</button>
        <button className="sec" style={{ flex: 1 }} disabled={locked} onClick={clearAll}>清除</button>
      </div>

      <details className="card">
        <summary>回報問題或建議</summary>
        <div className="stack" style={{ marginTop: 10 }}>
          <textarea rows={3} value={bug} onChange={(e) => setBug(e.target.value)} placeholder="請描述你遇到的問題或想要的功能" />
          <button className="sec" onClick={sendBug} disabled={!bug.trim()}>送出回報</button>
          {bugMsg && <div className="muted">{bugMsg}</div>}
        </div>
      </details>
    </div>
  );
}
