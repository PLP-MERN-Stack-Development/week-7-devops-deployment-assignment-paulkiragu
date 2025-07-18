import { useState } from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App(){
  const[user, setUser] = useState(null)

  return(
    <BrowserRouter>
    <Routes>
<Route path='/' element={user ? <Home user={user} /> : <Login setUser={setUser} />} />

    </Routes>
    </BrowserRouter>
  )
}