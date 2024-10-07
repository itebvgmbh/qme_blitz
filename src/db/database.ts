import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, Timestamp } from 'firebase/firestore';

export interface Salon {
  id: string;
  name: string;
  ownerId: string;
}

export interface Employee {
  id: string;
  name: string;
  workHours: string;
  breakTimes: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Appointment {
  id: string;
  salonId: string;
  employeeId: string;
  customerId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
}

export interface SalonHours {
  [day: string]: {
    start: string;
    end: string;
    breaks: { start: string; end: string }[];
  };
}

export const getSalons = async (): Promise<Salon[]> => {
  const salonsRef = collection(db, 'salons');
  const snapshot = await getDocs(salonsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Salon));
};

export const getEmployees = async (salonId: string): Promise<Employee[]> => {
  const employeesRef = collection(db, 'salons', salonId, 'employees');
  const snapshot = await getDocs(employeesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
};

export const getServices = async (salonId: string): Promise<Service[]> => {
  const servicesRef = collection(db, 'salons', salonId, 'services');
  const snapshot = await getDocs(servicesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<string> => {
  const appointmentsRef = collection(db, 'appointments');
  const docRef = await addDoc(appointmentsRef, {
    ...appointmentData,
    startTime: Timestamp.fromDate(appointmentData.startTime),
    endTime: Timestamp.fromDate(appointmentData.endTime)
  });
  return docRef.id;
};

export const getAppointments = async (salonId: string, startDate: Date, endDate: Date): Promise<Appointment[]> => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(
    appointmentsRef,
    where('salonId', '==', salonId),
    where('startTime', '>=', Timestamp.fromDate(startDate)),
    where('startTime', '<', Timestamp.fromDate(endDate))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime.toDate(),
    endTime: doc.data().endTime.toDate()
  } as Appointment));
};

export const getSalonHours = async (salonId: string): Promise<SalonHours | null> => {
  const salonRef = doc(db, 'salons', salonId);
  const salonDoc = await getDoc(salonRef);
  if (salonDoc.exists()) {
    return salonDoc.data().hours as SalonHours;
  }
  return null;
};

export const getAvailableSlots = async (salonId: string, employeeId: string, serviceId: string, date: Date): Promise<string[]> => {
  const salonHours = await getSalonHours(salonId);
  if (!salonHours) return [];

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = salonHours[dayOfWeek];
  if (!dayHours) return [];

  const employee = await getEmployeeById(salonId, employeeId);
  if (!employee) return [];

  const service = await getServiceById(salonId, serviceId);
  if (!service) return [];

  const appointments = await getAppointments(salonId, date, new Date(date.getTime() + 24 * 60 * 60 * 1000));

  const slots: string[] = [];
  const startTime = new Date(`${date.toDateString()} ${dayHours.start}`);
  const endTime = new Date(`${date.toDateString()} ${dayHours.end}`);

  while (startTime < endTime) {
    const slotEnd = new Date(startTime.getTime() + 10 * 60 * 1000);
    const slotString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (
      isEmployeeAvailable(employee, startTime) &&
      !isEmployeeOnBreak(dayHours.breaks, startTime) &&
      !hasConflictingAppointment(appointments, employeeId, startTime, slotEnd)
    ) {
      slots.push(slotString);
    }

    startTime.setMinutes(startTime.getMinutes() + 10);
  }

  return slots;
};

const isEmployeeAvailable = (employee: Employee, time: Date): boolean => {
  const [startHour, startMinute] = employee.workHours.split('-')[0].split(':').map(Number);
  const [endHour, endMinute] = employee.workHours.split('-')[1].split(':').map(Number);
  const startTime = new Date(time.getTime());
  startTime.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(time.getTime());
  endTime.setHours(endHour, endMinute, 0, 0);

  return time >= startTime && time < endTime;
};

const isEmployeeOnBreak = (breaks: { start: string; end: string }[], time: Date): boolean => {
  return breaks.some(breakTime => {
    const [startHour, startMinute] = breakTime.start.split(':').map(Number);
    const [endHour, endMinute] = breakTime.end.split(':').map(Number);
    const breakStart = new Date(time.getTime());
    breakStart.setHours(startHour, startMinute, 0, 0);
    const breakEnd = new Date(time.getTime());
    breakEnd.setHours(endHour, endMinute, 0, 0);

    return time >= breakStart && time < breakEnd;
  });
};

const hasConflictingAppointment = (appointments: Appointment[], employeeId: string, start: Date, end: Date): boolean => {
  return appointments.some(appointment => 
    appointment.employeeId === employeeId &&
    ((start >= appointment.startTime && start < appointment.endTime) ||
     (end > appointment.startTime && end <= appointment.endTime) ||
     (start <= appointment.startTime && end >= appointment.endTime))
  );
};

const getEmployeeById = async (salonId: string, employeeId: string): Promise<Employee | null> => {
  const employeeRef = doc(db, 'salons', salonId, 'employees', employeeId);
  const employeeDoc = await getDoc(employeeRef);
  return employeeDoc.exists() ? { id: employeeDoc.id, ...employeeDoc.data() } as Employee : null;
};

const getServiceById = async (salonId: string, serviceId: string): Promise<Service | null> => {
  const serviceRef = doc(db, 'salons', salonId, 'services', serviceId);
  const serviceDoc = await getDoc(serviceRef);
  return serviceDoc.exists() ? { id: serviceDoc.id, ...serviceDoc.data() } as Service : null;
};

export const setSalonHours = async (salonId: string, hours: SalonHours): Promise<void> => {
  const salonRef = doc(db, 'salons', salonId);
  await updateDoc(salonRef, { hours });
};