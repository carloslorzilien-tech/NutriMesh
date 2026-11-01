# NutriMesh — Piloto Operativo

Red logística entre cocinas de hoteles y bancos de alimentos en Santo Domingo, RD.

## Cómo ejecutar en local

```bash
cp .env.example .env   # rellena las variables de Firebase
npm install
npm run dev            # http://localhost:5173
```

## Variables de entorno

Crea un archivo `.env` en la raíz con las credenciales de Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Si el `.env` no existe la app arranca en **modo memoria**: los datos no se
persisten entre recargas pero el flujo completo es navegable.

## Despliegue en Vercel

1. Configura las mismas variables en *Settings → Environment Variables*.
2. Asegúrate de que el dominio de Vercel esté autorizado en Firebase:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Añade `<tu-proyecto>.vercel.app` (y el dominio personalizado si lo hay).

## Cuentas del piloto

| Cuenta | Rol |
|--------|-----|
| hotel.europa@nutrimesh.dev | Hotel (Gran Hotel Europa) |
| barcelo@nutrimesh.dev | Hotel (Barceló Santo Domingo) |
| coordinador@bard.org.do | Banco de alimentos |

## Arquitectura

```
src/
  pages/
    LandingPage.tsx   Portada pública (/, sin sesión)
    Login.tsx         Formulario de acceso (/login)
    HotelDashboard.tsx  Panel del hotel (/hotel)
    BancoDashboard.tsx  Panel del banco (/banco)
    DriverView.tsx    Vista del chofer (/c/:token) — sin cuenta
  components/
    Nav.tsx           Navbar de los paneles autenticados
    BatchRow.tsx      Fila de un lote en la lista
  context/
    AuthContext.tsx   Firebase Auth + modo demo
    ActivityContext.tsx  Últimas 8 líneas de actividad
  lib/
    firebase.ts       Inicialización de Firebase (solo si .env existe)
    store.ts          Capa de datos: Firestore o memoria
    types.ts          Tipos compartidos
    demo.ts           Datos en memoria para modo sin .env
  styles/
    global.css        Tokens, reset, utilidades y layout del panel
```

## Estados de un lote

`PUBLICADO → CONFIRMADO → RECOGIDO → RECIBIDO / RECHAZADO`

El hotel también puede reportar `SIN_EXCEDENTE` si no sobró nada.
