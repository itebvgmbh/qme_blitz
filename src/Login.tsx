import React, { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { getSalons } from './db/database'
import { auth, db } from './firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

interface LoginProps {
  onLogin: (role: 'salon' | 'customer', id?: string, name?: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [salonName, setSalonName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (role: 'salon' | 'customer') => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (role === 'salon') {
        const salons = await getSalons()
        const userSalon = salons.find((salon) => salon.ownerId === user.uid)
        if (userSalon) {
          onLogin('salon', userSalon.id, userSalon.name)
        } else {
          setError("No salon found for this account. Please register your salon.")
        }
      } else {
        onLogin('customer')
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleRegister = async (role: 'salon' | 'customer') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (role === 'salon') {
        const salonData = {
          name: salonName,
          ownerId: user.uid
        }
        const salonsRef = collection(db, 'salons')
        const docRef = await addDoc(salonsRef, salonData)
        onLogin('salon', docRef.id, salonName)
      } else {
        onLogin('customer')
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">{isRegistering ? 'Register' : 'Login'}</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {isRegistering && (
            <div>
              <Label htmlFor="salonName">Salon Name (for salon owners)</Label>
              <Input id="salonName" type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} />
            </div>
          )}
          {isRegistering ? (
            <>
              <Button onClick={() => handleRegister('salon')} className="w-full">Register as Salon</Button>
              <Button onClick={() => handleRegister('customer')} className="w-full">Register as Customer</Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleLogin('salon')} className="w-full">Login as Salon</Button>
              <Button onClick={() => handleLogin('customer')} className="w-full">Login as Customer</Button>
            </>
          )}
          <p className="text-center">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 hover:underline ml-1"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login