import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { getServices, Service } from './db/database'
import { db } from './firebase/config'
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

interface ServiceManagementProps {
  salonId: string;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ salonId }) => {
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState({ name: '', duration: 0, price: 0 })
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [salonId])

  const fetchServices = async () => {
    const fetchedServices = await getServices(salonId)
    setServices(fetchedServices)
  }

  const handleAddService = async () => {
    const servicesRef = collection(db, 'salons', salonId, 'services');
    await addDoc(servicesRef, newService);
    setNewService({ name: '', duration: 0, price: 0 })
    fetchServices()
  }

  const handleUpdateService = async () => {
    if (editingService) {
      const serviceRef = doc(db, 'salons', salonId, 'services', editingService.id);
      await updateDoc(serviceRef, editingService);
      setEditingService(null)
      fetchServices()
    }
  }

  const handleRemoveService = async (serviceId: string) => {
    const serviceRef = doc(db, 'salons', salonId, 'services', serviceId);
    await deleteDoc(serviceRef);
    fetchServices()
  }

  return (
    <div>
      <h2>Service Management</h2>
      <Dialog>
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleAddService}>Add Service</Button>
        </DialogContent>
      </Dialog>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            {service.name} - {service.duration} minutes - ${service.price}
            <Button onClick={() => setEditingService(service)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button onClick={() => handleRemoveService(service.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
          </li>
        ))}
      </ul>
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">
                  Name
                </Label>
                <Input
                  id="editName"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDuration" className="text-right">
                  Duration (minutes)
                </Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editingService.duration}
                  onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPrice" className="text-right">
                  Price
                </Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleUpdateService}>Update Service</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ServiceManagement