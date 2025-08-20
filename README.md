# Clasificador de Imágenes

Proyecto fullstack para clasificar imágenes usando **FastAPI** (backend) y **React + Vite** (frontend).

---

## Requisitos

- **Python 3.11** o superior
- **Git**
- **Node.js** y **npm** (para el frontend)
- **SQLite** (la base de datos se crea automáticamente)

---

## Instalación

### 1. Clonar el repositorio

```pwsh
git clone <URL_DEL_REPOSITORIO>
cd clasificador_imagenes
```

---

### 2. Backend

#### a. Crear y activar entorno virtual

```pwsh
cd backend
python -m venv venv
.\venv\Scripts\activate
```

#### b. Instalar dependencias

```pwsh
pip install -r requirements.txt
```

#### c. Configurar la base de datos

La base de datos SQLite (`images.db`) se crea automáticamente al ejecutar el backend o el script de carga de imágenes.

##### Cargar URLs de imágenes a la base de datos

El script `app/scripts/load_images.py` recorre la carpeta `frontend/public/images`, toma los nombres de los archivos de imagen y los guarda en la base de datos con su URL correspondiente.

- **¿Cómo funciona?**
  - Busca archivos con extensiones `.jpg`, `.jpeg`, `.png`, `.gif` en `frontend/public/images`.
  - Genera la URL pública para cada imagen (ejemplo: `http://localhost:5173/images/nombre.jpg`).
  - Si la URL no existe en la base de datos, la agrega.
  - Útil para inicializar la base de datos con las imágenes disponibles en el frontend.

- **Ejecutar el script:**

```pwsh
python app/scripts/load_images.py
```

---

#### d. Ejecutar el backend

```pwsh
uvicorn app.main:app --reload
```

---

### 3. Frontend (React + Vite)

#### a. Instalar dependencias

```pwsh
cd ../frontend
npm install
```

#### b. Ejecutar el servidor de desarrollo

```pwsh
npm run dev
```

#### c. Agregar imágenes

Crea la carpeta `public/images` dentro de `frontend` y coloca allí las imágenes que deseas clasificar.  
Estas imágenes serán accesibles desde la URL `http://localhost:5173/images/<nombre_imagen>`.

---

## Notas

- El entorno virtual y la base de datos están ignorados en `.gitignore`.
- Para producción, configura variables de entorno y seguridad según tus necesidades.
- El backend y frontend deben ejecutarse en paralelo para el funcionamiento completo de la aplicación.

---

## Estructura de carpetas

```
clasificador_imagenes/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   └── scripts/
│   │       └── load_images.py
│   ├── requirements.txt
│   └── images.db
│
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---
