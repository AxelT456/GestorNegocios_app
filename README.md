# 📱 App Gestión de Negocios (Frontend)

Aplicación móvil híbrida desarrollada con **Ionic 7** y **Angular** para la administración integral de micro-negocios gastronómicos. Permite gestión de punto de venta (POS), control de inventarios y análisis financiero en tiempo real.

Este proyecto consume una API REST desarrollada en Django.

## ✨ Características Principales

* **🔐 Autenticación Segura:** Login y Registro con manejo de Tokens (JWT).
* **📊 Dashboard Financiero:** Gráficas interactivas (Chart.js) para visualizar balance, productos top y flujo de caja.
* **🛒 Punto de Venta (POS):** Interfaz táctil optimizada para registrar ventas rápidas.
* **📦 Gestión de Inventario:** CRUD completo de productos y registro de gastos operativos.
* **🎨 Clean UI:** Diseño moderno, minimalista y responsivo.

## 🛠️ Tecnologías

* **Framework:** Ionic 7 + Angular 17
* **Lenguaje:** TypeScript
* **Estilos:** SCSS (Sass)
* **Gráficas:** Chart.js
* **Conexión:** HttpClient (Rest API)

## 🚀 Instalación y Configuración Local

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/AxelT456/GestorNegocios_App.git](https://github.com/AxelT456/GestorNegocios_App.git)
    cd GestorNegocios_App
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en navegador:**
    ```bash
    ionic serve
    ```

4.  **Generar Build para Producción (Vercel):**
    ```bash
    ionic build --prod
    ```

## 📂 Estructura del Proyecto

* `src/app/pages/`: Vistas de Autenticación (Login, Registro).
* `src/app/tabs/`: Navegación principal.
    * `tab1`: Dashboard y Analíticas.
    * `tab2`: Punto de Venta (Caja).
    * `tab3`: Administración (Menú y Gastos).
* `src/app/services/`: Lógica de conexión con la API (Auth y Finanzas).

## 📱 Despliegue

Este frontend está optimizado para desplegarse en:
* **Web:** Vercel / Netlify.
* **Móvil:** Android (APK) mediante Capacitor.

---
Desarrollado por Axel Tapia
