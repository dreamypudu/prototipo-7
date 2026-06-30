// Contrato de resultados que ve el usuario al cerrar la simulacion.
// La pipeline futura (DB -> feature engineering) producira este mismo shape;
// hoy lo llena buildMockResults() con datos inventados. Dashboard solo lee de aqui.
// Cada bloque indica la(s) tabla(s) reales del backend que lo alimentaran.

export interface SessionResults {
  schema_version: number;
  status: 'mock' | 'preliminary' | 'ready';
  generated_at: string;

  // Estilo de liderazgo (titular). Fuente: mlq_labels / explicit_decisions (sumas por dimension).
  headline: { title: string; subtitle: string };

  // Perfil MLQ-5X (radar), valores 0..4. Fuente: mlq_labels (iia,iic,mi,ei,ci,rc,dpe_a,dpe_p,lf).
  leadership: { axis: string; label: string; value: number }[];

  // Dice vs Hace: consistencia promesa/accion. Fuente: comparisons (outcome) + explicit_decisions.
  consistency_pct: number;
  diceVsHace: { promise: string; kept: boolean; detail: string }[];

  // Metricas conductuales (tarjetas). Fuentes:
  //  - deliberacion: process_logs / option_process_stats (tiempos, hover)
  //  - equipo: map_action_details / map_hover_stats (visitas, % proactivo, equidad)
  //  - informacion: question_log / email_action_details / document_action_details
  behavior: { id: string; label: string; value: string; hint: string }[];

  // Bullets interpretativos. Fuente: derivado de lo anterior.
  highlights: { kind: 'good' | 'risk' | 'info'; text: string }[];
}

// ponytail: datos fijos inventados; reemplazar por la pipeline cuando exista (mismo shape).
export function buildMockResults(): SessionResults {
  return {
    schema_version: 1,
    status: 'mock',
    generated_at: new Date().toISOString(),
    headline: {
      title: 'Liderazgo transformacional con sesgo a la acción',
      subtitle: 'Inspira y considera al equipo, pero rompe acuerdos bajo presión.',
    },
    leadership: [
      { axis: 'IIA', label: 'Influencia idealizada (atrib.)', value: 3.2 },
      { axis: 'IIC', label: 'Influencia idealizada (cond.)', value: 2.8 },
      { axis: 'MI', label: 'Motivación inspiradora', value: 3.6 },
      { axis: 'EI', label: 'Estimulación intelectual', value: 2.4 },
      { axis: 'CI', label: 'Consideración individualizada', value: 3.0 },
      { axis: 'RC', label: 'Recompensa contingente', value: 2.1 },
      { axis: 'DPE-A', label: 'Gestión por excepción (activa)', value: 1.8 },
      { axis: 'DPE-P', label: 'Gestión por excepción (pasiva)', value: 1.2 },
      { axis: 'LF', label: 'Laissez-faire', value: 0.9 },
    ],
    consistency_pct: 58,
    diceVsHace: [
      { promise: 'Prometió reservar Box 1 a Guzmán el martes', kept: false, detail: 'El martes el box quedó para Soto.' },
      { promise: 'Dijo que aliviaría la carga de Javier Castro', kept: true, detail: 'Bajó su carga clínica a 50%.' },
      { promise: 'Se comprometió a visitar primero al Sector Rojo', kept: false, detail: 'Visitó primero al Sector Azul.' },
      { promise: 'Aseguró revisar el protocolo de urgencias', kept: true, detail: 'Abrió y leyó el documento antes de decidir.' },
    ],
    behavior: [
      { id: 'decision_time', label: 'Tiempo medio de decisión', value: '8.4 s', hint: 'Decide con reflexión, no impulsivo.' },
      { id: 'hover_switches', label: 'Dudas entre opciones', value: '2.3 / nodo', hint: 'Comparó alternativas antes de elegir.' },
      { id: 'proactive_visits', label: 'Visitas proactivas', value: '6 de 9', hint: 'Buscó activamente a su equipo.' },
      { id: 'sector_equity', label: 'Equidad por sector', value: 'Alta', hint: 'Repartió atención entre Azul/Rojo/Amarillo.' },
      { id: 'info_before', label: 'Información revisada', value: '11 docs/correos', hint: 'Se informó antes de comprometerse.' },
      { id: 'questions', label: 'Preguntas al equipo', value: '7', hint: 'Indagó antes de juzgar.' },
    ],
    highlights: [
      { kind: 'good', text: 'Alta consideración individualizada: priorizó al funcionario sobrecargado.' },
      { kind: 'risk', text: 'Cumplió solo 58% de sus compromisos: lo que dice no siempre es lo que hace.' },
      { kind: 'good', text: 'Buscó información y consultó al equipo antes de decidir.' },
      { kind: 'risk', text: 'Baja recompensa contingente: pocos acuerdos claros de desempeño.' },
    ],
  };
}
