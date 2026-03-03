import React from 'react'
import { Navigate } from 'react-router-dom';
import {useContext } from "react";
import { authContext } from "../../contexts/authContext";

export default function ProtectedAuthRoute({children}) {
        const {userToken} = useContext(authContext);
    const isLoggedIn = !!userToken;
  return (
    <>
      {isLoggedIn ? <Navigate to={"/home"} /> : children}
    </>
  )
}
