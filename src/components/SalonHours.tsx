import React, { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { setSalonHours, getSalonHours, SalonHours as SalonHoursType } from '../db/database'

interface SalonHoursProps {
  salonId: string;
}

const defaultHours: SalonHoursType = {
  monday: { start: '09:00', end: '17:00', breaks: [] },
  tuesday: { start: '09:00', end: '17:00', breaks: [] },
  wednesday: { start: '09:00', end: '17:00', breaks: [] },
  thursday: { start: '09:00', end: '17:00', breaks: [] },
  friday: { start: '09:00', end: '17:00', breaks: [] },
  saturday: { start: '09:00', end: '17:00', breaks: [] },
  sunday: { start: '09:00', end: '17:00', breaks: [] },
};

const SalonHours: React.FC<SalonHoursProps> = ({ salonId }) => {
  const [hours, setHours] = useState<SalonHoursType>(defaultHours);

  useEffect(() => {
    const fetchHours = async () => {
      const fetchedHours = await getSalonHours(salonId);
      if (fetchedHours) {
        setHours(fetchedHours);
      }
    };
    fetchHours();
  }, [salonId]);

  const handleHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setHours(prevHours => ({
      ...prevHours,
      [day]: { ...prevHours[day], [field]: value }
    }));
  };

  const handleBreakChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setHours(prevHours => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        breaks: prevHours[day].breaks.map((brk, i) => 
          i === index ? { ...brk, [field]: value } : brk
        )
      }
    }));
  };

  const addBreak = (day: string) => {
    setHours(prevHours => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        breaks: [...prevHours[day].breaks, { start: '12:00', end: '13:00' }]
      }
    }));
  };

  const removeBreak = (day: string, index: number) => {
    setHours(prevHours => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        breaks: prevHours[day].breaks.filter((_, i) => i !== index)
      }
    }));
  };

  const saveHours = async () => {
    await setSalonHours(salonId, hours);
    alert('Salon hours saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Salon Hours</h2>
      {Object.entries(hours).map(([day, dayHours]) => (
        <div key={day} className="space-y-2">
          <h3 className="text-lg font-semibold capitalize">{day}</h3>
          <div className="flex space-x-4">
            <div>
              <Label htmlFor={`${day}-start`}>Start</Label>
              <Input
                id={`${day}-start`}
                type="time"
                value={dayHours.start}
                onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`${day}-end`}>End</Label>
              <Input
                id={`${day}-end`}
                type="time"
                value={dayHours.end}
                onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-md font-medium">Breaks</h4>
            {dayHours.breaks.map((brk, index) => (
              <div key={index} className="flex space-x-4 items-end">
                <div>
                  <Label htmlFor={`${day}-break-${index}-start`}>Start</Label>
                  <Input
                    id={`${day}-break-${index}-start`}
                    type="time"
                    value={brk.start}
                    onChange={(e) => handleBreakChange(day, index, 'start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${day}-break-${index}-end`}>End</Label>
                  <Input
                    id={`${day}-break-${index}-end`}
                    type="time"
                    value={brk.end}
                    onChange={(e) => handleBreakChange(day, index, 'end', e.target.value)}
                  />
                </div>
                <Button onClick={() => removeBreak(day, index)} variant="destructive">Remove</Button>
              </div>
            ))}
            <Button onClick={() => addBreak(day)}>Add Break</Button>
          </div>
        </div>
      ))}
      <Button onClick={saveHours}>Save Hours</Button>
    </div>
  );
};

export default SalonHours;