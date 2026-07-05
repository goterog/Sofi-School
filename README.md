# Sofi School

Sofi School es una web app para presentar un programa familiar guiado de educación en casa para etapa 3-6 años. Combina una landing pública visual y dinámica con un dashboard privado para portafolio, evidencias, recursos y seguimiento por familia/alumno.

## Estado actual

- Landing pública lista en `/`, con hero, principios, metodología, áreas, portafolio, recursos, manifiesto breve y contacto.
- Dashboard privado preparado en `/dashboard`, con modo demo local cuando Supabase no está configurado.
- Login en `/login`, diseñado para Google OAuth con acceso por invitación y no para registro abierto.
- Callback OAuth en `/auth/callback`.
- API de contacto en `/api/contact`, con validación Zod y guardado opcional en Supabase.
- Migraciones Supabase con tablas base, Row Level Security, buckets privados, guías, submaterias, invitaciones y consentimientos.
- Dashboard v1 con secciones de guía, materiales, portafolio documental y configuración.
- Aviso de privacidad base en `/privacidad` y `docs/PRIVACY.md`.
- Imagen hero generada y guardada en `public/images/hero-learning-table.png`.
- Producción verificada: `https://sofi-school.vercel.app`.
- Deploy inicial en Vercel verificado: `https://sofi-school-guillermos-projects-d93f9572.vercel.app`.
- Proyecto conectado a GitHub: `goterog/Sofi-School`.

## Stack

- Next.js App Router + TypeScript
- React 18
- Tailwind CSS
- Framer Motion para animaciones de scroll y microinteracciones
- Lucide React para iconos
- Supabase Auth, Postgres y Storage
- Vercel como despliegue recomendado

## Arquitectura

La app está organizada por rutas, componentes y librerías de soporte:

- `src/app`: rutas de Next.js.
- `src/components/landing`: experiencia pública de presentación.
- `src/components/dashboard`: interfaz privada de seguimiento.
- `src/lib/supabase`: clientes Supabase para navegador, servidor y escritura administrativa.
- `src/lib/demo-data.ts`: datos de vista previa cuando Supabase no está configurado.
- `supabase/migrations`: esquema SQL, RLS, seeds iniciales y storage.
- `docs/SECURITY.md`: notas de seguridad, privacidad y pendientes antes de producción.

Next.js no usa un `.html` editable como una página estática tradicional. El HTML se genera desde componentes `.tsx`. Para cambios pequeños:

- Marca y hero: `src/components/landing/landing-page.tsx`.
- Título SEO/Open Graph: `src/app/layout.tsx`.
- Texto del dashboard/sidebar: `src/components/dashboard/dashboard-shell.tsx`.
- Estilos globales: `src/app/globals.css`.
- Colores y theme Tailwind: `tailwind.config.ts`.

## Rutas principales

- `/`: landing pública de Sofi School.
- `/login`: acceso privado por invitación.
- `/dashboard`: resumen de familias, alumnos, evidencias y recursos.
- `/dashboard/alumnos/[id]`: portafolio de un alumno.
- `/api/contact`: endpoint del formulario público.
- `/api/dashboard/portfolio`: captura privada de evidencias y enlaces externos.
- `/api/dashboard/invitations`: allowlist de invitaciones para admins.
- `/api/privacy/consents`: registro de consentimiento familiar.
- `/auth/callback`: intercambio PKCE para OAuth.
- `/privacidad`: aviso de privacidad base.

## Funciones públicas

- Presentación de scroll continuo sin requerir clicks para comprender el programa.
- Hero con imagen editorial segura, sin menores identificables.
- Secciones de principios, metodología y áreas de estudio basadas en el documento educativo original.
- Gráficos, tarjetas y barras animadas con Framer Motion.
- CTA simple de contacto.
- Formulario con validación, honeypot anti-spam básico y aviso de privacidad pendiente para producción.

## Funciones privadas

