import React from 'react'
import '../styles/LandingPage.css'
import { useNavigate } from 'react-router-dom';

function LandingHeader() {

  const navigate = useNavigate();

  const handleClick = ()=> {
    navigate('/login');
  }

  return (
    <div className='LandingHeader'>
        <spam>MyChatClone</spam>
        <button onClick={handleClick}>Get Started</button>
    </div>
  )
}

export default LandingHeader