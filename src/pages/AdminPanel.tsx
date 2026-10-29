// src/pages/AdminPanel.tsx — Panel de Administración (PWA Operativa Clara)
import Nav from '../components/Nav';
import DemoBanner from '../components/DemoBanner';
import { DEMO_USERS } from '../lib/seedData';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ROLE_LABEL: Record<string, string> = {
  hotel: 'Hotel',
  coordinator: 'Banco (BARD)',
  admin: 'Administrador',
};

export default function AdminPanel() {
  const { isDemo } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-canvas)' }}>
      <DemoBanner />
      <Nav />

      <main className="app-container" style={{ paddingBottom: 60, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-pill status-pill--publicado" style={{ fontSize: 10 }}>
              SISTEMA & CUENTAS
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              PILOTO SANTO DOMINGO
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-ink)' }}>
            Administración del Piloto
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 2 }}>
            Gestión de identidades institucionales y llaves de acceso operativo.
          </p>
        </div>

        {isDemo && (
          <div className="notice-box notice-box--info" style={{ marginBottom: 24 }}>
            La app está ejecutándose en <strong>Modo Demo en Memoria</strong>. Al conectar Firebase mediante <code>.env</code>, las cuentas se validan contra Firebase Authentication.
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Usuarios Habilitados</h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>NOMBRE</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>CORREO</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>ROL</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>HOTEL ID</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 650 }}>{u.name}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-pill ${u.role === 'coordinator' ? 'status-pill--recibido' : u.role === 'admin' ? 'status-pill--confirmado' : 'status-pill--publicado'}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                      {u.hotelId ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credenciales Demo Preconfiguradas */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>Credenciales de Demostración</h3>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 14 }}>
            Contraseña estándar para todas las cuentas de prueba: <code>demo1234</code>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div style={{ padding: 12, background: 'var(--color-surface-sub)', borderRadius: 6 }}>
              <strong>Gran Hotel Europa:</strong>
              <div>hotel.europa@nutrimesh.dev</div>
            </div>
            <div style={{ padding: 12, background: 'var(--color-surface-sub)', borderRadius: 6 }}>
              <strong>Barceló Santo Domingo:</strong>
              <div>barcelo@nutrimesh.dev</div>
            </div>
            <div style={{ padding: 12, background: 'var(--color-surface-sub)', borderRadius: 6 }}>
              <strong>BARD (Banco de Alimentos):</strong>
              <div>coordinador@bard.org.do</div>
            </div>
          </div>
        </div>

        {/* Accesos directos */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/hotel" className="btn btn--secondary">Ir a Panel Hotel</Link>
          <Link to="/banco" className="btn btn--secondary">Ir a Radar Banco</Link>
          <Link to="/impacto" className="btn btn--secondary">Ir a Impacto</Link>
        </div>
      </main>
    </div>
  );
}
