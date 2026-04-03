import { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import Dashboard from './Dashboard';
import Discovery from './Discovery';
import Lists from './Lists';
import ListDetail from './ListDetail';
import ProductDetail from './ProductDetail';
import Alerts from './Alerts';
import Profile from './Profile';
import AddProductModal from '../components/AddProductModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export default function StashdApp() {
  const { user } = useAuth();
  const [activeTab,      setActiveTab]      = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedList,   setSelectedList]   = useState(null);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState(null);
  const [triggeredCount, setTriggeredCount] = useState(0);

  useEffect(() => {
    if (!user) { setTriggeredCount(0); return; }
    supabase
      .from('price_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_triggered', true)
      .then(({ count }) => setTriggeredCount(count ?? 0));
  }, [user]);

  const handleStash = (result) => {
    setAddModalPrefill({
      url:   result.product_url || result.link || null,
      name:  result.title       || null,
      price: result.price       ?? null,
      store: result.store       || null,
      image: result.image_url   || null,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setAddModalPrefill(null);
  };

  const handleTabChange = (tab) => {
    if (tab === 'add') {
      setAddModalPrefill(null);
      setShowAddModal(true);
      return;
    }
    setActiveTab(tab);
    setSelectedProduct(null);
    setSelectedList(null);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleProductBack = () => {
    setSelectedProduct(null);
  };

  const handleListClick = (list) => {
    setSelectedList(list);
  };

  const handleListBack = () => {
    setSelectedList(null);
  };

  if (selectedProduct) {
    return (
      <>
        <ProductDetail product={selectedProduct} onBack={handleProductBack} />
        {showAddModal && <AddProductModal onClose={handleCloseModal} prefill={addModalPrefill} />}
      </>
    );
  }

  if (selectedList && activeTab === 'lists') {
    return (
      <>
        <ListDetail
          list={selectedList}
          onBack={handleListBack}
          onProductClick={handleProductClick}
        />
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} alertCount={triggeredCount} />
        {showAddModal && <AddProductModal onClose={handleCloseModal} prefill={addModalPrefill} />}
      </>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':     return <Dashboard onProductClick={handleProductClick} onNavigate={handleTabChange} />;
      case 'discover': return <Discovery onProductClick={handleProductClick} onStash={handleStash} />;
      case 'lists':    return <Lists onListClick={handleListClick} />;
      case 'alerts':   return <Alerts />;
      case 'profile':  return <Profile />;
      default:         return <Dashboard onProductClick={handleProductClick} onNavigate={handleTabChange} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} alertCount={triggeredCount} />
      {showAddModal && <AddProductModal onClose={handleCloseModal} prefill={addModalPrefill} />}
    </>
  );
}
