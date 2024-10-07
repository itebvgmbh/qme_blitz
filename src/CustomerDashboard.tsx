import React, { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { getSalons, getEmployees, getServices, addAppointment, getAvailableSlots, getSalonHours } from './db/database'
import { auth } from './firebase/config'
import { signOut } from 'firebase/auth'
import { format, addMinutes, isAfter } from 'date-fns'

interface CustomerDashboardProps {
  onLogout: () => void
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onLogout }) => {
  const [salons, setSalons] = useState<any[]>([])
  const [selectedSalon, setSelectedSalon] = useState<string | null>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    fetchSalons()
  }, [])

  useEffect(() => {
    if (selectedSalon) {
      fetchEmployees(selectedSalon)
      fetchServices(selectedSalon)
    }
  }, [selectedSalon])

  useEffect(() => {
    if (selectedSalon && selectedEmployee && selectedService && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedSalon, selectedEmployee, selectedService, selectedDate])

  const fetchSalons = async () => {
    try {
      const fetchedSalons = await getSalons()
      setSalons(fetchedSalons)
    } catch (error) {
      console.error("Error fetching salons:", error)
    }
  }

  const fetchEmployees = async (salonId: string) => {
    try {
      const fetchedEmployees = await getEmployees(salonId)
      setEmployees(fetchedEmployees)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const fetchServices = async (salonId: string) => {
    try {
      const fetchedServices = await getServices(salonId)
      setServices(fetchedServices)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchAvailableSlots = async () => {
    if (selectedSalon && selectedEmployee && selectedService && selectedDate) {
      try {
        const salonHours = await getSalonHours(selectedSalon)
        const slots = await getAvailableSlots(selectedSalon, selectedEmployee, selectedService, selectedDate)
        const filteredSlots = filterSlotsByServiceDuration(slots, selectedService)
        setAvailableSlots(filteredSlots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
      }
    }
  }

  const filterSlotsByServiceDuration = (slots: string[], serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return slots

    return slots.filter(slot => {
      const slotStart = new Date(`${selectedDate.toDateString()} ${slot}`)
      const slotEnd = addMinutes(slotStart, service.duration)
      const nextSlotIndex = slots.indexOf(slot) + 1
      if (nextSlotIndex >= slots.length) return true
      const nextSlot = new Date(`${selectedDate.toDateString()} ${slots[nextSlotIndex]}`)
      return isAfter(nextSlot, slotEnd) || nextSlot.getTime() === slotEnd.getTime()
    })
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleBookAppointment = async () => {
    if (selectedSalon && selectedEmployee && selectedService && selectedSlot) {
      try {
        const service = services.find(s => s.id === selectedService)
        const startTime = new Date(`${selectedDate.toDateString()} ${selectedSlot}`)
        const endTime = addMinutes(startTime, service.duration)

        const appointmentData = {
          salonId: selectedSalon,
          employeeId: selectedEmployee,
          serviceId: selectedService,
          startTime,
          endTime,
          customerId: auth.currentUser?.uid || '',
        }
        await addAppointment(appointmentData)
        alert('Appointment booked successfully!')
        // Reset selection
        setSelectedSalon(null)
        setSelectedEmployee(null)
        setSelectedService(null)
        setSelectedDate(new Date())
        setSelectedSlot(null)
        setAvailableSlots([])
      } catch (error) {
        console.error("Error booking appointment:", error)
        alert('Failed to book appointment. Please try again.')
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="salon">Select Salon</Label>
          <Select onValueChange={(value) => setSelectedSalon(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a salon" />
            </SelectTrigger>
            <SelectContent>
              {salons.map((salon) => (
                <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSalon && (
          <>
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Select onValueChange={(value) => setSelectedEmployee(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service">Select Service</Label>
              <Select onValueChange={(value) => setSelectedService(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name} ({service.duration} min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>

            {availableSlots.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Available Slots</h2>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      variant={selectedSlot === slot ? "default" : "outline"}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedSlot && (
              <Button onClick={handleBookAppointment} className="w-full">
                Book Appointment
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CustomerDashboard