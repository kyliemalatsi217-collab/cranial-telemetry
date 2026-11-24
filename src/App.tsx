import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Eye,
  Sun,
  Download,
  Trash2,
  Check,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Activity,
  Sliders,
  FileText,
  Bell,
  BellRing,
  Smartphone,
  Laptop,
  Cloud,
  X,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Play,
  Calendar
} from './icons';

/**
 * CRANIAL TELEMETRY LOG (v2.0)
 * Aesthetic: Swiss Clinical Editorial / Dieter Rams Optical Instrument
 * Zero-glare matte surfaces, hairline 1px borders, tabular numerals, photophobia-safe mode,
 * 18:00 daily preventative tracking, categorized acute meds, and 2-hour follow-up pop-up alerts.
 */

// Anatomical Regions Definition (Orthographic Anterior & Posterior)
const CRANIAL_REGIONS = {
  anterior: [
    { id: 'frontal', label: 'Frontal / Forehead', short: 'Frontal', view: 'anterior' },
    { id: 'temple_l', label: 'Left Temple', short: 'L. Temple', view: 'anterior' },
    { id: 'temple_r', label: 'Right Temple', short: 'R. Temple', view: 'anterior' },
    { id: 'ocular_l', label: 'Left Ocular / Retro-orbital', short: 'L. Ocular', view: 'anterior' },
    { id: 'ocular_r', label: 'Right Ocular / Retro-orbital', short: 'R. Ocular', view: 'anterior' },
    { id: 'sinus', label: 'Nasal Bridge / Sinus', short: 'Sinus', view: 'anterior' },
    { id: 'tmj_l', label: 'Left Jaw / TMJ', short: 'L. TMJ', view: 'anterior' },
    { id: 'tmj_r', label: 'Right Jaw / TMJ', short: 'R. TMJ', view: 'anterior' },
  ],
  posterior: [
    { id: 'vertex', label: 'Vertex / Crown', short: 'Vertex', view: 'posterior' },
    { id: 'parietal_l', label: 'Left Parietal', short: 'L. Parietal', view: 'posterior' },
    { id: 'parietal_r', label: 'Right Parietal', short: 'R. Parietal', view: 'posterior' },
    { id: 'occipital', label: 'Occipital / Skull Base', short: 'Occipital', view: 'posterior' },
    { id: 'cervical', label: 'Upper Cervical / Neck', short: 'Cervical', view: 'posterior' },
  ]
};

const ALL_REGIONS_MAP = [...CRANIAL_REGIONS.anterior, ...CRANIAL_REGIONS.posterior].reduce(
  (acc, item) => ({ ...acc, [item.id]: item }),
  {}
);

const CRANIAL_PRESETS = [
  { id: 'left_hemi', label: 'Left Unilateral', zones: ['frontal', 'temple_l', 'ocular_l', 'parietal_l'] },
  { id: 'right_hemi', label: 'Right Unilateral', zones: ['frontal', 'temple_r', 'ocular_r', 'parietal_r'] },
  { id: 'tension_band', label: 'Band / Tension', zones: ['frontal', 'temple_l', 'temple_r', 'occipital'] },
  { id: 'retro_orbital', label: 'Behind Eyes', zones: ['ocular_l', 'ocular_r', 'sinus'] },
  { id: 'cervicogenic', label: 'Neck / Base', zones: ['occipital', 'cervical'] },
];

const TRIGGER_OPTIONS = [
  'Poor Sleep',
  'Screen Glare',
  'Dehydration',
  'Missed Meal',
  'Barometric Drop',
  'Stress',
  'Bright Light',
  'Neck Tension',
];

const SYMPTOM_OPTIONS = [
  'Aura',
  'Photophobia',
  'Phonophobia',
  'Nausea',
  'Brain Fog',
  'Dizziness',
  'Throbbing Pulse',
];

// Categorized Acute Medications Protocol
const ACUTE_MED_PROTOCOL = {
  triptan: [
    { id: 'maxalt_10', name: 'Maxalt RPD 10mg', generic: 'Rizatriptan', tier: 'triptan' }
  ],
  rescue: [
    { id: 'tramadol_100', name: 'Tramadol SR 100mg', generic: 'Sustained-Release Opioid', tier: 'rescue' }
  ],
  otc: [
    { id: 'panado_500', name: 'Panado 500mg', generic: 'Paracetamol', tier: 'otc' },
    { id: 'myprodol', name: 'Myprodol', generic: 'Ibuprofen/Paracetamol/Codeine', tier: 'otc' },
    { id: 'nurofen_400', name: 'Nurofen / Ibuprofen 400mg', generic: 'NSAID', tier: 'otc' },
    { id: 'syndol', name: 'Syndol', generic: 'Paracetamol/Codeine/Doxylamine', tier: 'otc' },
    { id: 'disprin', name: 'Disprin / Aspirin', generic: 'Acetylsalicylic Acid', tier: 'otc' },
  ]
};

const STORAGE_KEY_LOGS = 'cranial_telemetry_logs_v2';
const STORAGE_KEY_PREV = 'cranial_telemetry_preventatives_v2';
const STORAGE_KEY_SYNC = 'cranial_telemetry_sync_cfg_v2';

const getTodayDateKey = (dateObj = new Date()) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Pre-populated clinical baseline entries
const generateSampleEntries = () => {
  const now = new Date();
  const daysAgo = (d, hours = 10, mins = 15) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    dt.setHours(hours, mins, 0, 0);
    return dt.toISOString();
  };

  return [
    {
      id: 'sample-1',
      timestamp: daysAgo(1, 14, 20),
      severity: 7,
      durationMinutes: 180,
      ongoing: false,
      regions: ['temple_l', 'ocular_l', 'frontal'],
      triggers: ['Screen Glare', 'Poor Sleep'],
      symptoms: ['Photophobia', 'Throbbing Pulse'],
      acuteMeds: ['Maxalt RPD 10mg'],
      relief: 'relieved',
      followUpAt: null,
      notes: 'Taken at early onset behind left eye; resolved cleanly within 90 mins.',
      isSample: true,
    },
    {
      id: 'sample-2',
      timestamp: daysAgo(4, 19, 10),
      severity: 9,
      durationMinutes: 360,
      ongoing: false,
      regions: ['temple_r', 'ocular_r', 'occipital', 'cervical'],
      triggers: ['Barometric Drop', 'Stress'],
      symptoms: ['Aura', 'Photophobia', 'Nausea'],
      acuteMeds: ['Maxalt RPD 10mg', 'Tramadol SR 100mg'],
      relief: 'partial',
      followUpAt: null,
      notes: 'Severe breakthrough episode; Tramadol SR 100mg required after initial triptan.',
      isSample: true,
    },
    {
      id: 'sample-3',
      timestamp: daysAgo(8, 11, 30),
      severity: 5,
      durationMinutes: 120,
      ongoing: false,
      regions: ['frontal', 'sinus', 'ocular_l', 'ocular_r'],
      triggers: ['Dehydration', 'Missed Meal'],
      symptoms: ['Brain Fog', 'Phonophobia'],
      acuteMeds: ['Myprodol'],
      relief: 'relieved',
      followUpAt: null,
      notes: 'Bilateral frontal/orbital pressure; responded well to Myprodol and hydration.',
      isSample: true,
    },
    {
      id: 'sample-4',
      timestamp: daysAgo(12, 15, 45),
      severity: 6,
      durationMinutes: 150,
      ongoing: false,
      regions: ['temple_l', 'parietal_l'],
      triggers: ['Poor Sleep', 'Screen Glare'],
      symptoms: ['Photophobia'],
      acuteMeds: ['Maxalt RPD 10mg'],
      relief: 'relieved',
      followUpAt: null,
      notes: 'Left unilateral onset during afternoon display work.',
      isSample: true,
    },
    {
      id: 'sample-5',
      timestamp: daysAgo(16, 13, 0),
      severity: 4,
      durationMinutes: 90,
      ongoing: false,
      regions: ['occipital', 'cervical'],
      triggers: ['Neck Tension'],
      symptoms: ['Brain Fog'],
      acuteMeds: ['Nurofen / Ibuprofen 400mg'],
      relief: 'no_relief',
      followUpAt: null,
      notes: 'Suboccipital tightness; NSAID alone had minimal impact.',
      isSample: true,
    },
  ];
};

// Generate 14 days of realistic preventative adherence history
const generateSamplePreventatives = () => {
  const map = {};
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    const key = getTodayDateKey(dt);
    // High adherence with 1 missed dose 6 days ago for realistic telemetry
    const missed = i === 6;
    map[key] = {
      trepiline_10mg: !missed,
      trepiline_time: !missed ? '18:04' : null,
      toplep_25mg: !missed,
      toplep_time: !missed ? '18:04' : null,
    };
  }
  const todayKey = getTodayDateKey(now);
  map[todayKey] = {
    trepiline_10mg: false,
    trepiline_time: null,
    toplep_25mg: false,
    toplep_time: null,
  };
  return map;
};

