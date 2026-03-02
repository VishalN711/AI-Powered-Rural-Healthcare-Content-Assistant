import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import ConsultationDetail from './pages/ConsultationDetail';
import ReviewApprove from './pages/ReviewApprove';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
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

export default App;
