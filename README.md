# RiTech SAS — Sistema de gestión de exportaciones

Proyecto del curso **Bases de Datos con Java y Python** (Ingeniería de Software, Universidad Cooperativa de Colombia, sede Pasto).

Sistema para gestionar las exportaciones de café y cacao de **RiTech SAS** hacia la Unión Europea: productos y lotes con trazabilidad, clientes, contratos, exportaciones, documentos, seguimiento de envíos, cumplimiento normativo y panel de control.

**Equipo:** Camila Noguera (líder de proyecto), Ricardo Narváez y Andrey Luna (desarrolladores).

## Contenido

| Carpeta / archivo | Descripción |
|---|---|
| `ritech_app.py` | Aplicación en Python (consola) conectada a MySQL, con inicio de sesión por roles |
| `database/01_crear_base_ritech.sql` | Crea la base `ritech`, sus 8 tablas y datos de ejemplo |
| `database/02_cambios_sprint3_y_4.sql` | Agrega `contratos`, `usuarios` y la columna `archivo` en `documentos` |
| `web/agroexport.jsx` | Prototipo de la interfaz web (React) con datos de ejemplo |

## Historias de usuario cubiertas

- **Sprint 2:** HU-05 productos y lotes · HU-06 clientes · HU-07 historial de compras
- **Sprint 3:** HU-08 contratos · HU-09 exportaciones · HU-10 documentos
- **Sprint 4:** HU-11 seguimiento del envío · HU-12 cumplimiento normativo UE · HU-13 panel de control

## Cómo ejecutar la aplicación en Python

1. Instalar MySQL y ejecutar, en este orden, en MySQL Workbench:
   - `database/01_crear_base_ritech.sql`
   - `database/02_cambios_sprint3_y_4.sql`
2. Instalar la dependencia:
   ```
   pip install -r requirements.txt
   ```
3. En `ritech_app.py`, escribir la contraseña de MySQL en la función `conectar()`.
4. Ejecutar:
   ```
   python ritech_app.py
   ```

### Usuarios de prueba

| Rol | Usuario | Contraseña | Puede |
|---|---|---|---|
| Administrador | `admin` | `admin123` | Todo el sistema |
| Cliente | `cliente` | `cliente123` | Ver sus exportaciones, seguimiento, documentos y contratos |

> Las contraseñas están en texto plano solo por ser un proyecto académico. En un sistema real se guardarían cifradas (hash).

## Prototipo web

`web/agroexport.jsx` es un componente React (Tailwind no requerido, estilos en línea) con datos de ejemplo: login por roles, dashboard, exportaciones, trazabilidad, cumplimiento y reportes. Para verlo localmente se puede usar dentro de un proyecto Vite + React con `lucide-react` y `recharts` instalados.
