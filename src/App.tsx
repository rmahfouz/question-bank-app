
import React, { useEffect, useState } from 'react';
import { Question } from './types';
import { parseCSV } from './utils/csvParser';
// Simple SVG icons for toolbar
const icons = {
  fullscreen: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#fff" strokeWidth="2"/><path d="M6 6V4H4V6" stroke="#fff" strokeWidth="2"/><path d="M14 6V4H16V6" stroke="#fff" strokeWidth="2"/><path d="M6 14V16H4V14" stroke="#fff" strokeWidth="2"/><path d="M14 14V16H16V14" stroke="#fff" strokeWidth="2"/></svg>,
  textSize: <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 12, fontWeight: 'bold' }}>A</span>
    <span style={{ fontSize: 20, fontWeight: 'bold' }}>A</span>
  </div>,
  tutorial: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="2"/><path d="M10 6V10L12 12" stroke="#fff" strokeWidth="2"/></svg>,
  lab: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="5" width="10" height="10" rx="2" stroke="#fff" strokeWidth="2"/></svg>,
  notes: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#fff" strokeWidth="2"/><path d="M6 7H14" stroke="#fff" strokeWidth="2"/><path d="M6 11H14" stroke="#fff" strokeWidth="2"/></svg>,
  calculator: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2"/><circle cx="8" cy="8" r="1" fill="#fff"/><circle cx="12" cy="8" r="1" fill="#fff"/><circle cx="8" cy="12" r="1" fill="#fff"/><circle cx="12" cy="12" r="1" fill="#fff"/></svg>,
  reverse: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#fff" strokeWidth="2"/><path d="M6 10H14" stroke="#fff" strokeWidth="2"/></svg>,
  zoom: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#fff" strokeWidth="2"/><path d="M15 15L12.5 12.5" stroke="#fff" strokeWidth="2"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#fff" strokeWidth="2"/><path d="M10 6V10L12 12" stroke="#fff" strokeWidth="2"/></svg>
};

const TOPBAR_HEIGHT = 48;
const SIDEBAR_WIDTH = 80;

