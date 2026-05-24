import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K2_R4_DR_NEW_TECH",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "Ok, primero lo bueno. Acaba de salir una nueva librería de código abierto que podría acelerar el procesamiento de datos de nuestra plataforma en un 300%. Es revolucionaria. La mala noticia: integrarla ahora significa desechar las últimas tres semanas de trabajo y retrasar el sprint actual.",
        options: [
          { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Olvídalo. No podemos permitirnos un retraso. Nos quedamos con la tecnología actual, que ya sabemos que funciona.", tags: { "risk": "low" }, consequences: { trustChange: -5, supportChange: -5, dialogueResponse: "Entendido. Priorizamos el cronograma. Es una lástima desde el punto de vista técnico, pero es una decisión clara. Sigamos..." } },
          { option_id: "B", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Hazlo. Una mejora de 300% es una ventaja competitiva que no podemos ignorar. Asumiremos el costo del retrabajo.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -5, dialogueResponse: "Ok, es una decisión audaz. Al equipo le encantará el desafío técnico, pero prepárate para justificar el retraso. Siguiente punto..." } },
          { option_id: "C", cardTitle: "Siguiente", cardEmoji: "➡️", text: "No podemos parar el sprint, pero quiero explorar esto. Asigna a un ingeniero a crear una prueba de concepto en paralelo. Si funciona, la integramos en el siguiente ciclo.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Un enfoque de riesgo controlado. Me parece inteligente. Asignaré a alguien para esa prueba de concepto. Siguiente punto..." } },
          { option_id: "D", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "Anótalo en el backlog técnico. Lo consideraremos para la 'versión 2.0' del proyecto, después del lanzamiento inicial.", tags: { "risk": "low" }, consequences: { trustChange: -5, supportChange: -5, dialogueResponse: "Entendido. Priorizamos el cronograma. Es una lástima desde el punto de vista técnico, pero es una decisión clara. Sigamos..." } }
        ]
      },
  {
        node_id: "K2_E2_DR_TEAM_CONFLICT",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "...Ahora un problema interno. Dos de nuestros mejores ingenieros, Ana y Pedro, tienen un conflicto personal serio y apenas se hablan. Su falta de comunicación está creando un cuello de botella y afectando la moral del resto del equipo.",
        options: [
          { option_id: "A", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Diles que son profesionales y que deben dejar sus problemas personales en casa. Si no pueden, uno de los dos tendrá que irse.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, supportChange: -15, dialogueResponse: "Es una solución... funcional, supongo. Pero no resuelve el problema de fondo. Lo implementaré. Continuemos..." } },
          { option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "RRHH tiene un protocolo de mediación de conflictos. Inicia el procedimiento formal con ellos de inmediato.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 5, supportChange: 0, dialogueResponse: "Ok, seguir el protocolo. Es el camino correcto, aunque lento. Informaré a RRHH. Continuemos..." } },
          { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Esto es mi responsabilidad. Quiero que organices una reunión conmigo y con cada uno de ellos por separado. Necesito entender qué pasa antes de tomar cualquier medida.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 20, supportChange: 15, dialogueResponse: "Gracias. Aprecio que te involucres a ese nivel. Creo que es el enfoque correcto para el equipo. Coordinaré las reuniones..." } },
          { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Reasígnalos a módulos diferentes del proyecto para que no tengan que interactuar. Es la forma más rápida de solucionar el bloqueo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, dialogueResponse: "Es una solución... funcional, supongo. Pero no resuelve el problema de fondo. Lo implementaré. Continuemos..." } }
        ]
      },
  {
        node_id: "K2_R5_DR_SECURITY_VULN",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "...Pasando a seguridad. Una auditoría externa encontró una vulnerabilidad de nivel medio en uno de los componentes que usamos. Arreglarla 'correctamente' tomaría una semana entera y un especialista. La alternativa es aplicar un parche 'suficientemente bueno' en dos horas.",
        options: [
          { option_id: "A", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "La seguridad es la máxima prioridad. Paren lo que están haciendo y dediquen la semana a la solución completa.", tags: { "risk": "low" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -3, dialogueResponse: "Decisión clara. Notificaré al equipo que re-priorizamos todo. Es lo más seguro. Último punto..." } },
          { option_id: "B", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "El riesgo es 'medio', no 'crítico'. Apliquen el parche rápido y sigamos adelante. No podemos parar por todo.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, dialogueResponse: "Entendido. Parche rápido. Documentaremos que esta es una solución temporal bajo tu dirección. Último punto..." } },
          { option_id: "C", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "Apliquen el parche ahora para estar cubiertos, pero creen una tarea en el backlog con alta prioridad para implementar la solución completa en el próximo sprint.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "Un enfoque medido. Me parece razonable. Actuar ahora pero planificar a largo plazo. De acuerdo. Último punto..." } },
          { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Necesito más datos. Prepara un informe de una página que evalúe el peor escenario posible si esta vulnerabilidad es explotada. Decidiré con esa información.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, dialogueResponse: "Un enfoque medido. Me parece razonable. Actuar ahora pero planificar a largo plazo. De acuerdo. Último punto..." } }
        ]
      },
  {
        node_id: "K2_E3_DR_POACHING",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "...Y esto es delicado. Carolina Soto (CMO) se acercó directamente a Ana, nuestra ingeniera de visualización, y le asignó una 'tarea urgente' para su campaña de marketing, saltándose toda la planificación del sprint. Ana está confundida y no sabe a quién responder.",
        options: [
          { option_id: "A", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Dile a Ana que haga lo que pide Carolina. No quiero un conflicto con Marketing, son un área muy influyente.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, supportChange: -15, reputationChange: -5, dialogueResponse: "Ok." } },
          { option_id: "B", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Esto es una violación de los procesos. Hablaré directamente con Carolina y le recordaré que todas las solicitudes deben pasar por nuestra planificación de sprints.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Ok." } },
          { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Yo te respaldo. Habla tú con Ana y dile que su prioridad es el sprint que definimos. Yo me encargaré de la conversación con Carolina para buscar una solución que respete a nuestro equipo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 20, supportChange: 15, dialogueResponse: "Ok." } },
          { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Dile a Ana que ignore el correo de Carolina por ahora. Si vuelve a insistir, le diremos que estamos demasiado ocupados.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -10, dialogueResponse: " " } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "DR_MEETING_2",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
      initialDialogue: "Hola, {playerName}. Qué bueno que hablamos. El equipo está avanzando, pero estamos empezando a encontrar los problemas reales, los que no se ven en la planificación. Tengo un par de temas críticos que necesito discutir contigo.",
        nodes: ["K2_R4_DR_NEW_TECH", "K2_E2_DR_TEAM_CONFLICT", "K2_R5_DR_SECURITY_VULN", "K2_E3_DR_POACHING"],
        finalDialogue: "Ok, gracias. Esto me da claridad sobre cómo manejar estas situaciones. No es fácil, pero al menos sé a qué atenerme. Seguiremos trabajando."
      },
];
