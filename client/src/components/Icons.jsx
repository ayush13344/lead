const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const CupIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9z" />
    <path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M9 3.5c0 1 .8 1 .8 2M13 3.5c0 1 .8 1 .8 2" />
  </svg>
);
export const SearchIcon = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>);
export const PlusIcon = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const EditIcon = (p) => (<svg {...base} {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /></svg>);
export const TrashIcon = (p) => (<svg {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" /></svg>);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ArrowIcon = ({ dir = 'up', ...p }) => (
  <svg {...base} width={12} height={12} strokeWidth={2.4} {...p}>
    <path d={dir === 'up' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
  </svg>
);
export const ChevronIcon = ({ dir = 'left', ...p }) => (
  <svg {...base} {...p}><path d={dir === 'left' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'} /></svg>
);
