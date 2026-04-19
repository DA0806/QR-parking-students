# Control de Parqueo con QR - Key Alumnos

Una aplicación móvil desarrollada con **React Native (Expo)** y diseñada con un enfoque premium para gestionar de forma inteligente el sistema de parqueos dentro de un campus, optimizando el tiempo y dando visibilidad en tiempo real a los cupos disponibles.

## 🚀 Características Principales

Esta aplicación divide su funcionalidad según el rol del usuario (Estudiante vs. Seguridad/Administrador):

**1. Módulo Estudiante:**
* **Panel en vivo:** Visualiza la ocupación y aforo disponible de todas las zonas de parqueo mediante barras de progreso y diseño dinámico.
* **Smart QR Pass:** Generación inmediata de un gafete de entrada (QR dinámico) que contiene el id del usuario y las placas de sus vehículos registrados, validado directamente contra el sistema.

**2. Módulo Seguridad (Administrador):**
* **Cámara Escáner Nativa:** Uso de la tecnología de dispositivo (`expo-camera`) para enfocar el pase de los alumnos a su llegada o salida.
* **Lógica Autónoma:** El sistema capta automáticamente el flujo leyendo la `plate` del auto, revisando el aforo; si hay espacio da ingreso (ENTRY), de lo contrario alerta de un parqueo lleno. 
* **Bitácora Registral:** Un historial al momento (dashboard) registrando placas, timestamp y si está entrando o saliendo, recalculando estadísticamente los cupos de las zonas de la universidad.

## 🛠️ Stack Tecnológico Utilizado

* **Framework Base:** [React Native](https://reactnative.dev/) gestionado a través del ecosistema de [Expo](https://expo.dev/) (SDK 51 o superior).
* **Router:** Novedoso sistema basado en la web `Expo Router` (navegador por carpetas).
* **Styling V4 Premium:** Usamos [NativeWind](https://www.nativewind.dev/) que es la adaptación directa del compilador de **Tailwind CSS v3/v4** para interfaces móviles impactantes. Paleta de colores `slate` con accent en `sky` (Glassmorphism & Neon Shadows).
* **Mock Local Backend:** SQLite local en el propio dispositivo (`expo-sqlite`) usando el nuevo API asíncrono para gestionar tablas y validaciones transaccionales rápidas (Autónomo).
* **Soporte Multimedia:** `react-native-qrcode-svg` y `expo-camera` para la iteración óptica de códigos.

## ⚙️ ¿Cómo probarlo?

¡La app viene con un registro de usuarios de prueba pre-cargado! 
No necesitas servidor en la nube porque SQLite simulará la base de datos de manera impecable y local en tu primera recarga rápida.

### Pasos de Instalación

1. Clona o descarga el repositorio y abre la terminal en la raíz (`QR key`).
2. Instala todos los paquetes requeridos por el ecosistema local:
   ```bash
   npm install
   ```
3. *(Opcional)* Si te da conflictos en caché en desarrollos previos, puedes iniciar con la bandera force clear:
   ```bash
   npm start -- -c
   ```
4. Podrás usar la app en simulador web escaneándolo con **Expo Go** mediante tu dispositivo personal, o abrir "Emulador de Android/iOS" usando comandos recomendados dentro de la terminal (`w` para Web, `a` para Android, `i` para un dispositivo de iOS).

---

### 🔑 Credenciales para Evaluar

La base de datos expone dos cuentas de mock en la pantalla de inicio:

*   👤 **Estudiante:** Ingresa el correo `diego@student.com` y se mostrarán tus cupos más emisión de tu placa asignada ABC-123.
*   🛡️ **Administrador / Seguridad:** Ingresa el correo `admin@keyalumnos.com` para abrir el Dashboard. Si escaneas el QR del estudiante o en la misma app, irá actualizando el contador.
