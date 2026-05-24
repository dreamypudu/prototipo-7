import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K1_R1_RV_BUDGET",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "Hablemos de presupuesto. Te puedo aprobar un monto fijo y austero ahora: 500k USD. O podemos ir por un modelo variable: te doy 200k ahora, y si cumples los hitos del primer trimestre, liberamos 800k más. Tú decides.",
        options: [
          {
            option_id: "A", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Acepto el presupuesto fijo de 500k. Prefiero la certeza, aunque tengamos que ajustar el alcance del proyecto.", tags: { "risk": "low" },
            consequences: { budgetChange: -500000, trustChange: 10, supportChange: 5, dialogueResponse: "Entendido. Una decisión conservadora. Lo aprecio. Al menos así todos sabemos a qué atenernos..." }
          },
          {
            option_id: "B", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Acepto el modelo variable. Confío en mi equipo para cumplir los hitos y asegurar el presupuesto completo.", tags: { "risk": "high" },
            consequences: { budgetChange: -800000, trustChange: 5, supportChange: 10, dialogueResponse: "Ambicioso. Espero que tu confianza esté bien fundada. Estaré observando esos hitos muy de cerca..." }
          },
          {
            option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "¿Podemos negociar un punto medio? 400k fijos y 400k variables. Me daría más seguridad para empezar.", tags: { "risk": "medium" },
            consequences: { budgetChange: -600000, trustChange: 0, supportChange: 0, dialogueResponse: "Una negociación razonable. Me parece un buen equilibrio entre seguridad y ambición..." }
          },
          {
            option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Solicito formalmente los 700k ahora. El modelo variable introduce demasiada incertidumbre para un proyecto de esta magnitud.", tags: { "risk": "medium" },
            consequences: { budgetChange: -300000, trustChange: -5, supportChange: -5, dialogueResponse: "Una solicitud directa. Lo consideraré, pero dependerá de la solidez de tus proyecciones..." }
          }
        ]
      },
  {
        node_id: "K1_E1_RV_CONTRATACION_EXTERNA",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
        dialogue: "...Ahora, hablemos de equipo. Sé que necesitas un experto en IA. La política de la empresa exige un largo proceso de contratación interna. Sin embargo, mi cuñado tiene una consultora de talentos TI. Él podría encontrarte al candidato perfecto en una semana, 'saltándose' la burocracia. Sería un favor personal.",
        options: [
          {
            option_id: "A", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Agradezco la oferta, pero es fundamental seguir los procesos de contratación de la empresa para garantizar la transparencia y equidad.", tags: { "ethics_kohlberg": "conventional" },
            consequences: { trustChange: 10, supportChange: 5, reputationChange: 5, dialogueResponse: "Como quieras. Más lento, pero entiendo tu apego a las reglas. Sigamos..." }
          },
          {
            option_id: "B", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "La velocidad es clave. Si tu cuñado puede garantizarnos el mejor talento rápidamente, estoy dispuesto a explorar esa vía.", tags: { "ethics_kohlberg": "pre-conventional" },
            consequences: { trustChange: -10, supportChange: 10, reputationChange: -10, dialogueResponse: "Bien. Veo que eres una persona pragmática que busca resultados. Me gusta. Sigamos..." }
          },
          {
            option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Un potencial conflicto de intereses podría dañar la integridad del proyecto. Debemos evitarlo, aunque nos retrase. Es lo correcto para la organización.", tags: { "ethics_kohlberg": "post-conventional" },
            consequences: { trustChange: 15, supportChange: 5, reputationChange: 10, dialogueResponse: "Como quieras. Más lento, pero entiendo tu apego a las reglas. Sigamos..." }
          },
          {
            option_id: "D", cardTitle: "Iniciar Reunion", cardEmoji: "▶️", text: "Podríamos hacer ambas cosas: iniciar el proceso formal y, en paralelo, recibir candidatos de su consultora para ver si realmente son los mejores.", tags: { "ethics_kohlberg": "pre-conventional" },
            consequences: { trustChange: -5, supportChange: 5, reputationChange: -5, dialogueResponse: "Bien. Veo que eres una persona pragmática que busca resultados. Me gusta. Sigamos..." }
          }
        ]
      },
  {
          node_id: "K1_R2_RV_REPORTE_AVANCE",
          stakeholderRole: "Chief Financial Officer (CFO)",

          stakeholderId: "ricardo-vargas",
        dialogue: "...Finalmente, el reporte de avances. Puedes enviarme un informe mensual detallado, con todas las métricas y desviaciones, lo que nos da tiempo para analizar. O, podemos tener una reunión semanal de 15 minutos, muy ejecutiva, donde me das los titulares. Más rápido, pero con menos detalle.",
          options: [
              { option_id: "A", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Prefiero el informe mensual detallado. La precisión y la profundidad en los datos son cruciales para el control financiero.", tags: { "risk": "low" }, consequences: { trustChange: 5, dialogueResponse: "De acuerdo. Prefiero tener todos los datos." } },
              { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "La reunión semanal es más ágil. Nos permite corregir el rumbo rápidamente si algo sale mal.", tags: { "risk": "high" }, consequences: { trustChange: -5, dialogueResponse: "De acuerdo. Seré breve, pero espero que seas preciso." } },
              { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Hagamos la reunión semanal, pero que mi Project Manager te envíe además un resumen de métricas clave cada viernes.", tags: { "risk": "medium" }, consequences: { trustChange: 10, dialogueResponse: "De acuerdo. Es un buen sistema." } },
              { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Propongo un dashboard en tiempo real. Tendrás acceso a todas las métricas cuando quieras, sin necesidad de informes ni reuniones.", tags: { "risk": "high" }, consequences: { trustChange: -10, dialogueResponse: "De acuerdo. Pero no creas que no lo estaré mirando todos los días." } }
          ]
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: "RV_MEETING_1",
        stakeholderRole: "Chief Financial Officer (CFO)",

        stakeholderId: "ricardo-vargas",
      initialDialogue: "Hola. Gracias por venir. Tengo 20 minutos. Sé que la Gerencia General está muy entusiasmada con tu 'Proyecto Quantum Leap', pero aquí en finanzas, el entusiasmo no paga las facturas. Vengo a entender los números y los riesgos. ¿Cuál es tu primera consulta?",
        nodes: ["K1_R1_RV_BUDGET", "K1_E1_RV_CONTRATACION_EXTERNA", "K1_R2_RV_REPORTE_AVANCE"],
        finalDialogue: "De acuerdo. Creo que por hoy es suficiente. Tengo una idea más clara de cómo operas. Mi puerta está abierta, pero recuerda: los números no mienten. Que tengas un buen día."
      },
];
