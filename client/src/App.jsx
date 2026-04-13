import React from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { Routes,Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from "./redux/userslice.js";
export const serverUrl="https://interview-with-ai-c363.onrender.com"
import axios from 'axios'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import InterviewReport from './pages/InterviewReport.jsx'
import Pricing from './pages/Pricing.jsx'
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
        <Route path='/interview' element={<InterviewPage /> }/>
        <Route path='/history' element={<InterviewHistory /> }/>
        <Route  path='/report/:id' element={<InterviewReport /> }/>
        <Route path='/pricing' element={< Pricing/>} />
      </Routes>
  )
}
export default App
