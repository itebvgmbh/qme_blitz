import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { getEmployees, Employee } from './db/database'
import { db } from './firebase/config'
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

interface EmployeeManagementProps {
  salonId: string;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ salonId }) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newEmployee, setNewEmployee] = useState({ name: '', workHours: '', breakTimes: '' })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [salonId])

  const fetchEmployees = async () => {
    const fetchedEmployees = await getEmployees(salonId)
    setEmployees(fetchedEmployees)
  }

  const handleAddEmployee = async () => {
    const employeesRef = collection(db, 'salons', salonId, 'employees');
    await addDoc(employeesRef, newEmployee);
    setNewEmployee({ name: '', workHours: '', breakTimes: '' })
    fetchEmployees()
  }

  const handleUpdateEmployee = async () => {
    if (editingEmployee) {
      const employeeRef = doc(db, 'salons', salonId, 'employees', editingEmployee.id);
      await updateDoc(employeeRef, editingEmployee);
      setEditingEmployee(null)
      fetchEmployees()
    }
  }

  const handleRemoveEmployee = async (employeeId: string) => {
    const employeeRef = doc(db, 'salons', salonId, 'employees', employeeId);
    await deleteDoc(employeeRef);
    fetchEmployees()
  }

  return (
    <div>
      <h2>Employee Management</h2>
      <Dialog>
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workHours" className="text-right">
                Work Hours
              </Label>
              <Input
                id="workHours"
                value={newEmployee.workHours}
                onChange={(e) => setNewEmployee({ ...newEmployee, workHours: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breakTimes" className="text-right">
                Break Times
              </Label>
              <Input
                id="breakTimes"
                value={newEmployee.breakTimes}
                onChange={(e) => setNewEmployee({ ...newEmployee, breakTimes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleAddEmployee}>Add Employee</Button>
        </DialogContent>
      </Dialog>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name} - {employee.workHours} - {employee.breakTimes}
            <Button onClick={() => setEditingEmployee(employee)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button onClick={() => handleRemoveEmployee(employee.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
          </li>
        ))}
      </ul>
      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">
                  Name
                </Label>
                <Input
                  id="editName"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editWorkHours" className="text-right">
                  Work Hours
                </Label>
                <Input
                  id="editWorkHours"
                  value={editingEmployee.workHours}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, workHours: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBreakTimes" className="text-right">
                  Break Times
                </Label>
                <Input
                  id="editBreakTimes"
                  value={editingEmployee.breakTimes}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, breakTimes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleUpdateEmployee}>Update Employee</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default EmployeeManagement