# Backend - Clasificador de Imágenes

## Requisitos
- Python 3.11 o superior
- Git
- Node.js y npm (para el frontend)

## Instalación

### 1. Clonar el repositorio
```pwsh
# Clona el proyecto
 git clone <URL_DEL_REPOSITORIO>
 cd clasificador_imagenes/backend
```

### 2. Crear y activar entorno virtual
```pwsh
python -m venv venv
.\venv\Scripts\activate
```

### 3. Instalar dependencias
```pwsh
pip install -r requirements.txt
```

### 4. Configurar la base de datos
Asegúrate de tener el archivo `images.db` en la raíz de `backend`. Si necesitas cargar imágenes, ejecuta el script:
```pwsh
python app/scripts/load_images.py
```

### 5. Ejecutar el backend
```pwsh
uvicorn app.main:app --reload
```

## Frontend

1. Ve a la carpeta `frontend`:
   ```pwsh
   cd ../frontend
   ```
2. Instala dependencias:
   ```pwsh
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```pwsh
   npm run dev
   ```
 4. Crea la carpeta `public/images` dentro de `frontend` para almacenar las imágenes que se usarán en la aplicación.

## Notas
- El entorno virtual y la base de datos están ignorados en `.gitignore`.
- Para producción, configura variables de entorno y seguridad según tus necesidades.
