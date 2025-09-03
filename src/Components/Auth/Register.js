import React, {useState} from 'react'
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../Styles.css'

const Register = () => { 
    const [mail, setMail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [footballType, setFootballType] = useState('');
    const [position, setPosition] = useState('');

    const footballTypeArray = ["Football", "Futsal", "Mixed"]
    const positionFootballArray = [
        "Goalkeeper (GK)",
        "Centre-back (CB)",
        "Right-back (RB)",
        "Left-back (LB)",
        "Right wing-back (RWB)",
        "Left wing-back (LWB)",
        "Defensive midfielder (CDM)",
        "Central midfielder (CM)",
        "Right central midfielder (RCM)",
        "Left central midfielder (LCM)",
        "Midfielder (CAM)",
        "Winger (RW)",
        "Left winger (LW)",
        "Striker (ST)",
        "Second striker (SS)",
    ]

    const positionFutsalArray = [
        "Goalkeeper (GK)",
        "Fixo (FX)",
        "Right winger (RW)",
        "Left winger (LW)",
        "Pivot (PT)",
    ]

    const location = useLocation();
    const navigate = useNavigate();

    const { DTorPlayer } = location.state || {}

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const userId = await handleNewUser()
            if(userId)
                await handleNewTeam(userId, DTorPlayer)

            Swal.fire({icon: 'success', title: 'User Created', text: 'The user and the team were created successfully'}).then(() => {
                navigate('/')
            })
        }
        catch (error){
            console.error('Error creating the new user:', error);
        }
    }

    const handleNewUser = async () => {
        try {
            const data = {
                user_mail: mail,
                user_name: name,
                pass,
                DTorPlayer,
                user_position: position
            }

            const response = await axios.post(`http://localhost:5020/khomun-api/user/user`, data)

            if(response.status === 201) {
                return response.data.response.user_id
            }
        }
        catch (error){
            throw error;
        }
    }

    const handleNewTeam = async (userId, DTorPlayer) => {
        try {
            if(DTorPlayer) {
                const data = {
                    team_name: teamName,
                    pass: teamPassword,
                    dt_id: userId,
                    football_type: footballType
                }
                await axios.post(`http://localhost:5020/khomun-api/team/team`, data)
            }
            else{
                const data = {
                    team_name: teamName,
                    pass: teamPassword,
                    user_id: userId
                }
                await axios.put(`http://localhost:5020/khomun-api/team/team`, data)
            }
        }
        catch (error){
            throw error;
        }
    }

    return (
        <div className='register-container'>
            <div className='register-content'>
                <h3 className='register-title'>
                {DTorPlayer ? 'Register DT' : 'Register Player'}
                </h3>

                <form onSubmit={(e) => handleSubmit(e, true)} className='register-form'>
                    {/* Primera sección */}
                    <div className='register-section'>
                        <div className='input-Login'>
                        <label className='label-login'>Name</label>
                        <input
                            type='text'
                            className='border-name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Name'
                            required
                        />
                        </div>

                        <div className='input-Login'>
                        <label className='label-login'>Email</label>
                        <input
                            type='email'
                            className='border-name'
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            placeholder='Email'
                            required
                        />
                        </div>

                        <div className='input-Login'>
                        <label className='label-login'>Password</label>
                        <input
                            type='password'
                            className='border-name'
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder='Password'
                            required
                        />
                        </div>

                        {DTorPlayer ? (
                        <div className='input-Login'>
                            <label className='label-login'>Football Type</label>
                            <select id="footballType" className='border-name-select' value={footballType} onChange={(e) => setFootballType(e.target.value)} required>
                            <option value="" disabled>--Select your Football type--</option>
                            {footballTypeArray.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                            </select>
                        </div>
                        ) : (
                        <div className='input-Login'>
                            <label className='label-login'>Position</label>
                            <select id="position" className='border-name-select' value={position} onChange={(e) => setPosition(e.target.value)} required>
                            <option value="" disabled>--Select your Position--</option>
                            <option value="" disabled>--Football--</option>
                            {positionFootballArray.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                            <option value="" disabled>--Futsal--</option>
                            {positionFutsalArray.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                            </select>
                        </div>
                        )}
                    </div>

                    {/* Segunda sección */}
                    <div className='register-section'>
                        <div className='input-Login'>
                        <label className='label-login'>Team Name</label>
                        <input
                            type='text'
                            className='border-name'
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder='Team Name'
                            required
                        />
                        </div>

                        <div className='input-Login'>
                        <label className='label-login'>Team Password</label>
                        <input
                            type='password'
                            className='border-name'
                            value={teamPassword}
                            onChange={(e) => setTeamPassword(e.target.value)}
                            placeholder='Team Password'
                            required
                        />
                        </div>

                        <div className='register-button'>
                        <button type='submit'>Register</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Register;