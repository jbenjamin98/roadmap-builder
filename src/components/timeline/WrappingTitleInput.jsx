import { useRef, useLayoutEffect } from 'react';
import { NO_WORD_BREAK } from '../styleHelpers';

export default function WrappingTitleInput({ value, onChange, className, style }) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      style={{ ...NO_WORD_BREAK, ...style }}
      className={`resize-none overflow-hidden whitespace-normal leading-snug ${className}`}
    />
  );
}
