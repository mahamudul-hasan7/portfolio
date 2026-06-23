const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const statusMessage = document.getElementById('statusMessage');
const contentForm = document.getElementById('contentForm');
const panelTitle = document.getElementById('panelTitle');

let content = null;

const listSchemas = {
  'resume.education': [
    ['title', 'Title', 'text'],
    ['school', 'School', 'text'],
    ['period', 'Period', 'text'],
    ['details', 'Details', 'textarea']
  ],
  projects: [
    ['title', 'Title', 'text'],
    ['status', 'Status', 'text'],
    ['meta', 'Meta', 'text'],
    ['description', 'Description', 'textarea'],
    ['tech', 'Tech list', 'text'],
    ['liveUrl', 'Live URL', 'text'],
    ['codeUrl', 'Code URL', 'text']
  ],
  blogs: [
    ['title', 'Title', 'text'],
    ['date', 'Date', 'text'],
    ['readTime', 'Read time', 'text'],
    ['description', 'Description', 'textarea'],
    ['tags', 'Tags', 'text']
  ],
  skills: [
    ['name', 'Name', 'text'],
    ['group', 'Group', 'text'],
    ['level', 'Level', 'number']
  ],
  journey: [
    ['year', 'Year', 'text'],
    ['title', 'Title', 'text'],
    ['description', 'Description', 'textarea']
  ]
};

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff9a9a' : '';
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function getByPath(source, path) {
  return path.split('.').reduce((value, key) => value && value[key], source);
}

function setByPath(source, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, source);
  target[last] = value;
}

function emptyItemFor(listName) {
  return Object.fromEntries(listSchemas[listName].map(([key, , type]) => [key, type === 'number' ? 0 : '']));
}

function renderList(listName) {
  const host = document.querySelector(`[data-list="${listName}"]`);
  if (!host) return;

  const items = getByPath(content, listName) || [];
  host.textContent = '';

  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'repeat-card';

    const head = document.createElement('div');
    head.className = 'repeat-head';
    head.innerHTML = `<span class="repeat-title">${listName.replace('resume.', '')} ${index + 1}</span>`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-row';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      items.splice(index, 1);
      renderAll();
    });
    head.appendChild(remove);
    card.appendChild(head);

    const fields = document.createElement('div');
    fields.className = 'repeat-fields';

    listSchemas[listName].forEach(([key, labelText, type]) => {
      const label = document.createElement('label');
      label.textContent = labelText;
      const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
      if (type !== 'textarea') input.type = type;
      if (type === 'textarea') input.rows = 3;
      input.value = item[key] ?? '';
      input.addEventListener('input', () => {
        item[key] = type === 'number' ? Number(input.value) : input.value;
      });
      label.appendChild(input);
      if (type === 'textarea') label.classList.add('full');
      fields.appendChild(label);
    });

    card.appendChild(fields);
    host.appendChild(card);
  });
}

function renderSimpleFields() {
  contentForm.querySelectorAll('[data-path]').forEach(input => {
    const value = getByPath(content, input.dataset.path);
    if (input.dataset.array === 'lines') {
      input.value = Array.isArray(value) ? value.join('\n') : '';
    } else {
      input.value = value ?? '';
    }
  });
}

function bindSimpleFields() {
  contentForm.querySelectorAll('[data-path]').forEach(input => {
    input.addEventListener('input', () => {
      const value = input.dataset.array === 'lines'
        ? input.value.split('\n').map(item => item.trim()).filter(Boolean)
        : input.value;
      setByPath(content, input.dataset.path, value);
    });
  });
}

function renderAll() {
  renderSimpleFields();
  Object.keys(listSchemas).forEach(renderList);
}

async function loadContent() {
  setStatus('Loading content...');
  const data = await api('/api/admin-content');
  content = data.content;
  renderAll();
  setStatus('Loaded. Make edits and save when ready.');
}

async function saveContent() {
  setStatus('Saving to GitHub...');
  await api('/api/admin-content', {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
  setStatus('Saved. Vercel will redeploy after the GitHub commit.');
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
}

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

document.querySelectorAll('.nav-tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    button.classList.add('active');
    document.querySelector(`[data-panel="${button.dataset.tab}"]`).classList.add('active');
    panelTitle.textContent = button.textContent;
  });
});

document.querySelectorAll('.add-row').forEach(button => {
  button.addEventListener('click', () => {
    const listName = button.dataset.list;
    const list = getByPath(content, listName);
    list.push(emptyItemFor(listName));
    renderList(listName);
  });
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginMessage.textContent = 'Checking...';
  try {
    await api('/api/admin-login', {
      method: 'POST',
      body: JSON.stringify({ password: document.getElementById('adminPassword').value })
    });
    loginMessage.textContent = '';
    showDashboard();
    await loadContent();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

document.getElementById('saveBtn').addEventListener('click', () => {
  saveContent().catch(error => setStatus(error.message, true));
});

document.getElementById('reloadBtn').addEventListener('click', () => {
  loadContent().catch(error => setStatus(error.message, true));
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await api('/api/admin-logout', { method: 'POST', body: '{}' }).catch(() => {});
  content = null;
  showLogin();
});

document.getElementById('changePasswordBtn').addEventListener('click', async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const output = document.getElementById('passwordOutput');

  output.hidden = true;
  output.textContent = '';

  if (newPassword !== confirmPassword) {
    setStatus('New password and confirmation do not match.', true);
    return;
  }

  try {
    setStatus('Generating password update...');
    const data = await api('/api/admin-change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    output.textContent = [
      'Copy these into Vercel Environment Variables:',
      '',
      `ADMIN_PASSWORD_SALT=${data.env.ADMIN_PASSWORD_SALT}`,
      '',
      `ADMIN_PASSWORD_HASH=${data.env.ADMIN_PASSWORD_HASH}`,
      '',
      `ADMIN_SESSION_SECRET=${data.env.ADMIN_SESSION_SECRET}`,
      '',
      data.note
    ].join('\n');
    output.hidden = false;
    setStatus('Password update values generated. Update Vercel and redeploy.');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (error) {
    setStatus(error.message, true);
  }
});

bindSimpleFields();

api('/api/admin-me')
  .then(async data => {
    if (!data.authenticated) return showLogin();
    showDashboard();
    await loadContent();
  })
  .catch(() => showLogin());
