import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K2_R3_RV_COST_OVERRUN",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "El primer problema. La licencia principal del software de base de datos costará un 25% más de lo cotizado debido a nuevas tarifas del proveedor. Son 50k USD que no estaban en el presupuesto. ¿Cómo lo resolverás?",
        options: [
          { option_id: "A", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Absorberemos el costo por ahora y buscaremos eficiencias en otras áreas más adelante para compensar.", tags: { "risk": "high" }, consequences: { trustChange: -10, budgetChange: -50000, dialogueResponse: "Ya... 'esperar y ver'. Una apuesta arriesgada. Asegúrate de tener un plan concreto para esos 'ahorros futuros'..." } },
          { option_id: "B", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "Debemos ser responsables. Recortaré una de las funcionalidades no esenciales del Módulo 1 para liberar esos 50k.", tags: { "risk": "low" }, consequences: { trustChange: 10, supportChange: 5, projectProgressChange: -5, dialogueResponse: "Un recorte doloroso pero responsable. Es el tipo de decisión financiera que esperaba. Continuemos..." } },
          { option_id: "C", cardTitle: "Iniciar Reunion", cardEmoji: "▶️", text: "No acepto ese aumento. Iniciar una renegociación dura con el proveedor. Es un riesgo, podríamos perderlos, pero no cederé.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: -5, dialogueResponse: "Una postura agresiva. Puede funcionar o puede explotarnos en la cara. Valoro la iniciativa, pero ten cuidado..." } },
          { option_id: "D", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Presentaré una solicitud formal de aumento de presupuesto a la Gerencia, con la justificación del alza de precios del proveedor.", tags: { "risk": "medium" }, consequences: { trustChange: -15, supportChange: -10, budgetChange: -50000, dialogueResponse: "Así que la primera desviación y ya pides más dinero. Entendido. Lo evaluaremos. Sigamos..." } }
        ]
      },
  {
        node_id: "K2_E4_RV_MILESTONE_REPORT",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "...Siguiente punto. El hito del 'Módulo de Ingesta de Datos' se cumple esta semana, lo que libera la siguiente partida de fondos. Tus ingenieros dicen que el módulo es 'funcional', pero sé que es inestable y se cae dos veces al día. ¿Cómo lo reportarás oficialmente en el informe de avance?",
        options: [
          { option_id: "A", cardTitle: "Siguiente", cardEmoji: "➡️", text: "Lo reportaré como 'Completo'. Es funcional, como dice el equipo. Optimizaremos la estabilidad en el siguiente ciclo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: 5, projectProgressChange: 5, dialogueResponse: "Entiendo, priorizas el flujo de caja y la percepción. Es una estrategia. Sigamos..." } },
          { option_id: "B", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "El hito no está cumplido si no es estable. Lo reportaré como 'En Progreso', aunque eso retrase los fondos.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: -10, dialogueResponse: "Una postura apegada a la realidad, aunque sea dolorosa financieramente. Lo valoro. Sigamos..." } },
          { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Lo reportaré como 'Completo con Salvedades Técnicas', adjuntando un anexo con los logs de errores y un plan de acción. La transparencia es total.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 0, dialogueResponse: "Una postura apegada a la realidad, aunque sea dolorosa financieramente. Lo valoro. Sigamos..." } },
          { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Te lo comento a ti 'off the record', pero en el informe oficial para la gerencia irá como 'Completo' para no generar alarmas innecesarias.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, supportChange: 10, projectProgressChange: 5, dialogueResponse: "Entiendo, priorizas el flujo de caja y la percepción. Es una estrategia. Sigamos..." } }
        ]
      },
  {
        node_id: "K2_E5_RV_INVOICE_ERROR",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "...Hablando de finanzas. Mi analista encontró algo curioso. Nuestro proveedor de servicios cloud nos facturó 15.000 USD menos el mes pasado, claramente por un error de su sistema. Aún no se han dado cuenta. Legalmente, no estamos obligados a informarles.",
        options: [
          { option_id: "A", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Es un golpe de suerte. Lo consideraremos un ahorro y lo reasignaremos al fondo de contingencia del proyecto.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, budgetChange: 15000, dialogueResponse: "Una decisión puramente financiera. Anotado. Pasemos al último punto..." } },
          { option_id: "B", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Es dinero que no nos corresponde. Debemos contactarlos y pagar la diferencia. Nuestra integridad como empresa vale más que 15k.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 5, dialogueResponse: "Honesto. Cuesta dinero, pero entiendo el principio. Pasemos al último punto..." } },
          { option_id: "C", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "La política de la empresa nos exige verificar y pagar las facturas correctas. Hay que informar del error.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 0, dialogueResponse: "Honesto. Cuesta dinero, pero entiendo el principio. Pasemos al último punto..." } },
          { option_id: "D", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "No hagamos nada por ahora. Si ellos lo descubren y nos contactan, pagaremos. Si no, el ahorro es nuestro.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, budgetChange: 15000, dialogueResponse: "Una decisión puramente financiera. Anotado. Pasemos al último punto..." } }
        ]
      },
  {
        node_id: "K2_R4_RV_RESOURCE_CONFLICT",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "...El último punto es delicado. El equipo de Ventas está a punto de cerrar un contrato de 2 millones USD, pero necesitan a tu mejor analista de datos, a Laura, por dos semanas, a tiempo completo. Si se las cedes, tu proyecto se retrasa tres semanas. Si no, la empresa arriesga perder el contrato. La decisión es tuya.",
        options: [
          { option_id: "A", cardTitle: "Asignar Recursos", cardEmoji: "🧩", text: "Mi proyecto es la prioridad estratégica N°1. No puedo ceder a Laura en esta fase crítica.", tags: { "risk": "high" }, consequences: { trustChange: -20, supportChange: -15, dialogueResponse: "OK." } },
          { option_id: "B", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "El ingreso de ese contrato es más importante. Cederé a Laura y mi equipo absorberá el retraso como pueda.", tags: { "risk": "low" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -5, dialogueResponse: "OK." } },
          { option_id: "C", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Laura puede trabajar para ellos, pero solo medio día. Afectará a ambos, pero ninguno se detendrá por completo.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: -2, dialogueResponse: "OK." } },
          { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "La cederé, pero con una condición: que la Gerencia apruebe formalmente el nuevo cronograma de mi proyecto y ajuste las expectativas de entrega.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 5, projectProgressChange: -5, dialogueResponse: "OK." } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "RV_MEETING_2",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
      initialDialogue: "Hola de nuevo. He estado revisando los informes preliminares. Los planes se ven bien en el papel, pero la realidad siempre trae sorpresas. Quiero saber cómo estás manejando las desviaciones. ¿Qué tienes para mí?",
        nodes: ["K2_R3_RV_COST_OVERRUN", "K2_E4_RV_MILESTONE_REPORT", "K2_E5_RV_INVOICE_ERROR", "K2_R4_RV_RESOURCE_CONFLICT"],
        finalDialogue: "OK. Decisiones difíciles. Esta reunión me ha dado una visión clara de cómo manejas la presión y los imprevistos. Seguiremos en contacto. Puedes retirarte."
      },
];
