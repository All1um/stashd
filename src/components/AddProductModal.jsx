import { useState, useEffect } from 'react';
import { X, Link, Bell } from 'lucide-react';
import { toastSuccess, toastInfo } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

function GoldSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin flex-shrink-0">
      <circle cx="10" cy="10" r="8" fill="none" stroke="#2E2E2E" strokeWidth="2.5" />
      <circle cx="10" cy="10" r="8" fill="none" stroke="#D4A853" strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray="38 14" />
    </svg>
  );
}

export default function AddProductModal({ onClose, prefill = null }) {
  const { user } = useAuth();

  const [lists,        setLists]        = useState([]);
  const [url,          setUrl]          = useState(prefill?.url ?? '');
  const [scraping,     setScraping]     = useState(false);
  const [scrapeError,  setScrapeError]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [preview,      setPreview]      = useState(
    prefill ? { name: prefill.name, price: prefill.price, store: prefill.store, image: prefill.image, crossStorePrices: [] } : null
  );
  const [selectedList, setSelectedList] = useState(null);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertPrice,   setAlertPrice]   = useState('');
  const [manual,       setManual]       = useState(false);
  const [manualForm,   setManualForm]   = useState({ name: '', price: '', store: '', url: '', image: '' });

  // ── Fetch user's lists ────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    supabase
      .from('lists')
      .select('id, name, emoji')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const rows = data ?? [];
        setLists(rows);
        if (rows.length > 0) setSelectedList(rows[0].id);
      });
  }, [user]);

  // ── URL scrape ────────────────────────────────────────────

  const handleUrlChange = async (val) => {
    setUrl(val);
    setScrapeError('');

    if (!val.startsWith('http') || val.length < 16) return;

    setScraping(true);
    setPreview(null);

    const { data, error } = await supabase.functions.invoke('scrape-product', {
      body: { url: val, country_code: user?.profile?.country_code ?? 'CA' },
    });

    setScraping(false);

    if (error || data?.error) {
      setScrapeError(
        typeof (error || data?.error) === 'string'
          ? (error || data?.error)
          : 'Could not extract product. Try adding manually.'
      );
      return;
    }

    setPreview({
      name:             data.name,
      price:            data.price,
      store:            data.store_name,
      image:            data.image_url,
      crossStorePrices: data.crossStorePrices ?? [],
    });
  };

  // ── Save to Supabase ──────────────────────────────────────

  const handleSave = async () => {
    const name  = manual ? manualForm.name  : preview?.name;
    const price = manual ? manualForm.price : preview?.price;

    if (!name || !price) {
      toastInfo('Missing info', 'Add a product name and price first.');
      return;
    }

    if (!user) {
      toastInfo('Sign in required', 'Create a Stashd account to save products.');
      return;
    }

    setSaving(true);

    const parsedPrice = parseFloat(price);

    const { data: productRow, error: productError } = await supabase
      .from('products')
      .insert({
        user_id:        user.id,
        name:           manual ? manualForm.name              : preview.name,
        url:            manual ? (manualForm.url   || null)   : (url || null),
        image_url:      manual ? (manualForm.image || null)   : (preview.image  || null),
        store_name:     manual ? (manualForm.store || null)   : (preview.store  || null),
        original_price: parsedPrice,
        current_price:  parsedPrice,
        lowest_price:   parsedPrice,
      })
      .select('id')
      .single();

    if (productError || !productRow) {
      setSaving(false);
      toastInfo('Could not save', productError?.message ?? 'Unknown error');
      return;
    }

    const productId = productRow.id;

    // Link product to selected list
    if (selectedList) {
      await supabase.from('list_items').insert({
        list_id:    selectedList,
        product_id: productId,
      });
    }

    // Seed initial price history point
    await supabase.from('price_history').insert({
      product_id: productId,
      price:      parsedPrice,
    });

    // Create price alert if enabled
    if (alertEnabled && alertPrice && parseFloat(alertPrice) > 0) {
      await supabase.from('price_alerts').upsert({
        user_id:      user.id,
        product_id:   productId,
        target_price: parseFloat(alertPrice),
        alert_type:   'price',
      }, { onConflict: 'user_id,product_id' });
    }

    setSaving(false);

    toastSuccess('Saved to Stashd', name);

    onClose();
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-t-3xl animate-slide-up"
        style={{
          background: '#141414',
          border: '1px solid #1E1E1E',
          maxHeight: '90vh',
          overflowY: 'auto',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
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
              {/* URL input */}
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-2"
                style={{ background: '#1E1E1E', border: `1px solid ${scrapeError ? '#E74C3C' : '#2E2E2E'}` }}>
                <Link size={16} color="#6B6B6B" />
                <input
                  autoFocus
                  value={url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="Paste product URL..."
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: '#F5F0E8', fontFamily: 'Inter', fontSize: '15px' }}
                />
                {scraping && <GoldSpinner />}
              </div>

              {scrapeError && (
                <p className="mb-3" style={{ color: '#E74C3C', fontSize: '12px', fontFamily: 'Inter', paddingLeft: '4px' }}>
                  {scrapeError}
                </p>
              )}

              {scraping && !preview && (
                <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                  style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
                  <GoldSpinner />
                  <p style={{ color: '#6B6B6B', fontFamily: 'DM Mono, monospace', fontSize: '12px', letterSpacing: '0.06em' }}>
                    Extracting product data…
                  </p>
                </div>
              )}

              {preview && (
                <div className="flex gap-3 p-3 rounded-2xl mb-4 animate-fade-in"
                  style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
                  {preview.image && (
                    <img src={preview.image} alt={preview.name}
                      className="rounded-xl object-cover flex-shrink-0"
                      style={{ width: '60px', height: '60px' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                      {preview.name}
                    </p>
                    {preview.store && (
                      <span style={{
                        background: 'rgba(212,168,83,0.1)', color: '#D4A853',
                        fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                        fontFamily: 'Inter', fontWeight: 500, display: 'inline-block', marginTop: '3px',
                      }}>
                        {preview.store}
                      </span>
                    )}
                    {preview.price != null && (
                      <p style={{ color: '#D4A853', fontSize: '16px', fontFamily: 'DM Mono, monospace', fontWeight: 500, marginTop: '3px' }}>
                        ${Number(preview.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 mb-4 animate-fade-in">
              {[
                { key: 'name',  placeholder: 'Product name',           type: 'text'   },
                { key: 'price', placeholder: 'Price (e.g. 29.99)',     type: 'number' },
                { key: 'store', placeholder: 'Store name',             type: 'text'   },
                { key: 'url',   placeholder: 'Product URL (optional)', type: 'text'   },
                { key: 'image', placeholder: 'Image URL (optional)',   type: 'text'   },
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

          {/* List selector */}
          {lists.length > 0 && (
            <div className="mb-3">
              <p className="mb-2" style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500 }}>Save to</p>
              <div className="flex gap-2 flex-wrap">
                {lists.map(list => (
                  <button type="button" key={list.id} onClick={() => setSelectedList(list.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all"
                    style={{
                      background: selectedList === list.id ? 'rgba(212,168,83,0.15)' : '#1E1E1E',
                      border: `1px solid ${selectedList === list.id ? '#D4A853' : '#2E2E2E'}`,
                      color: selectedList === list.id ? '#D4A853' : '#6B6B6B',
                      fontSize: '13px', fontFamily: 'Inter', fontWeight: selectedList === list.id ? 600 : 400,
                    }}>
                    {list.emoji} {list.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alert toggle */}
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

          {/* Save CTA */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || scraping}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80 mb-3 disabled:opacity-50"
            style={{ background: '#E8652B', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: '16px' }}
          >
            {saving ? (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" className="animate-spin">
                  <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <circle cx="9" cy="9" r="7" fill="none" stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeDasharray="33 10" />
                </svg>
                Saving…
              </>
            ) : 'Save to Stashd'}
          </button>

          <button type="button"
            onClick={() => { setManual(!manual); setScrapeError(''); }}
            style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter', display: 'block', textAlign: 'center', width: '100%' }}
          >
            {manual ? 'Use URL instead' : 'Add Manually'}
          </button>
        </div>
      </div>
    </div>
  );
}
