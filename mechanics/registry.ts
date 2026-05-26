import { MechanicRegistry } from './types';
import DataExportMechanic from './modules/DataExportMechanic';
import DocumentsMechanic from './modules/DocumentsMechanic';
import EmailMechanic from './modules/EmailMechanic';
import ExperimentalMapMechanic from './modules/ExperimentalMapMechanic';
import InnovatecCalendarMechanic from './modules/InnovatecCalendarMechanic';
import InnovatecEmailMechanic from './modules/InnovatecEmailMechanic';
import InnovatecExperimentalMapMechanic from './modules/InnovatecExperimentalMapMechanic';
import InnovatecOfficeMechanic from './modules/InnovatecOfficeMechanic';
import InnovatecSummaryMechanic from './modules/InnovatecSummaryMechanic';
import MapMechanic from './modules/MapMechanic';
import OfficeMechanic from './modules/OfficeMechanic';
import ScheduleMechanic from './modules/ScheduleMechanic';
import SummaryMechanic from './modules/SummaryMechanic';
import { adminRules } from './admin/rules';
import { mapRules } from './map/rules';
import { officeRules } from './office/rules';
import { schedulerRules } from './scheduler/rules';

export const MECHANIC_REGISTRY: MechanicRegistry = {
  office: {
    mechanic_id: 'office',
    label: 'Oficina Central',
    tab_id: 'interaction',
    Module: OfficeMechanic,
    rules: officeRules
  },
  stakeholders: {
    mechanic_id: 'stakeholders',
    label: 'Relaciones',
    tab_id: 'summary',
    Module: SummaryMechanic
  },
  map: {
    mechanic_id: 'map',
    label: 'Mapa',
    tab_id: 'map',
    Module: MapMechanic,
    rules: mapRules
  },
  scheduler: {
    mechanic_id: 'scheduler',
    label: 'Agenda',
    tab_id: 'schedule',
    Module: ScheduleMechanic,
    rules: schedulerRules
  },
  inbox: {
    mechanic_id: 'inbox',
    label: 'Correos',
    tab_id: 'emails',
    Module: EmailMechanic
  },
  documents: {
    mechanic_id: 'documents',
    label: 'Archivos',
    tab_id: 'documents',
    Module: DocumentsMechanic
  },
  data_export: {
    mechanic_id: 'data_export',
    label: 'Datos',
    tab_id: 'data_export',
    Module: DataExportMechanic
  },
  experimental_map: {
    mechanic_id: 'experimental_map',
    label: 'Mapa Experimental',
    tab_id: 'experimental_map',
    Module: ExperimentalMapMechanic
  },
  innovatec_office: {
    mechanic_id: 'office',
    label: 'Oficina Central',
    tab_id: 'interaction',
    Module: InnovatecOfficeMechanic
  },
  innovatec_inbox: {
    mechanic_id: 'inbox',
    label: 'Correos',
    tab_id: 'emails',
    Module: InnovatecEmailMechanic
  },
  innovatec_calendar: {
    mechanic_id: 'calendar',
    label: 'Calendario',
    tab_id: 'calendar',
    Module: InnovatecCalendarMechanic
  },
  innovatec_stakeholders: {
    mechanic_id: 'stakeholders',
    label: 'Stakeholders',
    tab_id: 'summary',
    Module: InnovatecSummaryMechanic
  },
  innovatec_experimental_map: {
    mechanic_id: 'experimental_map',
    label: 'Mapa Experimental',
    tab_id: 'experimental_map',
    Module: InnovatecExperimentalMapMechanic
  },
  admin: {
    mechanic_id: 'admin',
    label: 'Administracion',
    tab_id: 'admin',
    rules: adminRules
  }
};
