import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K2_R4_CS_EXPECTATION_MGMT",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "Precisamente sobre la comunicación interna. La gente está nerviosa. ¿Cuál es nuestra estrategia? ¿Duplicamos la apuesta y hablamos de la 'revolución' que viene para generar entusiasmo, o bajamos el perfil y hablamos de 'optimización' para calmar los miedos?",
        options: [
          { option_id: "A", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Vamos con 'revolución'. Necesitamos generar energía y mostrar confianza. Los que se asusten, se adaptarán.", tags: { "risk": "high" }, consequences: { reputationChange: 10, trustChange: 5, supportChange: 5, dialogueResponse: "Audaz. Me gusta la energía. Una estrategia de alto impacto. De acuerdo, pasemos al siguiente punto..." } },
          { option_id: "B", cardTitle: "Gestionar Comunicacion", cardEmoji: "📣", text: "Usemos 'optimización' y 'mejora continua'. Un mensaje seguro que no alarme a nadie y nos dé un perfil bajo.", tags: { "risk": "low" }, consequences: { trustChange: -5, supportChange: -10, dialogueResponse: "Un enfoque seguro, clásico. No genera olas. Entendido. Pasemos al siguiente punto..." } },
          { option_id: "C", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "Segmentemos el mensaje. Uno inspirador para la gerencia y otro de seguridad y apoyo para los equipos de base.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Sofisticado. Un mensaje a medida para cada audiencia. Requiere delicadeza, pero puede funcionar. De acuerdo, siguiente punto..." } },
          { option_id: "D", cardTitle: "Gestionar Comunicacion", cardEmoji: "📣", text: "Ignoremos la comunicación interna por ahora. Enfoquemos toda nuestra energía en el hype externo y los clientes.", tags: { "risk": "high" }, consequences: { reputationChange: 5, trustChange: -15, supportChange: -5, dialogueResponse: "Audaz. Me gusta la energía. Una estrategia de alto impacto. De acuerdo, pasemos al siguiente punto..." } }
        ]
      },
  {
        node_id: "K2_E2_CS_NEGATIVE_FEEDBACK",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Hablando de percepciones. Mi equipo hizo un focus group con unos mockups de la interfaz. Para serte honesta, la reacción fue terrible. La gente la encontró 'confusa' e 'intimidante'. ¿Cómo presentamos esto en el informe de avance al comité directivo?",
        options: [
          { option_id: "A", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Omitimos ese feedback. Es demasiado temprano y solo generará dudas. Nos enfocamos en los aspectos positivos.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -5, reputationChange: -5, dialogueResponse: "Entendido, control de daños. A veces hay que maquillar la verdad para proteger el proyecto. Sigamos..." } },
          { option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Presentamos todos los resultados, textuales y sin filtro, tal como lo exige la política de reportes de la empresa.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 5, supportChange: -10, reputationChange: -10, dialogueResponse: "Transparencia total. Es un enfoque valiente, espero que no nos disparemos en el pie. Sigamos..." } },
          { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Lo presentamos como un hallazgo valioso que nos permite mejorar. Seremos transparentes con la crítica y mostraremos un plan de acción inmediato para solucionarlo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 5, reputationChange: 5, dialogueResponse: "Transparencia total. Es un enfoque valiente, espero que no nos disparemos en el pie. Sigamos..." } },
          { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Resaltamos los pocos comentarios positivos en el cuerpo del informe y enterramos los datos negativos en un anexo técnico.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, reputationChange: -10, dialogueResponse: "Entendido, control de daños. A veces hay que maquillar la verdad para proteger el proyecto. Sigamos..." } }
        ]
      },
  {
        node_id: "K2_R5_CS_BUDGET_OPPORTUNITY",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Ahora, una oportunidad increíble. La 'Tech Summit Latam' nos ofreció un stand de patrocinador de último minuto. Es la conferencia más grande del país. ¡Visibilidad masiva! Cuesta 30k USD. Mi presupuesto de marketing no lo cubre. ¿Puedes sacarlo del tuyo?",
        options: [
          { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Imposible. El presupuesto del proyecto es intocable y está auditado. No puedo justificar ese gasto.", tags: { "risk": "low" }, consequences: { trustChange: -10, supportChange: -15, dialogueResponse: "Una lástima. Una oportunidad perdida por rigidez presupuestaria. En fin, último tema..." } },
          { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Hecho. La visibilidad que nos dará vale cada centavo. Haré una reasignación interna. Considera esos 30k tuyos.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, budgetChange: -30000, dialogueResponse: "¡Sabía que verías la oportunidad! Eres un visionario. Gracias, no te arrepentirás. Último tema..." } },
          { option_id: "C", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "No puedo darte los 30k, pero puedo contribuir con 10k desde mi fondo de contingencia si ustedes consiguen el resto.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, budgetChange: -10000, dialogueResponse: "Un enfoque colaborativo. Me parece justo. Lo exploraremos. Último tema..." } },
          { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Preparo un caso de negocio y se lo presentamos juntos a Ricardo (CFO). Si él lo aprueba como un gasto extraordinario, tienes mi apoyo.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 10, dialogueResponse: "Un enfoque colaborativo. Me parece justo. Lo exploraremos. Último tema..." } }
        ]
      },
  {
        node_id: "K2_E3_CS_LEAK",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Ok, esto es delicado. Un diseñador junior de mi equipo, muy entusiasta, filtró en un foro público un concepto de una función que aún no está aprobada. Violó su acuerdo de confidencialidad. ¿Cómo procedemos?",
        options: [
          { option_id: "A", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Debe ser despedido. La política de la empresa sobre filtraciones es de tolerancia cero.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: -10, reputationChange: 5, dialogueResponse: "Ok, entiendo tu postura." } },
          { option_id: "B", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Fue un error de novato, sin mala intención. Hay que hablar con él, emitir una advertencia formal y usarlo como caso de estudio para el resto del equipo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 5, reputationChange: -5, dialogueResponse: "Ok, entiendo tu postura." } },
          { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Digámosle que borre el post y hagamos como si nada. No necesitamos un escándalo de RRHH. Un susto será suficiente castigo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, reputationChange: -10, dialogueResponse: "Ok, entiendo tu postura." } },
          { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "La imagen es lo primero. Dependiendo de la reacción online, o lo despedimos para mostrar mano dura, o lo ignoramos si a nadie le importa.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, reputationChange: -15, dialogueResponse: "Ok, entiendo tu postura." } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
          sequence_id: "CS_MEETING_2",
          stakeholderRole: "Chief Marketing Officer (CMO)",

          stakeholderId: "carolina-soto",
      initialDialogue: "Hola. Qué bueno verte. El proyecto ya está en boca de todos, para bien o para mal. Algunos están emocionados, otros están aterrorizados de que un robot les quite el trabajo. Necesitamos gestionar la narrativa de forma proactiva. ¿Qué tienes en mente?",
          nodes: ["K2_R4_CS_EXPECTATION_MGMT", "K2_E2_CS_NEGATIVE_FEEDBACK", "K2_R5_CS_BUDGET_OPPORTUNITY", "K2_E3_CS_LEAK"],
          finalDialogue: "Ok, entiendo tu postura. La gestión de crisis define a un líder. Tenemos mucho en qué pensar. Gracias por tu tiempo."
      },
];
