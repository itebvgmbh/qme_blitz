import React, { useState, useEffect } from 'react'
import SalonView from './SalonView'
import CustomerDashboard from './CustomerDashboard'
import Login from './Login'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { getSalons } from './db/database'

export type UserRole = 'salon' | 'customer' | null

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [salonName, setSalonName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const salons = await getSalons()
          const userSalon = salons.find((salon) => salon.ownerId === user.uid)
          if (userSalon) {
            setUserRole('salon')
            setSalonId(userSalon.id)
            setSalonName(userSalon.name)
          } else {
            setUserRole('customer')
          }
        } catch (error) {
          console.error("Error fetching salons:", error)
          setUserRole('customer')
        }
      } else {
        setUserRole(null)
        setSalonId(null)
        setSalonName(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center py-4">Salon Queue Manager</h1>
      {userRole === 'salon' && salonId && salonName && (
        <SalonView salonId={salonId} salonName={salonName} />
      )}
      {userRole === 'customer' && (
        <CustomerDashboard onLogout={() => setUserRole(null)} />
      )}
      {userRole === null && (
        <Login onLogin={(role, id, name) => {
          setUserRole(role)
          setSalonId(id || null)
          setSalonName(name || null)
        }} />
      )}
    </div>
  )
}

export default App