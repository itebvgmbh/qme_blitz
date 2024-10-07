import React, { useState } from 'react'
import { addAppointment, Appointment } from './db/database'

interface CustomerViewProps {
  onLogout: () => void
}

const CustomerView: React.FC<CustomerViewProps> = ({ onLogout }) => {
  const [customerName, setCustomerName] = useState('')

  const handleJoinQueue = async () => {
    if (customerName) {
      try {
        const appointmentData: Omit<Appointment, 'id'> = {
          salonId: 'sampleSalonId', // Replace with actual salonId
          employeeId: 'sampleEmployeeId', // Replace with actual employeeId
          customerId: 'sampleCustomerId', // Replace with actual customerId
          serviceId: 'sampleServiceId', // Replace with actual serviceId
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour later
        }
        await addAppointment(appointmentData)
        alert('You have been added to the queue!')
        setCustomerName('')
      } catch (error) {
        console.error("Error joining queue:", error)
        alert('Failed to join the queue. Please try again.')
      }
    } else {
      alert('Please enter your name')
    }
  }

  return (
    <div>
      <h1>Customer View</h1>
      <input
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleJoinQueue}>Join Queue</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  )
}

export default CustomerView