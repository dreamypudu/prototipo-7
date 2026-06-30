// Contrato de resultados que ve el usuario al cerrar la simulacion.
// La pipeline futura (DB -> feature engineering -> informe) producira este mismo shape;
// hoy lo llena buildMockResults() con datos inventados para mostrar la vision del dashboard.

export type ResultTone = 'good' | 'risk' | 'info';

export interface SessionResults {
  schema_version: number;
  status: 'mock' | 'preliminary' | 'ready';
  generated_at: string;

  headline: { title: string; subtitle: string };

  // Interpretacion futura: indicadores calculados + agente IA explicativo.
  aiSummary: {
    title: string;
    confidence: string;
    summary: string;
    strengths: string[];
    risks: string[];
    nextStep: string;
  };

  // Captura tri-nivel: declarativo, conductual y proceso.
  dataLayers: { label: string; value: string; hint: string }[];

  // Perfil MLQ-5X, valores 0..4.
  leadership: { axis: string; label: string; value: number }[];

  // Dice vs Hace: consistencia promesa/accion.
  consistency_pct: number;
  diceVsHace: { promise: string; kept: boolean; detail: string }[];

  // Indicadores simples derivados de telemetria.
  behavior: { id: string; label: string; value: string; hint: string; tone?: ResultTone }[];

  // Indicadores complejos derivados de trayectorias.
  advancedIndicators: {
    id: string;
    label: string;
    value: string;
    score: number;
    tone: ResultTone;
    evidence: string;
  }[];

  // Variables de estado que muestran consecuencia longitudinal.
  stateVariables: { label: string; value: string; hint: string; tone: ResultTone }[];

  // Bullets interpretativos.
  highlights: { kind: ResultTone; text: string }[];
}

