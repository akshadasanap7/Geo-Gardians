const DEMO_ACCOUNTS = {
  tourist: { email: 'tourist@safeyatra.com', password: 'tour123', name: 'Aarav Mehta', role: 'tourist', initials: 'AM' },
  authority: { email: 'auth@safeyatra.com', password: 'auth123', name: 'Nashik Control Room', role: 'authority', initials: 'NC' },
  responder: { email: 'resp@safeyatra.com', password: 'resp123', name: 'Ravi Patil', role: 'responder', initials: 'RP' },
  admin: { email: 'admin@safeyatra.com', password: 'admin123', name: 'System Administrator', role: 'admin', initials: 'SA' }
};

export function getDemoAccounts() {
  return Object.values(DEMO_ACCOUNTS);
}

export function loginDemo({ email, password, role }) {
  const match = Object.values(DEMO_ACCOUNTS).find((account) => (
    account.email === email && account.password === password && (!role || account.role === role)
  ));

  if (!match) {
    const error = new Error('Use one of the demo credentials below to enter the prototype.');
    error.code = 'DEMO_AUTH_FAILED';
    throw error;
  }

  return {
    token: `demo-token-${match.role}`,
    user: { ...match, id: `demo-${match.role}` }
  };
}

export function registerDemo({ name, email, role = 'tourist' }) {
  return {
    token: `demo-token-${role}`,
    user: { id: `demo-${Date.now()}`, name, email, role, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() }
  };
}
