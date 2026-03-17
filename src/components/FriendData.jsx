import React, { useEffect, useState } from 'react'
import Login from './Login';
import Cookies from 'js-cookie';
function FriendData({refreshKey}) {
    const [data,setData]= useState();
    const [userName,setUserName]= useState('');
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [msg,setMsg] = useState('')
    const [login,setLogin] = useState(false)
    useEffect(()=>{
    fetch("http://localhost:4000/dashboard", {
        credentials: "include"
    });
    })
    const CreateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/create', {
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
  return (
    <div>
        <form onSubmit={CreateUser} className='bg-amber-50 text-black'>
          <input onChange={(e)=>setUserName(e.target.value)} className="outline-1 bg-amber-300" type="text" />
          <input onChange={(e)=>setEmail(e.target.value)} className="outline-1 bg-amber-300" type="email" />
          <input onChange={(e)=>setPassword(e.target.value)} className="outline-1 bg-amber-300" type="password"/>
          <button type="submit"  className='btn btn-primary'>submit</button>
          {msg && (
            <p>{msg}</p>
          )}
          <button onClick={()=>setLogin(true)} className='btn btn-primary'>login</button>
          {login && (
            <Login></Login>
          )}
        </form>
    </div>
  )
}

export default FriendData
