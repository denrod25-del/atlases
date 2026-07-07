/* Maps each atlas storage prefix (defined inside the atlas file) to the
 * catalog record in atlases-meta.js. The Dashboard reads localStorage keyed
 * by these prefixes to compute per-atlas progress without knowing anything
 * about the internal atlas state shape beyond the fields all atlases share.
 *
 * All 15 core atlases with persistent storage. Coolify is stateless.
 */

export const STORAGE_PREFIX_TO_PATH = {
  'pyatlas':        '/python',
  'jsatlas':        '/javascript',
  'catlas':         '/c',
  'cppatlas':       '/cpp',
  'dbatlas':        '/db',
  'netatlas':       '/net',
  'linuxatlas':     '/linux',
  'cryptoatlas':    '/crypto',
  'compileratlas':  '/compilers',
  'obsatlas':       '/observability',
  'aiatlas':        '/ai',
  'fivematlas':     '/fivem',
  'encatlas':       '/encoding',
  'n8natlas':       '/n8n',
  'dockeratlas':    '/docker',
};

// Sub-keys each atlas writes under its prefix
export const ATLAS_KEYS = {
  completed:     'completed',      // JSON array of chapter IDs
  activeSection: 'activeSection',  // last visited section number
  stack:         'stack',          // user's stack-profile choice
  checklist:     'checklist',      // per-chapter checklist state
  quizState:     'quizState',      // quiz answers
};
