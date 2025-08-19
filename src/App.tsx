
import React, { useEffect, useState } from 'react';
import { Question } from './types';
import { parseCSV } from './utils/csvParser';
import { parseJSON } from './utils/jsonParser';
// Simple SVG icons for toolbar
const icons = {
  fullscreen: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#fff" strokeWidth="2"/><path d="M6 6V4H4V6" stroke="#fff" strokeWidth="2"/><path d="M14 6V4H16V6" stroke="#fff" strokeWidth="2"/><path d="M6 14V16H4V14" stroke="#fff" strokeWidth="2"/><path d="M14 14V16H16V14" stroke="#fff" strokeWidth="2"/></svg>,
  tutorial: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="2"/><path d="M10 6V10L12 12" stroke="#fff" strokeWidth="2"/></svg>,
  lab: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="5" width="10" height="10" rx="2" stroke="#fff" strokeWidth="2"/></svg>,
  notes: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#fff" strokeWidth="2"/><path d="M6 7H14" stroke="#fff" strokeWidth="2"/><path d="M6 11H14" stroke="#fff" strokeWidth="2"/></svg>,
  calculator: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2"/><circle cx="8" cy="8" r="1" fill="#fff"/><circle cx="12" cy="8" r="1" fill="#fff"/><circle cx="8" cy="12" r="1" fill="#fff"/><circle cx="12" cy="12" r="1" fill="#fff"/></svg>,
  reverse: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#fff" strokeWidth="2"/><path d="M6 10H14" stroke="#fff" strokeWidth="2"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#fff" strokeWidth="2"/><path d="M10 6V10L12 12" stroke="#fff" strokeWidth="2"/></svg>
};

const TOPBAR_HEIGHT = 48;
const BOTTOMBAR_HEIGHT = 32;
const SIDEBAR_WIDTH = 150; // Increased width to accommodate 3 questions per row

