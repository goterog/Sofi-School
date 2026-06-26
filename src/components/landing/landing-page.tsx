"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Compass,
  HeartHandshake,
  Home,
  Languages,
  Leaf,
  LibraryBig,
  LockKeyhole,
  Mail,
  MapPinned,
  MonitorSmartphone,
  Palette,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  UploadCloud,
  Users,
  Utensils,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Principle = {
  title: string;
  text: string;
  icon: LucideIcon;
  accent: string;
};

type Method = {
  title: string;
  text: string;
  icon: LucideIcon;
};

type Area = {
  title: string;
  icon: LucideIcon;
  color: string;
  items: string[];
};

const principles: Principle[] = [
  {
    title: "Aprendizaje integral",
    text: "Cuerpo, mente, vida social y mundo interior se trabajan como un solo proceso de desarrollo.",
    icon: Sparkles,
    accent: "bg-teal/10 text-teal"
  },
  {
    title: "Aprender haciendo",
    text: "La vida cotidiana se vuelve laboratorio: cocinar, observar, construir, conversar y resolver.",
    icon: Home,
    accent: "bg-coral/10 text-coral"
  },
  {
    title: "Ritmo personalizado",
    text: "Calendario adaptable y evaluación por objetivos cumplidos, no por prisa externa.",
    icon: CalendarDays,
    accent: "bg-sun/20 text-[#8a640c]"
  },
  {
    title: "Tecnología con intención",
    text: "IA, plataformas digitales y recursos audiovisuales se usan como herramientas, no como sustitutos del vínculo.",
    icon: BrainCircuit,
    accent: "bg-forest/10 text-forest"
  },
  {
    title: "Naturaleza y comunidad",
    text: "Salidas, espacios abiertos y redes de apoyo conectan el aprendizaje con el mundo real.",
    icon: Leaf,
    accent: "bg-leaf/10 text-leaf"
  },
  {
    title: "Habilidades para la vida",
    text: "Creatividad, autonomía, pensamiento crítico, ética y comunicación se practican desde temprano.",
    icon: HeartHandshake,
    accent: "bg-teal/10 text-teal"
  }
];

const methodology: Method[] = [
  {
    title: "Documentar progreso",
    text: "Fotos, videos, notas y avances se ordenan en un portafolio digital presentable.",
    icon: Camera
  },
  {
    title: "Aprender con mentores",
    text: "Expertos, visitas ocasionales y sesiones en línea amplían el mundo del alumno.",
    icon: Users
  },
  {
    title: "Reflexionar al aire libre",
    text: "Momentos en naturaleza ayudan a identificar intereses y ajustar el programa.",
    icon: Sprout
  },
  {
    title: "Salir a descubrir",
    text: "Museos, teatros y eventos educativos complementan lo que sucede en casa.",
    icon: MapPinned
  },
  {
    title: "Autogestión gradual",
    text: "Horarios, calendarios y organización personal se introducen de forma amable.",
    icon: Target
  }
];

