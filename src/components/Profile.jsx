import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import {sendData} from '../services/analyticsService'
import { set } from 'date-fns';

function Profile({refreshKey}) {
    const [data,setData]= useState(null);
    const [pr,setPr] = useState(false);
    const [sin,setSign] = useState(false)
    const [userName,setUserName]= useState('');
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [msg,setMsg] = useState('')
    const [login,setLogin] = useState(false)
    const [frd,setFrd]= useState();
    const [showForgetm,setShowForget]= useState(false)
    const [forgetEmail,setForgetEmail] = useState('') 
    const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    useEffect(() => {
      fetch(`${url}/me`, {
          credentials: "include"
      })
      .then(res => res.json())
      .then(data => {
          setData(data);
      })
      .catch(() => {
          console.log("Not logged in");
      });
  }, []);
  useEffect(() => {
    if (data && data.id) {
        setPr(true)
        setSign(true)
        sendData(data.id);
    }
}, [data]);
    const CreateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${url}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password })
      });

      const data = await res.json();

      setMsg(data.message); // or setMsg(data)

    } catch (error) {
      console.error(error);
      setMsg("Something went wrong");
    }
  };

    const loginUser = async (e) => {
      e.preventDefault();
      const res = await fetch(`${url}/login`,{
          method:'POST',
          credentials: "include",
          headers : {'Content-Type': 'application/json'},
          body : JSON.stringify({email:email,password:password})
      })
      const data = await res.json()
      setMsg(data.message); 
  }
  const logout = async () => {
      await fetch(`${url}/logout`, {
          method: 'POST',
          credentials: 'include'
      });
      setData(null);
  }
  const varifyAcc = async ()=>{
    console.log('helloooooo')
    const res = await fetch(`${url}/varify`,{
      method :'POST',
      credentials :"include",
      headers :{'Content-Type': 'application/json'},
      body : JSON.stringify({email : email})
    })
    const data = await res.json()
    setMsg(data.message)
  }
const forgetPass = async (e) => {
        e.preventDefault()
        console.log("forger")
      const res = await fetch(`${url}/forgot-password`,{
          method : 'POST',
          credentials: 'include', 
          headers : {'Content-Type': 'application/json'},
          body : JSON.stringify({ email: forgetEmail })
      });

      const resData = await res.json();
      setMsg(resData.message); 
  }
  return (
    <div className='w-full'>
      {!sin && (
        <div className='flex justify-self-center self-center justify-center items-center card w-100'>
        <form className="flex gap-10 flex-col" onSubmit={CreateUser}>
          <div className='form-group'>
            <label>Username</label>
            <input onChange={(e)=>setUserName(e.target.value)} className="outline-1 bg-amber-300" type="text" />
          </div>
          <div className='form-group'>
            <label>Email</label>
            <input onChange={(e)=>setEmail(e.target.value)} className="outline-1 bg-amber-300" type="email" />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input onChange={(e)=>setPassword(e.target.value)} className="outline-1 bg-amber-300" type="password"/>
          </div>
          <button type="submit" className='self-center w-20 flex justify-center items-center btn btn-primary'>submit</button>
          <button onClick={()=>{setLogin(true); setSign(true)}}>Already have Account?</button>
          {msg && (
            <p>{msg}</p>
          )}
          </form>
          </div>
        )}
          
          {login && (
                <div className='flex justify-self-center self-center justify-center flex-col  items-center card w-100'>
                  <form className="flex gap-10 flex-col" >
                    <div className='form-group'>
                    <label>Email</label>
                    <input onChange={(e)=>setEmail(e.target.value)} className="outline-1 bg-amber-300" type="email" />
                  </div>
                  <div className='form-group'>
                    <label>Password</label>
                    <input onChange={(e)=>setPassword(e.target.value)} className="outline-1 bg-amber-300" type="password"/>
                  </div>
                  <button type="submit" onClick={loginUser} className='self-center w-20 flex justify-center items-center btn btn-primary'>submit</button>
                  {msg && (
                    <p>{msg}</p>
                  )}
                  </form>
                  <div className='flex'>
                    <button onClick={()=>{setShowForget(true); setLogin(false)}} className='btn btn-primary'>forget password</button>
                    <button onClick={varifyAcc} className='btn btn-primary '>If not varify then varify</button>
                  </div>
                </div>
          )}
          {showForgetm && (
                <div className='flex justify-self-center self-center justify-center items-center card w-100'>
                  <form className="flex gap-10 flex-col" onSubmit={forgetPass}>
                    <div className='form-group'>
                    <label>Email</label>
                    <input onChange={(e)=>setForgetEmail(e.target.value)} className="outline-1 bg-amber-300" type="email" />
                  </div>
                  <button type="submit" className='self-center w-20 flex justify-center items-center btn btn-primary'>submit</button>
                  <button onClick={()=>{setLogin(true); setShowForget(false)}} className=''>Back to login</button>
                  {msg && (
                    <p>{msg}</p>
                  )}
                  </form>
                </div>
          )}
          {pr && (

            <div className='h-screen w-full bg-amber-50 flex flex-col lg:flex-row gap-10 items-center'>
            <div className='border rounded-full h-90 w-90 lg:h-100 bg-amber-500 lg:w-100'>
                <img src="" alt="" srcset="" />
            </div>
            <div className='h-90 w-90 lg:h-100 lg:w-100 bg-amber-950'>
              <p>{data?.username}</p>
              <p>{data?.email}</p>
              <p>{data?.varify}</p>
              
              {msg && (
                <p>{msg}</p>
              )}
            </div>  
          </div>
        )}
    </div>
  )
}

export default Profile
