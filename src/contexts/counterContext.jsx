import { createContext, useEffect, useState } from "react";

export const counterContext = createContext(0);

export default function CounterContextProvider({children}){


const [counter, setCounter]=useState(+localStorage.getItem("counter"));

return <counterContext.Provider value={{counter, setCounter}}>
      {children}
    </counterContext.Provider>
}