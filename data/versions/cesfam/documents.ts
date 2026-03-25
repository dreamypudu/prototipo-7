import type { Document } from '../../../types';

export const CESFAM_DOCUMENTS: Document[] = [
  {
    id: 'case1-borrador-lunes',
    title: 'Borrador consolidado del lunes',
    content: `Lunes AM (08:00 a 12:00) - propuesta consolidada

- Box 5: Dr. Eduardo Naranjo mantiene 12 controles cardiovasculares ya citados.
- Box 5: Dr. Andres Guzman agrego un bloque de observacion docente con interno.
- Box 6: Enf. Marcela Soto reservo curaciones y control IAAS de primera hora.
- Box 6: Sr. Daniel Rios ingreso seis pacientes vulnerables para acogida y filtro clinico.
- Box 6: Enf. Francisca Solis mantiene ocho controles reagendados de Amarillo.
- Box 6: TENS Claudia Morales fue movida como apoyo para sostener ese flujo.

Observacion:
El borrador resuelve la escasez superponiendo tres choques en el mismo bloque y dejando al Sector Rojo sin la TENS que necesitaba para su manana mas cargada.`,
  },
  {
    id: 'case1-horas-contractuales',
    title: 'Resumen de horas contractuales y horas protegidas',
    content: `Resumen operativo de la semana propuesta

- Dr. Andres Guzman solicita resguardar 4 horas administrativas el viernes PM en Oficinas Administrativas para actividad academica y gestion docente.
- Dr. Eduardo Naranjo ya tiene el lunes AM completo con 12 controles cardiovasculares.
- Enf. Marcela Soto informa que el lunes AM necesita a Claudia Morales disponible para sostener Box 5 y Box 6 en Rojo.
- Sector Amarillo informa seis ingresos comunitarios prioritarios el lunes AM, ademas de ocho controles reagendados con Enf. Francisca Solis.

Conclusion:
La tension no es solo por espacio fisico. Tambien cruza horas protegidas, continuidad asistencial y uso reiterado de la misma funcionaria como solucion rapida.`,
  },
  {
    id: 'case1-nota-marcela',
    title: 'Nota de Marcela Soto sobre sobrecarga de Claudia',
    content: `Dejo constancia de que la TENS Claudia Morales fue movida nuevamente fuera del Sector Rojo en el borrador del lunes AM.

La planificacion actual la instala en Box 6 junto a la demanda de Amarillo entre 08:00 y 12:00, dejando al Sector Rojo sin apoyo TENS para los controles del Dr. Eduardo Naranjo en Box 5 y las curaciones programadas en Box 6.

Esto no corresponde a un ajuste menor. Es una reasignacion reiterada que concentra el costo operativo sobre la misma funcionaria.

Solicito que el borrador final no la utilice nuevamente como solucion de emergencia sin acuerdo previo.

Enf. Marcela Soto
Jefa Sector Rojo`,
  },
  {
    id: 'case1-demanda-amarillo',
    title: 'Minuta de demanda prioritaria del Sector Amarillo',
    content: `Sector Amarillo - prioridades del lunes AM

- Enf. Francisca Solis mantiene ocho controles reagendados en Box 6 entre 08:00 y 12:00.
- Sr. Daniel Rios solicita un box adicional para seis ingresos comunitarios que ya fueron reagendados dos veces.
- Si no aparece un segundo espacio en ese bloque, los usuarios vulnerables vuelven a quedar fuera de ventana.

Observacion:
El sector requiere una salida real para el lunes AM. No basta con pedir tolerancia administrativa.`,
  },
  {
    id: 'case1-solicitud-azul',
    title: 'Solicitud de bloque protegido de Andres Guzman',
    content: `Solicitud interna - Sector Azul

Solicito resguardar el Box 5 el lunes AM (08:00 a 12:00) para observacion docente con interno y revision de casos complejos.

Adicionalmente, solicito mantener 4 horas administrativas el viernes PM en Oficinas Administrativas para gestion academica y coordinacion de esa actividad.

Argumento:
- mejora posicionamiento tecnico del CESFAM
- sostiene vinculo universitario
- protege linea de desarrollo docente

Observacion:
La solicitud compite directamente con controles clinicos ya citados del Sector Rojo.`,
  },
];
