import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import '../Styles.css'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const Player = ({playerId: fromLoginPlayerId}) => {
    const [sessionsList, setSessionsList] = useState([])
    const [filter, setFilter] = useState('total_distance')
    const [loading, setLoading] = useState(true)
    
    const location = useLocation();
    const { fromDTplayerId } = location.state || {}    
    console.log(fromDTplayerId, fromLoginPlayerId)
    const playerId = fromDTplayerId ? fromDTplayerId : fromLoginPlayerId

    const fetchSessionsList = async () => {
        try {
            const response = await axios.get(`http://localhost:5020/khomun-api/sessions/sessions?user_id=${playerId}`)
            console.log(response.data.response)
            return response.data.response;
        }
        catch (error){
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const sessionsList = await fetchSessionsList(playerId);
            setSessionsList(sessionsList)
            setLoading(false)
        }
        fetchData();
    }, [playerId])
    
    //Se puede optimizar y mucho
    const graphics = useMemo(() => {
        if(!sessionsList || !sessionsList.length) return { data: [], options: [] };

        const sortedsessionsList = sessionsList.sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
        const sportTypes = [...new Set(sortedsessionsList.map(session => session.sport_type))];

        const sessionsBySportType = sportTypes.map(type => ({
            type,
            sessions: sortedsessionsList.filter(session => session.sport_type === type)
        }));

        const dataArray = []
        const optionsArray = []
        sessionsBySportType.map(({ type, sessions }) => {
            console.log(sessions)
            const labels = sessions.map(s => s.session_date);
            const dataValues = sessions.map(s => s[filter]);
            const sport = type === 1 ? "Football" : "Futsal"
            
            console.log(labels.length === dataValues.length)

            const data = {
                labels: labels,//sortedsessionsList.map(session => session.session_date),
                datasets: [{
                    label: `${sport} - ${filter}`,
                    data: dataValues, //sortedsessionsList.map(session => session[filter]),
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(75,192,192,1)',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointRadius: 3,
                }]
            }

            const options = {
                responsive: true,
                maintainAspectRatio: false, // necesario cuando das altura externa al contenedor
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Performance Evolution'
                    }
                },
            };
            dataArray.push(data)
            optionsArray.push(options)
        })
        return {data: dataArray, options: optionsArray}
    }, [sessionsList, filter])

    if(loading)
        return (<h1>loading...</h1>)

    return(
        <div className='player-container-containers'>
            {<div className='player-button-container'> {/*Primera seccion donde vemos que grafica mostramos*/}
                <button onClick={() => setFilter('total_distance')}>Total Distance</button>
                <button onClick={() => setFilter('impacts')}>Impacts</button>
                <button onClick={() => setFilter('max_vel')}>Max Velocity</button>
                <button onClick={() => setFilter('high_intensity_distance')}>High Intensity Distance</button>
                <button onClick={() => setFilter('calories')}>Calories</button>
                <button onClick={() => setFilter('dls')}>DSL</button>
            </div>}
            <div className='graphics-container-containers'>
                {graphics.data.map((dataItem, index) => (
                <div style={graphics.data.length > 1 ? { width: '100%', height: '300px' }: { width: '800px', height: '300px' }} key={index}>
                    <Line data={dataItem} options={graphics.options[index]} />
                </div>
                ))}
            </div>
        </div>
    );
}

export default Player;