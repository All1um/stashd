// src/lib/toast.jsx
import { toast } from 'sonner';

const baseStyle = {
  background: '#141414',
  border: '1px solid #1E1E1E',
  color: '#F5F0E8',
  fontFamily: 'Inter, sans-serif',
};

const Desc = ({ text }) => (
  <span style={{ fontFamily: 'DM Mono, monospace', color: '#D4A853' }}>{text}</span>
);

/** Success toast — gold DM Mono description */
export const toastSuccess = (title, description) =>
  toast(title, {
    description: description ? <Desc text={description} /> : undefined,
    style: baseStyle,
  });

/** Info/neutral toast — gold DM Mono description */
export const toastInfo = (title, description) =>
  toast(title, {
    description: description ? <Desc text={description} /> : undefined,
    style: baseStyle,
  });
