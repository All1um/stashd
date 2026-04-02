import { useState, useEffect } from 'react';
import { Plus, Pencil, Check, X } from 'lucide-react';
import { toastSuccess } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

// ── Gold spinner ──────────────────────────────────────────

function GoldSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg width="28" height="28" viewBox="0 0 28 28" className="animate-spin">
        <circle cx="14" cy="14" r="11" fill="none" stroke="#1E1E1E" strokeWidth="2.5" />
        <circle cx="14" cy="14" r="11" fill="none" stroke="#D4A853" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="52 18" />
      </svg>
    </div>
  );
}

const DEFAULT_EMOJIS = ['📦','💻','🎁','🏠','👗','📚','🎮','✈️','🏋️','🎵'];

export default function Lists({ onListClick }) {
  const { user } = useAuth();

  const [lists,       setLists]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editingId,   setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState('');
  const [creating,    setCreating]    = useState(false);
  const [newName,     setNewName]     = useState('');

  // ── Fetch ─────────────────────────────────────────────────

  const fetchLists = async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('lists')
      .select(`
        id, name, emoji, created_at,
        list_items (
          products ( id, image_url, current_price )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    setLists(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLists(); }, [user]);

  // ── Create list ───────────────────────────────────────────

  const handleCreate = async () => {
    const name = newName.trim() || 'New List';
    const emoji = DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];

    const { data, error } = await supabase
      .from('lists')
      .insert({ user_id: user.id, name, emoji })
      .select('id, name, emoji, created_at')
      .single();

    if (!error && data) {
      setLists(prev => [...prev, { ...data, list_items: [] }]);
      toastSuccess('List created', name);
    }
    setCreating(false);
    setNewName('');
  };

  // ── Rename ────────────────────────────────────────────────

  const startEdit = (e, list) => {
    e.stopPropagation();
    setEditingId(list.id);
    setEditingName(list.name);
  };

  const commitEdit = async (listId) => {
    const name = editingName.trim();
    setEditingId(null);
    if (!name) return;

    setLists(prev => prev.map(l => l.id === listId ? { ...l, name } : l));
    await supabase.from('lists').update({ name }).eq('id', listId);
    toastSuccess('List updated', name);
  };

  // ── Helpers ───────────────────────────────────────────────

  const getProducts = (list) =>
    (list.list_items ?? []).map(li => li.products).filter(Boolean);

  const getStats = (list) => {
    const products = getProducts(list);
    return {
      count:      products.length,
      totalValue: products.reduce((s, p) => s + (p.current_price ?? 0), 0),
    };
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      style={{
        background: '#0A0A0A',
        paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
        height: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="px-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          My Lists
        </h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: '#E8652B' }}
        >
          <Plus size={14} color="white" strokeWidth={2.5} />
          <span style={{ color: 'white', fontSize: '13px', fontFamily: 'Inter', fontWeight: 600 }}>New List</span>
        </button>
      </div>

      {/* New list input */}
      {creating && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-2xl"
          style={{ background: '#141414', border: '1px solid #D4A853' }}>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            placeholder="List name…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: '#F5F0E8', fontFamily: 'Inter', fontSize: '15px' }}
          />
          <button type="button" onClick={handleCreate}>
            <Check size={16} color="#D4A853" />
          </button>
          <button type="button" onClick={() => { setCreating(false); setNewName(''); }}>
            <X size={16} color="#6B6B6B" />
          </button>
        </div>
      )}

      {loading ? <GoldSpinner /> : (
        <>
          {lists.length === 0 && !creating ? (
            <div className="text-center py-20">
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
              <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: '8px' }}>
                No lists yet.
              </p>
              <p style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter' }}>
                Create a list to organise your stash.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-40">
              {lists.map((list) => {
                const stats    = getStats(list);
                const products = getProducts(list);
                const thumbs   = products.slice(0, 4);
                const isEditing = editingId === list.id;

                return (
                  <div
                    key={list.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !isEditing && onListClick(list)}
                    onKeyDown={e => e.key === 'Enter' && !isEditing && onListClick(list)}
                    className="rounded-2xl p-4 cursor-pointer active:scale-95 transition-transform"
                    style={{ background: '#141414', border: '1px solid #1E1E1E' }}
                  >
                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-3"
                      style={{ height: '80px' }}>
                      {thumbs.length > 0 ? thumbs.map((p, i) => (
                        p?.image_url
                          ? <img key={i} src={p.image_url} alt="" className="w-full h-full object-cover" style={{ height: '38px' }} />
                          : <div key={i} style={{ background: '#1E1E1E', height: '38px' }} />
                      )) : (
                        <div className="col-span-2 flex items-center justify-center"
                          style={{ height: '80px', background: '#1E1E1E' }}>
                          <span style={{ fontSize: '32px' }}>{list.emoji}</span>
                        </div>
                      )}
                    </div>

                    {/* Name row — editable */}
                    <div className="flex items-center gap-1.5 mb-1" onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '16px' }}>{list.emoji}</span>

                      {isEditing ? (
                        <>
                          <input
                            autoFocus
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onBlur={() => commitEdit(list.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')  commitEdit(list.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 min-w-0 bg-transparent outline-none border-b"
                            style={{ color: '#F5F0E8', fontSize: '15px', fontFamily: 'Inter', fontWeight: 600, borderColor: '#D4A853' }}
                          />
                          <button type="button" onClick={() => commitEdit(list.id)} className="flex-shrink-0">
                            <Check size={14} color="#D4A853" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p style={{ color: '#F5F0E8', fontSize: '15px', fontFamily: 'Inter', fontWeight: 600 }}
                            className="truncate flex-1 min-w-0">
                            {list.name}
                          </p>
                          <button type="button" onClick={e => startEdit(e, list)}
                            className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                            <Pencil size={12} color="#6B6B6B" />
                          </button>
                        </>
                      )}
                    </div>

                    <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter', marginBottom: '4px' }}>
                      {stats.count} {stats.count === 1 ? 'item' : 'items'}
                    </p>
                    <p style={{ color: '#D4A853', fontSize: '14px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                      ${stats.totalValue.toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
