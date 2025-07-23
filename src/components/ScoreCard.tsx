import React, { useState } from 'react';

interface ScoreCardProps {
  label: string;
  value: number | null;
  target: number;
  unit?: string;
  editable?: boolean;
  onChange?: (newValue: number | null) => void;
}

const getPercent = (value: number | null, target: number) => {
  if (value === null || target === 0) return 0;
  return Math.round((value / target) * 100);
};

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, target, unit, editable, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value === null ? '' : value.toString());

  const percent = value === null ? 0 : Math.round((value / target) * 100);
  const over100 = percent > 100;
  const displayPercent = value === null ? 'No data' : `${percent}%`;

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setInputValue(value === null ? '' : value.toString());
  };
  const handleSave = () => {
    const newValue = inputValue === '' ? null : Number(inputValue);
    if (onChange) onChange(newValue);
    setEditing(false);
  };

  return (
    <div className="scorecard">
      <div className="scorecard-circle" style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width="120" height="120">
          <circle
            cx="60" cy="60" r="54"
            stroke="#e5e7eb" strokeWidth="12" fill="none"
          />
          <circle
            cx="60" cy="60" r="54"
            stroke={value === null ? '#d1d5db' : over100 ? '#a3e635' : '#22c55e'}
            strokeWidth="12"
            fill="none"
            strokeDasharray={339.292}
            strokeDashoffset={value === null ? 339.292 : 339.292 - (Math.min(percent, 100) / 100) * 339.292}
            style={{ transition: 'stroke-dashoffset 0.5s' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="scorecard-center" style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {editing ? (
            <>
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{ width: 60, textAlign: 'center', fontSize: 18 }}
                min={0}
              />
              <div style={{ marginTop: 4 }}>
                <button className="btn btn-xs btn-primary" onClick={handleSave}>Save</button>
                <button className="btn btn-xs btn-secondary" onClick={handleCancel} style={{ marginLeft: 4 }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 24, fontWeight: 600, color: value === null ? '#a3e635' : over100 ? '#a3e635' : '#22c55e' }}>
                {value === null ? 'No data' : `${percent}%`}
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#222' }}>
                {value === null ? '' : `${value}${unit ? ` ${unit}` : ''}`}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {value === null ? '' : `of ${target}${unit ? ` ${unit}` : ''}`}
              </div>
              {editable && (
                <button className="btn btn-xs btn-link" style={{ marginTop: 4 }} onClick={handleEdit}>Edit</button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="scorecard-label" style={{ textAlign: 'center', marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

export default ScoreCard; 