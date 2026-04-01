import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import Dashboard from './Dashboard';
import Lists from './Lists';
import ListDetail from './ListDetail';
import ProductDetail from './ProductDetail';
import Alerts from './Alerts';
import Profile from './Profile';
import AddProductModal from '../components/AddProductModal';
import { mockAlerts } from '../data/mockData';

export default function StashdApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const triggeredCount = mockAlerts.filter(a => a.status === 'triggered').length;

  const handleTabChange = (tab) => {
    if (tab === 'add') {
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
        {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
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
        {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
      </>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Dashboard onProductClick={handleProductClick} />;
      case 'lists': return <Lists onListClick={handleListClick} />;
      case 'alerts': return <Alerts />;
      case 'profile': return <Profile />;
      default: return <Dashboard onProductClick={handleProductClick} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} alertCount={triggeredCount} />
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
