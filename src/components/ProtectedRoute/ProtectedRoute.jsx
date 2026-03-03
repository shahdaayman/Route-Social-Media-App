import React from 'react'
import { Navigate } from 'react-router-dom';
import {useContext } from "react";
import { authContext } from "../../contexts/authContext";

export default function ProtectedRoute({children}) {
    const {userToken} = useContext(authContext);
    const isLoggedIn = !!userToken;
    
  return (
    <>
     {isLoggedIn? children : <Navigate to={"/login"}/>} 
    </>
  )
}
