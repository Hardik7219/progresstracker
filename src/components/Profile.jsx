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
    const url = import.meta.env.VITE_API_URL

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
    const sendRequest = async ()=>{
        const res = await fetch(`${url}/friend`,{
          method : 'POST',
          credentials: 'include', 
          headers : {'Content-Type': 'application/json'},
          body : JSON.stringify({frd, _id : data.id})
        })
        const data = await res.json()
        setMsg(data.message); 
    }
      const forgetPass = async (e) => {
        e.preventDefault()
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
      <div className=" p w-full h-20 bg-[#2e2a68] rounded-sm flex justify-between ">
        <div className='flex justify-center items-center flex-row gap-1'>
          <input onChange={(e)=>setFrd(e.target.value)} className='w-50 lg:w-100 outline-none search-box ' placeholder="Search" type="search"></input>
          <button onClick={sendRequest} className='p rounded-sm text-[15px] lg:text-lg btn2 btn-primary'>Send Request</button>
        </div>
        <div className='flex justify-center items-center justify-self-end'>
          <button onClick={()=>{
            if (data && data.id) {
              logout();
            } else {
              setLogin(current => !current);
              setSign(true);
            }
          }} className='p rounded-sm text-[15px] lg:text-lg btn2 btn-primary'>
            {data && data.id ? 'logout' : 'login'}
          </button>
        </div>
      </div>
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
          </form>
          {msg && (
            <p>{msg}</p>
          )}
          </div>
        )}
          
          {login && (
                <div className='flex justify-self-center self-center justify-center items-center card w-100'>
                  <form className="flex gap-10 flex-col" onSubmit={loginUser}>
                    <div className='form-group'>
                    <label>Email</label>
                    <input onChange={(e)=>setEmail(e.target.value)} className="outline-1 bg-amber-300" type="email" />
                  </div>
                  <div className='form-group'>
                    <label>Password</label>
                    <input onChange={(e)=>setPassword(e.target.value)} className="outline-1 bg-amber-300" type="password"/>
                  </div>
                  <button type="submit" className='self-center w-20 flex justify-center items-center btn btn-primary'>submit</button>
                  <button onClick={()=>{setShowForget(true); setLogin(false)}} className=''>forget password</button>
                  </form>
                  {msg && (
                    <p>{msg}</p>
                  )}
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
                  </form>
                  {msg && (
                    <p>{msg}</p>
                  )}
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
