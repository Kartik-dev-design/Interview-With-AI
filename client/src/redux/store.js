import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userslice.js'
export default configureStore({
  reducer: {
  user:userSlice
  },
})