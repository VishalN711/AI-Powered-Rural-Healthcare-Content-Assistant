import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import ConsultationDetail from './pages/ConsultationDetail';
import ReviewApprove from './pages/ReviewApprove';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewConsultation />} />
            <Route path="/consultation/:id" element={<ConsultationDetail />} />
            <Route path="/review/:id" element={<ReviewApprove />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
