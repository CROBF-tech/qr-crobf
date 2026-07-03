# Acceso a Cámaras de Dispositivos Móviles desde el Navegador (JavaScript)

Guía de referencia técnica sobre cómo pedir, mostrar, capturar y controlar la cámara de un celular usando APIs web nativas — sin depender de una librería de escaneo. Pensada como complemento a `library-usage-patterns-corrected.md` (que cubre las libs de QR/barcode); este doc se queda en la capa de abajo: la API del navegador que todas esas libs terminan usando por debajo.

---

## 1. La API base: `getUserMedia`

Todo acceso a cámara en el navegador pasa por una sola API: `navigator.mediaDevices.getUserMedia()`. Devuelve una `Promise<MediaStream>` — un stream de video (y opcionalmente audio) en vivo que podés conectar a un elemento `<video>`, dibujar en un `<canvas>`, o pasarle a un decodificador de barcodes.

```typescript
async function openCamera(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  return stream;
}
```

Esto solicita **cualquier** cámara disponible con la resolución que el navegador considere razonable. Para un caso real casi nunca vas a usar `video: true` a secas — vas a pasar un objeto de *constraints* (sección 3).

### Requisito obligatorio: Secure Context

`getUserMedia` **no existe o rechaza siempre** fuera de un contexto seguro:

- ✅ `https://` (cualquier dominio)
- ✅ `http://localhost` / `http://127.0.0.1` (excepción especial del navegador)
- ❌ `http://192.168.x.x:PUERTO` — cualquier IP de LAN por HTTP plano

Este es el bug más común al probar en el celu contra tu servidor de desarrollo local. Soluciones: `mkcert` para HTTPS local, o un túnel (`cloudflared`, `ngrok`). En producción no es un problema si el sitio ya sirve por HTTPS.

```typescript
// Chequeo defensivo antes de siquiera intentar
if (!navigator.mediaDevices?.getUserMedia) {
  throw new Error('Camera API not available — check secure context (HTTPS) and browser support');
}
```

### Caso especial: corriendo dentro de un `<iframe>`

Si tu scanner se embebe como widget dentro de un `<iframe>` (integraciones con terceros, un editor tipo web-IDE, un panel embebido en otra plataforma), `getUserMedia` va a fallar con `NotAllowedError` automáticamente **aunque todo esté en HTTPS**, salvo que el iframe declare explícitamente el permiso vía `Permissions-Policy`:

```html
<iframe src="https://qr.crobf.tech/scanner" allow="camera"></iframe>
```

Sin el atributo `allow="camera"` en el `<iframe>` que lo embebe, el navegador bloquea el acceso a cámara del documento embebido por política de seguridad — no es un bug tuyo, es el comportamiento esperado. Si `qr.crobf.tech` en algún momento se ofrece como widget embebible para otros sitios, esto es lo primero para documentarle a quien lo integre.

---

## 2. Mostrar el stream en un `<video>`

```typescript
const videoElement = document.querySelector('video') as HTMLVideoElement;

const stream = await navigator.mediaDevices.getUserMedia({ video: true });
videoElement.srcObject = stream;

try {
  await videoElement.play(); // algunos navegadores requieren llamar play() explícitamente
} catch (err) {
  // play() puede rechazar con AbortError si el video se interrumpe a mitad de arranque
  // (el usuario cambia de pestaña, gira la pantalla, cierra el modal justo en ese instante).
  // No es un error real de tu lado — ignoralo salvo que sea otro tipo de error.
  if ((err as Error).name !== 'AbortError') throw err;
}
```

Atributos del `<video>` que **siempre** hay que poner para que funcione bien en mobile:

```html
<video autoplay playsinline muted></video>
```

- **`playsinline`** — sin esto, iOS Safari abre el video en pantalla completa nativa en vez de mostrarlo embebido en la página. Es el atributo que más gente olvida y el que más rompe la experiencia en iPhone.
- **`muted`** — los navegadores bloquean el autoplay de video con audio sin interacción previa del usuario. Si tu stream no necesita audio (no lo necesita, casi nunca, para escaneo de códigos), pedí `audio: false` directamente en los constraints y de paso poné `muted` para evitar cualquier bloqueo de autoplay.
- **`autoplay`** — sin esto tenés que llamar `.play()` manualmente vos, lo cual también funciona pero es un paso más para olvidarse.

---

## 3. Constraints: elegir cámara, resolución y más

El segundo nivel de control es el objeto de *constraints* que le pasás a `getUserMedia`. Esto es lo que te deja pedir la cámara trasera, cierta resolución, etc.

### Cámara trasera vs frontal (`facingMode`)

```typescript
// Preferí la trasera, pero aceptá lo que haya (ideal)
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }, // 'user' para la frontal
});

// Exigí la trasera estrictamente (falla si no existe)
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: 'environment' } },
});
```

