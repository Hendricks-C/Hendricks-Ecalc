import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Navbar from './components/navbar.tsx'
function App() {

  return (
    
    <BrowserRouter>
      <Navbar />
    
      <Routes>
        {/* <Route exact path="/" element={Home} /> */}
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
