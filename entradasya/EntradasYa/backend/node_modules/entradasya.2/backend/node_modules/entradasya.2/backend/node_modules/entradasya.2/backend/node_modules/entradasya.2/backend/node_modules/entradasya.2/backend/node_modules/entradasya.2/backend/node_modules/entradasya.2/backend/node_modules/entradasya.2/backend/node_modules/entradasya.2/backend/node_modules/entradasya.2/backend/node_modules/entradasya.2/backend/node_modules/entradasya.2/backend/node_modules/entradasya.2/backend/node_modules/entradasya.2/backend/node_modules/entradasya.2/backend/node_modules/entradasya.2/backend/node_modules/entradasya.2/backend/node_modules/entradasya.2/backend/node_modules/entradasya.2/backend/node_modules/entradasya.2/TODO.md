# Restructuración del Proyecto EntradasYa

## Información Recopilada
- **Backend**: Arquitectura por características (admin/, compras/, etc.) con controller.js, model.js, routes.js por feature.
- **Frontend**: Todos los componentes en src/components/, muchos relacionados con admin y contador, contador-panel.html como entrada separada.
- **Base de Datos**: Esquema proporcionado para DB 'entradasya' con tablas como usuarios, eventos, compras, etc.

## Plan de Restructuración
- **Backend**: Cambiar a arquitectura por capas (controllers/, models/, routes/, middleware/, config/).
- **Frontend**: Agrupar componentes en subcarpetas (admin/, contador/, shared/), crear views/, router/, store/.
- Actualizar todos los imports.
- Asegurar que la API funcione con el esquema de DB.

## Pasos a Seguir
- [ ] Crear estructura de directorios nueva para backend
- [ ] Mover archivos de backend a nuevas carpetas
- [ ] Actualizar imports en backend
- [ ] Crear estructura de directorios nueva para frontend
- [ ] Mover componentes de frontend a subcarpetas
- [ ] Crear router, store, views en frontend
- [ ] Actualizar imports en frontend
- [ ] Verificar configuración de DB y conexión
- [ ] Probar backend (npm run dev)
- [ ] Probar frontend (npm run serve)
- [ ] Verificar que la API funcione correctamente con la DB

## Archivos Dependientes
- Todos los archivos en backend/ y frontend/

## Seguimiento de Progreso
- [x] Crear estructura de directorios nueva para backend
- [x] Mover archivos de backend a nuevas carpetas
- [x] Actualizar imports en backend
- [ ] Crear estructura de directorios nueva para frontend
- [ ] Mover componentes de frontend a subcarpetas
- [ ] Crear router, store, views en frontend
- [ ] Actualizar imports en frontend
- [ ] Verificar configuración de DB y conexión
- [x] Probar backend (npm run dev)
- [ ] Probar frontend (npm run serve)
- [ ] Verificar que la API funcione correctamente con la DB
