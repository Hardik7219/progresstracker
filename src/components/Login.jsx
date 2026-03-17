import React, { useState } from 'react'

function Login() {
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [msg,setMsg] = useState('')
    const login = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:4000/login',{
            method:'POST',
            headers : {'Content-Type': 'application/json'},
            body : JSON.stringify({email:email,password:password})
        })
        const data = await res.json()
        setMsg(data.message); 
    }
  return (
    <div>
      <form>
        <input onChange={(e)=>{setEmail(e.target.value)}} type="email"  />
        <input onChange={(e)=>{setPassword(e.target.value)}} type="password"  />
        <button onClick={login} className="btn btn-primary">login</button>
      </form>
      {msg && (
        <p>{msg}</p>
      )}
    </div>
  )
}

export default Login
