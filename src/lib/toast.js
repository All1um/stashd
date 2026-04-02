// src/lib/toast.js
import { toast } from 'sonner';

const baseStyle = {
  background: '#141414',
  border: '1px solid #1E1E1E',
  color: '#F5F0E8',
  fontFamily: 'Inter, sans-serif',
};

const descStyle = {
  fontFamily: 'DM Mono, monospace',
  color: '#D4A853',
};

export const toastSuccess = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: descStyle });

export const toastInfo = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: descStyle });