- `facingMode: 'environment'` (sin `exact`) es una **preferencia**: el navegador intenta dártela pero cae de vuelta a otra cámara si no puede cumplirla. Es lo que querés en el 95% de los casos — un escaner de QR con `facingMode: 'environment'` a secas.
- `{ exact: 'environment' }` hace que la promesa **rechace** (`OverconstrainedError`) si el dispositivo no tiene cámara trasera. Usalo solo si preferís mostrar un error claro antes que dejar que caiga a la frontal.

### Resolución

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
});
```

`ideal` es una preferencia suave — el navegador intenta acercarse pero no falla si no puede. Usar `min`/`max` en vez de `ideal` es más agresivo y puede hacer que la promesa rechace en dispositivos de gama baja; para un scanner de códigos, `ideal` es casi siempre lo correcto. Pedir una resolución más alta de la necesaria en celulares viejos puede además hacer que el decodificador de QR/barcode vaya más lento porque tiene más píxeles para procesar por frame — para escaneo, 1280x720 suele ser de sobra.

### Frame rate

```typescript
video: {
  frameRate: { ideal: 30, max: 30 },
}
```

Poner un `max` explícito evita que algunos dispositivos Android entreguen frames a 60fps innecesariamente, lo cual quema batería y CPU sin beneficio real para decodificar códigos.

### `aspectRatio`

```typescript
video: {
  aspectRatio: { ideal: 1 }, // cuadrado — o 4/3 si preferís
}
```

Es una constraint real y válida para controlar la forma del recorte de video que te devuelve el navegador (útil, por ejemplo, si tu UI de escaneo muestra un cuadro cuadrado y no querés lidiar con un video 16:9 y hacer el crop vos mismo en CSS/canvas).

⚠️ **Lo que NO hace:** a diferencia de lo que a veces se lee por ahí, `aspectRatio` **no** es una forma confiable de evitar que un Android con múltiples cámaras traseras (angular, ultra angular, macro) elija el lente equivocado. Esto está confirmado por los propios editores del spec de W3C: no existe hoy ninguna constraint estándar (`aspectRatio`, `zoom`, etc.) que distinga de forma confiable entre lentes físicos del mismo dispositivo — por eso hay una propuesta abierta para agregar una constraint nueva (`focalLength`) que todavía no está implementada en ningún navegador. Si te encontrás con el problema real de "el celu abre la cámara ultra angular en vez de la principal", la única solución que funciona hoy es la de la Sección 4: enumerar dispositivos con `enumerateDevices()` y elegir por `deviceId` o heurística de `label` (los labels de Android suelen incluir un índice numérico donde la cámara principal trasera es casi siempre la `0`).

### Combinando todo (constraints típicas para un scanner)

```typescript
const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
  },
};
```

---

## 4. Listar cámaras disponibles (`enumerateDevices`)

Si necesitás dejar que el usuario elija entre varias cámaras (por ejemplo, un dispositivo con dos cámaras traseras, común en flagships modernos), usás `enumerateDevices()`:

```typescript
async function listCameras(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
```

### ⚠️ Trampa no obvia: `label` viene vacío sin permiso previo

`enumerateDevices()` funciona sin haber pedido permiso de cámara todavía, pero en ese caso cada `MediaDeviceInfo.label` viene como **string vacío** por privacidad (el navegador no te deja enumerar cámaras por nombre hasta que el usuario ya te dio acceso a al menos una). Esto rompe cualquier UI de "elegí tu cámara" que dependa de mostrar nombres legibles.

**Fix:** pedí `getUserMedia` una vez primero (aunque sea con constraints genéricas) para "desbloquear" los labels, y recién después llamá `enumerateDevices()`:

```typescript
async function listCamerasWithLabels(): Promise<MediaDeviceInfo[]> {
  // Paso 1: pedir cualquier stream de video para que el navegador
  // nos deje ver los labels reales de los dispositivos
  const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
  tempStream.getTracks().forEach((track) => track.stop()); // cerrala, no la necesitamos

  // Paso 2: ahora sí, labels legibles
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
```

### Elegir una cámara específica por `deviceId`

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId: { exact: chosenDevice.deviceId } },
});
```

---

## 5. Capturar una foto (frame estático a `<canvas>`)

Para tomar una "foto" del frame actual del video (útil si querés capturar la imagen de un código en vez de decodificarlo en vivo, o para un flujo de "sacale una foto al código"):

```typescript
function captureFrame(video: HTMLVideoElement): Blob | null {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // toBlob es async por naturaleza (callback), toDataURL es sync pero más pesado en memoria
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
```

⚠️ Importante: `video.videoWidth` / `video.videoHeight` son **`0` hasta que el video tiene metadata cargada**. Si llamás a esto inmediatamente después de asignar `srcObject`, antes de que el stream esté realmente reproduciendo, vas a crear un canvas de 0x0. Esperá el evento `loadedmetadata` (o el `await videoElement.play()` ya resuelto, que normalmente implica que ya hay metadata) antes de permitir capturas.

```typescript
await new Promise<void>((resolve) => {
  if (video.readyState >= 1) return resolve(); // ya tiene metadata (HAVE_METADATA)
  video.addEventListener('loadedmetadata', () => resolve(), { once: true });
});
```

---

## 6. Cerrar la cámara correctamente (el paso que todos olvidan)

Asignar `srcObject = null` en el `<video>` **no apaga la cámara física**. El ícono/luz de cámara del sistema operativo se queda prendido hasta que detenés cada `track` del stream explícitamente:

```typescript
function closeCamera(stream: MediaStream, videoElement: HTMLVideoElement) {
  stream.getTracks().forEach((track) => track.stop()); // esto es lo que realmente apaga la cámara
  videoElement.srcObject = null; // esto solo desconecta el <video> del stream
}
```

Los dos pasos son necesarios: `track.stop()` libera el hardware, `srcObject = null` limpia la referencia del DOM. Si te olvidás del primero, el usuario ve la lucecita de cámara prendida (o el ícono de "app usando la cámara" en el navegador) incluso después de navegar a otra pantalla — un problema de privacidad y de batería.

### Guardar la referencia al stream para poder cerrarlo después

Patrón típico en un componente:

```typescript
function useCameraStream() {
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const start = useCallback(async (constraints: MediaStreamConstraints) => {
    // si ya había un stream abierto, cerralo antes de abrir uno nuevo
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // el componente pudo haberse desmontado MIENTRAS esperábamos el permiso/hardware
    // (usuario cierra el modal rápido, navega, etc.) — si eso pasó, apagamos
    // la cámara inmediatamente en vez de dejarla prendida sin dueño
    if (!isMountedRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return null;
    }

    streamRef.current = stream;
    return stream;
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  return { start, stop };
}
```

### ⚠️ Race condition: desmontaje mientras `getUserMedia` está en vuelo

`getUserMedia` puede tardar — está esperando que el usuario acepte el prompt de permiso, o que el hardware de la cámara arranque. Si el componente se desmonta en ese lapso (usuario cierra el modal del scanner antes de aceptar el permiso, navega a otra pantalla), el `return` del `useEffect` de cleanup ya se ejecutó — pero en ese momento `streamRef.current` todavía es `null`, porque la promesa de `getUserMedia` ni siquiera resolvió. Cuando esa promesa finalmente resuelve (a veces varios segundos después, si el usuario tardó en decidir el permiso), el código le asigna el stream a `streamRef.current` de un componente que ya no existe — y como nadie va a volver a llamar `stop()`, la cámara queda prendida indefinidamente sin forma de apagarla desde la UI.

El hook de arriba ya incluye el fix: un `isMountedRef` que se chequea *después* de que `getUserMedia` resuelve, apagando el stream inmediatamente si el componente ya no está montado. Es el mismo patrón que la condición de carrera de React Strict Mode documentada en `library-usage-patterns-corrected.md` para los wrappers de scanner — acá aplica al nivel más bajo, directo sobre `getUserMedia`.

---

## 7. Linterna / flash (`torch`)

Algunos dispositivos Android exponen el control de linterna como una *advanced constraint* aplicable después de ya tener el stream abierto (no todos los navegadores/dispositivos lo soportan — notablemente, **no funciona en iOS Safari**):

```typescript
async function toggleTorch(stream: MediaStream, on: boolean) {
  const [track] = stream.getVideoTracks();
  const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };

  if (!capabilities.torch) {
    console.warn('Torch not supported on this device/browser');
    return;
  }

  await track.applyConstraints({
    advanced: [{ torch: on } as any], // el tipo `torch` no está en el lib.dom.d.ts estándar todavía
  });
}
```

Nota de TypeScript: `torch` no forma parte de los tipos DOM estándar de TypeScript (es una extensión no estandarizada del W3C Media Capture spec), así que vas a necesitar un `as any` o una declaración de tipos custom como se hace con `jsQR` en el otro documento.

---

## 8. Verificar el estado de permiso sin disparar el prompt

La **Permissions API** te deja consultar si el usuario ya dio, negó, o no decidió el permiso de cámara — sin mostrar el prompt del navegador. Útil para adaptar la UI ("Activar cámara" vs "Cámara bloqueada, revisá los ajustes") antes de intentar `getUserMedia`:

```typescript
async function getCameraPermissionState(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!navigator.permissions?.query) return 'unsupported'; // Safari no soporta 'camera' como query name en todas las versiones
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unsupported';
  }
}
```

⚠️ Soporte disparejo: Safari (todas las plataformas) no soporta consultar `'camera'` vía `navigator.permissions.query` de forma confiable — vas a tener que envolver esto en `try/catch` y tratar cualquier fallo como `'unsupported'`, cayendo directamente a intentar `getUserMedia` y manejar el error si el usuario ya lo había denegado antes.

---

## 9. Manejo de errores: qué significa cada uno

`getUserMedia` rechaza con distintos tipos de `DOMException`. Vale la pena diferenciarlos porque el mensaje que le mostrás al usuario debería ser distinto en cada caso:

| `error.name` | Significa | Qué mostrarle al usuario |
|---|---|---|
| `NotAllowedError` | El usuario negó el permiso (o el navegador lo bloqueó por política, ej. iframe sin `allow="camera"` — ver Sección 1) | "Necesitamos acceso a la cámara — revisá los permisos del sitio en la configuración del navegador" |
| `NotFoundError` | No hay ninguna cámara física disponible | "No se encontró ninguna cámara en este dispositivo" |
| `NotReadableError` | Hay cámara, pero otro proceso/pestaña ya la está usando y el hardware no permite acceso compartido | "La cámara está siendo usada por otra aplicación" |
| `OverconstrainedError` | Los constraints pedidos (ej. `facingMode: { exact: 'environment' }`) no los puede cumplir ningún dispositivo | Reintentar con constraints más flexibles, o avisar que ese modo no está disponible |
| `SecurityError` | No estás en un contexto seguro (ver sección 1) | Bug de configuración, no del usuario — no debería llegar nunca a producción |
| `AbortError` | Interrupción de hardware/OS a mitad de la solicitud (poco común) | "Ocurrió un problema al iniciar la cámara, probá de nuevo" |

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
} catch (err) {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
        // permiso denegado
        break;
      case 'NotFoundError':
        // sin cámara
        break;
      case 'NotReadableError':
        // cámara ocupada por otra app
        break;
      case 'OverconstrainedError':
        // constraints imposibles — reintentar sin `exact`
        break;
      default:
      // caso genérico
    }
  }
}
```

---

## 10. Particularidades por plataforma

### iOS Safari (y cualquier navegador en iOS, todos usan WebKit)

- Requiere `playsinline` en el `<video>` sin excepción, o el video se abre en fullscreen nativo.
- No soporta la Permissions API para `'camera'` de forma confiable (sección 8).
- No soporta `torch` en `applyConstraints` — no hay control de flash desde la web en iPhone.
- No soporta la `BarcodeDetector` API nativa (ver el otro documento) — cualquier decodificación tiene que hacerse con una librería JS/WASM.
- Requiere secure context de forma estricta, sin excepciones adicionales más allá de `localhost`.
- iOS < 14.3 tenía restricciones adicionales de WebRTC fuera de Safari nativo (dentro de WebViews de otras apps) — si el proyecto en algún momento corre embebido en un WebView de una app nativa, esto puede ser relevante, pero para navegación normal ya no aplica en versiones actuales.

### Android Chrome / navegadores basados en Chromium

- Soporta `torch`, `zoom`, y otras *advanced constraints* que iOS no tiene.
- Soporta la Permissions API completa para `'camera'`.
- Soporta `BarcodeDetector` nativo.
- En dispositivos con múltiples cámaras traseras (teleobjetivo, ultra gran angular, etc.), `facingMode: 'environment'` sin más especificación deja que el navegador elija cuál — normalmente la principal, pero no está garantizado. Si necesitás una específica, hay que enumerar dispositivos y elegir por `deviceId` o por `label` (heurística, ya que los labels no están estandarizados entre fabricantes).

---

## 11. Checklist rápido de troubleshooting

Si la cámara no abre o se comporta raro, revisar en este orden:

1. **¿Es secure context?** — `https://` o `localhost`, nunca una IP de LAN por HTTP.
2. **¿Tiene `playsinline` el `<video>`?** — si no, en iOS se va a fullscreen o falla el autoplay.
3. **¿Se está capturando el frame antes de `loadedmetadata`?** — `videoWidth`/`videoHeight` en 0 es la señal.
4. **¿Hay un stream anterior sin cerrar?** — revisar que `track.stop()` se llame siempre antes de abrir uno nuevo, no solo `srcObject = null`.
5. **¿Constraints demasiado estrictas?** — probar sacando `exact` y usando `ideal` para descartar `OverconstrainedError`.
6. **¿El error es realmente de permisos o de hardware ocupado?** — diferenciar `NotAllowedError` de `NotReadableError` (sección 9) antes de asumir que es un tema de permisos.
7. **¿Se está usando una librería de escaneo (`html5-qrcode`, `@zxing/browser`) encima de esto?** — ver `library-usage-patterns-corrected.md` para las condiciones de carrera específicas de esas wrappers (arranques concurrentes, streams huérfanos, etc.), que son un nivel de complejidad aparte de lo cubierto acá.