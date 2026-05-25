import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K1_E3_JN_PERFORMANCE",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
        dialogue: "Para empezar, me preocupa uno de los ingenieros de tu nuevo equipo, Pedro. Es brillante, pero últimamente su rendimiento ha bajado mucho. La política de la empresa dice que tras dos semanas de bajo rendimiento, debemos iniciar un plan de mejora formal que podría terminar en despido.",
        options: [
          { option_id: "A", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Gracias por el aviso. Iniciaremos el plan de mejora formal de inmediato. Las reglas son para todos.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, bridgeResponse: "De acuerdo, apegado al procedimiento. Me encargaré de iniciar el proceso formalmente. Sigamos..." } },
          { option_id: "B", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Este proyecto es demasiado importante como para cargar con alguien que no rinde. Inicia el proceso de desvinculación.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, reputationChange: -5, bridgeResponse: "Entendido. Una decisión drástica. Procederé a contactar a legales. Sigamos..." } },
          { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Antes de cualquier proceso formal, quiero hablar con Pedro. Puede que esté pasando por un problema personal. Mi deber como líder es entender el contexto y apoyarlo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 20, supportChange: 15, reputationChange: 5, bridgeResponse: "Gracias. Ese es el tipo de liderazgo que queremos fomentar. Me alegra que esa sea tu primera inclinación. Coordinaré una reunión privada para ti..." } },
          { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Retrasa el proceso formal un par de semanas. Le daré tareas menos críticas mientras veo si su rendimiento mejora por sí solo para no tener que lidiar con el papeleo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -5, supportChange: -5, bridgeResponse: "Comprendo, quieres evitar la burocracia. Lo puedo retener un tiempo, pero no indefinidamente. Siguiente punto..." } }
        ]
      },
  {
        node_id: "K1_R1_JN_HIRING",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
        dialogue: "...Ahora, sobre nuevas contrataciones. Necesitas un experto en 'Cloud Architecture'. Podemos abrir un proceso de búsqueda nacional, que tardará 2-3 meses pero nos asegura muchos candidatos. O podemos promover a Ana, nuestra ingeniera de visualización; es inteligente y aprende rápido, pero no tiene experiencia en el área.",
        options: [
          { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Abramos el proceso nacional. No podemos arriesgarnos. Necesitamos a alguien con experiencia probada desde el día uno.", tags: { "risk": "low" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: -5, bridgeResponse: "Entendido. Una decisión segura. Redactaré el perfil de cargo para la búsqueda externa. Sigamos..." } },
          { option_id: "B", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "Promovamos a Ana. Apostemos por el talento interno. Prefiero el riesgo de la curva de aprendizaje a la demora de una contratación.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: 2, bridgeResponse: "Una gran muestra de confianza en nuestra gente. A Ana le encantará la oportunidad. Es un riesgo, pero uno que apoya nuestra cultura. Sigamos..." } },
          { option_id: "C", cardTitle: "Plan de Capacitacion", cardEmoji: "🎓", text: "Promovamos a Ana, pero invirtamos en un programa de mentoría intensivo con un consultor externo durante el primer mes.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 10, budgetChange: -10000, bridgeResponse: "Un enfoque equilibrado. Me gusta. Combina desarrollo interno con mitigación de riesgos. Lo coordinaré. Siguiente punto..." } },
          { option_id: "D", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Hagamos ambas cosas. Iniciemos el proceso de búsqueda y, mientras tanto, démosle a Ana la oportunidad como 'líder interina' del área.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, bridgeResponse: "Un enfoque equilibrado. Me gusta. No cerramos ninguna puerta. Lo coordinaré. Siguiente punto..." } }
        ]
      },
  {
        node_id: "K1_E2_JN_CONFIDENTIALITY",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
        dialogue: "...Un tema delicado. Como sabes, este proyecto podría llevar a la automatización de ciertos roles. La política de la empresa es no comunicar posibles despidos hasta que la decisión sea final e irrevocable para evitar el pánico.",
        options: [
          { option_id: "A", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "La política es clara y debemos seguirla. No diremos nada hasta que sea oficial.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, bridgeResponse: "De acuerdo. Es el camino más ordenado y apegado a la norma, aunque difícil. Siguiente punto..." } },
          { option_id: "B", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "La gente merece saber lo que podría pasar. Ocultarles esta información es injusto. Debemos ser transparentes sobre la posibilidad, aunque genere ansiedad.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 10, reputationChange: -10, bridgeResponse: "Transparencia radical... Es una postura éticamente admirable, pero prepárate para manejar las consecuencias en la moral del equipo. Siguiente punto..." } },
          { option_id: "C", cardTitle: "Iniciar Reunion", cardEmoji: "▶️", text: "No solo no diremos nada, sino que debemos iniciar una campaña de comunicación interna enfocada en los 'nuevos roles emocionantes' que creará la IA.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, reputationChange: 5, bridgeResponse: "Entiendo, un enfoque en la gestión de la percepción. Puede ser efectivo, pero también arriesgado si la gente siente que no somos sinceros. Sigamos..." } },
          { option_id: "D", cardTitle: "Gestionar Comunicacion", cardEmoji: "📣", text: "Se lo diremos solo a los gerentes de área en confianza, para que ellos puedan 'preparar' a su gente sin hacer un anuncio oficial.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -5, bridgeResponse: "Entiendo, un enfoque en la gestión de la percepción. Puede ser efectivo, pero también arriesgado si la gente siente que no somos sinceros. Sigamos..." } }
        ]
      },
  {
        node_id: "K1_R2_JN_TRAINING",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
        dialogue: "...Para que la gente adopte la nueva plataforma, necesitan capacitación. Podemos hacer un curso online obligatorio, de bajo costo y escalable. O podemos hacer talleres presenciales en grupos pequeños. Mucho más caro y lento, pero con mayor impacto.",
        options: [
          { option_id: "A", cardTitle: "Plan de Capacitacion", cardEmoji: "🎓", text: "Vamos con el curso online. Es la única forma eficiente de capacitar a toda la empresa sin detener las operaciones.", tags: { "risk": "low" }, consequences: { trustChange: 0, supportChange: 0, budgetChange: -5000, projectProgressChange: 5, bridgeResponse: "Eficiente y escalable. Es el enfoque estándar. Lo pondremos en marcha." } },
          { option_id: "B", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Los talleres presenciales son la única forma de asegurar una adopción real. Es una inversión, no un costo. Debemos hacerlo bien.", tags: { "risk": "high" }, consequences: { trustChange: 10, supportChange: 5, budgetChange: -30000, projectProgressChange: 2, bridgeResponse: "Una inversión en nuestra gente. Aprecio ese enfoque. Será más lento de organizar, pero los resultados serán mejores." } },
          { option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Hagamos un modelo mixto: un curso online para la base y talleres presenciales solo para los 'super-usuarios' o líderes de equipo.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, budgetChange: -15000, projectProgressChange: 4, bridgeResponse: "Un buen compromiso. Maximizamos el impacto donde más importa. Me parece un plan sólido." } },
          { option_id: "D", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Lancemos la plataforma sin una capacitación formal. El software debería ser lo suficientemente intuitivo. Daremos soporte a quienes lo necesiten.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: -5, bridgeResponse: "Es... una estrategia audaz. Confiar en la intuición de cientos de empleados es un riesgo operativo enorme. Como digas." } }
        ]
      },
  {
        node_id: "K1_E3_JN_REMOTE_WORK",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
        dialogue: "...Último punto. David Reyes, tu Lead Engineer, me ha pedido trabajar 100% remoto por un tema familiar delicado. Nuestra nueva política 'post-pandemia', impulsada por la gerencia, exige 3 días de presencialidad a la semana, sin excepciones, para 'fomentar la cultura'.",
        options: [
          { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "La política es para todos. David es clave, pero no podemos hacer una excepción con él. Deberá cumplir con los 3 días.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 5, supportChange: -10, bridgeResponse: "" } },
          { option_id: "B", cardTitle: "Hacer Preguntas", cardEmoji: "❓", text: "La familia es lo primero. Aprobaré su solicitud de trabajo 100% remoto. Si la gerencia pregunta, diré que es una 'necesidad crítica del proyecto'.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: 15, reputationChange: 5, bridgeResponse: "" } },
          { option_id: "C", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "La política parece ser demasiado rígida. Hablaré con la Gerencia General para proponer una enmienda basada en la flexibilidad y la confianza, usando el caso de David como ejemplo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 10, reputationChange: 10, bridgeResponse: "" } },
          { option_id: "D", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Que venga los 3 días, pero que se quede solo medio día en la oficina. Así cumple 'formalmente' la política, pero tiene la flexibilidad que necesita.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -5, supportChange: 5, bridgeResponse: "" } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "JN_MEETING_1",
        stakeholderRole: "Gerente de Recursos Humanos",

        stakeholderId: "javier-nunez",
      initialDialogue: "Hola, {playerName}, bienvenido. Soy Javier. He leído sobre el 'Proyecto Quantum Leap' y, francamente, aunque la tecnología suena fascinante, mi preocupación principal es el impacto en nuestra gente. Un cambio de esta magnitud puede generar mucha ansiedad. Estoy aquí para asegurar que lo hagamos de la forma correcta, cuidando a nuestro equipo. ¿Cuál es tu visión al respecto?",
        nodes: ["K1_E3_JN_PERFORMANCE", "K1_R1_JN_HIRING", "K1_E2_JN_CONFIDENTIALITY", "K1_R2_JN_TRAINING", "K1_E3_JN_REMOTE_WORK"],
        finalDialogue: "De acuerdo. Esta ha sido una conversación muy reveladora. Me da una idea clara de tu enfoque hacia la gestión de personas. Hay decisiones complejas por delante, pero ahora sé cómo las abordarás. Gracias por tu tiempo."
      },
];
