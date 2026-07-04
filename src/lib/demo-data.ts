export const demoDashboardData = {
  mode: "demo" as const,
  profileName: "Vista previa",
  role: "parent" as const,
  families: [
    {
      id: "familia-demo",
      name: "Familia demo",
      city: "México"
    }
  ],
  students: [
    {
      id: "alumno-demo",
      family_id: "familia-demo",
      full_name: "Alumno demo",
      birth_year: 2021,
      stage: "3-6 años"
    }
  ],
  areas: [
    {
      id: "area-lenguaje",
      slug: "lenguaje-comunicacion",
      name: "Lenguaje y comunicación",
      description: "Letras, números, símbolos, lectura y primeras matemáticas."
    },
    {
      id: "area-ecologia",
      slug: "ecologia-sustentabilidad",
      name: "Ecología y sustentabilidad",
      description: "Jardinería, huerto en casa, reciclaje y cuidado de recursos."
    }
  ],
  topics: [
    {
      id: "tema-numeros",
      area_id: "area-lenguaje",
      slug: "letras-numeros-simbolos",
      name: "Letras, números y símbolos",
      description: "Reconocimiento de signos y cantidades."
    },
    {
      id: "tema-plantas",
      area_id: "area-ecologia",
      slug: "jardineria-huerto",
      name: "Jardinería y huerto en casa",
      description: "Cuidado de plantas y observación de ciclos naturales."
    }
  ],
  guides: [
    {
      id: "guia-plantas",
      area_id: "area-ecologia",
      topic_id: "tema-plantas",
      area: "Ecología y sustentabilidad",
      topic: "Jardinería y huerto en casa",
      title: "Actividad con plantas: cuidar una semilla",
      objective: "Observar cómo una semilla cambia con el cuidado diario.",
      age_range: "3-6 años",
      materials: ["Semillas", "Algodón o tierra", "Frasco o maceta", "Agua"],
      steps: [
        "Preparar el frasco o maceta.",
        "Colocar la semilla y hablar de lo que necesita.",
        "Regar con poca agua durante varios días.",
        "Dibujar o contar los cambios observados."
      ],
      evidence_prompt: "Registrar nota breve y fotos antes/después."
    },
    {
      id: "guia-numeros",
      area_id: "area-lenguaje",
      topic_id: "tema-numeros",
      area: "Lenguaje y comunicación",
      topic: "Letras, números y símbolos",
      title: "Tarjetas de números con objetos de casa",
      objective: "Relacionar símbolos numéricos con cantidades reales.",
      age_range: "3-6 años",
      materials: ["Tarjetas del 1 al 10", "Objetos pequeños", "Mesa despejada"],
      steps: [
        "Elegir tres números.",
        "Colocar la cantidad correcta de objetos.",
        "Cambiar el orden y repetir.",
        "Conversar sobre lo que fue fácil o difícil."
      ],
      evidence_prompt: "Guardar nota de observación y foto del acomodo final."
    }
  ],
  entries: [
    {
      id: "entrada-1",
      student_id: "alumno-demo",
      area: "Lenguaje y comunicación",
      area_id: "area-lenguaje",
      topic: "Letras, números y símbolos",
      topic_id: "tema-numeros",
      period: "Semana 1",
      title: "Reconoce letras iniciales y cuenta una historia breve",
      summary: "Se documenta con una nota del adulto y tres fotos del material usado.",
      observation: "Muestra interés cuando puede escoger los objetos.",
      activity_date: "2026-06-26",
      evidence_kind: "photo" as const,
      external_provider: "Google Drive",
      privacy_notes: "Enlace restringido a la familia.",
      media_count: 3,
      created_at: "2026-06-26"
    },
    {
      id: "entrada-2",
      student_id: "alumno-demo",
      area: "Ecología y sustentabilidad",
      area_id: "area-ecologia",
      topic: "Jardinería y huerto en casa",
      topic_id: "tema-plantas",
      period: "Semana 1",
      title: "Observa el crecimiento de una semilla",
      summary: "Incluye enlace privado a un video corto y una foto del huerto en casa.",
      observation: "Recuerda revisar si la tierra sigue húmeda.",
      activity_date: "2026-06-26",
      evidence_kind: "video" as const,
      external_provider: "Google Drive",
      privacy_notes: "Video externo restringido por correo.",
      media_count: 2,
      created_at: "2026-06-26"
    },
    {
      id: "entrada-3",
      student_id: "alumno-demo",
      area: "Vida práctica y social",
      area_id: "area-vida",
      topic: "Nutrición, alimentación y cocina",
      topic_id: "tema-cocina",
      period: "Semana 2",
      title: "Participa en la preparación de una receta",
      summary: "Registro de pasos, conversación sobre medidas y hábitos de higiene.",
      observation: "Sigue instrucciones de dos pasos con acompañamiento.",
      activity_date: "2026-06-26",
      evidence_kind: "note" as const,
      external_provider: "",
      privacy_notes: "",
      media_count: 4,
      created_at: "2026-06-26"
    }
  ],
  resources: [
    {
      id: "recurso-1",
      title: "Guía de documentación del progreso",
      description: "Criterios para escribir observaciones breves y útiles.",
      category: "Portafolio",
      kind: "Documento",
      area: "General",
      topic: "Documentación",
      source_name: "Sofi School",
      audience: "Padres",
      external_url: "",
      access_notes: "Material interno."
    },
    {
      id: "recurso-2",
      title: "Tarjetas de números 1-10",
      description: "Material imprimible o replicable para asociar símbolo y cantidad.",
      category: "Tarjetas",
      kind: "Plantilla",
      area: "Lenguaje y comunicación",
      topic: "Letras, números y símbolos",
      source_name: "Sofi School",
      audience: "Padres y niños",
      external_url: "",
      access_notes: "PDF ligero o enlace restringido si se personaliza."
    },
    {
      id: "recurso-3",
      title: "Plantilla de observación de plantas",
      description: "Formato para registrar fecha, dibujo, cambios observados y cuidado realizado.",
      category: "Ecología",
      kind: "PDF",
      area: "Ecología y sustentabilidad",
      topic: "Jardinería y huerto en casa",
      source_name: "Sofi School",
      audience: "Padres y niños",
      external_url: "",
      access_notes: "Usar bucket privado o enlace restringido."
    }
  ],
  consents: [
    {
      id: "consent-demo",
      family_id: "familia-demo",
      consent_name: "uso-imagenes-videos-menores",
      consent_version: "2026-07-04",
      accepted: true,
      accepted_at: "2026-07-04T00:00:00.000Z",
      revoked_at: null
    }
  ],
  invitations: []
};

export type DemoDashboardData = typeof demoDashboardData;
