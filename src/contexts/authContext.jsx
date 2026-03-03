import { createContext } from "react";
import { useState, useEffect } from "react";

export const authContext = createContext(0);


export default function AuthContextProvider({children}){
    const [userToken, setUserToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setUserToken(savedToken);
        }
    }, []);

    return  <authContext.Provider value={{userToken, setUserToken}}>
        {children}
    </authContext.Provider>
}