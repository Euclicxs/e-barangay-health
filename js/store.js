/* Shared account store for the e-Barangay Health System (browser localStorage).
   Used by login.html, admin.html and security.html. */
(function (global) {
  const USERS_KEY = 'ebh_bhw_users';
  const LOGS_KEY = 'ebh_audit_logs';
  const SESSION_KEY = 'ebh_session';

  // The one and only administrator credential of the system.
  const ADMIN_CREDENTIAL = {
    username: 'admin',
    password: 'ebrgy@admin2026',
    fullName: 'Dr. Rosalinda Vidal',
    role: 'System Administrator'
  };

  const PUROKS = [
    'Calachuchi',
    'Bougainvillea',
    'Walingwaling',
    'Sampaguita',
    'Santan',
    'Rose',
    'Daisy'
  ];

  const SEED_USERS = [
    { id: 'USR-001', fullName: 'Maria Santos', username: 'msantos', password: 'bhw12345', purok: 'Calachuchi', contact: '09171234567', role: 'Registration Operator', status: 'active', lastLogin: '2026-08-07 08:14', createdAt: '2026-08-01 09:00' },
    { id: 'USR-002', fullName: 'Leonora Cano', username: 'lcano', password: 'bhw12345', purok: 'Calachuchi', contact: '09171234568', role: 'Registration Operator', status: 'active', lastLogin: '2026-08-06 13:22', createdAt: '2026-08-01 09:10' },
    { id: 'USR-003', fullName: 'Rosa dela Vega', username: 'rdelavega', password: 'bhw12345', purok: 'Bougainvillea', contact: '09171234569', role: 'Registration Operator', status: 'active', lastLogin: '2026-08-05 09:47', createdAt: '2026-08-01 09:20' },
    { id: 'USR-004', fullName: 'Carmen Ilustre', username: 'cilustre', password: 'bhw12345', purok: 'Walingwaling', contact: '09171234570', role: 'Registration Operator', status: 'active', lastLogin: '2026-08-04 10:30', createdAt: '2026-08-01 09:30' },
    { id: 'USR-005', fullName: 'Glenda Torcuato', username: 'gtorcuato', password: 'bhw12345', purok: 'Santan', contact: '09171234571', role: 'Registration Operator', status: 'inactive', lastLogin: '2026-08-03 14:55', createdAt: '2026-08-01 09:40' }
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function timestamp(date) {
    const d = date || new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function getUsers() {
    let users = read(USERS_KEY, null);
    if (!users) {
      users = SEED_USERS.map((user) => Object.assign({}, user));
      write(USERS_KEY, users);
    }
    return users;
  }

  function saveUsers(users) {
    write(USERS_KEY, users);
  }

  function nextUserId(users) {
    const numbers = users
      .map((user) => parseInt(String(user.id).replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const next = numbers.length ? Math.max.apply(null, numbers) + 1 : 1;
    return `USR-${String(next).padStart(3, '0')}`;
  }

  function findByUsername(username) {
    const needle = String(username || '').trim().toLowerCase();
    return getUsers().find(
      (user) =>
        user.username.toLowerCase() === needle ||
        user.id.toLowerCase() === needle
    );
  }

  function addUser(data) {
    const users = getUsers();
    const username = String(data.username || '').trim();

    if (!data.fullName || !username || !data.password || !data.purok) {
      return { ok: false, message: 'Full name, username, password and purok are required.' };
    }
    if (String(data.password).length < 8) {
      return { ok: false, message: 'Password must be at least 8 characters long.' };
    }
    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, message: `Username "${username}" is already taken.` };
    }

    const user = {
      id: nextUserId(users),
      fullName: String(data.fullName).trim(),
      username: username,
      password: String(data.password),
      purok: data.purok,
      contact: String(data.contact || '').trim(),
      role: data.role || 'Registration Operator',
      status: data.status === 'inactive' ? 'inactive' : 'active',
      lastLogin: null,
      createdAt: timestamp()
    };

    users.push(user);
    saveUsers(users);
    addLog(
      data.actor || 'Administrator',
      `${data.actor ? 'Added' : 'Self-registered'} BHW operator — ${user.id} (${user.fullName})` +
        (user.status === 'inactive' ? ' — pending activation' : '')
    );
    return { ok: true, user: user };
  }

  function setStatus(id, status, actor) {
    const users = getUsers();
    const user = users.find((item) => item.id === id);
    if (!user) return { ok: false, message: 'BHW account not found.' };

    user.status = status === 'active' ? 'active' : 'inactive';
    saveUsers(users);
    addLog(
      actor || 'Administrator',
      `${user.status === 'active' ? 'Activated' : 'Deactivated'} BHW access — ${user.id} (${user.fullName})`
    );
    return { ok: true, user: user };
  }

  function resetPassword(id, newPassword, actor) {
    if (!newPassword || String(newPassword).length < 8) {
      return { ok: false, message: 'Password must be at least 8 characters long.' };
    }
    const users = getUsers();
    const user = users.find((item) => item.id === id);
    if (!user) return { ok: false, message: 'BHW account not found.' };

    user.password = String(newPassword);
    saveUsers(users);
    addLog(actor || 'Administrator', `Reset password — ${user.id} (${user.fullName})`);
    return { ok: true, user: user };
  }

  function deleteUser(id, actor) {
    const users = getUsers();
    const user = users.find((item) => item.id === id);
    if (!user) return { ok: false, message: 'BHW account not found.' };

    saveUsers(users.filter((item) => item.id !== id));
    addLog(actor || 'Administrator', `Removed BHW operator — ${user.id} (${user.fullName})`);
    return { ok: true };
  }

  function loginBhw(username, password) {
    const user = findByUsername(username);
    if (!user || user.password !== String(password)) {
      return { ok: false, message: 'Invalid BHW ID / username or password.' };
    }
    if (user.status !== 'active') {
      return {
        ok: false,
        message: 'This BHW account is deactivated. Please contact the administrator.'
      };
    }

    const users = getUsers();
    const stored = users.find((item) => item.id === user.id);
    stored.lastLogin = timestamp();
    saveUsers(users);
    addLog(user.fullName, 'Login — session started');
    setSession({ role: 'bhw', id: user.id, name: user.fullName, purok: user.purok });
    return { ok: true, user: stored };
  }

  function loginAdmin(username, password) {
    if (
      String(username || '').trim().toLowerCase() !== ADMIN_CREDENTIAL.username ||
      String(password || '') !== ADMIN_CREDENTIAL.password
    ) {
      return { ok: false, message: 'Invalid administrator credential.' };
    }
    addLog(ADMIN_CREDENTIAL.fullName, 'Admin login — session started');
    setSession({ role: 'admin', id: 'ADM-001', name: ADMIN_CREDENTIAL.fullName });
    return { ok: true };
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (err) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getLogs() {
    return read(LOGS_KEY, []);
  }

  function addLog(actor, action) {
    const logs = getLogs();
    logs.unshift({ time: timestamp(), actor: actor, action: action });
    write(LOGS_KEY, logs.slice(0, 50));
  }

  global.EBHStore = {
    ADMIN_CREDENTIAL: ADMIN_CREDENTIAL,
    PUROKS: PUROKS,
    getUsers: getUsers,
    addUser: addUser,
    setStatus: setStatus,
    resetPassword: resetPassword,
    deleteUser: deleteUser,
    loginBhw: loginBhw,
    loginAdmin: loginAdmin,
    getSession: getSession,
    clearSession: clearSession,
    getLogs: getLogs,
    addLog: addLog
  };
})(window);
