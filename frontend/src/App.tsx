import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
function App() {

  return (
    
    <BrowserRouter>
      <h1>Test</h1>
      <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
      </nav>
    
      <Routes>
        {/* <Route exact path="/" element={Home} /> */}
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
