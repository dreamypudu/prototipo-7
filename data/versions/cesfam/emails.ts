import { EmailTemplate } from '../../../types';

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    email_id: 'email-001-welcome',
    trigger: { type: 'ON_MEETING_COMPLETE', stakeholder_id: 'system-startup' },
    from: 'Servicio de Salud',
    subject: 'Nombramiento y desafio de gestion',
    body: `Estimado/a Director/a:\n\nConfirmamos su nombramiento a cargo del CESFAM. Usted recibe una institucion con tres sectores fuertes, prioridades distintas y escaso margen operativo.\n\nSu primera semana sera clave para ordenar relaciones internas, sostener la atencion y evitar que la disputa entre jefaturas afecte a los usuarios.\n\nSofia Castro ya preparo la induccion inicial.`,
  },
  {
    email_id: 'email-case1-materiales',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-docs-ready' },
    from: 'Sofia Castro',
    subject: 'Antecedentes para revision del borrador del lunes',
    body: `Director/a:\n\nLe deje en Documentos el borrador consolidado del lunes, el resumen de horas contractuales y las notas internas del conflicto de boxes 5, 6 y 7.\n\nLe recomiendo revisarlos hoy, antes de empezar a cerrar la propuesta de la semana.\n\nSofia Castro\nAsistente Administrativa`,
  },
  {
    email_id: 'email-case1-friday-reminder',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-friday-reminder' },
    from: 'Sofia Castro',
    subject: 'Recordatorio: envio de borrador hoy',
    body: `Director/a:\n\nLe recuerdo que hoy viernes debe enviarse el borrador semanal que se utilizara el lunes.\n\nSi queda alguna definicion pendiente, conviene dejarla resuelta antes de cerrar la jornada.\n\nSofia Castro`,
  },
  {
    email_id: 'email-case1-monday-clean',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-clean' },
    from: 'Sofia Castro',
    subject: 'Borrador semanal recepcionado',
    body: `Director/a:\n\nSe recepciono el borrador semanal sin observaciones mayores. Quedaron tensiones politicas, pero no una objecion formal al inicio del lunes.\n\nQuedo atenta a cualquier ajuste operativo de ultima hora.\n\nSofia Castro`,
  },
  {
    email_id: 'email-case1-monday-tense',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-tense' },
    from: 'Sofia Castro',
    subject: 'Borrador semanal enviado con observaciones',
    body: `Director/a:\n\nEl borrador fue enviado, pero quedaron puntos sensibles y es probable que el lunes tengamos que revisar acuerdos en terreno.\n\nLe sugiero partir la jornada atento a cualquier desajuste entre lo comprometido y lo finalmente cargado.\n\nSofia Castro`,
  },
  {
    email_id: 'email-case1-monday-escalation',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-escalation' },
    from: 'Sofia Castro',
    subject: 'Constancia administrativa sobre borrador semanal',
    body: `Director/a:\n\nDejo constancia de que el borrador semanal fue enviado con observaciones relevantes sobre distribucion de boxes y compromisos que no quedaron reflejados de forma consistente.\n\nEs esperable que el lunes tengamos reclamos internos si esto no se aborda a primera hora.\n\nSofia Castro`,
  },
  {
    email_id: 'email-case1-monday-marcela',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-marcela' },
    from: 'Enf. Marcela Soto',
    subject: 'Dejo constancia por planificacion del lunes',
    body: `Director/a:\n\nTal como adverti en reunion, la propuesta enviada vuelve a cargar sobre el Sector Rojo costos que no fueron acordados.\n\nSi esto se mantiene al inicio del lunes, dejare la observacion en acta y resguardare formalmente a mi equipo.\n\nMarcela Soto\nJefa Sector Rojo`,
  },
  {
    email_id: 'email-case1-monday-daniel',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-daniel' },
    from: 'Sr. Daniel Rios',
    subject: 'Cobertura del lunes sigue insuficiente',
    body: `Director/a:\n\nRevise el borrador final y sigo sin ver una salida clara para cubrir la demanda prioritaria del lunes en el Sector Amarillo.\n\nSi no hacemos un ajuste temprano, voy a tener que reagendar usuarios que ya vienen esperando hace rato.\n\nDaniel Rios\nJefe Sector Amarillo`,
  },
  {
    email_id: 'email-case1-monday-guzman',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'case1-monday-guzman' },
    from: 'Dr. Andres Guzman',
    subject: 'Observacion sobre compromiso no reflejado',
    body: `Director/a:\n\nEl borrador semanal no refleja en forma consistente lo conversado respecto del Sector Azul.\n\nSi la planificacion finalmente desconoce ese acuerdo, le pido que lo conversemos antes de exponer al equipo a un cambio improvisado el lunes.\n\nDr. Andres Guzman\nJefe Sector Azul`,
  },
];
