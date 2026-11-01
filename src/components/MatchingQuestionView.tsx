import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { RotateCcw, Link2, Check, X } from 'lucide-react';
import { parseMatchingAnswer, serializeMatchingAnswer } from '../utils/cbtLogic';

interface MatchingQuestionViewProps {
  questionId: string;
  leftItems: string[];
  rightItems: string[];
  value: string | undefined; // serialized "0-1,1-2"
  onChange: (val: string) => void;
}

interface LineCoordinates {
  leftKey: string;
  rightKey: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const MatchingQuestionView: React.FC<MatchingQuestionViewProps> = ({
  questionId,
  leftItems,
  rightItems,
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const matches = parseMatchingAnswer(value);
  const [activeLeftIdx, setActiveLeftIdx] = useState<number | null>(null);
  const [lines, setLines] = useState<LineCoordinates[]>([]);

  // Function to calculate line coordinates
  const calculateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: LineCoordinates[] = [];

    Object.entries(matches).forEach(([lIdx, rIdx]) => {
      const leftEl = leftItemRefs.current[lIdx];
      const rightEl = rightItemRefs.current[rIdx];

      if (leftEl && rightEl) {
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();

        const x1 = lRect.right - containerRect.left;
        const y1 = lRect.top + lRect.height / 2 - containerRect.top;
        const x2 = rRect.left - containerRect.left;
        const y2 = rRect.top + rRect.height / 2 - containerRect.top;

        newLines.push({
          leftKey: lIdx,
          rightKey: rIdx,
          x1,
          y1,
          x2,
          y2,
        });
      }
    });

    setLines(newLines);
  };

  useLayoutEffect(() => {
    calculateLines();
  }, [value, leftItems, rightItems]);

  useEffect(() => {
    const handleResize = () => calculateLines();
    window.addEventListener('resize', handleResize);
    // Slight delay for font/layout settle
    const timer = setTimeout(calculateLines, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [value]);

  const handleLeftClick = (idx: number) => {
    if (matches[String(idx)] !== undefined) {
      // Disconnect if already connected
      const nextMatches = { ...matches };
      delete nextMatches[String(idx)];
      onChange(serializeMatchingAnswer(nextMatches));
      if (activeLeftIdx === idx) setActiveLeftIdx(null);
    } else {
      // Set as active selection
      setActiveLeftIdx(idx === activeLeftIdx ? null : idx);
    }
  };

  const handleRightClick = (idx: number) => {
    if (activeLeftIdx !== null) {
      const nextMatches = { ...matches };
      // If another left item was connected to this right item, remove that old connection
      Object.keys(nextMatches).forEach((k) => {
        if (nextMatches[k] === String(idx)) {
          delete nextMatches[k];
        }
      });
      // Set new connection
      nextMatches[String(activeLeftIdx)] = String(idx);
      onChange(serializeMatchingAnswer(nextMatches));
      setActiveLeftIdx(null);
    } else {
      // If no active left item, check if this right item is connected and disconnect it
      const connectedLeft = Object.keys(matches).find((k) => matches[k] === String(idx));
      if (connectedLeft !== undefined) {
        const nextMatches = { ...matches };
        delete nextMatches[connectedLeft];
        onChange(serializeMatchingAnswer(nextMatches));
      }
    }
  };

  const handleReset = () => {
    setActiveLeftIdx(null);
    onChange('');
  };

  const totalPairs = Object.keys(matches).length;

  return (
    <div className="mt-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-gray-700">
            Hubungkan Butir Kiri ke Kanan
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {totalPairs} Terhubung
          </span>
        </div>

        {totalPairs > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hapus Semua Garis</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4 italic">
        💡 Klik salah satu butir di kolom <b>KIRI</b>, lalu klik pasangan yang sesuai di kolom <b>KANAN</b> untuk menarik garis. Klik kembali untuk membatalkan.
      </p>

      {/* Matching Columns & SVG Container */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-r from-blue-50/20 via-transparent to-blue-50/20 rounded-2xl p-4 sm:p-6 border border-gray-200/90 flex justify-between gap-6 sm:gap-12 min-h-[220px]"
      >
        {/* SVG Canvas for Lines */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          {lines.map((line) => (
            <g key={`${line.leftKey}-${line.rightKey}`}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Endpoint dots */}
              <circle cx={line.x1} cy={line.y1} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <circle cx={line.x2} cy={line.y2} r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
            </g>
          ))}
        </svg>

        {/* Kolom Kiri */}
        <div className="flex flex-col gap-4 z-20 w-[45%]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
            Pernyataan (Kiri)
          </span>
          {leftItems.map((item, idx) => {
            const isConnected = matches[String(idx)] !== undefined;
            const isSelected = activeLeftIdx === idx;

            return (
              <div
                key={`left-${idx}`}
                data-testid={`match-left-${idx}`}
                data-match-left={idx}
                ref={(el) => {
                  leftItemRefs.current[String(idx)] = el;
                }}
                onClick={() => handleLeftClick(idx)}
                className={`relative px-4 py-3 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between shadow-xs select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300 scale-[1.02]'
                    : isConnected
                    ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold'
                    : 'border-amber-700/60 bg-white hover:bg-amber-50/40 text-gray-800 hover:border-amber-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-200/80 text-[11px] font-bold flex items-center justify-center text-gray-700">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>

                <div className="ml-2 shrink-0">
                  {isConnected ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : isSelected ? (
                    <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border-2 border-gray-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-4 z-20 w-[45%]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
            Pilihan Pasangan (Kanan)
          </span>
          {rightItems.map((item, idx) => {
            const isConnected = Object.values(matches).includes(String(idx));

            return (
              <div
                key={`right-${idx}`}
                data-testid={`match-right-${idx}`}
                data-match-right={idx}
                ref={(el) => {
                  rightItemRefs.current[String(idx)] = el;
                }}
                onClick={() => handleRightClick(idx)}
                className={`relative px-4 py-3 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between shadow-xs select-none ${
                  isConnected
                    ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold'
                    : activeLeftIdx !== null
                    ? 'border-blue-400 bg-white hover:bg-blue-50/70 text-blue-900 border-dashed animate-pulse'
                    : 'border-amber-700/60 bg-white hover:bg-amber-50/40 text-gray-800 hover:border-amber-700'
                }`}
              >
                <div className="shrink-0 mr-2">
                  {isConnected ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border-2 border-gray-400" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-right justify-end w-full">
                  <span>{item}</span>
                  <span className="w-5 h-5 rounded-full bg-gray-200/80 text-[11px] font-bold flex items-center justify-center text-gray-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
