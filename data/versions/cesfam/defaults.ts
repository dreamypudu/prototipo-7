import { ActivityType, GameState, TimeSlotType, DirectorObjectives, StaffMember, ScheduleAssignment, DayOfWeek, ScheduleBlock, RoomDefinition } from '../../../types';
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
    // BOXES
    { id: 'BOX_1', name: 'Box 1', sector: 'AZUL', gridArea: '1 / 1 / 2 / 2', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },
    { id: 'BOX_2', name: 'Box 2', sector: 'AZUL', gridArea: '1 / 2 / 2 / 3', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },
    { id: 'BOX_3', name: 'Box 3', sector: 'AZUL', gridArea: '1 / 3 / 2 / 4', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },
    { id: 'BOX_4', name: 'Box 4', sector: 'ROJO', gridArea: '2 / 1 / 3 / 2', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },
    { id: 'BOX_5', name: 'Box 5', sector: 'ROJO', gridArea: '2 / 2 / 3 / 3', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },
    { id: 'BOX_6', name: 'Box 6', sector: 'ROJO', gridArea: '2 / 3 / 3 / 4', color: 'bg-slate-900/25 border-slate-400/50 hover:bg-slate-800/45' },

    // BOTTOM
    { id: 'OFICINA_TECNICA', name: 'Oficinas Administrativas', sector: 'AMARILLO', gridArea: '3 / 1 / 4 / 2', color: 'bg-gray-900/30 border-gray-500/50 hover:bg-gray-800/50' },
    { id: 'AREA_COMUN', name: 'Auditorio', sector: 'COMMON', gridArea: '3 / 2 / 4 / 3', color: 'bg-gray-900/30 border-gray-600/50 hover:bg-gray-800/50' },
    { id: 'TERRENO', name: 'Salida a Terreno', sector: 'OUTSIDE', gridArea: '3 / 3 / 4 / 4', color: 'bg-green-900/20 border-green-500/50 hover:bg-green-900/40' },
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
    if (staff.id === 'marcela-soto') return 'OFICINA_TECNICA'; // Suele estar gestionando
    if (staff.id === 'eduardo-naranjo') return 'BOX_5';
    if (staff.id === 'claudia-morales') return 'OFICINA_TECNICA';
    
    // AMARILLO
    if (staff.id === 'daniel-rios') return 'TERRENO'; // Siempre en la calle
    if (staff.id === 'francisca-solis') return 'BOX_6';
    if (staff.id === 'ricardo-meza') return 'BOX_4'; 

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
                if (staff.id === 'marcela-soto' || staff.id === 'claudia-morales') {
                    activity = 'ADMIN';
                    roomId = 'OFICINA_TECNICA';
                }
                if (staff.id === 'andres-guzman' && day === 'Viernes') {
                    activity = 'ADMIN'; // Investigacion
                    roomId = 'OFICINA_TECNICA';
                }
                if (day === 'Lunes' && block === 'AM') {
                    if (staff.id === 'andres-guzman') {
                        activity = 'CLINICAL';
                        roomId = 'BOX_5';
                    }
                }
                if (day === 'Miércoles' && block === 'PM' && staff.id === 'marcela-soto') {
                    activity = 'CLINICAL';
                    roomId = 'BOX_6';
                }
                if (day === 'Viernes' && block === 'AM' && staff.id === 'paz-herrera') {
                    activity = 'CLINICAL';
                    roomId = 'BOX_3';
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

type PresentMapSlotAssignments = Array<{
    staffId: string;
    activity: ActivityType;
    roomId: string;
}>;

const PRESENT_MAP_LAYOUTS: Array<{
    day: DayOfWeek;
    block: ScheduleBlock;
    assignments: PresentMapSlotAssignments;
}> = [
    {
        day: DAYS_OF_WEEK[2],
        block: 'AM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_3' },
            { staffId: 'marcela-soto', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'claudia-morales', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'ricardo-meza', activity: 'TRAINING', roomId: 'AREA_COMUN' },
        ],
    },
    {
        day: DAYS_OF_WEEK[2],
        block: 'PM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'marcela-soto', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'claudia-morales', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_3' },
            { staffId: 'ricardo-meza', activity: 'TRAINING', roomId: 'AREA_COMUN' },
        ],
    },
    {
        day: DAYS_OF_WEEK[3],
        block: 'AM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'marcela-soto', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_3' },
            { staffId: 'claudia-morales', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'ricardo-meza', activity: 'TRAINING', roomId: 'AREA_COMUN' },
        ],
    },
    {
        day: DAYS_OF_WEEK[3],
        block: 'PM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'marcela-soto', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'claudia-morales', activity: 'CLINICAL', roomId: 'BOX_3' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'ricardo-meza', activity: 'TRAINING', roomId: 'AREA_COMUN' },
        ],
    },
    {
        day: DAYS_OF_WEEK[4],
        block: 'AM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'marcela-soto', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'claudia-morales', activity: 'CLINICAL', roomId: 'BOX_3' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'ricardo-meza', activity: 'TRAINING', roomId: 'AREA_COMUN' },
        ],
    },
    {
        day: DAYS_OF_WEEK[4],
        block: 'PM',
        assignments: [
            { staffId: 'andres-guzman', activity: 'TRAINING', roomId: 'AREA_COMUN' },
            { staffId: 'paz-herrera', activity: 'CLINICAL', roomId: 'BOX_1' },
            { staffId: 'javier-castro', activity: 'CLINICAL', roomId: 'BOX_2' },
            { staffId: 'marcela-soto', activity: 'ADMIN', roomId: 'OFICINA_TECNICA' },
            { staffId: 'eduardo-naranjo', activity: 'CLINICAL', roomId: 'BOX_4' },
            { staffId: 'claudia-morales', activity: 'CLINICAL', roomId: 'BOX_5' },
            { staffId: 'daniel-rios', activity: 'TERRAIN', roomId: 'TERRENO' },
            { staffId: 'francisca-solis', activity: 'CLINICAL', roomId: 'BOX_6' },
            { staffId: 'ricardo-meza', activity: 'CLINICAL', roomId: 'BOX_3' },
        ],
    },
];

export const CESFAM_PRESENT_MAP_SCHEDULE: ScheduleAssignment[] = PRESENT_MAP_LAYOUTS.flatMap(({ day, block, assignments }) =>
    assignments.map(({ staffId, activity, roomId }) => ({
        staffId,
        day,
        block,
        activity,
        roomId,
    }))
);


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
  day: 3,
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
  lastScheduleSubmissionDay: null,
  mechanicEvents: [],
  canonicalActions: [],
  expectedActions: [],
  comparisons: [],
  dailyResolutions: [],
  resolvedExpectedActionIds: []
};

export const buildInitialGameState = (): GameState => structuredClone(INITIAL_GAME_STATE);