const areas: Area[] = [
  {
    title: "Lenguaje y comunicación",
    icon: Languages,
    color: "border-teal/30 bg-teal/10",
    items: ["Letras, números y símbolos", "Lectura y gramática", "Matemáticas", "Otros idiomas"]
  },
  {
    title: "Salud y bienestar",
    icon: Utensils,
    color: "border-leaf/35 bg-leaf/10",
    items: ["Nutrición y cocina", "Ejercicio y deportes", "Expresión corporal", "Gestión emocional"]
  },
  {
    title: "Creatividad e imaginación",
    icon: Palette,
    color: "border-coral/35 bg-coral/10",
    items: ["Dibujo y arte", "Manualidades", "Espacio creativo", "Música instrumental"]
  },
  {
    title: "Ecología y sustentabilidad",
    icon: Sprout,
    color: "border-forest/25 bg-forest/10",
    items: ["Huerto en casa", "Reciclaje", "Medio ambiente", "Recursos naturales"]
  },
  {
    title: "Vida práctica y social",
    icon: Home,
    color: "border-sun/45 bg-sun/12",
    items: ["Habilidades domésticas", "Higiene personal", "Educación financiera"]
  },
  {
    title: "Habilidades sociales y ética",
    icon: HeartHandshake,
    color: "border-teal/30 bg-teal/10",
    items: ["Interacción social", "Comunicación efectiva", "Valores éticos", "Resolución de conflictos"]
  },
  {
    title: "Tecnología y computación",
    icon: MonitorSmartphone,
    color: "border-ink/10 bg-white",
    items: ["Uso de dispositivos", "Plataformas digitales", "Herramientas modernas"]
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -70]);
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 1.05]);

  return (
    <main className="min-h-screen overflow-hidden bg-cloud text-ink">
      <motion.div
        className="fixed left-0 top-0 z-[80] h-1 bg-gradient-to-r from-teal via-leaf to-coral"
        style={{ width: progressWidth }}
      />
      <SiteHeader />
      <section className="relative flex min-h-[88vh] items-center overflow-hidden pb-16 pt-24">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <Image
            src="/images/hero-learning-table.png"
            alt="Mesa de aprendizaje en casa con materiales creativos y una tableta con seguimiento educativo"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,50,47,0.88),rgba(10,84,80,0.58)_48%,rgba(255,255,255,0.18))]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-cloud to-transparent" />
        <div className="section-shell relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.08 }}
            className="max-w-3xl text-white"
          >
            <motion.p variants={fadeUp} className="mb-5 inline-flex max-w-full items-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold leading-5 backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Programa de educación en el hogar, etapa 3-6 años</span>
              <span className="sm:hidden">Programa en casa, 3-6 años</span>
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-balance text-4xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
              Sofi School
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl">
              Una guía educativa integral para cultivar habilidades, documentar avances y acompañar el desarrollo del potencial humano.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacto"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-semibold text-forest shadow-soft transition hover:-translate-y-0.5 hover:bg-cloud"
              >
                Contactar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/login"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/26 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Acceso dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <a
          href="#principios"
          aria-label="Ir a principios"
          className="focus-ring absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 rounded-md border border-white/30 bg-white/14 p-2 text-white backdrop-blur transition hover:bg-white/22 md:inline-flex"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </a>
      </section>

      <PrinciplesSection />
      <MethodologySection />
      <LearningAreasSection />
      <PortfolioSection />
      <ResourcesAndSecuritySection />
      <ManifestoSection />
      <ContactSection />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-md border border-white/55 bg-white/80 px-4 py-3 shadow-line backdrop-blur-xl">
        <a href="#" className="focus-ring inline-flex items-center gap-2 rounded-md px-1 py-1 font-semibold text-forest">
          <Compass className="h-5 w-5" aria-hidden="true" />
          Sofi School
        </a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/72 md:flex" aria-label="Navegación principal">
          <a className="transition hover:text-forest" href="#principios">
            Principios
          </a>
          <a className="transition hover:text-forest" href="#metodologia">
            Metodología
          </a>
          <a className="transition hover:text-forest" href="#areas">
            Áreas
          </a>
          <a className="transition hover:text-forest" href="#portafolio">
            Portafolio
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="focus-ring hidden rounded-md px-3 py-2 text-sm font-semibold text-forest transition hover:bg-forest/8 sm:inline-flex"
          >
            Dashboard
          </Link>
              <a
                href="#contacto"
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Contactar</span>
              </a>
        </div>
      </div>
    </header>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55 }}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-bold uppercase text-teal">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-ink/68 sm:text-lg">{children}</p>
    </motion.div>
  );
}

