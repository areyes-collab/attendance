import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AdminSendNotification } from './admin-send-notification';

export function SendNotificationButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('openSendNotificationModal', handler);
    return () => window.removeEventListener('openSendNotificationModal', handler);
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <AdminSendNotification />
          </div>
        </div>
      )}
    </>
  );
}
