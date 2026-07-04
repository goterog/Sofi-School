import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Datos que tratamos",
    items: [
      "Datos de contacto del adulto responsable.",
      "Datos básicos del alumno: nombre, etapa, año de nacimiento y familia.",
      "Evidencias educativas: notas, fotos, documentos y enlaces privados a videos o archivos externos.",
      "Registros técnicos mínimos de acceso, invitación y cambios sensibles."
    ]
  },
  {
    title: "Finalidades",
    items: [
      "Organizar el portafolio educativo familiar.",
      "Mostrar guías, materiales y avances por área de aprendizaje.",
      "Restringir el acceso a la familia autorizada.",
      "Atender solicitudes de acceso, corrección, cancelación u oposición."
    ]
  },
  {
    title: "Medidas de seguridad",
    items: [
      "Acceso por invitación y Google OAuth.",
      "Row Level Security por familia y alumno en Supabase.",
      "Storage privado para archivos ligeros cuando se use.",
      "Videos y archivos pesados como enlaces externos restringidos por correo.",
      "Service role limitado a servidor y nunca expuesto al navegador."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cloud px-5 py-10 text-ink sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Link>

        <header className="mt-8 rounded-md border border-ink/8 bg-white p-6 shadow-line">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-7 w-7 text-forest" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase text-teal">Aviso de privacidad</p>
              <h1 className="mt-2 text-3xl font-semibold">Sofi School</h1>
              <p className="mt-3 leading-7 text-ink/64">
                Documento base para la fase privada de prueba familiar. Debe revisarse legalmente antes de operar con más familias o con datos reales a escala.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-ink/64">
                {section.items.map((item) => (
                  <li key={item} className="rounded-md bg-cloud px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <article className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
            <h2 className="text-xl font-semibold">Derechos ARCO y consentimiento</h2>
            <p className="mt-3 leading-7 text-ink/64">
              El adulto responsable puede solicitar acceso, rectificación, cancelación u oposición sobre los datos bajo su familia. También puede revocar el consentimiento para uso de imágenes, videos o trabajos del menor; la revocación no afecta tratamientos ya realizados antes de la solicitud.
            </p>
          </article>

          <article className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
            <h2 className="text-xl font-semibold">Retención y enlaces externos</h2>
            <p className="mt-3 leading-7 text-ink/64">
              La aplicación guarda metadatos educativos y no almacena videos pesados en la base de datos. Si una familia usa Google Drive, OneDrive, iCloud u otro proveedor, debe mantener los archivos como restringidos y compartirlos solo con correos autorizados.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
