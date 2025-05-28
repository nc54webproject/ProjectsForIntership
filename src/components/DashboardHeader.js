import { LogOut} from 'lucide-react'
import '../styles/Dashboard.css'
import React from 'react'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function DashboardHeader() {

    const handleLogout = async () => {
        await signOut(auth);
      };

  return (
    <div className='DashboardHeader'>
        <h1 style={{fontSize:"24px"}}>MyChatClone</h1>
        <LogOut style={{cursor:"pointer"}} onClick={handleLogout}/>
    </div>
  )
}

export default DashboardHeader