function PrinciplesSection() {
  return (
    <section id="principios" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 grid-paper opacity-55" />
      <div className="section-shell relative">
        <SectionIntro eyebrow="Principios fundamentales" title="Una escuela que se vive, no solo se cursa">
          El programa conecta casa, comunidad, naturaleza y herramientas modernas para acompañar el desarrollo integral de niñas y niños pequeños.
        </SectionIntro>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <motion.article
                key={principle.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.04, duration: 0.5 }}
                className="card-hover group rounded-md border border-ink/8 bg-white/84 p-6 shadow-line backdrop-blur"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md ${principle.accent}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-ink">{principle.title}</h3>
                <p className="mt-3 leading-7 text-ink/66">{principle.text}</p>
                <div className="mt-5 h-1 w-full overflow-hidden rounded-md bg-mist">
                  <div className="h-full w-1/3 rounded-md bg-gradient-to-r from-teal to-coral transition-all duration-300 group-hover:w-full" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MethodologySection() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0.15, 0.58], [-10, 10]);

  return (
    <section id="metodologia" className="bg-white py-20 sm:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.p variants={fadeUp} className="mb-3 text-sm font-bold uppercase text-coral">
            Implementación y metodología
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Cada experiencia deja rastro, sentido y siguiente paso.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-ink/68">
            La metodología combina documentación, salidas educativas, expertos externos y reflexión para que el aprendizaje sea visible y ajustable.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 rounded-md border border-forest/12 bg-cloud p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
              <p className="leading-7 text-ink/72">
                La evaluación se centra en objetivos cumplidos, observaciones y evidencias, no en presión académica temprana.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            style={{ rotate }}
            className="absolute -right-8 top-4 hidden h-28 w-28 rounded-md border border-teal/18 bg-teal/8 lg:block"
          />
          <div className="relative rounded-md border border-ink/8 bg-cloud p-4 shadow-soft">
            <div className="absolute bottom-6 left-10 top-6 w-px bg-gradient-to-b from-teal via-leaf to-coral" />
            <div className="space-y-4">
              {methodology.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="card-hover relative ml-5 rounded-md border border-ink/8 bg-white p-5"
                  >
                    <div className="absolute -left-9 top-6 flex h-8 w-8 items-center justify-center rounded-md bg-forest text-white shadow-line">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-teal">Paso {index + 1}</p>
                        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                      </div>
                      <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-forest">
                        Vivo
                      </span>
                    </div>
                    <p className="mt-3 leading-7 text-ink/66">{item.text}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningAreasSection() {
  const areaSpanClasses = [
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-3"
  ];

  return (
    <section id="areas" className="py-20 sm:py-28">
      <div className="section-shell">
        <SectionIntro eyebrow="Áreas de estudio" title="Siete áreas para mirar al niño completo">
          El mapa curricular integra lenguaje, cuerpo, imaginación, ecología, vida práctica, ética y tecnología con actividades concretas.
        </SectionIntro>
        <div className="mt-14 grid gap-4 lg:grid-cols-7">
          {areas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.article
                key={area.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.04, duration: 0.5 }}
                className={`card-hover rounded-md border p-5 ${areaSpanClasses[index]} ${area.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-forest shadow-line">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-snug text-ink">{area.title}</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-ink/68">
                      {area.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  const entries = useMemo(
    () => [
      { label: "Lenguaje", title: "Reconoce símbolos y narra una historia", media: "3 fotos + nota" },
      { label: "Naturaleza", title: "Observa germinación en el huerto", media: "video corto" },
      { label: "Vida práctica", title: "Prepara una receta con apoyo", media: "lista + foto" }
    ],
    []
  );

  return (
    <section id="portafolio" className="bg-ink py-20 text-white sm:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.p variants={fadeUp} className="mb-3 text-sm font-bold uppercase text-sun">
            Portafolio privado
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            El progreso se documenta con evidencia, no solo con memoria.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-white/72">
            Cada alumno cuenta con una bitácora organizada por área y periodo: notas, fotos, documentos, clips y enlaces privados a videos largos.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Admin", "gestiona familias"],
              ["Padres", "suben evidencias"],
              ["RLS", "protege datos"]
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-white/10 bg-white/8 p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-white/62">{text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-md border border-white/10 bg-white p-3 text-ink shadow-soft"
        >
          <div className="rounded-md border border-ink/8 bg-cloud">
            <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-forest">Portafolio</p>
                <p className="text-xs text-ink/52">Periodo: Primavera 2026</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-md bg-teal/12 px-2 py-1 text-xs font-semibold text-teal">Áreas</span>
                <span className="rounded-md bg-coral/12 px-2 py-1 text-xs font-semibold text-coral">Evidencias</span>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-md border border-ink/8 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-teal">{entry.label}</p>
                      <h3 className="mt-1 font-semibold">{entry.title}</h3>
                    </div>
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-forest">{entry.media}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-md bg-mist">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${56 + index * 14}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.15 }}
                      className="h-full rounded-md bg-gradient-to-r from-teal to-leaf"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ResourcesAndSecuritySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="section-shell grid gap-6 lg:grid-cols-3">
        <motion.article
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="card-hover rounded-md border border-ink/8 bg-cloud p-7"
        >
          <LibraryBig className="h-8 w-8 text-teal" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Recursos y materiales</h2>
          <p className="mt-3 leading-7 text-ink/68">
            Biblioteca privada con documentos, ligas externas y materiales por etapa, área o familia.
          </p>
        </motion.article>
        <motion.article
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.06 }}
          className="card-hover rounded-md border border-ink/8 bg-cloud p-7"
        >
          <ShieldCheck className="h-8 w-8 text-forest" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Seguridad desde la base</h2>
          <p className="mt-3 leading-7 text-ink/68">
            Autenticación, permisos por familia, almacenamiento privado, URLs firmadas y auditoría básica.
          </p>
        </motion.article>
        <motion.article
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.12 }}
          className="card-hover rounded-md border border-ink/8 bg-cloud p-7"
        >
          <UploadCloud className="h-8 w-8 text-coral" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Medios ligeros</h2>
          <p className="mt-3 leading-7 text-ink/68">
            Fotos, documentos y clips pequeños viven en storage; videos largos se integran con enlaces privados.
          </p>
        </motion.article>
      </div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 grid-paper opacity-40" />
      <div className="section-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl rounded-md border border-forest/12 bg-white/88 p-7 text-center shadow-line backdrop-blur sm:p-10"
        >
          <WandSparkles className="mx-auto h-8 w-8 text-coral" aria-hidden="true" />
          <p className="mt-5 text-sm font-bold uppercase text-teal">Propósito educativo</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            No solo formar capacidades, sino despertar almas.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink/66">
            El manifiesto vive como una brújula interior: preparar para vivir con sentido, cultivar conciencia y aprender a ser verdaderamente humano.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "No pudimos enviar tu mensaje.");
      }

      setState("success");
      setMessage(payload.message || "Mensaje recibido. Te contactaremos pronto.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  }

  return (
    <section id="contacto" className="bg-forest py-20 text-white sm:py-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-sun">Contacto</p>
          <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Conversemos sobre la etapa, ritmo y necesidades de tu familia.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/74">
            Esta primera versión usa contacto simple. El acceso al dashboard se activa por invitación cuando una familia queda registrada.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              ["México primero", "Lenguaje y privacidad pensados para familias mexicanas."],
              ["3-6 años", "Etapa temprana, práctica, flexible y profundamente humana."],
              ["Bajo mantenimiento", "Tecnología administrada para sostener el sistema con calma."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-white/12 bg-white/8 p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-white/64">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-md border border-white/12 bg-white p-5 text-ink shadow-soft sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Nombre
              <input
                name="name"
                required
                minLength={2}
                className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                placeholder="Tu nombre"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Correo
              <input
                name="email"
                type="email"
                required
                className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                placeholder="correo@ejemplo.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Teléfono
              <input
                name="phone"
                className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                placeholder="Opcional"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Edad del niño
              <select name="childAge" className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal" defaultValue="">
                <option value="" disabled>
                  Selecciona
                </option>
                <option value="3">3 años</option>
                <option value="4">4 años</option>
                <option value="5">5 años</option>
                <option value="6">6 años</option>
                <option value="varios">Varios niños</option>
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold">
            Mensaje
            <textarea
              name="message"
              required
              minLength={12}
              rows={5}
              className="focus-ring resize-none rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
              placeholder="Cuéntanos qué estás buscando para tu familia."
            />
          </label>
          <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <button
            type="submit"
            disabled={state === "loading"}
            className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "loading" ? "Enviando..." : "Enviar mensaje"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {message ? (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm ${state === "success" ? "bg-leaf/12 text-forest" : "bg-coral/12 text-coral"}`}>
              {message}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-ink/52">
            Al enviar este formulario aceptas ser contactado sobre el programa. Antes de producción se debe publicar aviso de privacidad completo.
          </p>
        </form>
      </div>
    </section>
  );
}
