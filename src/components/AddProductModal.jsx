import { useState } from 'react';
import { X, Link, Loader2, Bell } from 'lucide-react';
import { mockLists } from '../data/mockData';

const MOCK_PREVIEW = {
  name: "Apple Watch Series 9 (GPS, 45mm)",
  price: 329.00,
  store: "Apple",
  image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop"
};

export default function AddProductModal({ onClose }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedList, setSelectedList] = useState(1);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [manual, setManual] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', price: '', store: '', image: '' });

  const handleUrlChange = (val) => {
    setUrl(val);
    if (val.startsWith('http') && val.length > 15) {
      setLoading(true);
      setPreview(null);
      setTimeout(() => {
        setLoading(false);
        setPreview(MOCK_PREVIEW);
      }, 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-t-3xl pb-safe animate-slide-up"
        style={{
          background: '#141414',
          border: '1px solid #1E1E1E',
          maxHeight: '90vh',
          overflowY: 'auto',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))'
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: '#2E2E2E' }} />
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#F5F0E8', fontSize: '20px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Add to Stashd
            </h2>
            <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: '#1E1E1E' }}>
              <X size={16} color="#6B6B6B" />
            </button>
          </div>

          {!manual ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
                style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
                <Link size={16} color="#6B6B6B" />
                <input
                  autoFocus
                  value={url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="Paste product URL..."
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: '#F5F0E8', fontFamily: 'Inter', fontSize: '15px' }}
                />
                {loading && <Loader2 size={16} color="#D4A853" className="animate-spin" />}
              </div>

              {preview && (
                <div className="flex gap-3 p-3 rounded-2xl mb-4 animate-fade-in" style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
                  <img src={preview.image} alt={preview.name} className="rounded-xl object-cover flex-shrink-0"
                    style={{ width: '60px', height: '60px' }} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                      {preview.name}
                    </p>
                    <span style={{
                      background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
                      fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                      fontFamily: 'Inter', fontWeight: 500, display: 'inline-block', marginTop: '3px'
                    }}>
                      {preview.store}
                    </span>
                    <p style={{ color: '#D4A853', fontSize: '16px', fontFamily: 'DM Mono, monospace', fontWeight: 500, marginTop: '3px' }}>
                      ${preview.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 mb-4 animate-fade-in">
              {[
                { key: 'name', placeholder: 'Product name', type: 'text' },
                { key: 'price', placeholder: 'Price (e.g. 29.99)', type: 'number' },
                { key: 'store', placeholder: 'Store name', type: 'text' },
                { key: 'image', placeholder: 'Image URL (optional)', type: 'text' },
              ].map(field => (
                <input key={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={manualForm[field.key]}
                  onChange={e => setManualForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{ background: '#1E1E1E', border: '1px solid #2E2E2E', color: '#F5F0E8', fontFamily: 'Inter', fontSize: '15px' }}
                />
              ))}
            </div>
          )}

          <div className="mb-3">
            <p className="mb-2" style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500 }}>Save to</p>
            <div className="flex gap-2 flex-wrap">
              {mockLists.map(list => (
                <button type="button" key={list.id} onClick={() => setSelectedList(list.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all"
                  style={{
                    background: selectedList === list.id ? 'rgba(212, 168, 83, 0.15)' : '#1E1E1E',
                    border: `1px solid ${selectedList === list.id ? '#D4A853' : '#2E2E2E'}`,
                    color: selectedList === list.id ? '#D4A853' : '#6B6B6B',
                    fontSize: '13px', fontFamily: 'Inter', fontWeight: selectedList === list.id ? 600 : 400
                  }}>
                  {list.emoji} {list.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl mb-4"
            style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
            <div className="flex items-center gap-2">
              <Bell size={15} color={alertEnabled ? '#D4A853' : '#6B6B6B'} />
              <span style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>Set price alert</span>
            </div>
            <button type="button" onClick={() => setAlertEnabled(!alertEnabled)}
              className="relative w-11 h-6 rounded-full transition-all"
              style={{ background: alertEnabled ? '#D4A853' : '#2E2E2E' }}>
              <div className="absolute top-0.5 transition-all w-5 h-5 rounded-full"
                style={{ background: 'white', left: alertEnabled ? '24px' : '2px' }} />
            </button>
          </div>

          {alertEnabled && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 animate-fade-in"
              style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
              <span style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '16px' }}>$</span>
              <input
                type="number"
                value={alertPrice}
                onChange={e => setAlertPrice(e.target.value)}
                placeholder="Alert me when below..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: '#F5F0E8', fontFamily: 'DM Mono, monospace', fontSize: '15px' }}
              />
            </div>
          )}

          <button type="button" onClick={onClose}
            className="w-full py-4 rounded-2xl transition-opacity active:opacity-80 mb-3"
            style={{ background: '#E8652B', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: '16px' }}>
            Save to Stashd
          </button>

          <button type="button"
            onClick={() => setManual(!manual)}
            style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter', display: 'block', textAlign: 'center', width: '100%' }}
          >
            {manual ? 'Use URL instead' : 'Add Manually'}
          </button>
        </div>
      </div>
    </div>
  );
}