const TEXT_SIZES = [14, 16, 18, 20, 22];
const DEFAULT_TEXT_SIZE_INDEX = 2;
const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [striked, setStriked] = useState<string[]>([]);
  const [showReferences, setShowReferences] = useState(false); // Added this line
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedBankFile, setSelectedBankFile] = useState<string>('Volume08Module2October2022.json');
  
  const [textSizeIdx, setTextSizeIdx] = useState<number>(DEFAULT_TEXT_SIZE_INDEX);
  const explanationRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setCurrent(0);
      setSelected(null);
      setShowExplanation(false);
      setStriked([]);
      setAnsweredQuestions({});

      console.log('Attempting to load question bank:', selectedBankFile);
      try {
        const response = await fetch(`/${selectedBankFile}`);
        console.log('Fetch response for', selectedBankFile, ':', response);
        if (!response.ok) throw new Error(`Failed to fetch ${selectedBankFile} (Status: ${response.status})`);

        let data;
        if (selectedBankFile.endsWith('.json')) {
          data = await response.json();
          const questionsArray: Question[] = Object.keys(data).map(id => ({
            id,
            ...data[id],
            explanation: data[id].explanation_html // Map explanation_html to explanation
          }));
          setQuestions(questionsArray);
        } else if (selectedBankFile.endsWith('.csv')) {
          const csvText = await response.text();
          const questionsArray = parseCSV(csvText);
          setQuestions(questionsArray);
        } else {
          throw new Error('Unsupported file type');
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();

    // Disable right click globally except answers/highlighted
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.answer-choice')
      ) {
        return;
      }
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [selectedBankFile]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = ''; // Clean up on unmount
    };
  }, []);

  if (questions.length === 0) return <div>Loading...</div>;

  const q = questions[current];
  const isCorrect = selected === q.correct_answer;

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevQuestion = () => {
    setCurrent(c => Math.max(c - 1, 0));
    setSelected(null);
    setShowExplanation(false);
    setStriked([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setShowExplanation(true);
    setAnsweredQuestions(prev => ({
      ...prev,
      [q.id]: isCorrect ? 'correct' : 'incorrect'
    }));
    explanationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  

  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7f8fa' }}>
      {/* Top Bar */}
      <div style={{ height: TOPBAR_HEIGHT, background: '#23408e', color: '#fff', padding: '0 16px', fontSize: 16, position: 'sticky', top: 0, zIndex: 10, whiteSpace: 'nowrap' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', height: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>Item {current + 1} of {questions.length}</div>
            <select
              style={{ marginLeft: '20px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#23408e' }}
              value={selectedBankFile}
              onChange={(e) => setSelectedBankFile(e.target.value)}
            >
              <option value="Volume08Module2October2022.json">Volume08Module2October2022.json</option>
              <option value="questions.csv">questions.csv</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: current === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} disabled={current === 0} onClick={prevQuestion}>
              &#9664; Previous
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} disabled={current === questions.length - 1} onClick={nextQuestion}>
              Next &#9654;
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setTextSizeIdx(prev => Math.max(0, prev - 1))}
              disabled={textSizeIdx === 0}
              style={{
                background: 'none',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '4px',
                width: '28px',
                height: '28px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              -
            </button>
            <button
              onClick={() => setTextSizeIdx(prev => Math.min(TEXT_SIZES.length - 1, prev + 1))}
              disabled={textSizeIdx === TEXT_SIZES.length - 1}
              style={{
                background: 'none',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '4px',
                width: '28px',
                height: '28px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
            {Object.entries(icons).filter(([key]) => key !== 'zoom').map(([key, icon]) => (
              <div 
                key={key} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: 48,
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
                  }
                }}
              >
                <span title={key}>{icon}</span>
                <span style={{ fontSize: 11, marginTop: 2 }}>{
                  key.charAt(0).toUpperCase() + key.slice(1)
                }</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, gap: '16px', height: `calc(100vh - ${TOPBAR_HEIGHT}px - ${BOTTOMBAR_HEIGHT}px)` }}>
        {/* Sidebar */}
        <div style={{ width: SIDEBAR_WIDTH, background: '#e9ecf2', borderRight: '1px solid #d1d5db', padding: '8px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', alignContent: 'flex-start', position: 'fixed', top: TOPBAR_HEIGHT, left: 0, height: `calc(100vh - ${TOPBAR_HEIGHT}px - ${BOTTOMBAR_HEIGHT}px)` }}>
          {questions.map((_, idx) => (
            <button
              key={idx}
              style={{
                width: 'calc((100% - 24px) / 3)',
                margin: '4px 4px 0px 4px',
                borderRadius: 4,
                background: answeredQuestions[questions[idx].id] === 'correct' ? '#28a745' : (answeredQuestions[questions[idx].id] === 'incorrect' ? '#dc3545' : (idx === current ? '#23408e' : '#fff')),
                color: idx === current ? '#fff' : '#23408e',
                border: '1px solid #23408e',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => {
                setCurrent(idx);
                setSelected(null);
                setShowExplanation(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px 48px', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', marginLeft: `${SIDEBAR_WIDTH + 16}px` }}>
          <div style={{ fontSize: TEXT_SIZES[textSizeIdx], marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Question Id: {q.id}</div>
            <div
              style={{ padding: '4px 0', borderRadius: 4, cursor: 'pointer' }}
              dangerouslySetInnerHTML={{ __html: q.question }}
            ></div>
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
              {q.choices.map((choice, idx) => {
                const optionValue = choice.text;
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
                      {choice.label}. {choice.text}
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
                Correct Answer: {q.correct_answer}
              </p>
              <strong>Explanation:</strong>
              <p
                style={{ padding: '4px 0', borderRadius: 4, cursor: 'pointer', fontSize: TEXT_SIZES[textSizeIdx] }}
                dangerouslySetInnerHTML={{ __html: q.explanation }}
              ></p>

              {q.references && q.references.length > 0 && (
                <button
                  onClick={() => setShowReferences(prev => !prev)}
                  style={{
                    marginTop: 8,
                    background: '#f0f0f0',
                    color: '#23408e',
                    border: '1px solid #23408e',
                    borderRadius: 4,
                    padding: '4px 12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {showReferences ? 'Hide References' : 'Show References'}
                </button>
              )}

              {showReferences && q.references && q.references.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid #d1d5db', paddingTop: 16 }}>
                  <strong>References:</strong>
                  <ul>
                    {q.references.map((ref, index) => (
                      <li key={index} style={{ marginBottom: 4 }}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
          )}
          <button onClick={nextQuestion} disabled={current === questions.length - 1} style={{ background: '#23408e', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, marginTop: 'auto', alignSelf: 'flex-end' }}>
            Next Question
          </button>
        </div>
      </div>
      {/* Bottom Bar */}
      <div style={{ height: 32, background: '#23408e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 14, position: 'fixed', bottom: 0, width: '100%' }}>
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
