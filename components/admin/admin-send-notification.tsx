import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { createNotification, NotificationTemplates } from '@/lib/notifications';
import { getDocuments } from '@/lib/firebase';
export function AdminSendNotification() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [channel, setChannel] = useState<'in-app' | 'email'>('in-app');
  const [template, setTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Notification templates
  const templates = [
    { value: 'late', label: 'Attendance Irregularity (Late)', get: (t: any) => NotificationTemplates.lateArrival(t.name, 'Room 101', '8:00 AM') },
    { value: 'absent', label: 'Attendance Irregularity (Absent)', get: (t: any) => NotificationTemplates.absence(t.name, 'Room 101') },
    { value: 'reminder', label: 'Class Reminder', get: (t: any) => NotificationTemplates.scheduleChange('Room 203', '10:00 AM') },
    { value: 'correction', label: 'Attendance Correction', get: (t: any) => ({ title: 'Attendance Correction', message: `Your attendance record for ${new Date().toLocaleDateString()} has been corrected to On-Time.`, type: 'info', category: 'attendance' }) },
    { value: 'announcement', label: 'System/School Announcement', get: (_t?: any) => NotificationTemplates.systemMaintenance('Tomorrow 8:00 PM') },
  ];

  // Fetch teachers on mount
  useEffect(() => {
    getDocuments('teachers').then(setTeachers);
  }, []);

  // Handle template selection
  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    const teacher = teachers.find(t => t.id === selectedTeacher);
    const tpl = templates.find(t => t.value === val);
    if (tpl) {
      const notif = tpl.get(teacher);
      setTitle(notif.title);
      setMessage(notif.message);
      setType(notif.type);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setSuccess('');
    setError('');
    try {
      // In-app notification
      await createNotification({
        user_id: selectedTeacher,
        user_role: 'teacher',
        title,
        message,
        type: type as 'info' | 'success' | 'warning' | 'error',
        category: 'system',
      });
      // Email notification (stub, extend with backend API)
      if (channel === 'email') {
        // TODO: Call backend API to send email
      }
      setSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setSelectedTeacher('');
      setTemplate('');
    } catch (err) {
      setError('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Send Notification to Teacher</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Select Teacher</label>
            <Select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); setTemplate(''); }}>
              <option value="">-- Select --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Purpose/Template</label>
            <Select value={template} onChange={e => handleTemplateChange(e.target.value)}>
              <option value="">-- Custom --</option>
              {templates.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification Title" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification Message" />
            {/* Removed stray import for getDocuments */}
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <Select value={type} onChange={e => setType(e.target.value)}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Channel</label>
            <Select value={channel} onChange={e => setChannel(e.target.value as 'in-app' | 'email')}>
              <option value="in-app">In-App</option>
              <option value="email">Email</option>
            </Select>
          </div>
          <Button onClick={handleSend} disabled={isSending || !selectedTeacher || !title || !message}>
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
          {success && <div className="text-green-600 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
// ...existing code...
