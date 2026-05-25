import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K1_E2_MF_METHODOLOGY",
        stakeholderRole: "Project Manager Senior",

        stakeholderId: "monica-flores",
        dialogue: "Precisamente sobre eso. Tu plan de proyecto no sigue la metodología 'Innovatec Standard'. Debemos seguir las reglas. Voy a necesitar que completes los 12 formularios de la Fase 1 antes de que el equipo escriba una sola línea de código.",
        options: [
          { option_id: "A", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Tienes razón, Mónica. La metodología existe por algo. Entrégame los formularios, nos aseguraremos de completarlos.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -10, bridgeResponse: "Excelente. Me alegra que empecemos con el pie derecho, respetando los procesos. Así se minimizan los riesgos..." } },
          { option_id: "B", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Aprecio tu experiencia, pero para este proyecto necesitamos agilidad. Confía en mí, mi método funciona. Empezaremos a programar mañana.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: 10, bridgeResponse: "Ya veo. Un enfoque disruptivo. Espero que sepas lo que haces. El riesgo es alto. Siguiente punto..." } },
          { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Entiendo la importancia de los procesos, pero la metodología actual no es adecuada para proyectos de IA. Propongo que trabajemos juntos en una versión adaptada. Es lo mejor para la empresa a largo plazo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 5, supportChange: 5, bridgeResponse: "Adaptar... es una posibilidad, pero requerirá muchas aprobaciones. Valoro la propuesta. Sigamos..." } },
          { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Llenaremos los formularios, pero de forma simbólica. Que tu equipo complete los documentos mientras mi equipo técnico avanza en paralelo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: 0, bridgeResponse: "Entendido. Una solución 'creativa' a las reglas. Anotado. Siguiente punto..." } }
        ]
      },
  {
        node_id: "K1_R1_MF_RESOURCE_ALLOCATION",
        stakeholderRole: "Project Manager Senior",

        stakeholderId: "monica-flores",
        dialogue: "...Ahora, la asignación de recursos. Para la fase de análisis de datos, el procedimiento estándar es asignar un analista de negocios junior. Son más baratos y están disponibles. Sé que pediste un 'Data Scientist', pero son caros y difíciles de conseguir.",
        options: [
            { option_id: "A", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Procedamos con el analista junior. Nos adaptaremos a los recursos disponibles como dicta el procedimiento.", tags: { "risk": "low" }, consequences: { trustChange: 10, supportChange: 5, bridgeResponse: "Una decisión prudente y apegada a la realidad presupuestaria. Procederé con la asignación. Siguiente punto..." } },
            { option_id: "B", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "No. Necesito un Data Scientist. La calidad del análisis es crítica. No empezaré hasta que tengamos a la persona correcta, aunque nos retrase.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, bridgeResponse: "Insistir en un recurso escaso... eso complicará el cronograma y el presupuesto. Lo registraré como un riesgo del proyecto. Siguiente punto..." } },
            { option_id: "C", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Asigna al analista junior, pero quiero que le paguemos un curso intensivo de Data Science y que David Reyes (Lead Engineer) sea su mentor.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, budgetChange: -5000, bridgeResponse: "Soluciones alternativas que se desvían del procedimiento. Requerirán aprobación de Finanzas y RRHH. Lo gestionaré. Sigamos..." } },
            { option_id: "D", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Contratemos un Data Scientist freelance por tres meses. Será más caro a corto plazo, pero mitigamos el riesgo de tener un análisis de baja calidad.", tags: { "risk": "medium" }, consequences: { trustChange: 0, supportChange: 5, budgetChange: -15000, bridgeResponse: "Soluciones alternativas que se desvían del procedimiento. Requerirán aprobación de Finanzas y RRHH. Lo gestionaré. Sigamos..." } }
        ]
      },
  {
        node_id: "K1_E3_MF_PAST_FAILURE",
        stakeholderRole: "Project Manager Senior",

        stakeholderId: "monica-flores",
        dialogue: "...Esto me recuerda al 'Proyecto Titán'. El PM de ese proyecto descubrió a mitad de camino que el presupuesto estaba mal calculado en un 30%. En lugar de reportarlo, intentó 'ocultarlo' con reasignaciones creativas. Fue un desastre.",
        options: [
          { option_id: "A", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "El error fue intentar ocultarlo, no la reasignación. Un buen PM debe ser capaz de manejar esas desviaciones sin alarmar a todo el mundo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -5, bridgeResponse: "Ya veo. Tienes una visión... flexible de los reportes. Es una perspectiva. Pasemos al último punto." } },
          { option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Su obligación, según el Manual de Proyectos página 42, era reportar cualquier desviación superior al 10% de inmediato. Debió seguir la regla.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 15, supportChange: 10, bridgeResponse: "Exacto. Si hubiera seguido el manual, el daño se habría controlado. Me alegra que lo veas así. Pasemos al último punto." } },
          { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "El verdadero problema fue la falta de transparencia. Un error no es una falla moral, ocultarlo sí. El equipo y la gerencia deben saber la verdad para tomar decisiones informadas.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 10, supportChange: 5, bridgeResponse: "Transparencia... sí, es un principio noble. A veces choca con la realidad de la oficina. Pero entiendo tu punto. Último tema." } },
          { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Probablemente estaba bajo mucha presión. A veces hay que 'maquillar' los números para proteger al equipo y al proyecto.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, bridgeResponse: "Ya veo. Tienes una visión... flexible de los reportes. Es una perspectiva. Pasemos al último punto." } }
        ]
      },
  {
          node_id: "K1_R2_MF_REPORTING_FREQUENCY",
          stakeholderRole: "Project Manager Senior",

          stakeholderId: "monica-flores",
        dialogue: "...Y para que eso no nos pase, hablemos de los reportes de avance. El estándar es un informe de progreso semanal que requiere 4 horas de preparación. O, como sé que te gusta la agilidad, podemos tener una reunión de pie de 10 minutos cada día.",
          options: [
              { option_id: "A", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Quedémonos con el informe semanal. Necesito la documentación detallada y el rastro en papel.", tags: { "risk": "low" }, consequences: { trustChange: 10, supportChange: 5, bridgeResponse: "" } },
              { option_id: "B", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "La reunión diaria. Es más eficiente y nos da feedback en tiempo real. Eliminemos el informe semanal.", tags: { "risk": "high" }, consequences: { trustChange: -10, supportChange: -5, bridgeResponse: "" } },
              { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Hagamos la reunión diaria, y al final de la semana, tu equipo me envía un resumen de una página con viñetas, no el informe de 4 horas.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, bridgeResponse: "" } },
              { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Automaticemos el reporte. Quiero que el equipo invierta en un dashboard que se actualice en tiempo real. Cero informes manuales.", tags: { "risk": "high" }, consequences: { trustChange: -5, supportChange: -10, projectProgressChange: 2, bridgeResponse: "" } }
          ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "MF_MEETING_1",
        stakeholderRole: "Project Manager Senior",

        stakeholderId: "monica-flores",
      initialDialogue: "Buenos días, {playerName}. He revisado el borrador del 'Proyecto Quantum Leap'. Es... ambicioso. Llevo 15 años gestionando proyectos en Innovatec y he aprendido que el éxito está en seguir los procedimientos que funcionan. Estoy aquí para asegurar que este proyecto se alinee con nuestras metodologías probadas. ¿Cuál es el primer punto que quieres revisar?",
        nodes: ["K1_E2_MF_METHODOLOGY", "K1_R1_MF_RESOURCE_ALLOCATION", "K1_E3_MF_PAST_FAILURE", "K1_R2_MF_REPORTING_FREQUENCY"],
        finalDialogue: "De acuerdo. Con esto tengo suficiente para elaborar el Plan de Gestión de Proyecto inicial. Veo que tienes ideas claras, aunque algunas se desvían de nuestras prácticas. Lo documentaré todo. Estamos en contacto."
      },
];
