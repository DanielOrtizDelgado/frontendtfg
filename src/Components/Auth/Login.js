import React, {useState} from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../Styles.css'

const Login = ({onLogin}) => {
    const [mail, setMail] = useState('');
    const [pass, setPass] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const data = {
                user_mail: mail,
                user_pass: pass
            }

            const response = await axios.post(`http://localhost:5020/khomun-api/user/logginUser`, data)

            if(response.status === 200) {
                localStorage.setItem('userDetails', JSON.stringify(response.data.response))
                onLogin()
                navigate('./home')
            }
        }
        catch (error){
            console.error('Error loging:', error);
            if (error.response.status === 404) {
                Swal.fire({icon: 'error', title: 'Login Error', text: 'The password or the username is incorrect!'})
            }
        }
    }

    const handleRegisterDT = async (e) => {
        navigate('/register', {state: {DTorPlayer: true}});
    }

    const handleRegisterPlayer = async (e) => {
        navigate('/register', {state: {DTorPlayer: false}});
    }

    return(
        <div className='login-container'>
            <div className='login-section'>
                <h1 className='initial-text'>Welcome to Khōmün! Predict your players' fatigue in real time and improve your substitutions. Quick data, clear decisions. Let's play!</h1>
            </div>
            <div className='login-section'>
                <h3>Do you have an account?</h3>
                <h4>Login</h4>
                <form  onSubmit={(e) => handleSubmit(e, true)}>
                    <div className='input-Login'>
                        <label className='label-login'>Email</label>
                        <input type="email" className='border-name' value={mail} onChange={(e) => setMail(e.target.value)} placeholder="Mail" required/>
                    </div>

                    <div className='input-Login'>
                        <label className='label-login'>Password</label>
                        <input type="password" className='border-name' value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" required/>
                    </div>

                    <div>
                        <button type="submit">Sign In</button>
                    </div>
                </form>
                <Link to="/forgotPassword" className='link-forgot'>Forgot password?</Link>

                <h3>Don't you have an account?</h3>
                <h4>Register</h4>
                
                <div className='button-container'>
                    <button onClick={handleRegisterDT}>Register DT</button>
                    <button onClick={handleRegisterPlayer}>Register Player</button>
                </div>
            </div>
        </div>
    );
}

export default Login;