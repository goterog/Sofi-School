# Seguridad y Privacidad

Esta app está diseñada para trabajar con datos de menores, por lo que el despliegue real debe tratar privacidad y permisos como parte central del producto.

## Controles incluidos

- Autenticación mediante Supabase Auth.
- Acceso por invitación; no hay registro abierto en la UI.
- Row Level Security por familia y alumno.
- Buckets privados para evidencias y recursos.
- URLs firmadas previstas para archivos privados.
- Validación de tipo y tamaño de archivo en storage.
- Tabla de auditoría para eventos sensibles.
- Formulario público con honeypot anti-spam básico.

## Antes de producción

- Publicar aviso de privacidad para México.
- Definir consentimiento explícito para uso de imágenes, videos y datos de menores.
- Activar MFA para administradores si Supabase lo permite en el proyecto.
- Revisar políticas de retención y borrado de evidencias.
- Configurar backups y alertas de Supabase.
- Limitar `SUPABASE_SERVICE_ROLE_KEY` solo al servidor.
