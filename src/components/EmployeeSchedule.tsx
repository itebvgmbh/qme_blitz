import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { getEmployees, getAppointments, getSalonHours, Employee, Appointment, SalonHours } from '../db/database'
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircle } from "lucide-react"
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface EmployeeScheduleProps {
  salonId: string;
}

const EmployeeSchedule: React.FC<EmployeeScheduleProps> = ({ salonId }) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [salonHours, setSalonHours] = useState<SalonHours | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
    fetchAppointments()
    fetchSalonHours()
  }, [salonId, currentDate])

  const fetchEmployees = async () => {
    try {
      const fetchedEmployees = await getEmployees(salonId)
      setEmployees(fetchedEmployees)
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Failed to fetch employees. Please try again later.")
    }
  }

  const fetchAppointments = async () => {
    try {
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
      const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59)
      const fetchedAppointments = await getAppointments(salonId, startOfDay, endOfDay)
      const formattedAppointments = fetchedAppointments.map((appointment: Appointment) => ({
        id: appointment.id,
        title: `${appointment.customerName} - ${appointment.serviceName}`,
        start: new Date(appointment.startTime.seconds * 1000),
        end: new Date(appointment.endTime.seconds * 1000),
        resourceId: appointment.employeeId
      }))
      setAppointments(formattedAppointments)
      setError(null)
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError("Failed to fetch appointments. An index may need to be created in Firebase.")
    }
  }

  const fetchSalonHours = async () => {
    try {
      const hours = await getSalonHours(salonId)
      setSalonHours(hours)
    } catch (err) {
      console.error("Error fetching salon hours:", err)
      setError("Failed to fetch salon hours. Please try again later.")
    }
  }

  const generateSalonHoursEvents = () => {
    if (!salonHours) return []

    const events = []
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[currentDate.getDay()]

    const dayHours = salonHours[currentDay]
    if (dayHours) {
      // Add working hours event
      events.push({
        id: 'workingHours',
        title: 'Working Hours',
        start: new Date(currentDate.setHours(parseInt(dayHours.start.split(':')[0]), parseInt(dayHours.start.split(':')[1]))),
        end: new Date(currentDate.setHours(parseInt(dayHours.end.split(':')[0]), parseInt(dayHours.end.split(':')[1]))),
        resourceId: 'salon',
        color: '#e6f7ff'
      })

      // Add break events
      dayHours.breaks.forEach((brk, index) => {
        events.push({
          id: `break-${index}`,
          title: 'Break',
          start: new Date(currentDate.setHours(parseInt(brk.start.split(':')[0]), parseInt(brk.start.split(':')[1]))),
          end: new Date(currentDate.setHours(parseInt(brk.end.split(':')[0]), parseInt(brk.end.split(':')[1]))),
          resourceId: 'salon',
          color: '#ffe7e7'
        })
      })
    }

    return events
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const allEvents = [...appointments, ...generateSalonHoursEvents()]

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="day"
        views={['day', 'week']}
        step={30}
        resources={[{ id: 'salon', title: 'Salon Hours' }, ...employees]}
        resourceIdAccessor="id"
        resourceTitleAccessor="name"
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || '#3174ad'
          }
        })}
      />
    </div>
  )
}

export default EmployeeSchedule