const TEXT_SIZES = [14, 16, 18, 20, 22];
const DEFAULT_TEXT_SIZE_INDEX = 2;
const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [striked, setStriked] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<{start: number, end: number}[]>([]);
  const [explanationHighlights, setExplanationHighlights] = useState<{start: number, end: number}[]>([]);
  const [textSizeIdx, setTextSizeIdx] = useState<number>(DEFAULT_TEXT_SIZE_INDEX);
  const explanationRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/questions.csv')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch questions');
        return res.text();
      })
      .then(data => {
        const parsed = parseCSV(data);
        setQuestions(parsed);
      })
      .catch(error => {
        console.error('Error loading questions:', error);
      });
    // Disable right click globally except answers/highlighted
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.answer-choice') ||
        target.closest('.highlighted-text')
      ) {
        return;
      }
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (questions.length === 0) return <div>Loading...</div>;

  const q = questions[current];
  const isCorrect = selected === q.correct_option;

  // Left click: select answer, do not submit
  const handleSelect = (option: string) => {
    setSelected(option);
    setStriked(prev => prev.filter(o => o !== option));
  };

  // Strike out choice by right click
  const handleStrike = (e: React.MouseEvent, option: string) => {
    e.preventDefault();
    setStriked(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const nextQuestion = () => {
    setCurrent(c => Math.min(c + 1, questions.length - 1));
    setSelected(null);
    setShowExplanation(false);
    setStriked([]);
    setHighlights([]);
    setExplanationHighlights([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevQuestion = () => {
    setCurrent(c => Math.max(c - 1, 0));
    setSelected(null);
    setShowExplanation(false);
    setStriked([]);
    setHighlights([]);
    setExplanationHighlights([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setShowExplanation(true);
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Highlight text by click and drag
  const handleHighlight = (e: React.MouseEvent<HTMLDivElement>, text: string, type: 'question' | 'explanation' = 'question') => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(e.currentTarget);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = text.indexOf(selectedText, preSelectionRange.toString().length);
    
    if (start === -1) return;

    if (type === 'question') {
      setHighlights(prev => [...prev, { start, end: start + selectedText.length }]);
    } else {
      setExplanationHighlights(prev => [...prev, { start, end: start + selectedText.length }]);
    }
    selection.removeAllRanges();
  };

  // Render highlighted text
  const renderHighlighted = (text: string, highlightsArray: {start: number, end: number}[] = highlights) => {
    if (highlightsArray.length === 0) return text;
    let parts: (string | JSX.Element)[] = [];
    let last = 0;
    highlightsArray.forEach(({ start, end }, i) => {
      if (start > last) parts.push(text.slice(last, start));
      parts.push(<span key={i} className="highlighted-text" style={{ background: '#ffe066' }}>{text.slice(start, end)}</span>);
      last = end;
    });
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7f8fa' }}>
      {/* Top Bar */}
      <div style={{ height: TOPBAR_HEIGHT, background: '#23408e', color: '#fff', padding: '0 16px', fontSize: 16, position: 'sticky', top: 0, zIndex: 10, whiteSpace: 'nowrap' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', height: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontWeight: 600 }}>Item {current + 1} of {questions.length}</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: current === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} disabled={current === 0} onClick={prevQuestion}>
              &#9664; Previous
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} disabled={current === questions.length - 1} onClick={nextQuestion}>
              Next &#9654;
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
            {Object.entries(icons).map(([key, icon]) => (
              <div 
                key={key} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: key === 'textSize' ? 60 : 48,
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => {
                  if (key === 'fullscreen') {
                    if (!isFullscreen) {
                      document.documentElement.requestFullscreen();
                    } else {
                      document.exitFullscreen();
                    }
                    setIsFullscreen(!isFullscreen);
                  } else if (key === 'textSize') {
                    setTextSizeIdx(idx => Math.min(TEXT_SIZES.length - 1, idx + 1));
                  }
                }}
              >
                <span title={key}>{icon}</span>
                <span style={{ fontSize: 11, marginTop: 2 }}>{
                  key === 'textSize' ? 'Text Size' : key.charAt(0).toUpperCase() + key.slice(1)
                }</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: SIDEBAR_WIDTH, background: '#e9ecf2', borderRight: '1px solid #d1d5db', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {questions.map((_, idx) => (
            <button
              key={idx}
              style={{
                width: 40,
                height: 40,
                margin: '4px 0',
                borderRadius: 4,
                background: idx === current ? '#23408e' : '#fff',
                color: idx === current ? '#fff' : '#23408e',
                border: '1px solid #23408e',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => {
                setCurrent(idx);
                setSelected(null);
                setShowExplanation(false);
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px 48px', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontSize: TEXT_SIZES[textSizeIdx], marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Question Id: {q.id}</div>
            <div
              style={{ padding: '4px 0', borderRadius: 4, cursor: 'pointer' }}
              onMouseUp={e => handleHighlight(e, q.question)}
              className="highlighted-text"
            >
              {renderHighlighted(q.question)}
            </div>
          </div>
          {/* Image only if present */}
          {q.imageUrl && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 320, height: 320, background: '#fff', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ccc' }}>
                <img src={q.imageUrl} alt="Fundus photo of retina" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, color: '#23408e', fontWeight: 500 }}>Fundus photo of retina</div>
            </div>
          )}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Which of the following is the most likely cause of this patient's condition?</div>
            <div style={{ border: '1px solid #23408e', borderRadius: 4, padding: 16, background: '#f7f8fa' }}>
              {[q.option1, q.option2, q.option3, q.option4].map((opt, idx) => {
                const optionValue = String(idx + 1);
                const isStriked = striked.includes(optionValue);
                return (
                  <div key={idx} style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                    <label
                      className="answer-choice"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: selected ? 'not-allowed' : 'pointer',
                        textDecoration: isStriked ? 'line-through' : 'none',
                        color: isStriked ? '#aaa' : 'inherit',
                        flex: 1,
                        fontSize: TEXT_SIZES[textSizeIdx]
                      }}
                      onContextMenu={e => handleStrike(e, optionValue)}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={optionValue}
                        checked={selected === optionValue}
                        disabled={!!showExplanation}
                        onChange={() => handleSelect(optionValue)}
                        style={{ marginRight: 8 }}
                      />
                      {String.fromCharCode(65 + idx)}. {opt}
                    </label>
                  </div>
                );
              })}
            </div>
            {/* ...existing code... */}
            <button
              style={{ marginTop: 16, background: '#23408e', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}
              disabled={!selected || showExplanation}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          {showExplanation && (
            <div ref={explanationRef} style={{ marginTop: 20, border: '1px solid #d1d5db', borderRadius: 4, padding: 16, background: '#f7f8fa' }}>
              <h3 style={{ color: isCorrect ? '#28a745' : '#dc3545', marginBottom: 10 }}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </h3>
              <p style={{ fontWeight: 'bold', marginBottom: 10 }}>
                Correct Answer: {q.correct_option}
              </p>
              <strong>Explanation:</strong>
              <p
                className="highlighted-text"
                style={{ padding: '4px 0', borderRadius: 4, cursor: 'pointer', fontSize: TEXT_SIZES[textSizeIdx] }}
                onMouseUp={e => handleHighlight(e, q.explanation, 'explanation')}
              >
                {renderHighlighted(q.explanation, explanationHighlights)}
              </p>
              <button onClick={nextQuestion} disabled={current === questions.length - 1} style={{ background: '#23408e', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, marginTop: 8 }}>
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Bar */}
      <div style={{ height: 32, background: '#23408e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 14 }}>
        <span>Block Time Elapsed: 00:14:23</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Medical Library</span>
          <span>My Notebook</span>
          <span>Flashcards</span>
          <span>Feedback</span>
          <span>Suspend</span>
          <span style={{ color: 'red' }}>End Block</span>
        </div>
      </div>
    </div>
  );
};

export default App;
