'use client';
import { useEffect, useState } from 'react';
import Md from './Md';

const STEPS = [
  [15, '正在啟動 AI 解題引擎...'],
  [35, '正在辨識題目內容與選項...'],
  [60, '正在進行觀念推導...'],
  [85, '正在生成選項分析與步驟說明...'],
  [100, '正在整理最終答題報告...'],
];

export default function Analysis({ loading, error, record, onHome }) {
  const [p, setP] = useState(5);
  useEffect(() => {
    if (!loading) return;
    setP(5);
    const t = setInterval(() => setP((x) => Math.min(95, x + (x < 60 ? 5 : x < 85 ? 2 : 0.4))), 700);
    return () => clearInterval(t);
  }, [loading]);

  const pill = loading ? '分析中' : error ? '失敗' : record ? '已完成' : '待命';
  const fb = record?.admin_feedback || {};

  let body;
  if (loading) {
    const msg = STEPS.find(([v]) => p <= v)?.[1] || STEPS[4][1];
    body = (
      <div className="inner center">
        <div className="spinner" aria-hidden="true" />
        <div style={{ fontSize: 20, fontWeight: 800, margin: '14px 0 16px' }}>已送出題目,分析題目中</div>
        <div className="row between"><small>解題進度</small><small>{Math.round(p)}%</small></div>
        <div className="bar"><i style={{ width: `${p}%` }} /></div>
        <div className="muted" style={{ marginTop: 14, fontSize: 14 }}>{msg}<br />解題約需 10~30 秒,請先不要離開此頁面。</div>
      </div>
    );
  } else if (error) {
    body = <div className="alert bad"><b>解題失敗</b><br />{error}</div>;
  } else if (!record) {
    body = <div className="alert">目前尚無最新的解題結果,請至「首頁」輸入或上傳題目。</div>;
  } else {
    body = (
      <>
        <div className="muted">本題解說深度:{record.depth_mode} · {record.subject}</div>
        <div className="answer">
          <div className="eyebrow">CORRECT ANSWER</div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="check">✓</span><b className="ans">{record.ans}</b>
            {fb.status === 'correct' && <span className="tag ok">管理員審核:正確</span>}
            {fb.status === 'incorrect' && <span className="tag bad">管理員審核:需再加強</span>}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>標準參考答案:{record.ref_answer}</div>
        </div>

        <div className="inner">
          <div className="secthead"><span className="num">01</span><div><div className="eyebrow">CONCEPT ANALYSIS</div><b>觀念詳解</b></div></div>
          <Md>{record.reasoning}</Md>
        </div>

        {record.options_analysis?.length > 0 && (
          <div className="inner">
            <div className="secthead"><span className="num">02</span><div><div className="eyebrow">OPTION ANALYSIS</div><b>選項解析</b></div></div>
            <div className="stack">
              {record.options_analysis.map((o, i) => (
                <div key={i} className={`opt ${o.is_correct ? 'ok' : 'bad'}`}>
                  <b>{o.is_correct ? '✔' : '✘'} {o.text || o.option}</b>
                  <Md>{o.explanation}</Md>
                </div>
              ))}
            </div>
          </div>
        )}

        {fb.comment && (
          <div className="inner" style={{ borderColor: '#F59E0B' }}>
            <b style={{ color: '#F59E0B' }}>管理員點評與觀念加強</b>
            <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{fb.comment}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="stack">
      <div className="row results-head">
        <button className="sec" disabled={loading} onClick={onHome}>← 返回解題首頁</button>
        <div style={{ flex: 1, minWidth: 0 }}><div className="eyebrow">SOLVE RESULTS</div><div className="h2">解題結果</div></div>
        <span className="pill">{pill}</span>
      </div>
      <div className="card stack">
        <div className="row">
          <span className="step lg">3</span>
          <div><b style={{ fontSize: 17 }}>解題解析</b><div className="muted">答案 → 觀念詳解 → 選項解析 → 追問</div></div>
        </div>
        {body}
      </div>
    </div>
  );
}
