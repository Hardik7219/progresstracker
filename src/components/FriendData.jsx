import React, { useState } from 'react'

function FriendData({refreshKey}) {
    const [data,setData]= useState();
    const [userName,setUserName]= useState('');
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [msg,setMsg] = useState('')
    const CreateUser = async (e)=>{
        e.preventDefault();
        const user = await fetch('http://localhost:3000/create',{
          method : 'POST',
          headers :{ 'Content-Type': 'application/json' },
          body : JSON.stringify({userName,email,password})
        })
        .then(res=> res.json())
        .then(data=>setMsg)
    }
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
        </form>
    </div>
  )
}

export default FriendData