// ponytail: datos fijos inventados; reemplazar por la pipeline cuando exista (mismo shape).
export function buildMockResults(): SessionResults {
  return {
    schema_version: 2,
    status: 'mock',
    generated_at: new Date().toISOString(),
    headline: {
      title: 'Diagnostico conductual avanzado',
      subtitle: '',
    },
    aiSummary: {
      title: 'Resumen IA del perfil conductual',
      confidence: 'Confianza alta - evidencia multifuente',
      summary:
        'El usuario muestra orientacion al equipo y busqueda activa de informacion. La principal brecha aparece cuando aumenta la presion: declara criterios colaborativos, pero ejecuta decisiones que reducen confianza y acceso a informacion critica.',
      strengths: [
        'Consulta al equipo antes de varias decisiones clave.',
        'Mantiene buen nivel de exploracion de informacion disponible.',
        'Aprende parcialmente despues de consecuencias negativas.',
      ],
      risks: [
        'La consistencia promesa-accion cae en escenarios de conflicto.',
        'Tiende a priorizar resolucion rapida sobre acuerdos sostenibles.',
      ],
      nextStep:
        'Ruta sugerida: entrenamiento en conversaciones dificiles, priorizacion bajo presion y seguimiento de compromisos.',
    },
    dataLayers: [
      { label: 'Declarativo', value: '24 decisiones', hint: 'Lo que prometio, priorizo o justifico.' },
      { label: 'Conductual', value: '67 acciones', hint: 'Lo que hizo en agenda, mapa, correo y documentos.' },
      { label: 'Proceso', value: '142 trazas', hint: 'Como decidio: tiempos, secuencias, dudas y omisiones.' },
    ],
    leadership: [
      { axis: 'IIA', label: 'Influencia idealizada (atrib.)', value: 3.2 },
      { axis: 'IIC', label: 'Influencia idealizada (cond.)', value: 2.8 },
      { axis: 'MI', label: 'Motivacion inspiradora', value: 3.6 },
      { axis: 'EI', label: 'Estimulacion intelectual', value: 2.4 },
      { axis: 'CI', label: 'Consideracion individualizada', value: 3.0 },
      { axis: 'RC', label: 'Recompensa contingente', value: 2.1 },
      { axis: 'DPE-A', label: 'Gestion por excepcion (activa)', value: 1.8 },
      { axis: 'DPE-P', label: 'Gestion por excepcion (pasiva)', value: 1.2 },
      { axis: 'LF', label: 'Laissez-faire', value: 0.9 },
    ],
    consistency_pct: 58,
    diceVsHace: [
      { promise: 'Prometio reservar Box 1 a Guzman el martes', kept: false, detail: 'El martes el box quedo para Soto.' },
      { promise: 'Dijo que aliviaria la carga de Javier Castro', kept: true, detail: 'Bajo su carga clinica a 50%.' },
      { promise: 'Se comprometio a visitar primero al Sector Rojo', kept: false, detail: 'Visito primero al Sector Azul.' },
      { promise: 'Aseguro revisar el protocolo de urgencias', kept: true, detail: 'Abrio y leyo el documento antes de decidir.' },
    ],
    behavior: [
      { id: 'decision_time', label: 'Tiempo medio de decision', value: '8.4 s', hint: 'Decide con reflexion, no impulsivo.', tone: 'info' },
      { id: 'hover_switches', label: 'Comparacion de alternativas', value: '2.3 / nodo', hint: 'Exploro opciones antes de elegir.', tone: 'good' },
      { id: 'proactive_visits', label: 'Visitas proactivas', value: '6 de 9', hint: 'Busco activamente a su equipo.', tone: 'good' },
      { id: 'sector_equity', label: 'Equidad por sector', value: 'Alta', hint: 'Distribuyo atencion entre Azul/Rojo/Amarillo.', tone: 'good' },
      { id: 'info_before', label: 'Informacion revisada', value: '11 fuentes', hint: 'Consulto documentos y correos antes de actuar.', tone: 'good' },
      { id: 'questions', label: 'Preguntas al equipo', value: '7', hint: 'Indago antes de juzgar.', tone: 'good' },
      { id: 'follow_through', label: 'Compromisos cumplidos', value: '58%', hint: 'Brecha visible entre promesa y ejecucion.', tone: 'risk' },
      { id: 'ignored_signals', label: 'Senales ignoradas', value: '4', hint: 'Omitio alertas relevantes en crisis.', tone: 'risk' },
    ],
    advancedIndicators: [
      {
        id: 'intention_action_gap',
        label: 'Intention-Action Gap',
        value: '42% brecha',
        score: 42,
        tone: 'risk',
        evidence: 'Promesas de escucha y priorizacion no se sostuvieron en 2 de 4 compromisos criticos.',
      },
      {
        id: 'consistency_pressure',
        label: 'Consistencia bajo presion',
        value: 'Media',
        score: 62,
        tone: 'info',
        evidence: 'Mantiene criterio en decisiones simples, pero cambia de estrategia cuando sube el conflicto.',
      },
      {
        id: 'leadership_failure_point',
        label: 'Leadership Failure Point',
        value: 'Conflicto multi-actor',
        score: 54,
        tone: 'risk',
        evidence: 'La competencia se debilita al equilibrar sectores con intereses incompatibles.',
      },
      {
        id: 'ethical_drift',
        label: 'Ethical Drift',
        value: 'Bajo-medio',
        score: 71,
        tone: 'good',
        evidence: 'Sostiene criterios eticos generales, aunque cede ante urgencias operativas puntuales.',
      },
      {
        id: 'learning_velocity',
        label: 'Learning Velocity',
        value: 'Alta',
        score: 78,
        tone: 'good',
        evidence: 'Despues de consecuencias negativas aumenta consulta de informacion antes de actuar.',
      },
      {
        id: 'role_transition_risk',
        label: 'Role Transition Risk',
        value: 'Moderado',
        score: 58,
        tone: 'risk',
        evidence: 'Buen desempeno operativo, pero riesgo en seguimiento de acuerdos y conflicto sostenido.',
      },
      {
        id: 'decision_signature',
        label: 'Decision Process Signature',
        value: 'Analitico-reactivo',
        score: 69,
        tone: 'info',
        evidence: 'Explora evidencia, pero acelera decisiones al enfrentar presion social o institucional.',
      },
      {
        id: 'stakeholder_blind_spot',
        label: 'Stakeholder Blind Spot',
        value: 'Sector Rojo',
        score: 47,
        tone: 'risk',
        evidence: 'Subestima advertencias de un sector cuando compiten prioridades clinicas y politicas.',
      },
    ],
    stateVariables: [
      { label: 'Confianza del equipo', value: '-12%', hint: 'Cae por compromisos incumplidos.', tone: 'risk' },
      { label: 'Acceso a informacion', value: '+18%', hint: 'Mejora cuando consulta de forma proactiva.', tone: 'good' },
      { label: 'Presion de conflicto', value: 'Alta', hint: 'Aumenta en la etapa final.', tone: 'risk' },
      { label: 'Credibilidad', value: 'Estable', hint: 'Se sostiene, pero con alertas por seguimiento.', tone: 'info' },
    ],
    highlights: [
      { kind: 'good', text: 'Alta consideracion individualizada: priorizo al funcionario sobrecargado.' },
      { kind: 'risk', text: 'Cumplio solo 58% de sus compromisos: lo que dice no siempre es lo que hace.' },
      { kind: 'good', text: 'Busco informacion y consulto al equipo antes de decidir.' },
      { kind: 'risk', text: 'Punto de quiebre: conflicto multi-actor con presion operativa.' },
    ],
  };
}
