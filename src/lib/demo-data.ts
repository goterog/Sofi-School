export const demoDashboardData = {
  mode: "demo" as const,
  profileName: "Vista previa",
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
  entries: [
    {
      id: "entrada-1",
      student_id: "alumno-demo",
      area: "Lenguaje y comunicación",
      period: "Semana 1",
      title: "Reconoce letras iniciales y cuenta una historia breve",
      summary: "Se documenta con una nota del adulto y tres fotos del material usado.",
      media_count: 3,
      created_at: "2026-06-26"
    },
    {
      id: "entrada-2",
      student_id: "alumno-demo",
      area: "Ecología y sustentabilidad",
      period: "Semana 1",
      title: "Observa el crecimiento de una semilla",
      summary: "Incluye enlace privado a un video corto y una foto del huerto en casa.",
      media_count: 2,
      created_at: "2026-06-26"
    },
    {
      id: "entrada-3",
      student_id: "alumno-demo",
      area: "Vida práctica y social",
      period: "Semana 2",
      title: "Participa en la preparación de una receta",
      summary: "Registro de pasos, conversación sobre medidas y hábitos de higiene.",
      media_count: 4,
      created_at: "2026-06-26"
    }
  ],
  resources: [
    {
      id: "recurso-1",
      title: "Guía de documentación del progreso",
      category: "Portafolio",
      kind: "Documento"
    },
    {
      id: "recurso-2",
      title: "Lista de salidas educativas sugeridas",
      category: "Comunidad",
      kind: "Enlace"
    },
    {
      id: "recurso-3",
      title: "Material de observación de naturaleza",
      category: "Ecología",
      kind: "PDF"
    }
  ]
};

export type DemoDashboardData = typeof demoDashboardData;
