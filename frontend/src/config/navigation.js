export const publicNavigation = [
  { label: 'Platform', href: '/#platform' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'About', href: '/about' }
];

export const roleNavigation = {
  tourist: [
    { label: 'Overview', href: '/tourist/dashboard', icon: 'LayoutDashboard' },
    { label: 'My journey', href: '/tourist/journey', icon: 'Route' },
    { label: 'Safety monitor', href: '/tourist/safety', icon: 'ShieldCheck' },
    { label: 'Digital ID', href: '/tourist/digital-id', icon: 'BadgeCheck' },
    { label: 'Emergency', href: '/tourist/emergency', icon: 'Siren', danger: true },
    { label: 'Profile', href: '/tourist/profile', icon: 'UserRound' }
  ],
  authority: [
    { label: 'Command center', href: '/authority/dashboard', icon: 'LayoutDashboard' },
    { label: 'Live map', href: '/authority/live-map', icon: 'Map' },
    { label: 'Incidents', href: '/authority/incidents', icon: 'TriangleAlert' },
    { label: 'Tourists', href: '/authority/tourists', icon: 'UsersRound' },
    { label: 'Geo-fences', href: '/authority/geofences', icon: 'Landmark' },
    { label: 'ID verification', href: '/authority/id-verification', icon: 'ScanLine' },
    { label: 'Analytics', href: '/authority/analytics', icon: 'ChartNoAxesCombined' }
  ],
  responder: [
    { label: 'Dispatch', href: '/responder/dashboard', icon: 'LayoutDashboard' },
    { label: 'Incidents', href: '/responder/incidents', icon: 'TriangleAlert' },
    { label: 'Navigation', href: '/responder/navigation', icon: 'Navigation' }
  ],
  admin: [
    { label: 'Overview', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Users', href: '/admin/users', icon: 'UsersRound' },
    { label: 'Zones', href: '/admin/zones', icon: 'Landmark' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings2' },
    { label: 'Audit logs', href: '/admin/audit-logs', icon: 'ScrollText' }
  ]
};

export const roleLabels = {
  tourist: 'Tourist workspace',
  authority: 'Authority command center',
  responder: 'Responder dispatch',
  admin: 'System administration'
};

export const routeByRole = {
  tourist: '/tourist/dashboard',
  authority: '/authority/dashboard',
  responder: '/responder/dashboard',
  admin: '/admin/dashboard'
};
