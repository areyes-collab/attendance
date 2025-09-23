import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AdminRFIDScanner } from '@/components/admin/admin-rfid-scanner';

export default function AdminScanPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">RFID Scanner</h1>
              <p className="text-gray-600">
                Scan teacher RFID cards to record attendance for scheduled classes.
              </p>
            </div>
            
            <AdminRFIDScanner />
          </div>
        </main>
      </div>
    </div>
  );
}