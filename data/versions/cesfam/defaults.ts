import { GameState, TimeSlotType, DirectorObjectives, StaffMember, ScheduleAssignment, DayOfWeek, ScheduleBlock, RoomDefinition } from '../../../types';
import { CESFAM_STAKEHOLDERS } from './stakeholders';

export const TIME_SLOTS: TimeSlotType[] = ['mañana', 'tarde'];

export const SECRETARY_ROLE = "Asistente Administrativa";

export const DAYS_OF_WEEK: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
export const SCHEDULE_BLOCKS: ScheduleBlock[] = ['AM', 'PM'];

// Helper to convert linear Game Day (1..28) to Week/Day format
export const getGameDate = (dayNumber: number): { week: number, dayName: string, dayIndex: number } => {
    // Assuming 5 work days per week
    const dayIndex = (dayNumber - 1) % 5;
    const week = Math.floor((dayNumber - 1) / 5) + 1;
    return {
        week,
        dayName: DAYS_OF_WEEK[dayIndex],
        dayIndex
    };
};

// Room Definitions used in Map and Scheduler
// Updated colors to be translucent (bg-opacity-20) for better background visibility
export const CESFAM_ROOMS: RoomDefinition[] = [
    { id: 'COORDINACION', name: 'Coordinación', sector: 'ADMIN', gridArea: '1 / 1 / 2 / 2', color: 'bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/40' },
    { id: 'FARMACIA', name: 'Farmacia', sector: 'ADMIN', gridArea: '1 / 2 / 2 / 4', color: 'bg-teal-900/20 border-teal-500/50 hover:bg-teal-900/40' },
    
    // AZUL (Left)
    { id: 'BOX_1', name: 'Box 1 (Azul)', sector: 'AZUL', gridArea: '2 / 1 / 3 / 2', color: 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/40' },
    { id: 'BOX_2', name: 'Box 2 (Azul)', sector: 'AZUL', gridArea: '3 / 1 / 4 / 2', color: 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/40' },
    { id: 'BOX_3', name: 'Box 3 (Azul)', sector: 'AZUL', gridArea: '4 / 1 / 5 / 2', color: 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/40' },
    
    // ROJO (Center)
    { id: 'BOX_4', name: 'Box 4 (Rojo)', sector: 'ROJO', gridArea: '2 / 2 / 3 / 3', color: 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40' },
    { id: 'BOX_5', name: 'Box 5 (Rojo)', sector: 'ROJO', gridArea: '3 / 2 / 4 / 3', color: 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40' },
    { id: 'BOX_6', name: 'Box 6 (Rojo)', sector: 'ROJO', gridArea: '4 / 2 / 5 / 3', color: 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40' },

    // AMARILLO (Right)
    { id: 'BOX_7', name: 'Box 7 (Amarillo)', sector: 'AMARILLO', gridArea: '2 / 3 / 3 / 4', color: 'bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-900/40' },
    { id: 'BOX_8', name: 'Box 8 (Amarillo)', sector: 'AMARILLO', gridArea: '3 / 3 / 4 / 4', color: 'bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-900/40' },
    { id: 'OFICINA_TECNICA', name: 'Oficinas Técnicas', sector: 'AMARILLO', gridArea: '4 / 3 / 5 / 4', color: 'bg-gray-900/30 border-gray-500/50 hover:bg-gray-800/50' }, 

    // BOTTOM
    { id: 'AREA_COMUN', name: 'Área Común', sector: 'COMMON', gridArea: '5 / 1 / 6 / 3', color: 'bg-gray-900/30 border-gray-600/50 hover:bg-gray-800/50' },
    { id: 'TERRENO', name: 'Salida a Terreno', sector: 'OUTSIDE', gridArea: '5 / 3 / 6 / 4', color: 'bg-green-900/20 border-green-500/50 hover:bg-green-900/40' },
];

export const INITIAL_STAFF: StaffMember[] = [
    // --- SECTOR AZUL (Elite, Academia) ---
    { 
        id: 'andres-guzman', 
        name: 'Dr. Andrés Guzmán', 
        role: 'Medico', 
        sectorId: 'AZUL', 
        burnout: 10, 
        morale: 90, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/haTtDtC.png" 
    },
    { 
        id: 'paz-herrera', 
        name: 'Enf. Paz Herrera', 
        role: 'Enfermera', 
        sectorId: 'AZUL', 
        burnout: 30, 
        morale: 85, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/JLlAfIm.png" 
    },
    { 
        id: 'javier-castro', 
        name: 'TENS Javier Castro', 
        role: 'TENS', 
        sectorId: 'AZUL', 
        burnout: 60, // Riesgo Oculto inicial alto
        morale: 50, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/egOSYNj.png" 
    },

    // --- SECTOR ROJO (Normativa, Derechos) ---
    { 
        id: 'marcela-soto', 
        name: 'Enf. Marcela Soto', 
        role: 'Enfermera', 
        sectorId: 'ROJO', 
        burnout: 20, 
        morale: 80, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/JLlAfIm.png" 
    },
    { 
        id: 'eduardo-naranjo', 
        name: 'Dr. Eduardo Naranjo', 
        role: 'Medico', 
        sectorId: 'ROJO', 
        burnout: 40, 
        morale: 60, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/haTtDtC.png" 
    },
    { 
        id: 'claudia-morales', 
        name: 'TENS Claudia Morales', 
        role: 'TENS', 
        sectorId: 'ROJO', 
        burnout: 30, 
        morale: 70, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/egOSYNj.png" 
    },

    // --- SECTOR AMARILLO (Comunidad, Calle) ---
    { 
        id: 'daniel-rios', 
        name: 'Sr. Daniel Ríos', 
        role: 'TENS', 
        sectorId: 'AMARILLO', 
        burnout: 50, 
        morale: 90, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/egOSYNj.png" 
    },
    { 
        id: 'francisca-solis', 
        name: 'Enf. Francisca Solís', 
        role: 'Enfermera', 
        sectorId: 'AMARILLO', 
        burnout: 60, 
        morale: 40, // Moral baja por empatía/sufrimiento
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/JLlAfIm.png" 
    },
    { 
        id: 'ricardo-meza', 
        name: 'Dr. Ricardo Meza', 
        role: 'Medico', 
        sectorId: 'AMARILLO', 
        burnout: 70, // Riesgo de renuncia
        morale: 30, 
        contractHours: 44,
        portraitUrl: "https://i.imgur.com/haTtDtC.png" 
    },
];

// Helper to determine default room based on staff ID and sector
const getDefaultRoom = (staff: StaffMember): string => {
    // AZUL
    if (staff.id === 'andres-guzman') return 'BOX_1'; // Box Principal Azul
    if (staff.id === 'paz-herrera') return 'BOX_2';
    if (staff.id === 'javier-castro') return 'BOX_3';
    
    // ROJO
    if (staff.id === 'marcela-soto') return 'COORDINACION'; // Suele estar gestionando
    if (staff.id === 'eduardo-naranjo') return 'BOX_5';
    if (staff.id === 'claudia-morales') return 'BOX_4';
    
    // AMARILLO
    if (staff.id === 'daniel-rios') return 'TERRENO'; // Siempre en la calle
    if (staff.id === 'francisca-solis') return 'BOX_7';
    if (staff.id === 'ricardo-meza') return 'BOX_8'; 

    return 'AREA_COMUN';
};

// Helper to generate default Clinical schedule
const generateDefaultSchedule = (): ScheduleAssignment[] => {
    const assignments: ScheduleAssignment[] = [];
    INITIAL_STAFF.forEach(staff => {
        const defaultRoom = getDefaultRoom(staff);
        DAYS_OF_WEEK.forEach(day => {
            SCHEDULE_BLOCKS.forEach(block => {
                // Default assignments based on personality
                let activity: 'CLINICAL' | 'ADMIN' | 'TERRAIN' | 'TRAINING' = 'CLINICAL';
                let roomId = defaultRoom;

                if (staff.id === 'daniel-rios') {
                    activity = 'TERRAIN';
                    roomId = 'TERRENO';
                }
                if (staff.id === 'andres-guzman' && day === 'Viernes') {
                    activity = 'ADMIN'; // Investigación
                    roomId = 'OFICINA_TECNICA';
                }

                assignments.push({
                    staffId: staff.id,
                    day,
                    block,
                    activity, 
                    roomId
                });
            });
        });
    });
    return assignments;
};


export const DIRECTOR_OBJECTIVES: DirectorObjectives = {
  maxDeadline: 28,
  minBudget: 0,
  minReputation: 30,
  minProgress: 100,
  minTrustWithRequired: 40,
  requiredStakeholdersRoles: [
    "Jefe Sector Azul",
    "Jefa Sector Rojo",
    "Jefe Sector Amarillo"
  ]
};

export const INITIAL_GAME_STATE: GameState = {
  playerName: '',
  projectTitle: "Gestión Directiva CESFAM: Los Tres Sectores",
  budget: 1000000,
  day: 1,
  timeSlot: 'mañana',
  projectDeadline: 28,
  reputation: 60,
  projectProgress: 0,
  stakeholders: CESFAM_STAKEHOLDERS,
  staffRoster: INITIAL_STAFF,
  weeklySchedule: generateDefaultSchedule(),
  calendar: [],
  eventsLog: [],
  history: {},
  strategy: {
    budgetAllocation: {
      community: 20,
      environment: 20,
      pr: 20,
      legal: 20,
      safety: 20,
    },
    projectScope: {
      technicalApproach: 'standard',
      mitigationMeasures: [],
    },
    timeline: {
      schedule: 'normal',
    },
    publicRelations: {
      transparency: 'controlled',
      narrative: 'jobs',
    },
  },
  completedScenarios: [],
  completedSequences: [],
  criticalWarnings: [],
  decisionLog: [],
  questionLog: [],
  processLog: [],
  inbox: [],
  stakeholder_preferences: {},
  readDocuments: [],
  playerActionsLog: [],
  playerNotes: "",
  scenarioSchedule: {}, // Initialize empty, will be populated by App on startup
  mechanicEvents: [],
  canonicalActions: [],
  expectedActions: [],
  comparisons: []
};

export const buildInitialGameState = (): GameState => structuredClone(INITIAL_GAME_STATE);
