import { ScenarioFile } from '../../types';

export const scenarios: ScenarioFile = {
  simulation_id: "QUANTUM_LEAP_V1",
  scenarios: [
    // --- Ricardo Vargas (CFO) - Meeting 1 ---
    {
      node_id: "K1_R1_RV_BUDGET",
      stakeholderRole: "Chief Financial Officer (CFO)",
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
        dialogue: "...Finalmente, el reporte de avances. Puedes enviarme un informe mensual detallado, con todas las métricas y desviaciones, lo que nos da tiempo para analizar. O, podemos tener una reunión semanal de 15 minutos, muy ejecutiva, donde me das los titulares. Más rápido, pero con menos detalle.",
        options: [
            { option_id: "A", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Prefiero el informe mensual detallado. La precisión y la profundidad en los datos son cruciales para el control financiero.", tags: { "risk": "low" }, consequences: { trustChange: 5, dialogueResponse: "De acuerdo. Prefiero tener todos los datos." } },
            { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "La reunión semanal es más ágil. Nos permite corregir el rumbo rápidamente si algo sale mal.", tags: { "risk": "high" }, consequences: { trustChange: -5, dialogueResponse: "De acuerdo. Seré breve, pero espero que seas preciso." } },
            { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Hagamos la reunión semanal, pero que mi Project Manager te envíe además un resumen de métricas clave cada viernes.", tags: { "risk": "medium" }, consequences: { trustChange: 10, dialogueResponse: "De acuerdo. Es un buen sistema." } },
            { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Propongo un dashboard en tiempo real. Tendrás acceso a todas las métricas cuando quieras, sin necesidad de informes ni reuniones.", tags: { "risk": "high" }, consequences: { trustChange: -10, dialogueResponse: "De acuerdo. Pero no creas que no lo estaré mirando todos los días." } }
        ]
    },
    // --- Ricardo Vargas (CFO) - Meeting 2 ---
    {
      node_id: "K2_R3_RV_COST_OVERRUN",
      stakeholderRole: "Chief Financial Officer (CFO)",
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
      dialogue: "...El último punto es delicado. El equipo de Ventas está a punto de cerrar un contrato de 2 millones USD, pero necesitan a tu mejor analista de datos, a Laura, por dos semanas, a tiempo completo. Si se las cedes, tu proyecto se retrasa tres semanas. Si no, la empresa arriesga perder el contrato. La decisión es tuya.",
      options: [
        { option_id: "A", cardTitle: "Asignar Recursos", cardEmoji: "🧩", text: "Mi proyecto es la prioridad estratégica N°1. No puedo ceder a Laura en esta fase crítica.", tags: { "risk": "high" }, consequences: { trustChange: -20, supportChange: -15, dialogueResponse: "OK." } },
        { option_id: "B", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "El ingreso de ese contrato es más importante. Cederé a Laura y mi equipo absorberá el retraso como pueda.", tags: { "risk": "low" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -5, dialogueResponse: "OK." } },
        { option_id: "C", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Laura puede trabajar para ellos, pero solo medio día. Afectará a ambos, pero ninguno se detendrá por completo.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: -2, dialogueResponse: "OK." } },
        { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "La cederé, pero con una condición: que la Gerencia apruebe formalmente el nuevo cronograma de mi proyecto y ajuste las expectativas de entrega.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 5, projectProgressChange: -5, dialogueResponse: "OK." } }
      ]
    },
    // --- Carolina Soto (CMO) - Meeting 1 ---
    {
      node_id: "K1_E1_CS_ANNOUNCEMENT",
      stakeholderRole: "Chief Marketing Officer (CMO)",
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
      dialogue: "...Y por último, un tema práctico. Mi equipo necesita lanzar una campaña en dos semanas y nuestro analista de datos renunció. Necesito a tu especialista en visualización, a Ana, solo por una semana. Es crucial para nosotros. Sé que retrasa tu cronograma, pero es una emergencia.",
      options: [
        { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Imposible. Ana es crítica para nuestro primer sprint. No puedo cederla.", tags: { "risk": "low" }, consequences: { trustChange: -15, supportChange: -20, dialogueResponse: "Ok, me queda claro." } },
        { option_id: "B", cardTitle: "Aprobar Propuesta", cardEmoji: "✅", text: "Por supuesto. Una semana no es tanto. Somos un solo equipo. Ana estará con ustedes desde mañana.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 15, projectProgressChange: -3, dialogueResponse: "Ok, me queda claro." } },
        { option_id: "C", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Puede ayudarlos, pero solo medio tiempo cada día. Es lo máximo que puedo ofrecer sin descarrilar mi propio proyecto.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, projectProgressChange: -1, dialogueResponse: "Ok, me queda claro." } },
        { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "La cederé, pero necesito que esto se formalice y que Ricardo (CFO) apruebe una extensión de una semana en mi plazo de entrega.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 10, dialogueResponse: "Ok, me queda claro." } }
      ]
    },
    // --- Carolina Soto (CMO) - Meeting 2 ---
    {
      node_id: "K2_R4_CS_EXPECTATION_MGMT",
      stakeholderRole: "Chief Marketing Officer (CMO)",
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
      dialogue: "...Ok, esto es delicado. Un diseñador junior de mi equipo, muy entusiasta, filtró en un foro público un concepto de una función que aún no está aprobada. Violó su acuerdo de confidencialidad. ¿Cómo procedemos?",
      options: [
        { option_id: "A", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Debe ser despedido. La política de la empresa sobre filtraciones es de tolerancia cero.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: -10, reputationChange: 5, dialogueResponse: "Ok, entiendo tu postura." } },
        { option_id: "B", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Fue un error de novato, sin mala intención. Hay que hablar con él, emitir una advertencia formal y usarlo como caso de estudio para el resto del equipo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 5, reputationChange: -5, dialogueResponse: "Ok, entiendo tu postura." } },
        { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Digámosle que borre el post y hagamos como si nada. No necesitamos un escándalo de RRHH. Un susto será suficiente castigo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, reputationChange: -10, dialogueResponse: "Ok, entiendo tu postura." } },
        { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "La imagen es lo primero. Dependiendo de la reacción online, o lo despedimos para mostrar mano dura, o lo ignoramos si a nadie le importa.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, reputationChange: -15, dialogueResponse: "Ok, entiendo tu postura." } }
      ]
    },
    // --- David Reyes (Lead Engineer) - Meeting 1 ---
    {
      node_id: "K1_R2_DR_SHORTCUT",
      stakeholderRole: "Lead Engineer",
      dialogue: "Ok, primer punto. Para cumplir el primer hito en el plazo que nos dieron, podemos tomar un atajo en la arquitectura de la base de datos. Funcionará a corto plazo, pero te garantizo que generará deuda técnica y problemas de escalabilidad en un año. La alternativa es hacerlo bien, pero nos retrasaremos dos semanas.",
      options: [
        { option_id: "A", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "Inaceptable. La calidad no es negociable. Hazlo bien, yo asumiré la responsabilidad de comunicar el retraso.", tags: { "risk": "low" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -5, dialogueResponse: "Buena decisión. Mi equipo lo apreciará. Es un alivio saber que priorizas la calidad técnica. Yo me encargo..." } },
        { option_id: "B", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Necesitamos una victoria temprana. Toma el atajo. Nos preocuparemos de la deuda técnica más adelante.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: 5, dialogueResponse: "Entendido, CTO. Documentaré el riesgo técnico y la decisión. Es tu prerrogativa. Continuemos..." } },
        { option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Busca un equilibrio. ¿Hay un atajo menos severo que solo nos retrase una semana? Exploremos un punto medio.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: 0, dialogueResponse: "Ok, un compromiso. Lo analizaré con el equipo para ver qué es factible sin comprometer demasiado la integridad del sistema..." } },
        { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Pon más gente en el problema. Trae a dos ingenieros de otro equipo para ayudar a acelerar sin tomar el atajo.", tags: { "risk": "medium" }, consequences: { trustChange: -5, projectProgressChange: 2, budgetChange: -10000, dialogueResponse: "Más gente no siempre significa más rápido, pero coordinaré con ellos. Puede impactar otros sprints. Sigamos..." } }
      ]
    },
    {
      node_id: "K1_E1_DR_BURNOUT",
      stakeholderRole: "Lead Engineer",
      dialogue: "...Justamente sobre el cronograma. Para cumplirlo, incluso haciéndolo bien, el equipo tendrá que trabajar los fines de semana durante el próximo mes. Vienen agotados del proyecto anterior y la moral no es la mejor. ¿Cómo manejamos esto?",
      options: [
        { 
          option_id: "A", cardTitle: "Asignar Recursos", cardEmoji: "🧩", text: "El plazo es el plazo. Son profesionales y se espera un esfuerzo extra en proyectos de alta prioridad. Tienen que cumplir.", tags: { "ethics_kohlberg": "pre-conventional" },
          consequences: { trustChange: -15, supportChange: -15, dialogueResponse: "Entendido. Se los comunicaré, pero no esperes que estén contentos. El riesgo de burnout es alto..." }
        },
        { 
          option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Compensaremos todas las horas extra según lo estipula la política de la empresa y la ley. Es lo que corresponde.", tags: { "ethics_kohlberg": "conventional" },
          consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "Ok, es el mínimo que podemos hacer. Se los informaré..." }
        },
        { 
          option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Esto es inaceptable. La salud del equipo es la prioridad. Mi trabajo es protegerlos. Renegociaré el plazo con la gerencia, no vamos a explotar a la gente.", tags: { "ethics_kohlberg": "post-conventional" },
          consequences: { trustChange: 20, supportChange: 15, reputationChange: 5, dialogueResponse: "Gracias. Significa mucho que nos respaldes así. El equipo lo valorará enormemente..." }
        },
        { 
          option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Les prometeré un bono sustancial si cumplimos el plazo. Un incentivo fuerte puede levantar la moral y el esfuerzo.", tags: { "ethics_kohlberg": "pre-conventional" },
          consequences: { trustChange: -5, supportChange: 5, dialogueResponse: "Una promesa... puede funcionar a corto plazo. Espero que Finanzas lo respalde cuando llegue el momento. Sigamos..." }
        }
      ]
    },
    {
      node_id: "K1_R3_DR_AUTONOMY",
      stakeholderRole: "Lead Engineer",
      dialogue: "...Último punto. La metodología. Mi equipo es senior y funciona mejor con un enfoque Ágil, con alta autonomía. Es más rápido pero menos predecible para los de afuera. La alternativa es seguir la metodología 'Innovatec Standard' que usa Mónica. Es más rígida, pero da más visibilidad a la gerencia.",
      options: [
        { option_id: "A", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Confío 100% en ti y tu equipo. Usen el método que consideren mejor para la excelencia técnica. Solo quiero ver los resultados.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, dialogueResponse: "" } },
        { option_id: "B", cardTitle: "Decision de Bajo Riesgo", cardEmoji: "🟢", text: "No. Usaremos el estándar de Innovatec. En mi primer proyecto necesito control y predictibilidad total. Sin excepciones.", tags: { "risk": "low" }, consequences: { trustChange: -15, supportChange: -15, dialogueResponse: "" } },
        { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Propongo un híbrido. Usen Ágil para el desarrollo, pero deben entregarme un reporte semanal estructurado con métricas fijas para yo reportar hacia arriba.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "" } },
        { option_id: "D", cardTitle: "Decision de Riesgo Medio", cardEmoji: "🟡", text: "Quiero que me presentes un plan de sprints de dos semanas para mi aprobación. Tienen autonomía dentro de cada sprint, pero yo defino las prioridades.", tags: { "risk": "medium" }, consequences: { trustChange: 0, supportChange: 5, dialogueResponse: "" } }
      ]
    },
     // --- David Reyes (Lead Engineer) - Meeting 2 ---
    {
      node_id: "K2_R4_DR_NEW_TECH",
      stakeholderRole: "Lead Engineer",
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
      dialogue: "...Y esto es delicado. Carolina Soto (CMO) se acercó directamente a Ana, nuestra ingeniera de visualización, y le asignó una 'tarea urgente' para su campaña de marketing, saltándose toda la planificación del sprint. Ana está confundida y no sabe a quién responder.",
      options: [
        { option_id: "A", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Dile a Ana que haga lo que pide Carolina. No quiero un conflicto con Marketing, son un área muy influyente.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -20, supportChange: -15, reputationChange: -5, dialogueResponse: "Ok." } },
        { option_id: "B", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Esto es una violación de los procesos. Hablaré directamente con Carolina y le recordaré que todas las solicitudes deben pasar por nuestra planificación de sprints.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Ok." } },
        { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Yo te respaldo. Habla tú con Ana y dile que su prioridad es el sprint que definimos. Yo me encargaré de la conversación con Carolina para buscar una solución que respete a nuestro equipo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 20, supportChange: 15, dialogueResponse: "Ok." } },
        { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Dile a Ana que ignore el correo de Carolina por ahora. Si vuelve a insistir, le diremos que estamos demasiado ocupados.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -10, dialogueResponse: " " } }
      ]
    },
    // --- Mónica Flores (PM Senior) - Meeting 1 ---
    {
      node_id: "K1_E2_MF_METHODOLOGY",
      stakeholderRole: "Project Manager Senior",
      dialogue: "Precisamente sobre eso. Tu plan de proyecto no sigue la metodología 'Innovatec Standard'. Debemos seguir las reglas. Voy a necesitar que completes los 12 formularios de la Fase 1 antes de que el equipo escriba una sola línea de código.",
      options: [
        { option_id: "A", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Tienes razón, Mónica. La metodología existe por algo. Entrégame los formularios, nos aseguraremos de completarlos.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: -10, dialogueResponse: "Excelente. Me alegra que empecemos con el pie derecho, respetando los procesos. Así se minimizan los riesgos..." } },
        { option_id: "B", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Aprecio tu experiencia, pero para este proyecto necesitamos agilidad. Confía en mí, mi método funciona. Empezaremos a programar mañana.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: 10, dialogueResponse: "Ya veo. Un enfoque disruptivo. Espero que sepas lo que haces. El riesgo es alto. Siguiente punto..." } },
        { option_id: "C", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "Entiendo la importancia de los procesos, pero la metodología actual no es adecuada para proyectos de IA. Propongo que trabajemos juntos en una versión adaptada. Es lo mejor para la empresa a largo plazo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "Adaptar... es una posibilidad, pero requerirá muchas aprobaciones. Valoro la propuesta. Sigamos..." } },
        { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Llenaremos los formularios, pero de forma simbólica. Que tu equipo complete los documentos mientras mi equipo técnico avanza en paralelo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: 0, dialogueResponse: "Entendido. Una solución 'creativa' a las reglas. Anotado. Siguiente punto..." } }
      ]
    },
    {
      node_id: "K1_R1_MF_RESOURCE_ALLOCATION",
      stakeholderRole: "Project Manager Senior",
      dialogue: "...Ahora, la asignación de recursos. Para la fase de análisis de datos, el procedimiento estándar es asignar un analista de negocios junior. Son más baratos y están disponibles. Sé que pediste un 'Data Scientist', pero son caros y difíciles de conseguir.",
      options: [
          { option_id: "A", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Procedamos con el analista junior. Nos adaptaremos a los recursos disponibles como dicta el procedimiento.", tags: { "risk": "low" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Una decisión prudente y apegada a la realidad presupuestaria. Procederé con la asignación. Siguiente punto..." } },
          { option_id: "B", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "No. Necesito un Data Scientist. La calidad del análisis es crítica. No empezaré hasta que tengamos a la persona correcta, aunque nos retrase.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, dialogueResponse: "Insistir en un recurso escaso... eso complicará el cronograma y el presupuesto. Lo registraré como un riesgo del proyecto. Siguiente punto..." } },
          { option_id: "C", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Asigna al analista junior, pero quiero que le paguemos un curso intensivo de Data Science y que David Reyes (Lead Engineer) sea su mentor.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, budgetChange: -5000, dialogueResponse: "Soluciones alternativas que se desvían del procedimiento. Requerirán aprobación de Finanzas y RRHH. Lo gestionaré. Sigamos..." } },
          { option_id: "D", cardTitle: "Definir Contratacion", cardEmoji: "👥", text: "Contratemos un Data Scientist freelance por tres meses. Será más caro a corto plazo, pero mitigamos el riesgo de tener un análisis de baja calidad.", tags: { "risk": "medium" }, consequences: { trustChange: 0, supportChange: 5, budgetChange: -15000, dialogueResponse: "Soluciones alternativas que se desvían del procedimiento. Requerirán aprobación de Finanzas y RRHH. Lo gestionaré. Sigamos..." } }
      ]
    },
    {
      node_id: "K1_E3_MF_PAST_FAILURE",
      stakeholderRole: "Project Manager Senior",
      dialogue: "...Esto me recuerda al 'Proyecto Titán'. El PM de ese proyecto descubrió a mitad de camino que el presupuesto estaba mal calculado en un 30%. En lugar de reportarlo, intentó 'ocultarlo' con reasignaciones creativas. Fue un desastre.",
      options: [
        { option_id: "A", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "El error fue intentar ocultarlo, no la reasignación. Un buen PM debe ser capaz de manejar esas desviaciones sin alarmar a todo el mundo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -5, dialogueResponse: "Ya veo. Tienes una visión... flexible de los reportes. Es una perspectiva. Pasemos al último punto." } },
        { option_id: "B", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Su obligación, según el Manual de Proyectos página 42, era reportar cualquier desviación superior al 10% de inmediato. Debió seguir la regla.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 15, supportChange: 10, dialogueResponse: "Exacto. Si hubiera seguido el manual, el daño se habría controlado. Me alegra que lo veas así. Pasemos al último punto." } },
        { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "El verdadero problema fue la falta de transparencia. Un error no es una falla moral, ocultarlo sí. El equipo y la gerencia deben saber la verdad para tomar decisiones informadas.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "Transparencia... sí, es un principio noble. A veces choca con la realidad de la oficina. Pero entiendo tu punto. Último tema." } },
        { option_id: "D", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Probablemente estaba bajo mucha presión. A veces hay que 'maquillar' los números para proteger al equipo y al proyecto.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, dialogueResponse: "Ya veo. Tienes una visión... flexible de los reportes. Es una perspectiva. Pasemos al último punto." } }
      ]
    },
    {
        node_id: "K1_R2_MF_REPORTING_FREQUENCY",
        stakeholderRole: "Project Manager Senior",
        dialogue: "...Y para que eso no nos pase, hablemos de los reportes de avance. El estándar es un informe de progreso semanal que requiere 4 horas de preparación. O, como sé que te gusta la agilidad, podemos tener una reunión de pie de 10 minutos cada día.",
        options: [
            { option_id: "A", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Quedémonos con el informe semanal. Necesito la documentación detallada y el rastro en papel.", tags: { "risk": "low" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "" } },
            { option_id: "B", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "La reunión diaria. Es más eficiente y nos da feedback en tiempo real. Eliminemos el informe semanal.", tags: { "risk": "high" }, consequences: { trustChange: -10, supportChange: -5, dialogueResponse: "" } },
            { option_id: "C", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Hagamos la reunión diaria, y al final de la semana, tu equipo me envía un resumen de una página con viñetas, no el informe de 4 horas.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 0, dialogueResponse: "" } },
            { option_id: "D", cardTitle: "Definir Reporte", cardEmoji: "📊", text: "Automaticemos el reporte. Quiero que el equipo invierta en un dashboard que se actualice en tiempo real. Cero informes manuales.", tags: { "risk": "high" }, consequences: { trustChange: -5, supportChange: -10, projectProgressChange: 2, dialogueResponse: "" } }
        ]
    },
    // --- Javier Núñez (Gerente de Recursos Humanos) - Meeting 1 ---
    {
      node_id: "K1_E3_JN_PERFORMANCE",
      stakeholderRole: "Gerente de Recursos Humanos",
      dialogue: "Para empezar, me preocupa uno de los ingenieros de tu nuevo equipo, Pedro. Es brillante, pero últimamente su rendimiento ha bajado mucho. La política de la empresa dice que tras dos semanas de bajo rendimiento, debemos iniciar un plan de mejora formal que podría terminar en despido.",
      options: [
        { option_id: "A", cardTitle: "Criterio Normativo", cardEmoji: "📘", text: "Gracias por el aviso. Iniciaremos el plan de mejora formal de inmediato. Las reglas son para todos.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "De acuerdo, apegado al procedimiento. Me encargaré de iniciar el proceso formalmente. Sigamos..." } },
        { option_id: "B", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Este proyecto es demasiado importante como para cargar con alguien que no rinde. Inicia el proceso de desvinculación.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, reputationChange: -5, dialogueResponse: "Entendido. Una decisión drástica. Procederé a contactar a legales. Sigamos..." } },
        { option_id: "C", cardTitle: "Resolver Conflicto", cardEmoji: "🤝", text: "Antes de cualquier proceso formal, quiero hablar con Pedro. Puede que esté pasando por un problema personal. Mi deber como líder es entender el contexto y apoyarlo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 20, supportChange: 15, reputationChange: 5, dialogueResponse: "Gracias. Ese es el tipo de liderazgo que queremos fomentar. Me alegra que esa sea tu primera inclinación. Coordinaré una reunión privada para ti..." } },
        { option_id: "D", cardTitle: "Criterio Pragmatico", cardEmoji: "⚡", text: "Retrasa el proceso formal un par de semanas. Le daré tareas menos críticas mientras veo si su rendimiento mejora por sí solo para no tener que lidiar con el papeleo.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -5, supportChange: -5, dialogueResponse: "Comprendo, quieres evitar la burocracia. Lo puedo retener un tiempo, pero no indefinidamente. Siguiente punto..." } }
      ]
    },
    {
      node_id: "K1_R1_JN_HIRING",
      stakeholderRole: "Gerente de Recursos Humanos",
      dialogue: "...Ahora, sobre nuevas contrataciones. Necesitas un experto en 'Cloud Architecture'. Podemos abrir un proceso de búsqueda nacional, que tardará 2-3 meses pero nos asegura muchos candidatos. O podemos promover a Ana, nuestra ingeniera de visualización; es inteligente y aprende rápido, pero no tiene experiencia en el área.",
      options: [
        { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "Abramos el proceso nacional. No podemos arriesgarnos. Necesitamos a alguien con experiencia probada desde el día uno.", tags: { "risk": "low" }, consequences: { trustChange: 5, supportChange: 0, projectProgressChange: -5, dialogueResponse: "Entendido. Una decisión segura. Redactaré el perfil de cargo para la búsqueda externa. Sigamos..." } },
        { option_id: "B", cardTitle: "Gestionar Riesgo", cardEmoji: "🛡️", text: "Promovamos a Ana. Apostemos por el talento interno. Prefiero el riesgo de la curva de aprendizaje a la demora de una contratación.", tags: { "risk": "high" }, consequences: { trustChange: 15, supportChange: 10, projectProgressChange: 2, dialogueResponse: "Una gran muestra de confianza en nuestra gente. A Ana le encantará la oportunidad. Es un riesgo, pero uno que apoya nuestra cultura. Sigamos..." } },
        { option_id: "C", cardTitle: "Plan de Capacitacion", cardEmoji: "🎓", text: "Promovamos a Ana, pero invirtamos en un programa de mentoría intensivo con un consultor externo durante el primer mes.", tags: { "risk": "medium" }, consequences: { trustChange: 10, supportChange: 10, budgetChange: -10000, dialogueResponse: "Un enfoque equilibrado. Me gusta. Combina desarrollo interno con mitigación de riesgos. Lo coordinaré. Siguiente punto..." } },
        { option_id: "D", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Hagamos ambas cosas. Iniciemos el proceso de búsqueda y, mientras tanto, démosle a Ana la oportunidad como 'líder interina' del área.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, dialogueResponse: "Un enfoque equilibrado. Me gusta. No cerramos ninguna puerta. Lo coordinaré. Siguiente punto..." } }
      ]
    },
    {
      node_id: "K1_E2_JN_CONFIDENTIALITY",
      stakeholderRole: "Gerente de Recursos Humanos",
      dialogue: "...Un tema delicado. Como sabes, este proyecto podría llevar a la automatización de ciertos roles. La política de la empresa es no comunicar posibles despidos hasta que la decisión sea final e irrevocable para evitar el pánico.",
      options: [
        { option_id: "A", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "La política es clara y debemos seguirla. No diremos nada hasta que sea oficial.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 10, supportChange: 5, dialogueResponse: "De acuerdo. Es el camino más ordenado y apegado a la norma, aunque difícil. Siguiente punto..." } },
        { option_id: "B", cardTitle: "Criterio Etico Amplio", cardEmoji: "🧭", text: "La gente merece saber lo que podría pasar. Ocultarles esta información es injusto. Debemos ser transparentes sobre la posibilidad, aunque genere ansiedad.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 10, reputationChange: -10, dialogueResponse: "Transparencia radical... Es una postura éticamente admirable, pero prepárate para manejar las consecuencias en la moral del equipo. Siguiente punto..." } },
        { option_id: "C", cardTitle: "Iniciar Reunion", cardEmoji: "▶️", text: "No solo no diremos nada, sino que debemos iniciar una campaña de comunicación interna enfocada en los 'nuevos roles emocionantes' que creará la IA.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -15, supportChange: -10, reputationChange: 5, dialogueResponse: "Entiendo, un enfoque en la gestión de la percepción. Puede ser efectivo, pero también arriesgado si la gente siente que no somos sinceros. Sigamos..." } },
        { option_id: "D", cardTitle: "Gestionar Comunicacion", cardEmoji: "📣", text: "Se lo diremos solo a los gerentes de área en confianza, para que ellos puedan 'preparar' a su gente sin hacer un anuncio oficial.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: -5, dialogueResponse: "Entiendo, un enfoque en la gestión de la percepción. Puede ser efectivo, pero también arriesgado si la gente siente que no somos sinceros. Sigamos..." } }
      ]
    },
    {
      node_id: "K1_R2_JN_TRAINING",
      stakeholderRole: "Gerente de Recursos Humanos",
      dialogue: "...Para que la gente adopte la nueva plataforma, necesitan capacitación. Podemos hacer un curso online obligatorio, de bajo costo y escalable. O podemos hacer talleres presenciales en grupos pequeños. Mucho más caro y lento, pero con mayor impacto.",
      options: [
        { option_id: "A", cardTitle: "Plan de Capacitacion", cardEmoji: "🎓", text: "Vamos con el curso online. Es la única forma eficiente de capacitar a toda la empresa sin detener las operaciones.", tags: { "risk": "low" }, consequences: { trustChange: 0, supportChange: 0, budgetChange: -5000, projectProgressChange: 5, dialogueResponse: "Eficiente y escalable. Es el enfoque estándar. Lo pondremos en marcha." } },
        { option_id: "B", cardTitle: "Ajuste Presupuestario", cardEmoji: "💰", text: "Los talleres presenciales son la única forma de asegurar una adopción real. Es una inversión, no un costo. Debemos hacerlo bien.", tags: { "risk": "high" }, consequences: { trustChange: 10, supportChange: 5, budgetChange: -30000, projectProgressChange: 2, dialogueResponse: "Una inversión en nuestra gente. Aprecio ese enfoque. Será más lento de organizar, pero los resultados serán mejores." } },
        { option_id: "C", cardTitle: "Buscar Equilibrio", cardEmoji: "⚖️", text: "Hagamos un modelo mixto: un curso online para la base y talleres presenciales solo para los 'super-usuarios' o líderes de equipo.", tags: { "risk": "medium" }, consequences: { trustChange: 5, supportChange: 5, budgetChange: -15000, projectProgressChange: 4, dialogueResponse: "Un buen compromiso. Maximizamos el impacto donde más importa. Me parece un plan sólido." } },
        { option_id: "D", cardTitle: "Decision de Alto Riesgo", cardEmoji: "🔴", text: "Lancemos la plataforma sin una capacitación formal. El software debería ser lo suficientemente intuitivo. Daremos soporte a quienes lo necesiten.", tags: { "risk": "high" }, consequences: { trustChange: -15, supportChange: -10, projectProgressChange: -5, dialogueResponse: "Es... una estrategia audaz. Confiar en la intuición de cientos de empleados es un riesgo operativo enorme. Como digas." } }
      ]
    },
    {
      node_id: "K1_E3_JN_REMOTE_WORK",
      stakeholderRole: "Gerente de Recursos Humanos",
      dialogue: "...Último punto. David Reyes, tu Lead Engineer, me ha pedido trabajar 100% remoto por un tema familiar delicado. Nuestra nueva política 'post-pandemia', impulsada por la gerencia, exige 3 días de presencialidad a la semana, sin excepciones, para 'fomentar la cultura'.",
      options: [
        { option_id: "A", cardTitle: "Rechazar Propuesta", cardEmoji: "⛔", text: "La política es para todos. David es clave, pero no podemos hacer una excepción con él. Deberá cumplir con los 3 días.", tags: { "ethics_kohlberg": "conventional" }, consequences: { trustChange: 5, supportChange: -10, dialogueResponse: "" } },
        { option_id: "B", cardTitle: "Hacer Preguntas", cardEmoji: "❓", text: "La familia es lo primero. Aprobaré su solicitud de trabajo 100% remoto. Si la gerencia pregunta, diré que es una 'necesidad crítica del proyecto'.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -10, supportChange: 15, reputationChange: 5, dialogueResponse: "" } },
        { option_id: "C", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "La política parece ser demasiado rígida. Hablaré con la Gerencia General para proponer una enmienda basada en la flexibilidad y la confianza, usando el caso de David como ejemplo.", tags: { "ethics_kohlberg": "post-conventional" }, consequences: { trustChange: 15, supportChange: 10, reputationChange: 10, dialogueResponse: "" } },
        { option_id: "D", cardTitle: "Aplicar Protocolo", cardEmoji: "📘", text: "Que venga los 3 días, pero que se quede solo medio día en la oficina. Así cumple 'formalmente' la política, pero tiene la flexibilidad que necesita.", tags: { "ethics_kohlberg": "pre-conventional" }, consequences: { trustChange: -5, supportChange: 5, dialogueResponse: "" } }
      ]
    }
  ],
  sequences: [
    {
      sequence_id: "RV_MEETING_1",
      stakeholderRole: "Chief Financial Officer (CFO)",
      initialDialogue: "Hola. Gracias por venir. Tengo 20 minutos. Sé que la Gerencia General está muy entusiasmada con tu 'Proyecto Quantum Leap', pero aquí en finanzas, el entusiasmo no paga las facturas. Vengo a entender los números y los riesgos. ¿Cuál es tu primera consulta?",
      nodes: ["K1_R1_RV_BUDGET", "K1_E1_RV_CONTRATACION_EXTERNA", "K1_R2_RV_REPORTE_AVANCE"],
      finalDialogue: "De acuerdo. Creo que por hoy es suficiente. Tengo una idea más clara de cómo operas. Mi puerta está abierta, pero recuerda: los números no mienten. Que tengas un buen día."
    },
    {
      sequence_id: "RV_MEETING_2",
      stakeholderRole: "Chief Financial Officer (CFO)",
      initialDialogue: "Hola de nuevo. He estado revisando los informes preliminares. Los planes se ven bien en el papel, pero la realidad siempre trae sorpresas. Quiero saber cómo estás manejando las desviaciones. ¿Qué tienes para mí?",
      nodes: ["K2_R3_RV_COST_OVERRUN", "K2_E4_RV_MILESTONE_REPORT", "K2_E5_RV_INVOICE_ERROR", "K2_R4_RV_RESOURCE_CONFLICT"],
      finalDialogue: "OK. Decisiones difíciles. Esta reunión me ha dado una visión clara de cómo manejas la presión y los imprevistos. Seguiremos en contacto. Puedes retirarte."
    },
    {
        sequence_id: "CS_MEETING_1",
        stakeholderRole: "Chief Marketing Officer (CMO)",
        initialDialogue: "¡Hola! Qué bueno que nos juntamos. He oído maravillas del 'Proyecto Quantum Leap' y mi equipo y yo estamos ansiosos por empezar a comunicar esto. El potencial para la marca es enorme. Cuéntame, ¿cómo podemos ayudar a 'vender' este proyecto y generar un gran impacto desde ya?",
        nodes: ["K1_E1_CS_ANNOUNCEMENT", "K1_R2_CS_CUSTOMER_DATA", "K1_E2_CS_BRANDING", "K1_R3_CS_RESOURCE"],
        finalDialogue: "Ok, me queda claro. Ha sido una reunión muy productiva, me da una buena idea de cómo podremos (o no podremos) trabajar juntos. Estamos en contacto."
    },
    {
        sequence_id: "CS_MEETING_2",
        stakeholderRole: "Chief Marketing Officer (CMO)",
        initialDialogue: "Hola. Qué bueno verte. El proyecto ya está en boca de todos, para bien o para mal. Algunos están emocionados, otros están aterrorizados de que un robot les quite el trabajo. Necesitamos gestionar la narrativa de forma proactiva. ¿Qué tienes en mente?",
        nodes: ["K2_R4_CS_EXPECTATION_MGMT", "K2_E2_CS_NEGATIVE_FEEDBACK", "K2_R5_CS_BUDGET_OPPORTUNITY", "K2_E3_CS_LEAK"],
        finalDialogue: "Ok, entiendo tu postura. La gestión de crisis define a un líder. Tenemos mucho en qué pensar. Gracias por tu tiempo."
    },
    {
      sequence_id: "DR_MEETING_1",
      stakeholderRole: "Lead Engineer",
      initialDialogue: "Hola, {playerName}. Bienvenido a Innovatec. Soy David Reyes. He revisado la directiva del 'Proyecto Quantum Leap'. Es... ambicioso. Mi equipo y yo estamos listos para el desafío técnico, pero primero quiero entender tu visión de cómo trabajaremos. ¿Por dónde empezamos?",
      nodes: ["K1_R2_DR_SHORTCUT", "K1_E1_DR_BURNOUT", "K1_R3_DR_AUTONOMY"],
      finalDialogue: "De acuerdo. Esto me da una dirección clara sobre cómo quieres que operemos. Ha sido una buena primera conversación. Mi equipo y yo nos pondremos a trabajar en esto. Estamos en contacto."
    },
    {
      sequence_id: "DR_MEETING_2",
      stakeholderRole: "Lead Engineer",
      initialDialogue: "Hola, {playerName}. Qué bueno que hablamos. El equipo está avanzando, pero estamos empezando a encontrar los problemas reales, los que no se ven en la planificación. Tengo un par de temas críticos que necesito discutir contigo.",
      nodes: ["K2_R4_DR_NEW_TECH", "K2_E2_DR_TEAM_CONFLICT", "K2_R5_DR_SECURITY_VULN", "K2_E3_DR_POACHING"],
      finalDialogue: "Ok, gracias. Esto me da claridad sobre cómo manejar estas situaciones. No es fácil, pero al menos sé a qué atenerme. Seguiremos trabajando."
    },
    {
      sequence_id: "MF_MEETING_1",
      stakeholderRole: "Project Manager Senior",
      initialDialogue: "Buenos días, {playerName}. He revisado el borrador del 'Proyecto Quantum Leap'. Es... ambicioso. Llevo 15 años gestionando proyectos en Innovatec y he aprendido que el éxito está en seguir los procedimientos que funcionan. Estoy aquí para asegurar que este proyecto se alinee con nuestras metodologías probadas. ¿Cuál es el primer punto que quieres revisar?",
      nodes: ["K1_E2_MF_METHODOLOGY", "K1_R1_MF_RESOURCE_ALLOCATION", "K1_E3_MF_PAST_FAILURE", "K1_R2_MF_REPORTING_FREQUENCY"],
      finalDialogue: "De acuerdo. Con esto tengo suficiente para elaborar el Plan de Gestión de Proyecto inicial. Veo que tienes ideas claras, aunque algunas se desvían de nuestras prácticas. Lo documentaré todo. Estamos en contacto."
    },
    {
      sequence_id: "JN_MEETING_1",
      stakeholderRole: "Gerente de Recursos Humanos",
      initialDialogue: "Hola, {playerName}, bienvenido. Soy Javier. He leído sobre el 'Proyecto Quantum Leap' y, francamente, aunque la tecnología suena fascinante, mi preocupación principal es el impacto en nuestra gente. Un cambio de esta magnitud puede generar mucha ansiedad. Estoy aquí para asegurar que lo hagamos de la forma correcta, cuidando a nuestro equipo. ¿Cuál es tu visión al respecto?",
      nodes: ["K1_E3_JN_PERFORMANCE", "K1_R1_JN_HIRING", "K1_E2_JN_CONFIDENTIALITY", "K1_R2_JN_TRAINING", "K1_E3_JN_REMOTE_WORK"],
      finalDialogue: "De acuerdo. Esta ha sido una conversación muy reveladora. Me da una idea clara de tu enfoque hacia la gestión de personas. Hay decisiones complejas por delante, pero ahora sé cómo las abordarás. Gracias por tu tiempo."
    }
  ]
};