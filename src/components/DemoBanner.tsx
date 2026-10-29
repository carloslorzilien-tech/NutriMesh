// src/components/DemoBanner.tsx — Banner discreto de modo demo
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function DemoBanner() {
  const { isDemo } = useAuth();
  if (!isDemo) return null;

  return (
    <div className="demo-badge-bar" role="status" aria-live="polite">
      <AlertCircle size={13} />
      <span>Modo Demo en Memoria · Piloto BARD & Hoteles Santo Domingo</span>
    </div>
  );
}
