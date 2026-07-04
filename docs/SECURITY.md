# Seguridad y Privacidad

Esta app está diseñada para trabajar con datos de menores, por lo que el despliegue real debe tratar privacidad y permisos como parte central del producto.

## Controles incluidos

- Autenticación mediante Supabase Auth.
- Acceso por invitación; no hay registro abierto en la UI.
- Google OAuth como flujo principal de acceso.
- Allowlist de invitaciones en `invitations`.
- Before User Created Auth Hook previsto en la migración v1 para rechazar emails no invitados.
- Row Level Security por familia y alumno.
- Buckets privados para evidencias y recursos.
- URLs firmadas previstas para archivos privados.
- Validación de tipo y tamaño de archivo en storage.
- Captura de evidencias pesadas como enlaces privados externos, sin guardar tokens de proveedores.
- Registro de consentimiento familiar en `privacy_consents`.
- Tabla de auditoría para eventos sensibles.
- Formulario público con honeypot anti-spam básico.
- Cliente administrativo estricto: `SUPABASE_SERVICE_ROLE_KEY` no degrada a anon.

## Antes de producción

- Revisar legalmente el aviso de privacidad base en `docs/PRIVACY.md` y `/privacidad`.
- Definir consentimiento explícito para uso de imágenes, videos y datos de menores.
- Activar MFA para administradores si Supabase lo permite en el proyecto.
- Revisar políticas de retención y borrado de evidencias.
- Configurar backups y alertas de Supabase.
- Limitar `SUPABASE_SERVICE_ROLE_KEY` solo al servidor.
- Configurar Google OAuth en Supabase y en Google Cloud con URLs de redirección correctas.
- Activar el hook `hook_require_invitation` en Authentication > Hooks de Supabase.
