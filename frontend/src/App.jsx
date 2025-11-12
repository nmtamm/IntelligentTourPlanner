import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import UserProfile from './components/UserProfile.jsx';
import InputForm from './components/inputform.jsx';
import Header from './components/Header.jsx';

const App = () => {
    return (
        // <Router>
        //     <AuthProvider>
        //         <div style={{ "padding": "20px" }}>
        //             <nav>
        //                 <ul>
        //                     <li><Link to="/register">Register</Link></li>
        //                     <li><Link to="/login">Login</Link></li>
        //                     <li><Link to="/profile">Profile</Link></li>
        //                 </ul>
        //             </nav>
        //             <Routes>
        //                 <Route path="/register" element={<Register />} />
        //                 <Route path="/login" element={<Login />} />
        //                 <Route path="/profile" element={<UserProfile />} />
        //             </Routes>
        //         </div>
        //     </AuthProvider>
        // </Router>
        <>
            <Header />
            <InputForm />
        </>
    );
};

export default App;