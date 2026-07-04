# Aviso de privacidad base

Este documento es una base operativa para la fase privada de prueba de Sofi School. Debe revisarse por una persona legal antes de operar con más familias o usar datos reales a escala.

## Responsable

Sofi School trata datos personales para organizar un programa familiar guiado de educación en casa, portafolio de evidencias, materiales y seguimiento privado por familia.

## Datos tratados

- Datos del adulto responsable: nombre, correo y relación con la familia.
- Datos del alumno: nombre, etapa educativa, año de nacimiento, familia y notas educativas.
- Evidencias educativas: observaciones, fotos, documentos, trabajos del menor y enlaces privados a videos o archivos externos.
- Datos técnicos mínimos: invitaciones, consentimientos, auditoría básica y fecha de creación o modificación.

## Finalidades

- Crear y consultar el portafolio educativo del alumno.
- Ordenar evidencias por fecha, área de estudio, submateria y tipo de evidencia.
- Mostrar guías, actividades y materiales didácticos.
- Restringir el acceso a familias y administradores autorizados.
- Atender solicitudes de acceso, rectificación, cancelación u oposición.

## Consentimiento de menores

El adulto responsable debe aceptar expresamente el tratamiento de imágenes, voz, videos o trabajos del menor antes de cargar evidencias reales. La aplicación registra versión, fecha y estado del consentimiento en `privacy_consents`.

## Enlaces externos

Para mantener ligera la base de datos gratuita de Supabase, los videos y archivos pesados se guardan como enlaces privados externos. La familia debe configurar esos archivos como restringidos y compartirlos solo con correos autorizados. La app no solicita ni almacena tokens de Google Drive, OneDrive, iCloud u otros proveedores en esta fase.

## Seguridad

- Acceso por invitación y Google OAuth.
- Before User Created Auth Hook para rechazar emails no invitados.
- Row Level Security por familia y alumno.
- Buckets privados para archivos ligeros cuando se usen.
- `SUPABASE_SERVICE_ROLE_KEY` limitado al servidor.
- Auditoría básica para eventos sensibles.

## Retención y eliminación

Durante la fase de prueba, conservar solo evidencias necesarias para el seguimiento familiar. Si una familia solicita eliminación, borrar metadatos del portafolio, medios en Supabase Storage y referencias a enlaces externos. Los archivos externos deben eliminarse o revocarse en el proveedor donde viven.

## Derechos ARCO

El adulto responsable puede solicitar acceso, rectificación, cancelación u oposición sobre los datos de su familia. También puede revocar consentimiento para uso de imagen, video o trabajos del menor.

## Pendientes antes de producción

- Completar identidad y domicilio del responsable.
- Definir canal formal para solicitudes ARCO.
- Definir plazos de retención.
- Revisar si aplica COPPA u otra norma fuera de México.
- Validar el aviso con asesoría legal.
