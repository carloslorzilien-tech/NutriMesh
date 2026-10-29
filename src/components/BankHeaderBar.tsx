import { useData } from '../context/DataContext';

// Banco top‑bar showing live counts
export default function BankHeaderBar() {
  const { batches } = useData();

  // Helper to filter by status
  const countByStatus = (status: string) =>
    batches.filter((b) => b.status === status).length;

  const kgWeighedToday = batches
    .filter((b) => b.status === 'RECIBIDO')
    .reduce((sum, b) => sum + (b.destKg ?? b.originKg ?? b.estimatedKg ?? 0), 0);

  return (
    <div
      style={{
        height: 40,
        background: 'var(--color-bosque, #14372C)',
        color: '#F9F8F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        padding: '0 20px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 450,
      }}
    >
      <span>
        Por recoger: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{countByStatus('PUBLICADO')}</span>
      </span>
      <span>
        En camino: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{countByStatus('CONFIRMADO')}</span>
      </span>
      <span>
        Kg pesados hoy: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{kgWeighedToday.toFixed(1)} kg</span>
      </span>
    </div>
  );
}
