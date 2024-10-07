import React from 'react'
import { LogOut } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import EmployeeManagement from './EmployeeManagement'
import ServiceManagement from './ServiceManagement'
import EmployeeSchedule from './components/EmployeeSchedule'
import SalonHours from './components/SalonHours'
import { auth } from './firebase/config'
import { signOut } from 'firebase/auth'

interface SalonViewProps {
  salonId: string;
  salonName: string;
}

const SalonView: React.FC<SalonViewProps> = ({ salonId, salonName }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{salonName} Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="hours">Salon Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeeManagement salonId={salonId} />
        </TabsContent>
        <TabsContent value="services">
          <ServiceManagement salonId={salonId} />
        </TabsContent>
        <TabsContent value="schedule">
          <EmployeeSchedule salonId={salonId} />
        </TabsContent>
        <TabsContent value="hours">
          <SalonHours salonId={salonId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SalonView