import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ConsultationPage from './ConsultationPage';

function Home() {
  const [joinId, setJoinId] = useState('');
  const navigate = useNavigate();

  function generateMeetingId() {
    // 32-char hex string
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handleCreate = () => {
    const meetingId = generateMeetingId();
    navigate(`/consultation/${meetingId}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      navigate(`/consultation/${joinId.trim()}`);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h2>Welcome to SageCare Consultation</h2>
      <p>To join a meeting, use your unique consultation link.</p>
      <button onClick={handleCreate} style={{ padding: '12px 28px', fontSize: 18, borderRadius: 8, background: '#3498db', color: '#fff', border: 'none', margin: '24px 0', cursor: 'pointer', fontWeight: 600 }}>Create New Meeting</button>
      <div style={{ margin: '32px 0 0 0', padding: 20, background: '#f8f8f8', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
        <form onSubmit={handleJoin}>
          <label htmlFor="join-id" style={{ fontWeight: 500, fontSize: 16 }}>Or join an existing meeting</label>
          <input
            id="join-id"
            type="text"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            placeholder="Enter Meeting ID"
            style={{ width: '100%', padding: 10, margin: '12px 0', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ padding: '10px 22px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Join Meeting</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/consultation/:meetingId" element={<ConsultationPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
export default App;