const getSeverityMeta = (level) => {
  if (level <= 3) return { label: 'MILD', desc: 'Noticeable discomfort; normal function maintained.' };
  if (level <= 6) return { label: 'MODERATE', desc: 'Distracting pain; requires pacing and glare reduction.' };
  if (level <= 8) return { label: 'SEVERE', desc: 'Marked impairment; acute photophobia or throbbing.' };
  return { label: 'INCAPACITATING', desc: 'Complete functional disruption; dark-room rest mandatory.' };
};

const formatClinicalTimestamp = (isoString) => {
  try {
    const d = new Date(isoString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${mon} · ${hrs}:${mins}`;
  } catch {
    return isoString;
  }
};

const formatCountdown = (msRemaining) => {
  if (msRemaining <= 0) return 'DUE NOW';
  const totalSec = Math.floor(msRemaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const toLocalDatetimeInput = (dateObj = new Date()) => {
  const offset = dateObj.getTimezoneOffset();
  const local = new Date(dateObj.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

/**
 * Architectural SVG Orthographic Cranial Diagram
 * Renders crisp clinical wireframe anatomy with clickable hotzones and frequency heatmap mode.
 */
function CranialDiagram({
  selectedRegions = [],
  onToggleRegion,
  heatmapCounts = null,
  maxHeatCount = 1,
  amberMode = false,
  compact = false,
}) {
  const isHeatmap = Boolean(heatmapCounts);

  const getZoneStyle = (zoneId) => {
    if (isHeatmap) {
      const count = heatmapCounts[zoneId] || 0;
      if (count === 0) {
        return {
          fill: 'transparent',
          stroke: amberMode ? '#47363E' : '#352A2E',
          strokeWidth: '1',
          opacity: 0.65,
        };
      }
      const ratio = Math.max(0.22, count / Math.max(1, maxHeatCount));
      return {
        fill: amberMode ? '#C98598' : '#C97A8E',
        fillOpacity: (0.18 + ratio * 0.62).toFixed(2),
        stroke: amberMode ? '#D996A8' : '#D98FA2',
        strokeWidth: '1.25',
      };
    }

    const active = selectedRegions.includes(zoneId);
    if (active) {
      return {
        fill: amberMode ? '#C98598' : '#C97A8E',
        fillOpacity: amberMode ? '0.40' : '0.36',
        stroke: amberMode ? '#E3A4B6' : '#E2A4B4',
        strokeWidth: '1.4',
      };
    }
    return {
      fill: amberMode ? '#21191E' : '#1B1719',
      fillOpacity: '0.85',
      stroke: amberMode ? '#4A3841' : '#3A2F34',
      strokeWidth: '1',
    };
  };

  const baseLineColor = amberMode ? '#634C56' : '#4E3F46';
  const gridLineColor = amberMode ? '#33262C' : '#282125';
  const labelColor = amberMode ? '#B596A3' : '#968089';

  return (
    <div className={`grid grid-cols-2 ${compact ? 'gap-3' : 'gap-3.5'}`}>
      {/* ANTERIOR / FACIAL ORTHOGRAPHIC VIEW */}
      <div
        className={`relative rounded-xl border ${
          amberMode ? 'border-[#3B2C33] bg-[#181216]' : 'border-[#332A2E] bg-[#181416]'
        } p-2.5 flex flex-col items-center`}
      >
        <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest uppercase mb-1 px-0.5">
          <span style={{ color: labelColor }}>FIG 01. ANTERIOR</span>
          <span style={{ color: labelColor }}>FRONTAL</span>
        </div>

        <svg
          viewBox="0 0 200 235"
          className="w-full max-w-[180px] h-auto select-none"
          role="img"
          aria-label="Anterior Head Pain Map"
        >
          <line x1="100" y1="10" x2="100" y2="225" stroke={gridLineColor} strokeWidth="1" strokeDasharray="2 3" />
          <line x1="18" y1="108" x2="182" y2="108" stroke={gridLineColor} strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="100" cy="108" r="82" fill="none" stroke={gridLineColor} strokeWidth="0.75" />

          <path
            d="M 46 84 C 44 42, 68 22, 100 22 C 132 22, 156 42, 154 84 C 154 112, 150 135, 142 158 C 134 182, 118 202, 100 205 C 82 202, 66 182, 58 158 C 50 135, 46 112, 46 84 Z"
            fill="none"
            stroke={baseLineColor}
            strokeWidth="1.25"
          />

          <path d="M 46 94 C 37 94, 36 124, 47 128" fill="none" stroke={baseLineColor} strokeWidth="1" />
          <path d="M 154 94 C 163 94, 164 124, 153 128" fill="none" stroke={baseLineColor} strokeWidth="1" />
          <path d="M 68 186 L 64 218 M 132 186 L 136 218" fill="none" stroke={baseLineColor} strokeWidth="1" />

          <g onClick={() => !isHeatmap && onToggleRegion('frontal')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 62 56 C 66 34, 82 27, 100 27 C 118 27, 134 34, 138 56 L 132 76 C 112 72, 88 72, 68 76 Z"
              {...getZoneStyle('frontal')}
            />
            <title>Frontal / Forehead</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('temple_l')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 139 58 C 149 65, 151 86, 148 106 L 135 102 C 135 88, 135 74, 139 58 Z"
              {...getZoneStyle('temple_l')}
            />
            <title>Left Temple</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('temple_r')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 61 58 C 51 65, 49 86, 52 106 L 65 102 C 65 88, 65 74, 61 58 Z"
              {...getZoneStyle('temple_r')}
            />
            <title>Right Temple</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('ocular_r')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <ellipse cx="77" cy="96" rx="14" ry="11" {...getZoneStyle('ocular_r')} />
            <path d="M 67 96 Q 77 90 87 96 Q 77 102 67 96 Z" fill="none" stroke={baseLineColor} strokeWidth="0.8" />
            <title>Right Ocular / Behind Eye</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('ocular_l')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <ellipse cx="123" cy="96" rx="14" ry="11" {...getZoneStyle('ocular_l')} />
            <path d="M 113 96 Q 123 90 133 96 Q 123 102 113 96 Z" fill="none" stroke={baseLineColor} strokeWidth="0.8" />
            <title>Left Ocular / Behind Eye</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('sinus')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path d="M 93 80 L 107 80 L 111 124 L 100 130 L 89 124 Z" {...getZoneStyle('sinus')} />
            <title>Sinus / Nasal Bridge</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('tmj_r')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 54 118 L 72 126 L 78 168 L 62 154 C 56 140, 54 128, 54 118 Z"
              {...getZoneStyle('tmj_r')}
            />
            <title>Right Jaw / TMJ</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('tmj_l')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 146 118 L 128 126 L 122 168 L 138 154 C 144 140, 146 128, 146 118 Z"
              {...getZoneStyle('tmj_l')}
            />
            <title>Left Jaw / TMJ</title>
          </g>

          <line x1="87" y1="164" x2="113" y2="164" stroke={baseLineColor} strokeWidth="1" />
          <text x="24" y="222" fill={labelColor} fontSize="9" fontFamily="monospace">R</text>
          <text x="169" y="222" fill={labelColor} fontSize="9" fontFamily="monospace">L</text>
        </svg>
      </div>

      {/* POSTERIOR / CRANIAL ORTHOGRAPHIC VIEW */}
      <div
        className={`relative rounded-xl border ${
          amberMode ? 'border-[#3B2C33] bg-[#181216]' : 'border-[#332A2E] bg-[#181416]'
        } p-2.5 flex flex-col items-center`}
      >
        <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest uppercase mb-1 px-0.5">
          <span style={{ color: labelColor }}>FIG 02. POSTERIOR</span>
          <span style={{ color: labelColor }}>CRANIAL</span>
        </div>

        <svg
          viewBox="0 0 200 235"
          className="w-full max-w-[180px] h-auto select-none"
          role="img"
          aria-label="Posterior Head Pain Map"
        >
          <line x1="100" y1="10" x2="100" y2="225" stroke={gridLineColor} strokeWidth="1" strokeDasharray="2 3" />
          <line x1="18" y1="108" x2="182" y2="108" stroke={gridLineColor} strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="100" cy="108" r="82" fill="none" stroke={gridLineColor} strokeWidth="0.75" />

          <path
            d="M 46 86 C 44 42, 68 22, 100 22 C 132 22, 156 42, 154 86 C 154 116, 146 142, 134 156 L 136 218 L 64 218 L 66 156 C 54 142, 46 116, 46 86 Z"
            fill="none"
            stroke={baseLineColor}
            strokeWidth="1.25"
          />

          <path d="M 46 94 C 37 94, 36 124, 47 128" fill="none" stroke={baseLineColor} strokeWidth="1" />
          <path d="M 154 94 C 163 94, 164 124, 153 128" fill="none" stroke={baseLineColor} strokeWidth="1" />

          <g onClick={() => !isHeatmap && onToggleRegion('vertex')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 64 56 C 70 33, 84 27, 100 27 C 116 27, 130 33, 136 56 L 124 66 L 76 66 Z"
              {...getZoneStyle('vertex')}
            />
            <title>Vertex / Crown</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('parietal_l')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 52 64 L 74 70 L 97 70 L 97 116 L 54 116 C 50 98, 50 80, 52 64 Z"
              {...getZoneStyle('parietal_l')}
            />
            <title>Left Parietal</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('parietal_r')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 148 64 L 126 70 L 103 70 L 103 116 L 146 116 C 150 98, 150 80, 148 64 Z"
              {...getZoneStyle('parietal_r')}
            />
            <title>Right Parietal</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('occipital')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path
              d="M 56 122 L 144 122 C 141 139, 134 150, 126 158 L 74 158 C 66 150, 59 139, 56 122 Z"
              {...getZoneStyle('occipital')}
            />
            <title>Occipital / Skull Base</title>
          </g>

          <g onClick={() => !isHeatmap && onToggleRegion('cervical')} className={!isHeatmap ? 'cursor-pointer' : ''}>
            <path d="M 72 164 L 128 164 L 131 212 L 69 212 Z" {...getZoneStyle('cervical')} />
            <line x1="94" y1="176" x2="106" y2="176" stroke={baseLineColor} strokeWidth="0.9" />
            <line x1="94" y1="188" x2="106" y2="188" stroke={baseLineColor} strokeWidth="0.9" />
            <line x1="94" y1="200" x2="106" y2="200" stroke={baseLineColor} strokeWidth="0.9" />
            <title>Upper Cervical / Neck</title>
          </g>

          <text x="24" y="222" fill={labelColor} fontSize="9" fontFamily="monospace">L</text>
          <text x="169" y="222" fill={labelColor} fontSize="9" fontFamily="monospace">R</text>
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  // Photophobia Low-Stimulus Amber Mode
  const [amberMode, setAmberMode] = useState(false);

  // Mobile/Compact View Tab Switcher ('entry' | 'telemetry') - Both visible side-by-side on lg+ screens
  const [activeMobileTab, setActiveMobileTab] = useState('entry');
  const [selectedStripDateKey, setSelectedStripDateKey] = useState(() => getTodayDateKey());

  // Persistent Episodes State
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read telemetry storage:', e);
    }
    return generateSampleEntries();
  });

  // Persistent Daily 18:00 Preventatives State (Trepiline 10mg & Toplep 25mg)
  const [preventativeLog, setPreventativeLog] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREV);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Failed to read preventative storage:', e);
    }
    return generateSamplePreventatives();
  });

  // Cross-Device Sync & Push Notification Config State
  const [syncConfig, setSyncConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SYNC);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      syncEmail: '',
      deviceLabel: typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile PWA' : 'Laptop Workstation',
      pushEnabled: false,
    };
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to write telemetry logs:', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREV, JSON.stringify(preventativeLog));
    } catch (e) {
      console.error('Failed to write preventative logs:', e);
    }
  }, [preventativeLog]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(syncConfig));
    } catch {}
  }, [syncConfig]);

  // Live Clock Tick for 18:00 Preventative Status & 2-Hour Follow-Up Countdown
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Active 2-Hour Follow-Up Pop-Up Notification State
  const [activeFollowUpModal, setActiveFollowUpModal] = useState(null);
  const triggeredIdsRef = useRef(new Set());

  // Weekly 7-day strip centered/ending around current day for quick visual check-ins
  const weekStripDays = useMemo(() => {
    const base = new Date(nowTs);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const key = getTodayDateKey(d);
      const hasEpisode = entries.some((ep) => getTodayDateKey(new Date(ep.timestamp)) === key);
      const prevRec = preventativeLog[key];
      const prevDone = Boolean(prevRec?.trepiline_10mg || prevRec?.toplep_25mg);
      result.push({
        key,
        dayLabel: dayNames[d.getDay()],
        dateNum: d.getDate(),
        hasEpisode,
        prevDone,
      });
    }
    return result;
  }, [nowTs, entries, preventativeLog]);

  // Monitor scheduled 2-hour follow-ups automatically
  useEffect(() => {
    const dueEntry = entries.find(
      (ep) =>
        ep.followUpAt &&
        ep.relief === 'pending' &&
        new Date(ep.followUpAt).getTime() <= nowTs &&
        !triggeredIdsRef.current.has(ep.id)
    );

    if (dueEntry) {
      triggeredIdsRef.current.add(dueEntry.id);
      setActiveFollowUpModal(dueEntry);

      // Also fire native OS/Browser Pop-Up Notification if permitted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('2-Hour Medication Check · Cranial Telemetry', {
            body: `How did your headache respond 2h after taking ${(dueEntry.acuteMeds || []).join(' + ')}?`,
            tag: `followup-${dueEntry.id}`,
            requireInteraction: true,
          });
        } catch (err) {
          // Fallback handled by in-app pop-up modal
        }
      }
    }
  }, [entries, nowTs]);

  // Today's Preventative Record
  const todayKey = getTodayDateKey(new Date(nowTs));
  const todayPrev = preventativeLog[todayKey] || {
    trepiline_10mg: false,
    trepiline_time: null,
    toplep_25mg: false,
    toplep_time: null,
  };

  // Toggle Trepiline 10mg or Toplep 25mg for today
  const handleTogglePreventative = (medKey) => {
    const nowDate = new Date();
    const timeStr = `${String(nowDate.getHours()).padStart(2, '0')}:${String(nowDate.getMinutes()).padStart(2, '0')}`;
    const isCurrentlyTaken = Boolean(todayPrev[medKey]);

    setPreventativeLog((prev) => ({
      ...prev,
      [todayKey]: {
        ...(prev[todayKey] || {
          trepiline_10mg: false,
          trepiline_time: null,
          toplep_25mg: false,
          toplep_time: null,
        }),
        [medKey]: !isCurrentlyTaken,
        [`${medKey.replace('_10mg', '').replace('_25mg', '')}_time`]: !isCurrentlyTaken ? timeStr : null,
      },
    }));
  };

  // Check if current local time is approaching or past 18:00
  const currentHour = new Date(nowTs).getHours();
  const isEveningWindow = currentHour >= 17;
  const bothPreventativesTaken = todayPrev.trepiline_10mg && todayPrev.toplep_25mg;

  // Rapid Clinical Entry Form State
  const [severity, setSeverity] = useState(6);
  const [selectedRegions, setSelectedRegions] = useState(['temple_l', 'ocular_l']);
  const [timestamp, setTimestamp] = useState(() => toLocalDatetimeInput(new Date()));
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [ongoing, setOngoing] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState(['Screen Glare']);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Photophobia']);
  const [selectedAcuteMeds, setSelectedAcuteMeds] = useState(['Maxalt RPD 10mg']);
  const [customMedInput, setCustomMedInput] = useState('');
  const [notes, setNotes] = useState('');

  // UI Feedback & Ledger State
  const [commitBanner, setCommitBanner] = useState(null);
  const [confirmClearSamples, setConfirmClearSamples] = useState(false);
  const [filterZone, setFilterZone] = useState('ALL');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const handleToggleRegion = (regionId) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]
    );
  };

  const handleApplyPreset = (presetZones) => {
    setSelectedRegions(presetZones);
  };

  const toggleListValue = (list, setter, val) => {
    setter(list.includes(val) ? list.filter((item) => item !== val) : [...list, val]);
  };

  // Commit new migraine telemetry entry & automatically arm 2-hour follow-up timer
  const handleCommitEntry = (e) => {
    e.preventDefault();
    const medsList = [...selectedAcuteMeds];
    if (customMedInput.trim()) {
      medsList.push(customMedInput.trim());
    }

    const occurredDate = new Date(timestamp);
    const hasAcuteMeds = medsList.length > 0;
    // Schedule 2-hour follow-up check if acute meds were logged
    const followUpAt = hasAcuteMeds
      ? new Date(occurredDate.getTime() + 2 * 60 * 60 * 1000).toISOString()
      : null;

    const newEntry = {
      id: `ep-${Date.now()}`,
      timestamp: occurredDate.toISOString(),
      severity,
      durationMinutes: ongoing ? 0 : Number(durationMinutes) || 0,
      ongoing,
      regions: selectedRegions,
      triggers: selectedTriggers,
      symptoms: selectedSymptoms,
      acuteMeds: medsList,
      relief: hasAcuteMeds ? 'pending' : 'none_taken',
      followUpAt,
      notes: notes.trim(),
      isSample: false,
    };

    setEntries((prev) => [newEntry, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setNotes('');
    setCustomMedInput('');
    setTimestamp(toLocalDatetimeInput(new Date()));
    setCommitBanner(hasAcuteMeds ? 'LOGGED · 2H FOLLOW-UP ARMED' : 'TELEMETRY RECORD COMMITTED');
    setTimeout(() => setCommitBanner(null), 3800);
  };

  // Resolve 2-hour follow-up pop-up outcome
  const handleResolveFollowUp = (entryId, outcome) => {
    setEntries((prev) =>
      prev.map((ep) =>
        ep.id === entryId
          ? { ...ep, relief: outcome, followUpAt: null }
          : ep
      )
    );
    setActiveFollowUpModal(null);
  };

  // Simulate immediate 2-hour pop-up notification for testing or early check-in
  const handleSimulateFollowUp = (targetEntry = null) => {
    const candidate =
      targetEntry ||
      entries.find((ep) => ep.relief === 'pending' && (ep.acuteMeds || []).length > 0) ||
      entries.find((ep) => (ep.acuteMeds || []).length > 0);

    if (!candidate) return;

    setActiveFollowUpModal(candidate);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('2-Hour Medication Check · Cranial Telemetry', {
          body: `How did your headache respond 2h after taking ${(candidate.acuteMeds || []).join(' + ')}?`,
          tag: `sim-followup-${candidate.id}`,
        });
      } catch {}
    }
  };

  // Request Browser Notification Permission
  const handleEnableBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setSyncConfig((prev) => ({ ...prev, pushEnabled: true }));
      }
    } catch (err) {
      console.error('Notification permission request failed:', err);
    }
  };

  // Cycle relief outcome directly in ledger
  const cycleReliefStatus = (entryId) => {
    const order = ['pending', 'relieved', 'partial', 'no_relief'];
    setEntries((prev) =>
      prev.map((ep) => {
        if (ep.id !== entryId) return ep;
        const currentIdx = order.indexOf(ep.relief);
        const nextIdx = (currentIdx + 1) % order.length;
        return { ...ep, relief: order[nextIdx], followUpAt: null };
      })
    );
  };

  const handleDeleteEntry = (entryId) => {
    setEntries((prev) => prev.filter((ep) => ep.id !== entryId));
    if (activeFollowUpModal?.id === entryId) {
      setActiveFollowUpModal(null);
    }
  };

  const handleClearSampleData = () => {
    setEntries((prev) => prev.filter((ep) => !ep.isSample));
    setConfirmClearSamples(false);
  };

  // Export CSV including daily preventatives summary & episode ledger
  const handleExportCSV = () => {
    const headers = [
      'Date_ISO',
      'Severity_1_to_10',
      'Duration_Mins',
      'Status',
      'Cranial_Zones',
      'Triggers',
      'Symptoms',
      'Acute_Medications',
      'Two_Hour_Relief_Outcome',
      'Clinical_Notes',
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = entries.map((ep) => [
      escapeCsv(ep.timestamp),
      ep.severity,
      ep.ongoing ? 'ONGOING' : ep.durationMinutes,
      escapeCsv(ep.ongoing ? 'Active' : 'Resolved'),
      escapeCsv((ep.regions || []).map((r) => ALL_REGIONS_MAP[r]?.short || r).join('; ')),
      escapeCsv((ep.triggers || []).join('; ')),
      escapeCsv((ep.symptoms || []).join('; ')),
      escapeCsv((ep.acuteMeds || []).join('; ') || 'None'),
      escapeCsv(ep.relief),
      escapeCsv(ep.notes),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cranial-telemetry-${getTodayDateKey()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Computed Clinical Telemetry & Medication Analytics
  const analytics = useMemo(() => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const recent30 = entries.filter((ep) => now - new Date(ep.timestamp).getTime() <= thirtyDaysMs);

    const episodeCount = recent30.length;
    const meanSeverity =
      episodeCount > 0
        ? (recent30.reduce((sum, ep) => sum + ep.severity, 0) / episodeCount).toFixed(1)
        : '0.0';

    // Monthly Maxalt RPD 10mg count (important for triptan overuse monitoring, typically <= 9-10/month)
    const currentMonthPrefix = getTodayDateKey().slice(0, 7); // YYYY-MM
    const monthlyMaxaltCount = entries.filter(
      (ep) =>
        ep.timestamp.startsWith(currentMonthPrefix) &&
        (ep.acuteMeds || []).some((m) => m.toLowerCase().includes('maxalt'))
    ).length;

    // 14-day Preventative Adherence Rate
    const prevKeys = Object.keys(preventativeLog);
    let totalDoseSlots = 0;
    let takenDoseSlots = 0;
    prevKeys.forEach((k) => {
      const rec = preventativeLog[k];
      if (!rec) return;
      totalDoseSlots += 2;
      if (rec.trepiline_10mg) takenDoseSlots += 1;
      if (rec.toplep_25mg) takenDoseSlots += 1;
    });
    const preventativeAdherencePct =
      totalDoseSlots > 0 ? Math.round((takenDoseSlots / totalDoseSlots) * 100) : 100;

    // Region frequencies
    const regionCounts = {};
    entries.forEach((ep) => {
      (ep.regions || []).forEach((r) => {
        regionCounts[r] = (regionCounts[r] || 0) + 1;
      });
    });

    const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
    const topRegionId = sortedRegions[0]?.[0] || null;
    const topRegionLabel = topRegionId ? ALL_REGIONS_MAP[topRegionId]?.short || topRegionId : 'NONE';
    const maxRegionCount = sortedRegions[0]?.[1] || 1;

    // Trigger frequencies
    const triggerCounts = {};
    entries.forEach((ep) => {
      (ep.triggers || []).forEach((t) => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });
    const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);

    // Medication Efficacy Breakdown across Maxalt, Tramadol SR 100, and OTCs
    const medStats = {};
    entries.forEach((ep) => {
      (ep.acuteMeds || []).forEach((medName) => {
        if (!medStats[medName]) {
          medStats[medName] = { total: 0, relieved: 0, partial: 0, noRelief: 0, pending: 0 };
        }
        medStats[medName].total += 1;
        if (ep.relief === 'relieved') medStats[medName].relieved += 1;
        else if (ep.relief === 'partial') medStats[medName].partial += 1;
        else if (ep.relief === 'no_relief') medStats[medName].noRelief += 1;
        else medStats[medName].pending += 1;
      });
    });
    const sortedMeds = Object.entries(medStats).sort((a, b) => b[1].total - a[1].total);

    // Active pending 2-hour follow-up queue
    const pendingFollowUps = entries
      .filter((ep) => ep.relief === 'pending' && (ep.acuteMeds || []).length > 0)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      episodeCount,
      meanSeverity,
      monthlyMaxaltCount,
      preventativeAdherencePct,
      topRegionLabel,
      regionCounts,
      sortedRegions,
      maxRegionCount,
      sortedTriggers,
      sortedMeds,
      pendingFollowUps,
      hasSamples: entries.some((ep) => ep.isSample),
    };
  }, [entries, preventativeLog]);

  const visibleEntries = useMemo(() => {
    if (filterZone === 'ALL') return entries;
    return entries.filter((ep) => (ep.regions || []).includes(filterZone));
  }, [entries, filterZone]);

  const severityMeta = getSeverityMeta(severity);
  const nextPendingFollowUp = analytics.pendingFollowUps[0] || null;
  const nextFollowUpCountdown = nextPendingFollowUp?.followUpAt
    ? formatCountdown(new Date(nextPendingFollowUp.followUpAt).getTime() - nowTs)
    : null;

  // Theme Tokens: Soft Lavender-Lilac & Alabaster default, or Refined Muted Dusty-Rose & Plum-Taupe Soft Dim
  const theme = amberMode
    ? {
        bg: 'bg-[#1A1418]',
        canvas: 'bg-[#211A1F]',
        panel: 'bg-[#2A2127]',
        panelAlt: 'bg-[#332830]',
        border: 'border-[#443640]',
        borderStrong: 'border-[#5C4957]',
        ink: 'text-[#F2E6EC]',
        inkMuted: 'text-[#B59DA8]',
        accentBg: 'bg-[#C98598]',
        accentText: 'text-[#1D1519]',
        accentBorder: 'border-[#D493A5]',
        softLavenderTile: 'bg-[#352B38] border-[#4F4054]',
        softRoseTile: 'bg-[#3D2831] border-[#593B48]',
        softMintTile: 'bg-[#283530] border-[#3C5048]',
        softApricotTile: 'bg-[#3C2E2B] border-[#57433E]',
        dockBg: 'bg-[#151013] border-[#3A2D36] text-[#F2E6EC]',
        transition: 'transition-colors duration-200',
      }
    : {
        bg: 'bg-[#ECE9F7]',
        canvas: 'bg-[#F8F7FC]',
        panel: 'bg-[#FFFFFF]',
        panelAlt: 'bg-[#F3F0FA]',
        border: 'border-[#E3DFEE]',
        borderStrong: 'border-[#D2CCE4]',
        ink: 'text-[#23202A]',
        inkMuted: 'text-[#756F82]',
        accentBg: 'bg-[#9E8CE6]',
        accentText: 'text-[#FFFFFF]',
        accentBorder: 'border-[#8D7AD9]',
        softLavenderTile: 'bg-[#E6E0FA] border-[#D4CBF5]',
        softRoseTile: 'bg-[#F5E1E7] border-[#E7C9D2]',
        softMintTile: 'bg-[#DFF0E8] border-[#C5E2D4]',
        softApricotTile: 'bg-[#FBEAD6] border-[#EED5B6]',
        dockBg: 'bg-[#17151C] border-[#2C2836] text-[#F7F5FC]',
        transition: 'transition-all duration-200',
      };

  const isCloudConfigured = Boolean(syncConfig.supabaseUrl && syncConfig.supabaseAnonKey);

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.ink} pb-24 lg:pb-12 font-sans antialiased selection:bg-[#D9B8EB] selection:text-[#23202A]`}
      style={{ fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"' }}
    >
      {/* =====================================================================
          2-HOUR MEDICATION EFFICACY POP-UP NOTIFICATION MODAL / BANNER
         ===================================================================== */}
      {activeFollowUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#17151C]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="followup-popup-title"
        >
          <div
            className={`w-full max-w-md rounded-3xl overflow-hidden border ${theme.borderStrong} ${theme.panel} shadow-xl`}
          >
            {/* Pop-Up Header */}
            <div className={`px-5 py-3.5 border-b ${theme.border} ${theme.softLavenderTile} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <BellRing className={`w-4 h-4 ${amberMode ? 'text-[#E3A864]' : 'text-[#6B57B8]'}`} />
                <span
                  id="followup-popup-title"
                  className="text-xs font-semibold tracking-wide uppercase"
                >
                  2-Hour Medication Check
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveFollowUpModal(null)}
                aria-label="Snooze or dismiss pop-up"
                className={`p-1.5 rounded-full ${theme.inkMuted} hover:${theme.ink} cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pop-Up Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className={`text-[11px] font-medium uppercase tracking-wider ${theme.inkMuted}`}>
                  Logged {formatClinicalTimestamp(activeFollowUpModal.timestamp)} · Pain{' '}
                  {activeFollowUpModal.severity}/10
                </div>
                <p className="text-sm leading-relaxed">
                  It has been 2 hours since taking{' '}
                  <span className="font-semibold">
                    {(activeFollowUpModal.acuteMeds || []).join(' + ') || 'acute medication'}
                  </span>
                  . How are you feeling now?
                </p>
              </div>

              {/* Affected Regions Context */}
              {(activeFollowUpModal.regions || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeFollowUpModal.regions.map((rId) => (
                    <span
                      key={rId}
                      className={`text-[11px] font-medium rounded-full px-3 py-0.5 border ${theme.border} ${theme.panelAlt}`}
                    >
                      {ALL_REGIONS_MAP[rId]?.short || rId}
                    </span>
                  ))}
                </div>
              )}

              {/* One-Tap Clinical Efficacy Outcome Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleResolveFollowUp(activeFollowUpModal.id, 'relieved')}
                  className={`py-3 px-3 rounded-2xl border text-xs font-semibold cursor-pointer ${
                    amberMode
                      ? 'border-[#C98A46] bg-[#C98A46] text-[#14100C]'
                      : 'border-[#A7D3BE] bg-[#DFF0E8] text-[#28543E] hover:bg-[#CFE8DC]'
                  }`}
                >
                  ✓ Relieved
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveFollowUp(activeFollowUpModal.id, 'partial')}
                  className={`py-3 px-3 rounded-2xl border text-xs font-semibold cursor-pointer ${
                    amberMode
                      ? 'border-[#8A6840] bg-[#2B2116] text-[#E3A864]'
                      : 'border-[#EED5B6] bg-[#FBEAD6] text-[#6E4C24] hover:bg-[#F7DFC3]'
                  }`}
                >
                  ◑ Partial
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveFollowUp(activeFollowUpModal.id, 'no_relief')}
                  className={`py-3 px-3 rounded-2xl border text-xs font-semibold cursor-pointer ${
                    amberMode
                      ? 'border-[#694D2F] bg-[#211A13] text-[#C4935B]'
                      : 'border-[#E7C9D2] bg-[#F5E1E7] text-[#7A3E52] hover:bg-[#EED2DC]'
                  }`}
                >
                  ✕ No Effect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CROSS-DEVICE SYNC & PUSH NOTIFICATIONS DRAWER MODAL
         ===================================================================== */}
      {isSyncModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17151C]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sync-modal-title"
        >
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden border ${theme.borderStrong} ${theme.panel} max-h-[90vh] overflow-y-auto shadow-xl`}>
            <div className={`px-5 py-4 border-b ${theme.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                <h2 id="sync-modal-title" className="text-sm font-semibold">
                  Cross-Device Sync & 2H Pop-Ups
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className={`p-1.5 rounded-full ${theme.inkMuted} hover:${theme.ink} cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Device Nodes Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${theme.softLavenderTile} flex items-start gap-2.5`}>
                  <Laptop className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Laptop</div>
                    <div className={`text-[11px] ${theme.inkMuted} mt-0.5`}>
                      {isCloudConfigured ? 'Supabase Sync Ready' : 'Local Browser Ready'}
                    </div>
                  </div>
                </div>
                <div className={`p-3.5 rounded-2xl border ${theme.softMintTile} flex items-start gap-2.5`}>
                  <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Phone PWA</div>
                    <div className={`text-[11px] ${theme.inkMuted} mt-0.5`}>
                      Add to Home Screen
                    </div>
                  </div>
                </div>
              </div>

              {/* System Browser Pop-Up Notification Permission */}
              <div className={`p-4 rounded-2xl border ${theme.border} ${theme.panelAlt} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">2-Hour Pop-Up Alerts</span>
                  <span
                    className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border ${
                      notifPermission === 'granted'
                        ? theme.softMintTile
                        : `${theme.border} ${theme.panel} ${theme.inkMuted}`
                    }`}
                  >
                    {notifPermission === 'granted' ? 'Enabled' : notifPermission}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${theme.inkMuted}`}>
                  Pops up 2 hours after logging Maxalt RPD 10mg, Tramadol SR 100mg, or OTC pain relief so you can tap how it helped.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleEnableBrowserNotifications}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium border ${theme.borderStrong} ${theme.panel} cursor-pointer`}
                  >
                    {notifPermission === 'granted' ? '✓ Alerts Permitted' : 'Allow Pop-Up Alerts'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSyncModalOpen(false);
                      handleSimulateFollowUp();
                    }}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium border ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} cursor-pointer`}
                  >
                    Test 2H Pop-Up
                  </button>
                </div>
              </div>

              {/* Supabase Real-Time Sync Credentials */}
              <div className="space-y-2.5">
                <div className="font-semibold">Supabase Cloud Sync (Laptop ↔ Phone)</div>
                <p className={`text-xs leading-relaxed ${theme.inkMuted}`}>
                  Paste the same Supabase URL, Anon Key, and email on your laptop and phone to keep logs and 18:00 check-offs in sync.
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className={`block text-[11px] font-medium ${theme.inkMuted} mb-1`}>
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={syncConfig.supabaseUrl}
                      onChange={(e) => setSyncConfig((p) => ({ ...p, supabaseUrl: e.target.value }))}
                      placeholder="https://your-project-id.supabase.co"
                      className={`w-full h-9 px-3.5 rounded-xl text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium ${theme.inkMuted} mb-1`}>
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      value={syncConfig.supabaseAnonKey}
                      onChange={(e) => setSyncConfig((p) => ({ ...p, supabaseAnonKey: e.target.value }))}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className={`w-full h-9 px-3.5 rounded-xl text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium ${theme.inkMuted} mb-1`}>
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={syncConfig.syncEmail}
                      onChange={(e) => setSyncConfig((p) => ({ ...p, syncEmail: e.target.value }))}
                      placeholder="you@domain.com"
                      className={`w-full h-9 px-3.5 rounded-xl text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold border ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} cursor-pointer`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN ALABASTER & LAVENDER CONTAINER SHELL
         ===================================================================== */}
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        <div className={`rounded-[32px] border ${theme.border} ${theme.canvas} p-4 sm:p-6 shadow-sm space-y-6`}>
          {/* TOP GREETING & QUICK UTILITY HEADER */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${theme.softLavenderTile} font-semibold text-sm`}
              >
                CT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                    Cranial Telemetry
                  </h1>
                  <span className={`text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full border ${theme.softLavenderTile}`}>
                    v2.0
                  </span>
                </div>
                <p className={`text-xs ${theme.inkMuted}`}>
                  {new Date(nowTs).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  · Swiss clinical · low-glare
                </p>
              </div>
            </div>

            {/* Top Action Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {nextPendingFollowUp && (
                <button
                  type="button"
                  onClick={() => handleSimulateFollowUp(nextPendingFollowUp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${theme.softApricotTile} ${theme.transition} animate-soft-pulse`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>2H Check</span>
                  <span className="tabular-nums font-semibold">{nextFollowUpCountdown}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border ${theme.border} ${theme.panel} hover:${theme.borderStrong} flex items-center gap-1.5 cursor-pointer ${theme.transition}`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isCloudConfigured ? 'Synced' : 'Sync'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border ${theme.border} ${theme.panel} hover:${theme.borderStrong} flex items-center gap-1.5 cursor-pointer ${theme.transition}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                type="button"
                onClick={() => setAmberMode((prev) => !prev)}
                aria-pressed={amberMode}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                  amberMode
                    ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`
                    : `${theme.border} ${theme.panel} ${theme.ink} hover:${theme.borderStrong}`
                } ${theme.transition}`}
                title="Toggle soft warm dim mode for sensitive eyes"
              >
                {amberMode ? <Eye className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{amberMode ? 'Dim On' : 'Soft Dim'}</span>
              </button>
            </div>
          </header>

          {/* WEEKLY 7-DAY STRIP + DAILY 18:00 PREVENTATIVES CARD */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* 7-Day Activity Strip */}
            <div className={`xl:col-span-5 rounded-3xl border ${theme.border} ${theme.panel} p-4 flex flex-col justify-between gap-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">This Week</span>
                <span className={`text-[11px] ${theme.inkMuted}`}>
                  Dots = 18:00 meds or log
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekStripDays.map((day) => {
                  const isToday = day.key === todayKey;
                  const isSelected = day.key === selectedStripDateKey;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedStripDateKey(day.key)}
                      className={`py-2.5 px-1 rounded-2xl flex flex-col items-center gap-1 cursor-pointer border ${
                        isSelected
                          ? `${theme.dockBg} border-transparent`
                          : isToday
                          ? `${theme.softLavenderTile}`
                          : `border-transparent hover:${theme.panelAlt}`
                      } ${theme.transition}`}
                    >
                      <span className={`text-[11px] ${isSelected ? 'opacity-80' : theme.inkMuted}`}>
                        {day.dayLabel}
                      </span>
                      <span className="text-xs font-semibold tabular-nums">{day.dateNum}</span>
                      <div className="flex items-center gap-1 h-2">
                        {day.prevDone && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              amberMode ? 'bg-[#8CC4AC]' : 'bg-[#77B899]'
                            }`}
                          />
                        )}
                        {day.hasEpisode && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              amberMode ? 'bg-[#D996A8]' : 'bg-[#D6859C]'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily 18:00 Preventative Checklist (Trepiline 10mg & Toplep 25mg) */}
            <div className={`xl:col-span-7 rounded-3xl border ${theme.border} ${theme.panel} p-4 flex flex-col justify-between gap-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${theme.softLavenderTile}`}>
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold">Evening Preventatives · 18:00</div>
                    <div className={`text-[11px] ${theme.inkMuted}`}>
                      {bothPreventativesTaken
                        ? 'Both evening doses checked off today'
                        : isEveningWindow
                        ? '18:00 window — ready to check off'
                        : `Scheduled for 18:00 · ${analytics.preventativeAdherencePct}% 14d streak`}
                    </div>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-3 py-1 rounded-full border ${bothPreventativesTaken ? theme.softMintTile : theme.panelAlt} ${theme.border}`}>
                  {bothPreventativesTaken ? '✓ Complete' : `${analytics.preventativeAdherencePct}% 14d`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* TREPILINE 10MG */}
                <button
                  type="button"
                  onClick={() => handleTogglePreventative('trepiline_10mg')}
                  aria-pressed={todayPrev.trepiline_10mg}
                  className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left cursor-pointer ${
                    todayPrev.trepiline_10mg
                      ? theme.softMintTile
                      : `${theme.border} ${theme.panelAlt} hover:${theme.borderStrong}`
                  } ${theme.transition}`}
                >
                  <div>
                    <div className="text-xs font-semibold">Trepiline 10mg</div>
                    <div className={`text-[11px] ${theme.inkMuted}`}>
                      {todayPrev.trepiline_10mg
                        ? `Taken at ${todayPrev.trepiline_time || '18:00'}`
                        : 'Amitriptyline · 18:00'}
                    </div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      todayPrev.trepiline_10mg
                        ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`
                        : `${theme.borderStrong} ${theme.panel}`
                    }`}
                  >
                    {todayPrev.trepiline_10mg && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                </button>

                {/* TOPLEP 25MG */}
                <button
                  type="button"
                  onClick={() => handleTogglePreventative('toplep_25mg')}
                  aria-pressed={todayPrev.toplep_25mg}
                  className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left cursor-pointer ${
                    todayPrev.toplep_25mg
                      ? theme.softMintTile
                      : `${theme.border} ${theme.panelAlt} hover:${theme.borderStrong}`
                  } ${theme.transition}`}
                >
                  <div>
                    <div className="text-xs font-semibold">Toplep 25mg</div>
                    <div className={`text-[11px] ${theme.inkMuted}`}>
                      {todayPrev.toplep_25mg
                        ? `Taken at ${todayPrev.toplep_time || '18:00'}`
                        : 'Topiramate · 18:00'}
                    </div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      todayPrev.toplep_25mg
                        ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`
                        : `${theme.borderStrong} ${theme.panel}`
                    }`}
                  >
                    {todayPrev.toplep_25mg && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================================
              MAIN TWO-COLUMN WORKSPACE
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* =========================================================
                LEFT COLUMN (5 COLS): GENTLE EPISODE ENTRY CARD
               ========================================================= */}
            <section
              className={`lg:col-span-5 ${
                activeMobileTab === 'entry' ? 'block' : 'hidden lg:block'
              }`}
            >
              <form
                onSubmit={handleCommitEntry}
                className={`rounded-3xl border ${theme.border} ${theme.panel} divide-y ${theme.border} overflow-hidden`}
              >
                {/* Form Header */}
                <div className="px-5 py-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className={`w-4 h-4 ${theme.inkMuted}`} />
                    <h2 className="text-sm font-semibold">Log Headache / Migraine</h2>
                  </div>
                  {commitBanner && (
                    <span className={`text-[11px] font-medium rounded-full px-3 py-0.5 border ${theme.softMintTile}`}>
                      {commitBanner}
                    </span>
                  )}
                </div>

                {/* A. CRANIAL PAIN LOCALIZATION */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">Where It Hurts</label>
                    <span className={`text-[11px] tabular-nums ${theme.inkMuted}`}>
                      {selectedRegions.length} selected
                    </span>
                  </div>

                  {/* Quick Anatomical Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {CRANIAL_PRESETS.map((preset) => {
                      const isExactMatch =
                        preset.zones.length === selectedRegions.length &&
                        preset.zones.every((z) => selectedRegions.includes(z));
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.zones)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                            isExactMatch
                              ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`
                              : `${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink}`
                          } ${theme.transition}`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                    {selectedRegions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRegions([])}
                        className={`px-2.5 py-1 rounded-full text-[11px] border ${theme.border} ${theme.inkMuted} hover:${theme.ink} cursor-pointer`}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Orthographic Anterior + Posterior Head Diagrams */}
                  <CranialDiagram
                    selectedRegions={selectedRegions}
                    onToggleRegion={handleToggleRegion}
                    amberMode={amberMode}
                  />

                  {/* Synchronized Region Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.values(ALL_REGIONS_MAP).map((reg) => {
                      const active = selectedRegions.includes(reg.id);
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => handleToggleRegion(reg.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                            active
                              ? theme.softRoseTile
                              : `${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink}`
                          } ${theme.transition}`}
                        >
                          {active ? `• ${reg.short}` : reg.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* B. PAIN INTENSITY SCALE (1-10) */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">Pain Level</label>
                    <span className={`text-xs font-semibold tabular-nums px-2.5 py-0.5 rounded-full border ${theme.softLavenderTile}`}>
                      {severity}/10 · {severityMeta.label.toLowerCase()}
                    </span>
                  </div>

                  <div
                    className="grid grid-cols-10 gap-1"
                    role="radiogroup"
                    aria-label="Pain Intensity 1 to 10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = severity === num;
                      const isFilled = num <= severity;
                      let btnStyle = `${theme.panelAlt} ${theme.border} ${theme.inkMuted}`;
                      if (isFilled) {
                        btnStyle = isSelected
                          ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText} font-semibold`
                          : theme.softLavenderTile;
                      }
                      return (
                        <button
                          key={num}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSeverity(num)}
                          className={`h-9 rounded-xl text-xs tabular-nums border cursor-pointer ${btnStyle} ${theme.transition}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`text-[11px] ${theme.inkMuted}`}>{severityMeta.desc}</p>
                </div>

                {/* C. ONSET TIME & DURATION */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="onset-time"
                      className={`block text-[11px] font-medium ${theme.inkMuted} mb-1.5`}
                    >
                      Started At
                    </label>
                    <input
                      id="onset-time"
                      type="datetime-local"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      className={`w-full h-9 px-3 rounded-xl text-xs tabular-nums border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="duration-mins"
                        className={`text-[11px] font-medium ${theme.inkMuted}`}
                      >
                        Duration (mins)
                      </label>
                      <button
                        type="button"
                        onClick={() => setOngoing((prev) => !prev)}
                        className={`text-[10px] font-medium rounded-full px-2 py-0.5 border cursor-pointer ${
                          ongoing ? theme.softRoseTile : `${theme.border} ${theme.inkMuted}`
                        }`}
                      >
                        {ongoing ? 'Ongoing' : 'Set Ongoing'}
                      </button>
                    </div>
                    <input
                      id="duration-mins"
                      type="number"
                      min="0"
                      max="4320"
                      step="15"
                      disabled={ongoing}
                      value={ongoing ? '' : durationMinutes}
                      placeholder={ongoing ? 'Active now' : '120'}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className={`w-full h-9 px-3 rounded-xl text-xs tabular-nums border ${theme.border} ${theme.panelAlt} ${theme.ink} disabled:opacity-45`}
                    />
                  </div>
                </div>

                {/* D. ACUTE & RESCUE MEDICATIONS */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">Acute & Rescue Meds</label>
                    <span className={`text-[11px] ${theme.inkMuted}`}>
                      {selectedAcuteMeds.length > 0 ? 'Sets 2h check-in' : 'None selected'}
                    </span>
                  </div>

                  {/* Maxalt RPD 10mg */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${theme.inkMuted}`}>
                        Onset Triptan
                      </span>
                      <span className={`text-[11px] tabular-nums px-2.5 py-0.5 rounded-full border ${theme.softLavenderTile}`}>
                        Maxalt this month: {analytics.monthlyMaxaltCount}/9
                      </span>
                    </div>
                    {ACUTE_MED_PROTOCOL.triptan.map((med) => {
                      const active = selectedAcuteMeds.includes(med.name);
                      return (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => toggleListValue(selectedAcuteMeds, setSelectedAcuteMeds, med.name)}
                          className={`w-full px-4 py-2.5 rounded-2xl border flex items-center justify-between text-left cursor-pointer ${
                            active
                              ? theme.softLavenderTile
                              : `${theme.border} ${theme.panelAlt} hover:${theme.borderStrong}`
                          } ${theme.transition}`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{med.name}</div>
                            <div className={`text-[11px] ${theme.inkMuted}`}>
                              {med.generic} · Early onset
                            </div>
                          </div>
                          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${active ? `${theme.accentBorder} ${theme.accentBg} ${theme.accentText}` : `${theme.border} ${theme.panel}`}`}>
                            {active ? '✓ Added' : 'Add'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tramadol SR 100mg Severe Rescue */}
                  <div className="space-y-1.5">
                    <span className={`block text-[11px] font-medium ${theme.inkMuted}`}>
                      Severe Rescue
                    </span>
                    {ACUTE_MED_PROTOCOL.rescue.map((med) => {
                      const active = selectedAcuteMeds.includes(med.name);
                      return (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => toggleListValue(selectedAcuteMeds, setSelectedAcuteMeds, med.name)}
                          className={`w-full px-4 py-2 rounded-2xl border flex items-center justify-between text-left cursor-pointer ${
                            active
                              ? theme.softApricotTile
                              : `${theme.border} ${theme.panelAlt} hover:${theme.borderStrong}`
                          } ${theme.transition}`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{med.name}</div>
                            <div className={`text-[11px] ${theme.inkMuted}`}>
                              {med.generic} · When really bad
                            </div>
                          </div>
                          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${active ? theme.softApricotTile : `${theme.border} ${theme.panel}`}`}>
                            {active ? '✓ Added' : 'Rescue'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Common OTC Pain Meds */}
                  <div className="space-y-1.5">
                    <span className={`block text-[11px] font-medium ${theme.inkMuted}`}>
                      Over-the-Counter (OTC)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ACUTE_MED_PROTOCOL.otc.map((med) => {
                        const active = selectedAcuteMeds.includes(med.name);
                        return (
                          <button
                            key={med.id}
                            type="button"
                            onClick={() => toggleListValue(selectedAcuteMeds, setSelectedAcuteMeds, med.name)}
                            title={med.generic}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                              active
                                ? theme.softMintTile
                                : `${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink}`
                            } ${theme.transition}`}
                          >
                            {active ? `✓ ${med.name}` : med.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={customMedInput}
                    onChange={(e) => setCustomMedInput(e.target.value)}
                    placeholder="Other medication (optional)..."
                    className={`w-full h-9 px-3.5 rounded-xl text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                  />
                </div>

                {/* E & F. TRIGGERS, SYMPTOMS & NOTES */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <label className={`block text-[11px] font-medium ${theme.inkMuted} mb-1.5`}>
                      Triggers
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {TRIGGER_OPTIONS.map((trig) => {
                        const active = selectedTriggers.includes(trig);
                        return (
                          <button
                            key={trig}
                            type="button"
                            onClick={() => toggleListValue(selectedTriggers, setSelectedTriggers, trig)}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                              active
                                ? theme.softApricotTile
                                : `${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink}`
                            } ${theme.transition}`}
                          >
                            {trig}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-medium ${theme.inkMuted} mb-1.5`}>
                      Symptoms
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SYMPTOM_OPTIONS.map((sym) => {
                        const active = selectedSymptoms.includes(sym);
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => toggleListValue(selectedSymptoms, setSelectedSymptoms, sym)}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                              active
                                ? theme.softRoseTile
                                : `${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink}`
                            } ${theme.transition}`}
                          >
                            {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="clinical-notes"
                      className={`block text-[11px] font-medium ${theme.inkMuted} mb-1.5`}
                    >
                      Notes
                    </label>
                    <textarea
                      id="clinical-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any extra context..."
                      className={`w-full p-3 rounded-2xl text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink} resize-none`}
                    />
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="p-5">
                  <button
                    type="submit"
                    className={`w-full h-11 rounded-full text-xs font-semibold tracking-wide border ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} flex items-center justify-center gap-2 cursor-pointer ${theme.transition}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Entry</span>
                  </button>
                </div>
              </form>
            </section>

            {/* =========================================================
                RIGHT COLUMN (7 COLS): PASTEL TILES, HEATMAP & LEDGER
               ========================================================= */}
            <section
              className={`lg:col-span-7 space-y-6 ${
                activeMobileTab === 'telemetry' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* 2-HOUR POP-UP CHECK STRIP */}
              <div
                className={`rounded-3xl border ${theme.border} ${theme.panel} px-5 py-3.5 flex flex-wrap items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme.softApricotTile} shrink-0`}>
                    <Bell className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">2-Hour Relief Pop-Up</div>
                    <div className={`text-[11px] ${theme.inkMuted} truncate`}>
                      {nextPendingFollowUp
                        ? `Waiting on ${(nextPendingFollowUp.acuteMeds || []).join(' + ')} · ${nextFollowUpCountdown}`
                        : 'All logged doses have a relief check recorded'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateFollowUp()}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border ${theme.borderStrong} ${theme.panelAlt} hover:${theme.border} flex items-center gap-1.5 cursor-pointer ${theme.transition}`}
                >
                  <Play className="w-3 h-3" />
                  <span>Simulate 2H Pop-Up</span>
                </button>
              </div>

              {/* SOFT PASTEL SUMMARY TILES (Inspired by Reference Stat Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-3xl border ${theme.softMintTile}`}>
                  <div className={`text-[11px] font-medium ${theme.inkMuted}`}>30d Logs</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {analytics.episodeCount}
                  </div>
                  <div className={`mt-0.5 text-[11px] ${theme.inkMuted}`}>
                    Avg {analytics.meanSeverity}/10
                  </div>
                </div>

                <div className={`p-4 rounded-3xl border ${theme.softLavenderTile}`}>
                  <div className={`text-[11px] font-medium ${theme.inkMuted}`}>Maxalt / Mo</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {analytics.monthlyMaxaltCount}
                    <span className={`text-xs font-normal ${theme.inkMuted}`}>/9</span>
                  </div>
                  <div className={`mt-0.5 text-[11px] ${theme.inkMuted}`}>Rizatriptan</div>
                </div>

                <div className={`p-4 rounded-3xl border ${theme.softApricotTile}`}>
                  <div className={`text-[11px] font-medium ${theme.inkMuted}`}>18:00 Routine</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {analytics.preventativeAdherencePct}%
                  </div>
                  <div className={`mt-0.5 text-[11px] ${theme.inkMuted}`}>14-day rate</div>
                </div>

                <div className={`p-4 rounded-3xl border ${theme.softRoseTile}`}>
                  <div className={`text-[11px] font-medium ${theme.inkMuted}`}>Top Spot</div>
                  <div className="mt-1 text-lg font-semibold truncate">
                    {analytics.topRegionLabel}
                  </div>
                  <div className={`mt-0.5 text-[11px] ${theme.inkMuted}`}>Most frequent</div>
                </div>
              </div>

              {/* HEATMAP & MED / TRIGGER INSIGHTS */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className={`xl:col-span-6 rounded-3xl border ${theme.border} ${theme.panel} overflow-hidden flex flex-col`}>
                  <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${theme.inkMuted}`} />
                      <h2 className="text-xs font-semibold">Pain Frequency Map</h2>
                    </div>
                    <span className={`text-[11px] tabular-nums ${theme.inkMuted}`}>
                      {entries.length} entries
                    </span>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <CranialDiagram
                      heatmapCounts={analytics.regionCounts}
                      maxHeatCount={analytics.maxRegionCount}
                      amberMode={amberMode}
                      compact
                    />

                    <div className="space-y-2 pt-1">
                      {analytics.sortedRegions.slice(0, 4).map(([regId, count]) => {
                        const pct = Math.round((count / Math.max(1, entries.length)) * 100);
                        return (
                          <div key={regId} className="flex items-center justify-between text-xs gap-2">
                            <span className="truncate font-medium">{ALL_REGIONS_MAP[regId]?.short || regId}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className={`w-20 h-2 rounded-full overflow-hidden ${theme.panelAlt}`}>
                                <div
                                  className={amberMode ? 'h-full bg-[#C98598] rounded-full' : 'h-full bg-[#B5A5F0] rounded-full'}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`w-12 text-right tabular-nums ${theme.inkMuted}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={`xl:col-span-6 rounded-3xl border ${theme.border} ${theme.panel} divide-y ${theme.border} overflow-hidden`}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-semibold">2h Med Relief</h2>
                      <span className={`text-[11px] ${theme.inkMuted}`}>Effectiveness</span>
                    </div>

                    {analytics.sortedMeds.length === 0 ? (
                      <p className={`text-xs ${theme.inkMuted}`}>No acute meds logged yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {analytics.sortedMeds.slice(0, 4).map(([medName, stat]) => {
                          const resolvedTrials = stat.relieved + stat.partial + stat.noRelief;
                          const effectiveScore = stat.relieved + stat.partial * 0.5;
                          const efficacyPct =
                            resolvedTrials > 0 ? Math.round((effectiveScore / resolvedTrials) * 100) : null;

                          return (
                            <div key={medName} className="space-y-1">
                              <div className="flex justify-between text-xs gap-2">
                                <span className="truncate font-medium">{medName}</span>
                                <span className={`tabular-nums shrink-0 ${theme.inkMuted}`}>
                                  {efficacyPct !== null ? `${efficacyPct}%` : 'Pending'}
                                </span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${theme.panelAlt}`}>
                                <div
                                  className={amberMode ? 'h-full bg-[#8CC4AC] rounded-full' : 'h-full bg-[#87C5A8] rounded-full'}
                                  style={{
                                    width: `${efficacyPct ?? 15}%`,
                                    opacity: efficacyPct === null ? 0.4 : 1,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-semibold">Common Triggers</h2>
                      <span className={`text-[11px] ${theme.inkMuted}`}>Share</span>
                    </div>

                    {analytics.sortedTriggers.length === 0 ? (
                      <p className={`text-xs ${theme.inkMuted}`}>No triggers logged yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {analytics.sortedTriggers.slice(0, 4).map(([trigger, count]) => {
                          const pct = Math.round((count / Math.max(1, entries.length)) * 100);
                          return (
                            <div key={trigger} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium">{trigger}</span>
                                <span className={`tabular-nums ${theme.inkMuted}`}>{pct}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${theme.panelAlt}`}>
                                <div
                                  className={amberMode ? 'h-full bg-[#D996A8] rounded-full' : 'h-full bg-[#E3A6B8] rounded-full'}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* HISTORY LEDGER */}
              <div className={`rounded-3xl border ${theme.border} ${theme.panel} overflow-hidden`}>
                <div className={`px-5 py-3.5 border-b ${theme.border} flex flex-wrap items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${theme.inkMuted}`} />
                    <h2 className="text-xs font-semibold">Recent Entries</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="Filter episodes by cranial zone"
                      value={filterZone}
                      onChange={(e) => setFilterZone(e.target.value)}
                      className={`h-8 px-3 rounded-full text-xs border ${theme.border} ${theme.panelAlt} ${theme.ink}`}
                    >
                      <option value="ALL">All spots ({entries.length})</option>
                      {Object.values(ALL_REGIONS_MAP).map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.short}
                        </option>
                      ))}
                    </select>

                    {analytics.hasSamples && !confirmClearSamples && (
                      <button
                        type="button"
                        onClick={() => setConfirmClearSamples(true)}
                        className={`h-8 px-3 rounded-full text-[11px] font-medium border ${theme.border} ${theme.inkMuted} hover:${theme.ink} cursor-pointer`}
                      >
                        Clear samples
                      </button>
                    )}
                    {confirmClearSamples && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleClearSampleData}
                          className={`h-8 px-3 rounded-full text-[11px] font-semibold border ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} cursor-pointer`}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearSamples(false)}
                          className={`h-8 px-3 rounded-full text-[11px] border ${theme.border} ${theme.inkMuted} cursor-pointer`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {visibleEntries.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className={`text-xs ${theme.inkMuted}`}>No entries match this filter.</p>
                  </div>
                ) : (
                  <div className={`divide-y ${theme.border}`}>
                    {visibleEntries.map((ep) => {
                      const isExpanded = expandedRowId === ep.id;
                      const badgeStyle =
                        ep.severity >= 7
                          ? theme.softRoseTile
                          : ep.severity >= 4
                          ? theme.softApricotTile
                          : theme.softMintTile;

                      return (
                        <div key={ep.id} className={theme.transition}>
                          <div className="px-5 py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-11 h-10 rounded-2xl border text-xs font-semibold tabular-nums flex flex-col items-center justify-center shrink-0 ${badgeStyle}`}
                              >
                                <span>{ep.severity}/10</span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold tabular-nums">
                                    {formatClinicalTimestamp(ep.timestamp)}
                                  </span>
                                  <span className={`text-[11px] tabular-nums ${theme.inkMuted}`}>
                                    {ep.ongoing ? 'Ongoing' : `${ep.durationMinutes}m`}
                                  </span>
                                  {(ep.acuteMeds || []).map((m) => (
                                    <span
                                      key={m}
                                      className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border ${
                                        m.toLowerCase().includes('tramadol')
                                          ? theme.softApricotTile
                                          : m.toLowerCase().includes('maxalt')
                                          ? theme.softLavenderTile
                                          : `${theme.border} ${theme.panelAlt}`
                                      }`}
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(ep.regions || []).map((rId) => (
                                    <span
                                      key={rId}
                                      className={`text-[10px] rounded-full px-2 py-0.5 border ${theme.border} ${theme.panelAlt} ${theme.inkMuted}`}
                                    >
                                      {ALL_REGIONS_MAP[rId]?.short || rId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  ep.relief === 'pending'
                                    ? handleSimulateFollowUp(ep)
                                    : cycleReliefStatus(ep.id)
                                }
                                className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                                  ep.relief === 'relieved'
                                    ? theme.softMintTile
                                    : ep.relief === 'partial'
                                    ? theme.softApricotTile
                                    : ep.relief === 'no_relief'
                                    ? theme.softRoseTile
                                    : `${theme.softLavenderTile}`
                                }`}
                              >
                                {ep.relief === 'relieved'
                                  ? '✓ Relieved'
                                  : ep.relief === 'partial'
                                  ? '◑ Partial'
                                  : ep.relief === 'no_relief'
                                  ? '✕ No Effect'
                                  : ep.relief === 'none_taken'
                                  ? '— No Meds'
                                  : '◷ 2H Check'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : ep.id)}
                                aria-expanded={isExpanded}
                                aria-label="Toggle episode details"
                                className={`p-1.5 rounded-full border ${theme.border} ${theme.panelAlt} ${theme.inkMuted} hover:${theme.ink} cursor-pointer`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(ep.id)}
                                aria-label="Delete episode entry"
                                className={`p-1.5 rounded-full border ${theme.border} ${theme.panelAlt} ${theme.inkMuted} cursor-pointer`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div
                              className={`px-5 py-3.5 border-t ${theme.border} ${theme.panelAlt} grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs`}
                            >
                              <div>
                                <span className={`block text-[11px] font-medium ${theme.inkMuted} mb-0.5`}>
                                  Triggers
                                </span>
                                <div>
                                  {(ep.triggers || []).length > 0 ? ep.triggers.join(', ') : 'None logged'}
                                </div>
                              </div>

                              <div>
                                <span className={`block text-[11px] font-medium ${theme.inkMuted} mb-0.5`}>
                                  Symptoms & Meds
                                </span>
                                <div>
                                  {(ep.symptoms || []).length > 0 ? ep.symptoms.join(', ') : 'No symptoms'}
                                </div>
                                <div className={`mt-0.5 ${theme.inkMuted}`}>
                                  {(ep.acuteMeds || []).join(' + ') || 'No acute meds'}
                                </div>
                              </div>

                              <div>
                                <span className={`block text-[11px] font-medium ${theme.inkMuted} mb-0.5`}>
                                  Notes
                                </span>
                                <div className={ep.notes ? '' : theme.inkMuted}>
                                  {ep.notes || 'No notes.'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================================
          FLOATING DARK PILL NAVIGATION DOCK (INSPIRED BY REFERENCE)
         ===================================================================== */}
      <nav
        aria-label="Quick navigation dock"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
      >
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-lg ${theme.dockBg}`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveMobileTab('entry');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              activeMobileTab === 'entry'
                ? 'bg-white text-[#17151C] font-semibold'
                : 'opacity-75 hover:opacity-100'
            } ${theme.transition}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMobileTab('telemetry');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              activeMobileTab === 'telemetry'
                ? 'bg-white text-[#17151C] font-semibold'
                : 'opacity-75 hover:opacity-100'
            } ${theme.transition}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateFollowUp()}
            className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-pointer"
            title="Open 2-hour follow-up pop-up"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2H Pop-Up</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-pointer"
            title="Laptop & phone sync settings"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </nav>
    </div>
  );
}