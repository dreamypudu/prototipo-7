import { Stakeholder } from '../../../types';
import { CESFAM_QUESTIONS } from './questions';

export const CESFAM_STAKEHOLDERS: Stakeholder[] = [
    // --- SOPORTE ADMINISTRATIVO ---
    {
      id: "sofia-castro",
      shortId: "SC",
      name: "Sofía Castro",
      role: "Asistente Administrativa",
      power: 20, interest: 100, trust: 80, support: 100, minSupport: 50, maxSupport: 100, mood: 'neutral',
      personality: "Profesional, discreta y experta en la burocracia. Es el nexo entre la Dirección y la realidad operativa de los sectores.",
      portraitUrl: 'https://i.imgur.com/6ZCdB5G.png',
      agenda: ["Mantener el orden administrativo.", "Evitar conflictos legales.", "Asegurar que el Director tenga la información correcta."],
      commitments: [],
      informationTiers: [],
      questions: CESFAM_QUESTIONS['sofia-castro'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },

    // --- SECTOR AZUL ---
    {
      id: "andres-guzman",
      shortId: "AG",
      name: "Dr. Andrés Guzmán",
      role: "Jefe Sector Azul",
      power: 90, interest: 80, trust: 50, support: 50, minSupport: 20, maxSupport: 90, mood: 'neutral',
      personality: "El Académico Político. Carismático y conectado, pero elitista. Valora el prestigio y la investigación sobre la productividad asistencial.",
      portraitUrl: "https://i.imgur.com/haTtDtC.png",
      agenda: [
        "Obtener horas protegidas para investigación.",
        "Asegurar el mejor equipamiento (Box 5) para su sector.",
        "Mantener el estatus del Sector Azul como referente académico."
      ],
      commitments: [],
      informationTiers: [
        { trustThreshold: 60, information: "Está negociando un convenio con la Universidad a espaldas de la Dirección." },
        { trustThreshold: 80, information: "Usa su influencia política externa como amenaza si no consigue recursos." }
      ],
      questions: CESFAM_QUESTIONS['andres-guzman'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },
    {
      id: "paz-herrera",
      shortId: "PH",
      name: "Enf. Paz Herrera",
      role: "Enfermera Sector Azul",
      power: 40, interest: 70, trust: 60, support: 60, minSupport: 30, maxSupport: 80, mood: 'neutral',
      personality: "La Ejecutora Leal. Brillante técnicamente, eficiente, pero ve a los pacientes 'difíciles' como una molestia. Lealtad total a Guzmán.",
      portraitUrl: "/avatars/paz-herrera.png",
      agenda: [
        "Maximizar la eficiencia clínica.",
        "Evitar tareas 'menores' (visitas domiciliarias básicas).",
        "Seguir la visión académica de Guzmán."
      ],
      commitments: [],
      informationTiers: [],
      questions: CESFAM_QUESTIONS['paz-herrera'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },
    {
      id: "javier-castro",
      shortId: "JC",
      name: "TENS Javier Castro",
      role: "TENS Sector Azul",
      power: 10, interest: 50, trust: 50, support: 50, minSupport: 10, maxSupport: 70, mood: 'anxious',
      personality: "El Eslabón Silencioso. Tímido y muy trabajador. Absorbe toda la carga que Guzmán y Herrera rechazan. Riesgo alto de colapso silencioso.",
      portraitUrl: "/avatars/javier-castro.png",
      agenda: [
        "Sobrevivir a la carga laboral sin conflictos.",
        "Evitar errores administrativos.",
        "No decepcionar a sus jefes."
      ],
      commitments: [],
      informationTiers: [
        { trustThreshold: 50, information: "Está cubriendo errores de registro de Herrera para evitar problemas." }
      ],
      questions: CESFAM_QUESTIONS['javier-castro'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },

    // --- SECTOR ROJO ---
    {
      id: "marcela-soto",
      shortId: "MS",
      name: "Enf. Marcela Soto",
      role: "Jefa Sector Rojo",
      power: 80, interest: 95, trust: 50, support: 50, minSupport: 10, maxSupport: 80, mood: 'neutral',
      personality: "La Guardiana del Reglamento. Maternal con su equipo, inflexible con la dirección. Su prioridad son los derechos laborales y los protocolos.",
      portraitUrl: "https://i.imgur.com/JLlAfIm.png",
      agenda: [
        "Bloquear horas extra no reglamentadas.",
        "Cumplimiento estricto de protocolos (cero riesgo legal).",
        "Proteger a su equipo de la sobrecarga."
      ],
      commitments: [],
      informationTiers: [
        { trustThreshold: 70, information: "Tiene preparada una denuncia a Contraloría si se violan los descansos." }
      ],
      questions: CESFAM_QUESTIONS['marcela-soto'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },
    {
      id: "eduardo-naranjo",
      shortId: "EN",
      name: "Dr. Eduardo Naranjo",
      role: "Médico Sector Rojo",
      power: 30, interest: 40, trust: 60, support: 60, minSupport: 20, maxSupport: 70, mood: 'neutral',
      personality: "El Pasivo Complaciente. Competente pero sin carácter. Evita conflictos dando licencias o demorándose en las consultas. Protegido por Soto.",
      portraitUrl: "/avatars/eduardo-naranjo.png",
      agenda: [
        "Evitar conflictos con pacientes y jefatura.",
        "Mantener su rutina sin sobresaltos.",
        "No ser responsabilizado por decisiones difíciles."
      ],
      commitments: [],
      informationTiers: [],
      questions: CESFAM_QUESTIONS['eduardo-naranjo'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },
    {
      id: "claudia-morales",
      shortId: "CM",
      name: "TENS Claudia Morales",
      role: "TENS Sector Rojo",
      power: 50, interest: 90, trust: 40, support: 40, minSupport: 0, maxSupport: 80, mood: 'angry',
      personality: "La Activista. Fuerte sentido de justicia. Vocal y conflictiva. Detonante de conflictos de clima laboral y Ley Karin.",
      portraitUrl: "/avatars/claudia-morales.png",
      agenda: [
        "Denunciar cualquier injusticia o maltrato.",
        "Movilizar al gremio si es necesario.",
        "Exigir respeto para el estamento TENS."
      ],
      commitments: [],
      informationTiers: [
        { trustThreshold: 40, information: "Está recopilando antecedentes para una acusación por acoso laboral." }
      ],
      questions: CESFAM_QUESTIONS['claudia-morales'] ?? [],
      questionsAsked: [],
      status: 'ok',
      lastMetDay: 0,
    },

    // --- SECTOR AMARILLO ---
    {
        id: "daniel-rios",
        shortId: "DR",
        name: "Sr. Daniel Ríos",
        role: "Jefe Sector Amarillo",
        power: 70, interest: 90, trust: 60, support: 60, minSupport: 30, maxSupport: 90, mood: 'neutral',
        personality: "El Líder Callejero. Pragmático, anti-burocracia, orientado a la acción social. Se salta las reglas para ayudar al vecino. Respaldo de la comunidad.",
        portraitUrl: "/avatars/daniel-rios.png",
        agenda: [
          "Soluciones rápidas para los pacientes (saltarse protocolos).",
          "Conseguir recursos para terreno.",
          "Mantener la paz social con la Junta de Vecinos."
        ],
        commitments: [],
        informationTiers: [
          { trustThreshold: 60, information: "Ha autorizado entregas de medicamentos sin receta completa para ayudar a vecinos." }
        ],
        questions: CESFAM_QUESTIONS['daniel-rios'] ?? [],
        questionsAsked: [],
        status: 'ok',
        lastMetDay: 0,
    },
    {
        id: "francisca-solis",
        shortId: "FS",
        name: "Enf. Francisca Solís",
        role: "Enfermera Sector Amarillo",
        power: 30, interest: 80, trust: 70, support: 70, minSupport: 40, maxSupport: 90, mood: 'sad',
        personality: "El Corazón Emocional. Empática hasta el dolor. Sufre con las fallas del sistema. Barómetro ético de la gestión.",
        portraitUrl: "/avatars/francisca-solis.png",
        agenda: [
          "Humanizar la atención.",
          "Ayudar a los casos sociales complejos.",
          "No perder la sensibilidad ante el sufrimiento."
        ],
        commitments: [],
        informationTiers: [],
        questions: CESFAM_QUESTIONS['francisca-solis'] ?? [],
        questionsAsked: [],
        status: 'ok',
        lastMetDay: 0,
    },
    {
        id: "ricardo-meza",
        shortId: "RM",
        name: "Dr. Ricardo Meza",
        role: "Médico Sector Amarillo",
        power: 40, interest: 60, trust: 50, support: 50, minSupport: 10, maxSupport: 80, mood: 'frustrated',
        personality: "El Inconformista Impaciente. Joven, moderno, quiere cambios rápidos. Se frustra con la falta de tecnología. Riesgo de renuncia.",
        portraitUrl: "/avatars/ricardo-meza.png",
        agenda: [
          "Modernizar la gestión (menos papel, más apps).",
          "Obtener herramientas tecnológicas (ecógrafos, tablets).",
          "Ver resultados rápidos o irse al sector privado."
        ],
        commitments: [],
        informationTiers: [
          { trustThreshold: 50, information: "Ya tuvo una entrevista en una clínica privada la semana pasada." }
        ],
        questions: CESFAM_QUESTIONS['ricardo-meza'] ?? [],
        questionsAsked: [],
        status: 'ok',
        lastMetDay: 0,
    }
  ];
