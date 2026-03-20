import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import {sendData} from '../services/analyticsService'

function FriendData({refreshKey}) {
    const [data,setData]= useState(null);
    const [userName,setUserName]= useState('');
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [msg,setMsg] = useState('')
    const [login,setLogin] = useState(false)
    const [frd,setFrd]= useState();
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
          body : JSON.stringify({frd, id : data.id})
        })
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
            data && data.id ? logout() : setLogin(current => !current)
          }} className='p rounded-sm text-[15px] lg:text-lg btn2 btn-primary'>
            {data && data.id ? 'logout' : 'login'}
          </button>
        </div>
      </div>
      {!data && (
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
                  </form>
                  {msg && (
                    <p>{msg}</p>
                  )}
                </div>
          )}
    </div>
  )
}

export default FriendData
