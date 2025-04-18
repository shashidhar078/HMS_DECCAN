import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AwaitingApproval.css';

const AwaitingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="approval-container">
      <div className="approval-card">
        <h2>Registration Submitted</h2>
        <p>Your account is pending admin approval. You'll receive an email once your account is approved.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </div>
  );
};

export default AwaitingApproval;