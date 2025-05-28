import React from 'react'
import '../styles/LandingPage.css'
import LandingHeader from '../components/LandingHeader'
import LandingContainer from '../components/LandingContainer'

function LandingPage() {
  return (
    <div className='LandingPage'>
        <LandingHeader />
        <LandingContainer />
    </div>
  )
}

export default LandingPage