import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { sendData } from '../services/analyticsService'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import CalendarHeatmap from './CalendarHeatmap';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);
import Loader from './Loader';
function FriendData({ refreshKey }) {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState('')
    const [frd, setFrd] = useState();
    const [datas,setDatas]=useState();
    const [par, setPar] = useState()
    const [anyl, setAnyl] = useState();
    const [loading,setLoading]= useState();
    const [n,setN]=useState();
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionPercentage: 0 });
    const [progress, setProgress] = useState({ completionComponent: 0, consistencyComponent: 0, consistencyRate: 0, score: 0, streakComponent: 0 });
    const [daily, setDaily] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [loader,setLoader]= useState(false)
    const [trend, setTrend] = useState({ trend: 'neutral', message: '', icon: '' });
    const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true)
        fetch(`${url}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {setData(data)
                setLoading(false)
            })
            .catch(() => console.log("Not logged in"));
    }, []);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        if (!data?.id) { setMsg("Please login first"); return; }
        setLoading(true)
        fetch(`${url}/analysFriend/${data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {anydata(data)
                setLoading(false)
            })
            .catch(() => {console.log("No data"),setLoading(false)});
            setMsg("")
    }, [data])
    useEffect(() => {
        if (!anyl) return
        setStats(anyl.basicStats);
        setProgress(anyl.progressScore);
        setDaily(anyl.dailyTreads);
        setWeekly(anyl.weeklyTreads);
        setStreak({ current: 10, longest: 20 });
        setTrend(anyl.improveTread);
    }, [anyl])
    const anydata=(d)=>{
        setAnyl(d.data)
        setN(d.partn)
    }
    const sendRequest = async () => {
        if (!data?.id) { setMsg("Please login first"); return; }
        if (!frd?.trim()) { setMsg("Enter a username"); return; }
        if(loader) return 
        setLoader(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${url}/friend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ frd, id: data.id })
            });
            const result = await res.json();
            setLoader(false)
            setMsg(result.message);
        } catch (error) {
            setMsg("Something went wrong");
            setLoader(false)
        }
    };




    //================================
    const [chartView, setChartView] = useState('daily');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

    const dailyChartData = {
        labels: daily.map((d) => d.label),
        datasets: [
            {
                label: 'Completed Tasks',
                data: daily.map((d) => d.count),
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointRadius: 4,
            },
        ],
    };

    const weeklyChartData = {
        labels: weekly.map((w) => w.label),
        datasets: [
            {
                label: 'Completed Tasks',
                data: weekly.map((w) => w.count),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: textColor },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: textColor, maxRotation: 45 },
                grid: { display: false },
            },
        },
    };

    const doughnutData = {
        labels: ['Completion', 'Streak', 'Consistency'],
        datasets: [
            {
                data: [
                    progress.completionComponent,
                    progress.streakComponent,
                    progress.consistencyComponent,
                ],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };
    return (
        <>
            <div className='w-full'>
                <div>

                {loader && (
                      <div className='flex z-50 top-0 fixed self-center w-full h-screen justify-self-center justify-center items-center'>
                      <div className=" w-full h-screen backdrop-blur-sm flex justify-center items-center">
                      <Loader></Loader>
                      </div>
                      </div>
                      )}
                {loading && (

                    <div className='h-screen  animate-pulse '>
                <div className="analytics-score-section  h-60">
                </div>
                <div className="analytics-stats h-40">
                            <div className="mini-stat">
                                
                                
                            </div>
                            <div className="mini-stat">
                                
                                
                            </div>
                            <div className="mini-stat">
                                
                                
                            </div>
                            <div className="mini-stat">
                                
                                
                            </div>
                            <div className="mini-stat">
                                
                                
                            </div>
                    </div>
                    <div className="card h-7/12"></div>
                    <div className='card h-60'></div>
            </div>
            )}

          {!loading && (

              <div>

                {!data && (
                    <div className='flex justify-self-center self-center justify-center items-center card w-100'>
                        <h1> You does't have a account</h1>
                        {msg && (
                            <p>{msg}</p>
                        )}
                    </div>
                )}
                {anyl && (
                    <div className="analytics-page">
                        <div className="page-header">
                            <div>
                                <h1>Progress Analytics of <p>{n}</p></h1>
                                <p className="subtitle">Hardik's productivity over time</p>
                            </div>
                        </div>
                        {/* Score Overview */}
                        <div className="analytics-score-section">
                            <div className="score-circle-container">
                                <div className="score-circle">
                                    <svg viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="54"
                                            fill="none"
                                            stroke="var(--color-primary)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(progress.score / 100) * 339.3} 339.3`}
                                            transform="rotate(-90 60 60)"
                                            className="score-ring"
                                            />
                                    </svg>
                                    <div className="score-value">
                                        <span className="score-num">{progress.score}</span>
                                        <span className="score-label">Score</span>
                                    </div>
                                </div>
                            </div>

                            <div className="score-breakdown">
                                <h3>Score Breakdown</h3>
                                <div className="breakdown-item">
                                    <div className="breakdown-header">
                                        <Target size={16} />
                                        <span>Task Completion</span>
                                        <span className="breakdown-value">{progress.completionComponent}/50</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill fill-primary" style={{ width: `${(progress.completionComponent / 50) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="breakdown-item">
                                    <div className="breakdown-header">
                                        <Zap size={16} />
                                        <span>Streak Bonus</span>
                                        <span className="breakdown-value">{progress.streakComponent}/25</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill fill-amber" style={{ width: `${(progress.streakComponent / 25) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="breakdown-item">
                                    <div className="breakdown-header">
                                        <Award size={16} />
                                        <span>Consistency</span>
                                        <span className="breakdown-value">{progress.consistencyComponent}/45</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill fill-emerald" style={{ width: `${(progress.consistencyComponent / 45) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="score-doughnut">
                                <Doughnut
                                    data={doughnutData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        cutout: '65%',
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: { color: textColor, padding: 12, usePointStyle: true },
                                            },
                                        },
                                    }}
                                    />
                            </div>
                        </div>
                        {/* Stats Row */}
                        <div className="analytics-stats">
                            <div className="mini-stat">
                                <span className="mini-stat-value">{stats.total}</span>
                                <span className="mini-stat-label">Total Tasks</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{stats.completed}</span>
                                <span className="mini-stat-label">Completed</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{stats.completionPercentage}%</span>
                                <span className="mini-stat-label">Completion Rate</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{streak.current}</span>
                                <span className="mini-stat-label">Current Streak</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{progress.consistencyRate}%</span>
                                <span className="mini-stat-label">Consistency</span>
                            </div>
                        </div>
                        <div className="card chart-card">
                            <div className="card-header">
                                <h2><TrendingUp size={18} /> Completion Trends</h2>
                                <div className="chart-toggle">
                                    <button
                                        className={`filter-btn ${chartView === 'daily' ? 'active' : ''}`}
                                        onClick={() => setChartView('daily')}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        className={`filter-btn ${chartView === 'weekly' ? 'active' : ''}`}
                                        onClick={() => setChartView('weekly')}
                                    >
                                        Weekly
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                {chartView === 'daily' ? (
                                    <Line data={dailyChartData} options={chartOptions} />
                                ) : (
                                    <Bar data={weeklyChartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                        {/* Calendar Heatmap */}
                        <div className="card">
                            <div className="card-header">
                                <h2>📅 Activity Heatmap</h2>
                            </div>
                            <CalendarHeatmap />
                        </div>
                    </div>
                )}
                                
                </div>
                    )}
                                    </div>
                    {!par  && (
                    <div className=" p w-full h-20 bg-[#2e2a68] rounded-sm flex justify-between ">
                        <div className='flex justify-center items-center flex-row gap-1'>
                            <input onChange={(e) => setFrd(e.target.value)} className='w-50 lg:w-100 outline-none search-box ' placeholder="Search" type="search"></input>
                            <button onClick={sendRequest} className='p rounded-sm text-[15px] lg:text-lg btn2 btn-primary'>Send Request</button>
                        </div>
                        {msg && (<p>{msg}</p>)}
                    </div>
                )}
            </div>
        </>
    )
}

export default FriendData
