# Key Alumnos - Plataforma de Parqueo Inteligente

Una plataforma integral desarrollada con **React Native (Expo)**, **Node.js** y **Clerk** diseñada con un enfoque premium para gestionar de forma inteligente el sistema de parqueos dentro de un campus, optimizando el tiempo y dando visibilidad en tiempo real a los cupos disponibles.

## 🚀 Arquitectura Cliente-Servidor (Fase 2)

La aplicación ha mutado de un prototipo local a una arquitectura robusta Centralizada:
1. **Frontend (App Móvil):** Construida en Expo React Native usando Expo Router y NativeWind.
2. **Backend (API REST):** Servidor local desarrollado en Node.js + Express que almacena todas las transacciones, aforos y usuarios en **SQLite**.
3. **Autenticación (Nube):** Sistema de Seguridad delegada a **Clerk** con soporte para Single Sign-On (SSO) de Microsoft e inicio clásico por correo electrónico.

## 👥 Roles del Sistema

Esta aplicación divide su funcionalidad estrictamente en 3 capas de permisos controladas por el servidor:

**1. Módulo Estudiante (`student`):**
* **Panel en vivo:** Visualiza la ocupación y aforo disponible de todas las zonas de parqueo (Actualizado por API).
* **Smart QR Pass / Gafete:** Generación inmediata de un gafete de entrada (QR dinámico) ligado a su perfil de Clerk.
* **Gestión de Vehículos:** Capacidad de añadir y eliminar placas y modelos de auto a su flotilla personal.

**2. Módulo Guardia / Seguridad (`admin`):**
* **Selector de Zona (Parqueo):** Permite al guardia establecer en qué punto de entrada se encuentra situado físicamente.
* **Cámara Escáner Nativa:** Uso de la cámara del dispositivo para enfocar los pases estudiantiles.
* **Lógica Automática:** El escáner se comunica con el servidor para autorizar la placa y sumar o restar aforos dinámicamente si el vehículo está entrando o saliendo de la zona. 

**3. Módulo de Gerencia (`superadmin`):**
* **Administración de Zonas:** Creación y Destrucción de parqueos y modificación de aforos totales.
* **Panel de Usuarios:** Control en tiempo real de todos los usuarios registrados a través de Clerk, para promover estudiantes al rol de guardias de seguridad o revocarles permisos.

## 🛠️ Stack Tecnológico Utilizado

* **Frontend:** React Native (Expo SDK 54+), Expo Router (Navegación tipo File-system), UI NativeWind v4 (TailwindCSS).
* **Backend:** Node.js, Express, SQLite3 (Base de datos transaccional central).
* **Seguridad:** Clerk-Expo, SSO de Microsoft, React Native SecureStore.
* **APIs de Hardware:** `expo-camera`, `expo-linking`, `expo-crypto`.

## ⚙️ ¿Cómo levantar la Plataforma para probarla?

> **Nota Crítica:** Al ser ahora una plataforma Cliente-Servidor, se requieren levantar DOS consolas diferentes, una para el backend y otra para el frontend.

### 1. Iniciar el Backend (Base de Datos / API)
1. Abre tu primera terminal en la carpeta principal.
2. Ingresa a la carpeta del backend: `cd backend`
3. Instala los paquetes: `npm install`
4. Enciende el servidor:
```bash
node index.js
```
*(Mantén esta terminal minimizada escuchando en el puerto 3000)*

### 2. Configurar la Red Front-End
Si pruebas la app en un emulador Android, se usará la IP `10.0.2.2`. Sin embargo, si deseas probar el escáner de QR directamente desde **tu celular físico**, debes:
1. Ir al archivo `config/api.ts`
2. Cambiar la constante `HOST` a la IPv4 de tu computadora (Ej. `192.168.0.x`).
3. Crear un archivo `.env` en la raíz del proyecto.
4. Agregar el parámetro de autenticación: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_LLAVE_DE_CLERK`

### 3. Iniciar la App Móvil (Front-End)
1. Abre una segunda terminal en la raíz de tu proyecto (`QR key`).
2. Instala los paquetes:
```bash
npm install
```
3. Levanta Metro Bundler limpiando cachés previas:
```bash
npm start -- -c
```
4. Escanea el código con Expo Go o arranca la Web/Emulador.

---

### 🔑 Gestión Inicial de Roles (Testing)

Dado que Clerk maneja la seguridad, cualquier cuenta nueva creada (Correo o Microsoft) ingresará como `student` por defecto. 

**Para testear el panel de `superadmin` por primera vez:**
1. Crea tu cuenta en la app y accede al panel de estudiante.
2. Abre tu explorador de Bases de Datos favorito (Ej. SQLite Browser).
3. Entra a `backend/keyalumnos.db`.
4. En la tabla `Users`, localiza tu usuario y cambia la columna `role` a `superadmin`.
5. Guarda la DB, y refresca tu app móvil (Reiniciar Metro Bundle).
A partir de ahí, obtendrás el control absoluto y podrás convertir a otras cuentas en Guardias directamente desde la app.
