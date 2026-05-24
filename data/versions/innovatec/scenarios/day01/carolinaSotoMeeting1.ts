import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: "K1_E1_CS_ANNOUNCEMENT",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "Mi primera idea: deberíamos lanzar un comunicado de prensa esta misma semana. Un gran titular sobre 'Innovatec lidera la revolución de la IA' nos daría un impulso de imagen increíble, aunque la tecnología aún no esté ni cerca de ser funcional.",
        options: [
          { option_id: "A", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Totalmente. Hay que aprovechar el momentum. Un buen titular ahora nos compra tiempo y apoyo interno.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { reputationChange: 15, trustChange: 10, dialogueResponse: "¡Perfecto! Sabía que entenderías la urgencia. Me encanta la agilidad. Dejemos que mi equipo prepare un borrador..." } },
          { option_id: "B", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "No podemos anunciar algo que no es real. La política de comunicación de la empresa prohíbe las declaraciones especulativas.", tags: { "ethics_kohlberg": "conventional" }, consequences: { reputationChange: 5, trustChange: -10, supportChange: -10, dialogueResponse: "Mmm, ok. Apegado a las reglas. Un poco burocrático para mi gusto, pero lo respeto. Sigamos..." } },
          { option_id: "C", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "Entiendo tu entusiasmo, pero prometer de más ahora podría dañar la confianza de nuestros clientes a largo plazo si no cumplimos. Es un riesgo que no deberíamos tomar.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Entiendo, piensas a largo plazo. Un enfoque seguro. Quizás demasiado seguro. Pero bueno, continuemos..." } },
          { option_id: "D", cardTitle: "Gestionar Comunicacion", cardEmoji: "📣", text: "Hagamos un anuncio, pero usando un lenguaje vago y enfocado en la 'visión futura'. Así no mentimos directamente, pero generamos expectación.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { reputationChange: 5, trustChange: 0, dialogueResponse: "¡Perfecto! Sabía que entenderías la urgencia. Me encanta la agilidad. Dejemos que mi equipo prepare un borrador..." } }
        ]
      },
  {
        node_id: "K1_R2_CS_CUSTOMER_DATA",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Ok, siguiente idea. Para que la plataforma sea un éxito de marketing, necesitamos datos. Quiero integrar los perfiles de redes sociales de nuestros clientes con sus datos de compra. Las correlaciones que podríamos encontrar serían una mina de oro para mis campañas.",
        options: [
          { option_id: "A", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Técnicamente es muy complejo y la ley de protección de datos lo hace demasiado riesgoso. Descartémoslo por ahora.", tags: { "risk": "low" }, consequences: { trustChange: -5, supportChange: -10, dialogueResponse: "Siempre posponiendo... Entiendo la cautela, pero la oportunidad se nos puede escapar de las manos. Sigamos..." } },
          { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Es una idea poderosa. La agrego al alcance del proyecto. Asumiremos el desafío técnico y legal.", tags: { "risk": "high" }, consequences: { trustChange: 10, supportChange: 15, projectProgressChange: 5, dialogueResponse: "¡Excelente! Visión de futuro. Sabía que verías el potencial. Mi equipo estará feliz de colaborar en eso. Próximo tema..." } },
          { option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Propongo un piloto muy pequeño y controlado con un grupo de clientes que nos den su consentimiento explícito para un estudio. Así medimos el valor sin exponernos.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "Un piloto... es mejor que nada, supongo. Es un enfoque metódico. Acepto. Próximo tema..." } },
          { option_id: "D", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "Enfoquémonos primero en tener la plataforma base funcionando. Podemos añadir la integración de redes sociales en la 'Fase 2' del proyecto.", tags: { "risk": "low" }, consequences: { trustChange: 0, supportChange: -5, dialogueResponse: "Siempre posponiendo... Entiendo la cautela, pero la oportunidad se nos puede escapar de las manos. Sigamos..." } }
        ]
      },
  {
        node_id: "K1_E2_CS_BRANDING",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Ahora, el branding interno. Para asegurar el apoyo de todos, propongo que en todas las comunicaciones internas presentemos esto como una 'Iniciativa Conjunta de Marketing y Tecnología'. Le da más peso y asegura que mi equipo se sienta parte.",
        options: [
          { option_id: "A", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Por supuesto. Si eso ayuda a conseguir apoyo, me parece perfecto. El nombre es lo de menos.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: 10, supportChange: 10, dialogueResponse: "Genial, me alegra que estemos en la misma página en esto. Es importante para la colaboración..." } },
          { option_id: "B", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "El proyecto fue asignado formalmente al área de Tecnología. Debemos ser precisos y mantener esa definición para evitar confusiones de roles.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: -10, supportChange: -15, dialogueResponse: "Entiendo, te apegas a lo formal. Un poco rígido, pero claro. Sigamos..." } },
          { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Para ser justos con todos los departamentos que se verán impactados, deberíamos llamarlo una 'Iniciativa de Transformación de Innovatec', liderada por Tecnología.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 5, supportChange: 0, dialogueResponse: "Mmm, una jugada política interesante, muy inclusiva. Me gusta cómo suena. Podemos trabajar con eso..." } },
          { option_id: "D", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Estoy de acuerdo con el 'branding', pero el presupuesto y los recursos seguirán siendo gestionados 100% por mi área, que quede claro.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -5, supportChange: 5, dialogueResponse: "Genial, me alegra que estemos en la misma página en esto. Es importante para la colaboración..." } }
        ]
      },
  {
        node_id: "K1_R3_CS_RESOURCE",
        stakeholderRole: "Chief Marketing Officer (CMO)",

        stakeholderId: "carolina-soto",
        dialogue: "...Y por último, un tema práctico. Mi equipo necesita lanzar una campaña en dos semanas y nuestro analista de datos renunció. Necesito a tu especialista en visualización, a Ana, solo por una semana. Es crucial para nosotros. Sé que retrasa tu cronograma, pero es una emergencia.",
        options: [
          { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Imposible. Ana es crítica para nuestro primer sprint. No puedo cederla.", tags: { "risk": "low" }, consequences: { trustChange: -15, supportChange: -20, dialogueResponse: "Ok, me queda claro." } },
          { option_id: "B", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Por supuesto. Una semana no es tanto. Somos un solo equipo. Ana estará con ustedes desde mañana.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 15, projectProgressChange: -3, dialogueResponse: "Ok, me queda claro." } },
          { option_id: "C", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Puede ayudarlos, pero solo medio tiempo cada día. Es lo máximo que puedo ofrecer sin descarrilar mi propio proyecto.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, projectProgressChange: -1, dialogueResponse: "Ok, me queda claro." } },
          { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "La cederé, pero necesito que esto se formalice y que Ricardo (CFO) apruebe una extensión de una semana en mi plazo de entrega.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 10, dialogueResponse: "Ok, me queda claro." } }
        ]
      },
];

export const sequences: MeetingSequence[] = [
  {
          sequence_id: "CS_MEETING_1",
          stakeholderRole: "Chief Marketing Officer (CMO)",

          stakeholderId: "carolina-soto",
      initialDialogue: "¡Hola! Qué bueno que nos juntamos. He oído maravillas del 'Proyecto Quantum Leap' y mi equipo y yo estamos ansiosos por empezar a comunicar esto. El potencial para la marca es enorme. Cuéntame, ¿cómo podemos ayudar a 'vender' este proyecto y generar un gran impacto desde ya?",
          nodes: ["K1_E1_CS_ANNOUNCEMENT", "K1_R2_CS_CUSTOMER_DATA", "K1_E2_CS_BRANDING", "K1_R3_CS_RESOURCE"],
          finalDialogue: "Ok, me queda claro. Ha sido una reunión muy productiva, me da una buena idea de cómo podremos (o no podremos) trabajar juntos. Estamos en contacto."
      },
];
