import { createContext, useContext, useState } from "react"

const PlatformContext = createContext(null)

export const usePlatform = () => useContext(PlatformContext)

export const PlatformProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [config, setConfig] = useState(null)
  const [company, setCompany] = useState(null)
  const [location, setLocation] = useState(null)

  const login = (cfg, usr) => {
    setConfig(cfg)
    setUser(usr)
  }

  const logout = () => {
    setUser(null)
    setConfig(null)
    setCompany(null)
    setLocation(null)
  }

  const setContext = (comp, loc) => {
    setCompany(comp)
    setLocation(loc)
  }

  return (
    <PlatformContext.Provider value={{
      user, config, company, location,
      login, logout, setContext
    }}>
      {children}
    </PlatformContext.Provider>
  )
}