import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Layout from './Components/Layout';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register'
import Home from './Components/Home/Home';
import Player from './Components/Home/Player';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.clear()
  }

  useEffect(() => {
    const storedIsAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
    if(storedIsAuthenticated !== isAuthenticated)
      setIsAuthenticated(storedIsAuthenticated)
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', JSON.stringify(true))
  }

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
        <div>
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin}/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/home" element={<Home onLogout={handleLogout}/>} />
            <Route path="/player" element={<Player/>} />

          </Routes>
        </div>
      </Layout>

    </Router>
  );
}

export default App;
