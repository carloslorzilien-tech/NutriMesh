# NutriMesh

Coordinación de excedente entre hoteles y el Banco de Alimentos República Dominicana. No es un marketplace. El hotel publica, el banco confirma, el chofer abre un link y el banco pesa lo que llegó.

Piloto de demostración para Build for Earth. Hoteles de prueba: Gran Hotel Europa y Barceló Santo Domingo. Banco: BARD. Santo Domingo.

## Correr

npm install
npm run dev

Sin `.env` arranca en modo demo, con datos en memoria. Para Firebase, copia `.env.example` a `.env` y rellena las claves. Las cuentas se crean a mano en Authentication.

| Rol | Correo | Clave |
| --- | --- | --- |
| Hotel Europa | hotel.europa@nutrimesh.dev | demo1234 |
| Barceló | barcelo@nutrimesh.dev | demo1234 |
| Banco | coordinador@bard.org.do | demo1234 |
| Chofer | sin cuenta | /c/:token |

## Reglas

Caliente: 60 °C o más, 4 h. Frío: 5 °C o menos, 24 h. Una bandeja GN 1/1 son unos 4 kg. Una ración son 0.4 kg (1 kg son 2.5 raciones). Un kg rescatado son unos 2.5 kg de CO₂e. Los tres últimos son supuestos y la app los muestra como supuestos.

El banco no acepta fórmula infantil ni lácteos para menores de 2 años.

## Demo

El recorrido de 4 minutos está en `demo.md`.