- Dashboard preparado para familias múltiples.
- Roles previstos: `admin` y `parent`.
- Acceso por invitación mediante Supabase Auth.
- Google OAuth como flujo principal de acceso.
- Allowlist fuerte con `invitations` y Auth Hook `hook_require_invitation`.
- Vista por familia/alumno.
- Guías de actividad por área y submateria.
- Biblioteca de materiales por área, submateria, fuente y audiencia.
- Portafolio organizado por fecha, área, submateria, periodo y tipo de evidencia.
- Evidencias previstas: notas, fotos, documentos, clips pequeños y enlaces privados a videos largos.
- Registro de enlaces privados externos para mantener ligera la DB gratuita de Supabase.
- Consentimiento familiar para uso de imágenes, videos y trabajos de menores.
- Modo demo local para revisar la UI sin configurar Supabase.

## Modelo de datos

La migración inicial crea:

- `profiles`
- `families`
- `family_members`
- `students`
- `learning_areas`
- `periods`
- `portfolio_entries`
- `portfolio_media`
- `resources`
- `resource_links`
- `contact_requests`
- `audit_events`
- `learning_topics`
- `activity_guides`
- `invitations`
- `privacy_consents`

También crea los buckets privados:

- `portfolio-evidence`
- `resource-files`

Las áreas iniciales incluyen lenguaje, salud, creatividad, ecología, vida práctica, habilidades sociales y tecnología.

## Seguridad

La seguridad está pensada desde la base:

- Row Level Security por familia/alumno.
- Storage privado.
- Políticas para que padres solo vean datos de su familia.
- Acceso administrativo separado.
- Validación de archivos por tipo y tamaño.
- Auditoría básica para eventos sensibles.
- `SUPABASE_SERVICE_ROLE_KEY` solo debe vivir en servidor.
- El cliente administrativo no usa anon como fallback.
- Videos y archivos pesados deben vivir como enlaces privados externos restringidos por correo.

Antes de producción falta revisar legalmente el aviso de privacidad, cerrar plazos de retención, validar el consentimiento para uso de imágenes/videos de menores y activar MFA para administradores si Supabase lo permite.

## Desarrollo local

Instala dependencias:

```bash
npm install
```

Copia variables de entorno:

```bash
copy .env.example .env.local
```

Configura Supabase cuando tengas proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Ejecuta el servidor:

```bash
npm run dev
```

Sin Supabase configurado, la landing funciona y el dashboard muestra una vista demo local. Con Supabase configurado, `/dashboard` exige sesión real.

## Base de datos

Aplica la migración con Supabase CLI:

```bash
supabase db push
```

También puedes pegar el SQL de `supabase/migrations/20260626000000_initial_schema.sql` en el editor SQL del proyecto Supabase.

## Verificación

Comandos usados para validar:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

## Despliegue recomendado

El proyecto Vercel actual se llama `sofi-school` en el scope `guillermos-projects-d93f9572`.
La configuración versionada en `vercel.json` fija el framework como `nextjs` para que los deploys automáticos desde Git usen el preset correcto.

URLs actuales:

- Producción verificada: `https://sofi-school.vercel.app`.

Deploy manual desde esta carpeta:

```bash
npx vercel deploy --prod --yes
```

Flujo automático de trabajo:

1. `main` funciona como rama de producción.
2. Mantener cambios nuevos en ramas `feature/...` para obtener previews automáticos.
3. Cuando Supabase esté listo, configurar variables de entorno en Vercel.
4. Revisar políticas de privacidad, consentimiento y backups antes de usar datos reales de menores.

Activación de Supabase:

1. Crear proyecto Supabase.
2. Aplicar la migración SQL.
3. Configurar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en Vercel.
4. Crear usuarios/invitaciones desde Supabase Auth o un flujo administrativo futuro.
5. Configurar Google OAuth en Supabase Authentication > Providers.
6. Activar `hook_require_invitation` en Authentication > Hooks como Before User Created Hook.
7. Registrar invitaciones en `/dashboard` con una cuenta admin o insertarlas directamente en `invitations`.
