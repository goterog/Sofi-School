# Flujo cloud: Supabase staging + Vercel Preview

Este proyecto valida cambios en la nube antes de llevarlos a `main`. Producción y Preview no deben compartir datos de menores.

## 1. Crear Supabase staging

1. Crear un segundo proyecto dentro de la organización de Supabase y nombrarlo `sofi-school-staging`.
2. Usar una contraseña de base distinta a producción y guardarla en el gestor de secretos correspondiente.
3. Aplicar, en orden, todas las migraciones de `supabase/migrations`.
4. Confirmar que existan los buckets privados `portfolio-evidence` y `resource-files` y que sus límites/políticas coincidan con las migraciones.
5. Activar Google como proveedor y registrar el mismo Auth Hook `hook_require_invitation` utilizado en producción.
6. Crear únicamente perfiles, familias, alumnos y archivos ficticios. No copiar información real desde producción.

## 2. OAuth para Preview

- Mantener `https://sofi-school.vercel.app` como Site URL de producción.
- En Supabase staging, agregar la URL exacta del Preview de la rama o el patrón de Vercel autorizado para el equipo, por ejemplo:

  `https://*-guillermos-projects-d93f9572.vercel.app/**`

- En Google Cloud OAuth, agregar como redirect URI la URL de callback del proyecto Supabase staging:

  `https://<project-ref-staging>.supabase.co/auth/v1/callback`

- El frontend calcula `redirectTo` desde `window.location.origin`, por lo que el callback vuelve al dominio específico del Preview.
- Para producción se recomienda conservar URLs exactas; el wildcard se utiliza únicamente para Preview.

## 3. Variables de Vercel

Configurar en Vercel → Project Settings → Environment Variables:

| Variable | Preview | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de staging | URL de producción |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon de staging | anon de producción |
| `SUPABASE_SERVICE_ROLE_KEY` | service role de staging | service role de producción |
| `NEXT_PUBLIC_SITE_URL` | URL de rama si se fija dominio | `https://sofi-school.vercel.app` |

No registrar valores reales en Git. Después de cambiar variables, volver a desplegar el Preview.

## 4. Secuencia de entrega

1. Crear una rama `codex/...` o `feature/...` desde `main`.
2. Aplicar la nueva migración exclusivamente en staging.
3. Push de la rama y apertura del Preview de Vercel.
4. Probar OAuth con un correo de prueba previamente invitado.
5. Ejecutar la lista de aceptación de este documento.
6. Revisar migración y cambios en Pull Request.
7. Aplicar la migración en producción durante la ventana de despliegue.
8. Hacer merge a `main` y verificar producción sin crear datos de prueba.

La migración debe llegar a cada base antes que el frontend que consulta sus columnas nuevas.

## 5. Aceptación en Preview

- Admin crea y edita una familia y un alumno; ambos pueden archivarse sin borrado físico.
- Padre no puede abrir el área administrativa ni modificar publicaciones ajenas.
- Primer intento de publicación muestra el consentimiento; después de aceptarlo, no vuelve a pedirlo para la misma familia y versión.
- Drag and drop rechaza tipos no permitidos, archivos mayores a 10 MB y lotes de más de 10.
- Una publicación con archivos no aparece hasta que todos terminan y se finaliza.
- Imágenes abren desde URL firmada y los PDF se descargan/visualizan sin volver público el bucket.
- Autor y admin pueden editar y retirar; retirar borra el objeto y oculta la publicación a la familia.
- El admin puede consultar metadatos archivados, pero no el contenido retirado.
- Guías y materiales respetan `draft`, `published` y `archived`; un padre solo ve publicados.
- La navegación funciona en escritorio y móvil, incluyendo cierre seguro del modal.
- `npm run typecheck`, `npm run lint` y `npm run build` terminan correctamente.

