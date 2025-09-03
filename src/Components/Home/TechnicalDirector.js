import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles.css'

const TechnicalDirector = ({dtId}) => {
    const [team, setTeam] = useState({})
    const [playerLists, setPlayerList] = useState([])
    const [sessionsList, setSessionsList] = useState([])

    const fileInputRef = useRef(null);
    const [selectedFile, setselectedFile] = useState(null);
    const [dataUploaded, setDataUploaded] = useState(false)
    const [modelSelected, setModelSelected] = useState(1) //Revisar
    const [playerSelected, setPlayerSelected] = useState(1) //Revisar
    const models = [{"model_id": 1, "model_name": "MLP"}, {"model_id": 2, "model_name": "Random Forest"}, 
        {"model_id": 3, "model_name": "XGBRegressor"}]
    
    const [manually, setManually] = useState(false)
    const [showPrePredictionModal, setShowPrePredictionModal] = useState(false)
    const [showPostPredictionModal, setShowPostPredictionModal] = useState(false)

    const [half, setHalf] = useState(null)
    const [footballType, setFootballType] = useState(null)
    const [totalDist1, setTotalDist1] = useState(0)

    /*
    Parte,
                   |Tipo_F11
    TipoDeporte    |
                   |Tipo_FSALA
    DistanciaTotal1,
    CorrerAltaVelocidad1,
    DistanciaAltaIntensidad1,
    DistanciaPorMinuto1,
    DistanciaTotal2,
    CorrerAltaVelocidad2,
    DistanciaAltaIntensidad2,
    DistanciaPorMinuto2,
    DistanciaTotal3,
    CorrerAltaVelocidad3,
    DistanciaAltaIntensidad3,
    DistanciaPorMinuto3,
    Impactos,
    máxima velocidad, 
    No de Sprints,
    Distancia de Sprint,
    Aceleraciones,
    Desaceleraciones,
    Calorías,
    HID por minuto,
    Distancia de sprint por minuto,
    Step Balance (L),
    Step Balance (R),
    */

    const [dslPredicted, setDslPredicted] = useState(null)
    const [fiability, setFiability] = useState(null)
    const [tired, setTired] = useState('')

    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());

    const fetchTeam = async () => {
        try {
            const response = await axios.get(`http://localhost:5020/khomun-api/team/team?user_id=${dtId}`)
            return response.data.response
        }
        catch (error){
            console.error(error);
        }
    }

    const fetchPlayerList = async (user_id) => {
        if(user_id){
            try {
                const response = await axios.get(`http://localhost:5020/khomun-api/user/user?user_id=${user_id}`)
                console.log(response.data.response)
                return {
                    player_id: response.data.response.user_id,
                    player_name: response.data.response.user_name,
                    player_position: response.data.response.user_position
                }
            }
            catch (error){
                console.error(error);
            }
        }
    }

    const fetchSessionsList = async (team_id) => {
        try {
            const response = await axios.get(`http://localhost:5020/khomun-api/sessions/sessions?team_id=${team_id}`)
            return response.data.response;
        }
        catch (error){
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const DTteam = await fetchTeam();
            if(DTteam){
                const players = await Promise.all(DTteam.players.map(user_id => fetchPlayerList(user_id)))
                const sessions = await fetchSessionsList(DTteam.team_id);
                setPlayerList(players)
                setSessionsList(sessions)
            }
        }
        fetchData();
    }, [dtId])


    const selectFile = (e) => {
        e.preventDefault();
        fileInputRef.current.click();    
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        //console.log("Archivo seleccionado:", file);
        if(file) {
            setselectedFile(file)
            setDataUploaded(true)
            handleOpenModal(false)
        }
    };


    const handleOpenModal = (manually) => {
        setManually(manually)
        setShowPrePredictionModal(true)
    }

    const predict = async (playerOrTeam) => {
        console.log(selectedFile)
        console.log(playerOrTeam)
        console.log(modelSelected)
        console.log(playerSelected)

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('mode', playerOrTeam);
        formData.append('model', modelSelected);
        formData.append('user_id', playerSelected)

        try {
            const response = await axios.post('http://localhost:5020/khomun-api/predictions/predictions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response)
            if(response.status === 200){
                //Como por ahora estamos de prueba solo muestro el primer elemento del array (los dsl)
                //Ahora voy a probar con una media entre los resultados
                let avgDsl = 0
                for(let i = 0; i < response.data.response.prediction.dsl_pred.length; i++)
                    avgDsl += response.data.response.prediction.dsl_pred[i]
                avgDsl /= response.data.response.prediction.dsl_pred.length
                setDslPredicted(avgDsl) //response.data.response.prediction.dsl_pred[0] //response.data.response.prediction.dsl_pred
                setFiability(response.data.response.prediction.cv_reliability.r2_mean)
                
                const howTired = response.data.response.prediction.dsl_pred_norm_0_1[0] //response.data.response.prediction.dsl_pred_norm_0_1
                if(howTired <= 0.25)
                    setTired("Fresh") //Fully recovered, ready to perform at max capacity.
                else if(howTired <= 0.50)
                    setTired("Lightly fatigued") //Minor signs of effort, little to no performance impact.
                else if(howTired <= 0.75)
                    setTired("Fatigued") //Noticeable tiredness, performance and recovery affected.
                else if(howTired > 0.75)
                    setTired("Exhausted") //Very high fatigue, risk of injury, should rest.

                setShowPrePredictionModal(false)
                setShowPostPredictionModal(true)
            }
        }
        catch (error) {
            console.error('Error al subir el archivo:', error);
            Swal.fire({icon: 'error', title: 'Prediction Error', 
                text: 'Oops something happened. Try attaching a correct csv or xlsx or enter the data manually!'})
        }
    }

    const handleClick = (playerId) => {
        navigate(`/player`, {state: {fromDTplayerId: playerId}});
    };

    const toYMD = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const parseYMDslash = (str) => {
        const [y, m, d] = str.split('/').map(Number); // "2025/01/01"
        return new Date(y, m - 1, d); // fecha local, sin UTC
    };

    return(
        <div className='technicalDirector-container-containers'>
            <div className='predict-container'> {/*Primera seccion donde predeciremos*/}
                <button onClick={selectFile}>Predict attaching a csv or xlsx file</button>
                <input
                    type="file"
                    accept=".csv,.xlsx"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <button onClick={() => handleOpenModal(true)} disabled>Coming Soon</button> {/*Enter data manually*/}
            </div>
            <div className="player-list-container"> {/*Segunda seccion con la lista de los jugadores*/}
                {playerLists.map(player => (
                    <div key={player.player_id} className="player-card" onClick={() => handleClick(player.player_id)}>
                        <h4>{player.player_name}</h4>
                        <p>{player.player_position}</p>
                    </div>
                ))}
            </div>
            <div className='calendar-container'> {/*Tercera seccion con el calendario de entrenamientos/partidos*/}
                <Calendar
                    onChange={setDate}
                    value={null}
                    tileClassName={({ date, view }) => {
                        // view === 'month' evita afectar a decade/year view
                        /*if (view === 'month') {
                            const formatted = date.toISOString().split('T')[0];

                            // Busca si la fecha está en sessionsList
                            const session = sessionsList.find(s => {
                                // Convertimos session_date a formato YYYY-MM-DD
                                const sessionFormatted = new Date(
                                s.session_date.split('/').join('-')
                                ).toISOString().split('T')[0];
                                return sessionFormatted === formatted;
                            });

                            if (session) {
                                if (session.session_type === 2) return 'red-tile';
                                if (session.session_type === 1) return 'blue-tile';
                            }
                            return null;
                        }*/
                        if (view !== 'month') return null;

                        const formatted = toYMD(date); // local
                        const session = sessionsList.find((s) => toYMD(parseYMDslash(s.session_date)) === formatted);

                        if (!session) return null;
                        return session.session_type === 2 ? 'red-tile' : session.session_type === 1 ? 'blue-tile' : null;
                    }}
                />
            </div>

            {showPrePredictionModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <button className="close-button-modal1" onClick={() => setShowPrePredictionModal(false)}>x</button> {/*Dejar bonito*/}
                        {manually ? (
                            <div>
                                <div className='input-Login'>
                                    <label className='label-login'>Half</label>
                                    <input type="number" className='border-name' value={half} onChange={(e) => setHalf(e.target.value)} placeholder="half" required/>
                                </div>

                                <select id="footballType" className='border-name-select' value={footballType} onChange={(e) => setFootballType(e.target.value)} required>
                                    <option value="" disabled>--Select your Football type--</option>
                                    <option value={0}>Football</option>
                                    <option value={1}>Futsal</option>
                                </select>

                                <div className='input-Login'>
                                    <label className='label-login'>Total Distance 1st segment</label>
                                    <input type="text" className='border-name' value={totalDist1} onChange={(e) => setTotalDist1(e.target.value)} placeholder="Total Distance 1st segment" required/>
                                </div>
                            </div>
                        ):
                        (   
                            <div>
                                <div>
                                    <label className='label-login'>File: {selectedFile ? selectedFile.name : 'No file selected'}</label>
                                </div>

                                <div className='input-Login'>
                                    <label className='label-login'>Model</label>
                                    <select id="model" className='border-name-select' value={modelSelected} onChange={(e) => setModelSelected(e.target.value)} required>
                                        <option value="" disabled>--Select your Models type--</option>
                                        {models.map((model, index) => (
                                            <option key={index} value={model.model_id}>{model.model_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='input-Login'>
                                    <label className='label-login'>Player</label>
                                    <select id="player" className='border-name-select' value={playerSelected} onChange={(e) => setPlayerSelected(e.target.value)} required>
                                        <option value="" disabled>--Select the player--</option>
                                        {playerLists.map((player, index) => (
                                            <option key={index} value={player.player_id}>{player.player_name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        )}

                        <div className='button-container'>
                            <button onClick={() =>predict(true)} disabled={!dataUploaded}>Predict acording to a player</button>
                            <button onClick={() => predict(false)} disabled={!dataUploaded}>Predict acording to the team</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showPostPredictionModal && (
            <div className="modal-backdrop">
                <div className="modal">
                    <button className="close-button-modal2" onClick={() => setShowPostPredictionModal(false)}>x</button>
                    <h3>Prediction</h3>
                    <p>DSL: {Math.round(dslPredicted)}</p>
                    <p>Model fiability: { Math.round(fiability*100)}%</p>
                    <p>The player will be: {tired}</p>
                </div>
            </div>
        )}
        </div>
    );
}

export default TechnicalDirector;