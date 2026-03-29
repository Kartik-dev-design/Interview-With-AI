import React from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { Routes,Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from "./redux/userslice.js";
export const serverUrl="http://localhost:8000"
import axios from 'axios'
function App() {
  const dispatch=useDispatch()
  useEffect(()=>{
   const getCurrentUser=async()=>{
    try{
      const res=await axios.get(`${serverUrl}/api/user/current-user`
      ,{withCredentials:true})
     // console.log("Current user:",res.data)
      dispatch(setUserData(res.data))
    }
    catch(error){
      console.log("Error fetching current user:",error)
      dispatch(setUserData(null))
    }
   }
    getCurrentUser()
  },[dispatch])
  return (
      <Routes >
        <Route path='/' element={<Home /> }/>
        <Route path='/auth' element={<Auth /> }/>
      </Routes>
  )
}
export default App