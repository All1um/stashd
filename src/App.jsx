import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Home from '@/pages/Home.jsx';
import { AuthProvider } from '@/lib/AuthContext';

function App() {
  return (
    <AuthProvider>
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <Sonner
        theme="dark"
        toastOptions={{
          style: {
            background: '#141414',
            border: '1px solid #1E1E1E',
            color: '#F5F0E8',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
