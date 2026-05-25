import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K1_R2_DR_SHORTCUT",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "Ok, primer punto. Para cumplir el primer hito en el plazo que nos dieron, podemos tomar un atajo en la arquitectura de la base de datos. Funcionará a corto plazo, pero te garantizo que generará deuda técnica y problemas de escalabilidad en un año. La alternativa es hacerlo bien, pero nos retrasaremos dos semanas.",
        options: [
          { option_id: "A", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "Inaceptable. La calidad no es negociable. Hazlo bien, yo asumiré la responsabilidad de comunicar el retraso.", tags: { "risk": "low" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -5, bridgeResponse: "Buena decisión. Mi equipo lo apreciará. Es un alivio saber que priorizas la calidad técnica. Yo me encargo..." } },
          { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Necesitamos una victoria temprana. Toma el atajo. Nos preocuparemos de la deuda técnica más adelante.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: 5, bridgeResponse: "Entendido, CTO. Documentaré el riesgo técnico y la decisión. Es tu prerrogativa. Continuemos..." } },
          { option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Busca un equilibrio. ¿Hay un atajo menos severo que solo nos retrase una semana? Exploremos un punto medio.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: 0, bridgeResponse: "Ok, un compromiso. Lo analizaré con el equipo para ver qué es factible sin comprometer demasiado la integridad del sistema..." } },
          { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Pon más gente en el problema. Trae a dos ingenieros de otro equipo para ayudar a acelerar sin tomar el atajo.", tags: { "risk": "medium" }, consequences: { trustChange: -5, projectProgressChange: 2, budgetChange: -10000, bridgeResponse: "Más gente no siempre significa más rápido, pero coordinaré con ellos. Puede impactar otros sprints. Sigamos..." } }
        ]
      },
  {
        node_id: "K1_E1_DR_BURNOUT",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "...Justamente sobre el cronograma. Para cumplirlo, incluso haciéndolo bien, el equipo tendrá que trabajar los fines de semana durante el próximo mes. Vienen agotados del proyecto anterior y la moral no es la mejor. ¿Cómo manejamos esto?",
        options: [
          {
            option_id: "A", cardTitle: "Asignar Recursos", cardEmoji: "🧩", text: "El plazo es el plazo. Son profesionales y se espera un esfuerzo extra en proyectos de alta prioridad. Tienen que cumplir.", tags: { "ethics_kohlberg": "pre-conventional" },
            consequences: { trustChange: -15, supportChange: -15, bridgeResponse: "Entendido. Se los comunicaré, pero no esperes que estén contentos. El riesgo de burnout es alto..." }
          },
          {
            option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Compensaremos todas las horas extra según lo estipula la política de la empresa y la ley. Es lo que corresponde.", tags: { "ethics_kohlberg": "conventional" },
            consequences: { trustChange: 5, supportChange: 5, bridgeResponse: "Ok, es el mínimo que podemos hacer. Se los informaré..." }
          },
          {
            option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Esto es inaceptable. La salud del equipo es la prioridad. Mi trabajo es protegerlos. Renegociaré el plazo con la gerencia, no vamos a explotar a la gente.", tags: { "ethics_kohlberg": "post-conventional" },
            consequences: { trustChange: 20, supportChange: 15, reputationChange: 5, bridgeResponse: "Gracias. Significa mucho que nos respaldes así. El equipo lo valorará enormemente..." }
          },
          {
            option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Les prometeré un bono sustancial si cumplimos el plazo. Un incentivo fuerte puede levantar la moral y el esfuerzo.", tags: { "ethics_kohlberg": "pre-conventional" },
            consequences: { trustChange: -5, supportChange: 5, bridgeResponse: "Una promesa... puede funcionar a corto plazo. Espero que Finanzas lo respalde cuando llegue el momento. Sigamos..." }
          }
        ]
      },
  {
        node_id: "K1_R3_DR_AUTONOMY",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
        dialogue: "...Último punto. La metodología. Mi equipo es senior y funciona mejor con un enfoque Ágil, con alta autonomía. Es más rápido pero menos predecible para los de afuera. La alternativa es seguir la metodología 'Innovatec Standard' que usa Mónica. Es más rígida, pero da más visibilidad a la gerencia.",
        options: [
          { option_id: "A", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Confío 100% en ti y tu equipo. Usen el método que consideren mejor para la excelencia técnica. Solo quiero ver los resultados.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, bridgeResponse: "" } },
          { option_id: "B", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "No. Usaremos el estándar de Innovatec. En mi primer proyecto necesito control y predictibilidad total. Sin excepciones.", tags: { "risk": "low" }, consequences: { trustChange: -15, supportChange: -15, bridgeResponse: "" } },
          { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Propongo un híbrido. Usen Ágil para el desarrollo, pero deben entregarme un reporte semanal estructurado con métricas fijas para yo reportar hacia arriba.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, bridgeResponse: "" } },
          { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Quiero que me presentes un plan de sprints de dos semanas para mi aprobación. Tienen autonomía dentro de cada sprint, pero yo defino las prioridades.", tags: { "risk": "medium" }, consequences: { trustChange: 0, supportChange: 5, bridgeResponse: "" } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "DR_MEETING_1",
        stakeholderRole: "Lead Engineer",

        stakeholderId: "david-reyes",
      initialDialogue: "Hola, {playerName}. Bienvenido a Innovatec. Soy David Reyes. He revisado la directiva del 'Proyecto Quantum Leap'. Es... ambicioso. Mi equipo y yo estamos listos para el desafío técnico, pero primero quiero entender tu visión de cómo trabajaremos. ¿Por dónde empezamos?",
        nodes: ["K1_R2_DR_SHORTCUT", "K1_E1_DR_BURNOUT", "K1_R3_DR_AUTONOMY"],
        finalDialogue: "De acuerdo. Esto me da una dirección clara sobre cómo quieres que operemos. Ha sido una buena primera conversación. Mi equipo y yo nos pondremos a trabajar en esto. Estamos en contacto."
      },
];
