import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const mainGrid = document.getElementById('main-grid');
const extraGrid = document.getElementById('extra-commands');
const commandModal = document.getElementById('command-modal');
const addCommandBtn = document.getElementById('add-command-btn');
const commandForm = document.getElementById('command-form');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');
const loginError = document.getElementById('login-error');

// --- Auth Handling ---

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.error(error);
      loginError.style.display = 'block';
    });
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    initAdmin();
  } else {
    loginSection.style.display = 'flex';
    dashboard.style.display = 'none';
  }
});

// --- Commands Logic ---

let unsubscribe = null;

function initAdmin() {
  loadCommands();
  initSortable(mainGrid);
  initSortable(extraGrid);
}

function initSortable(container) {
  new Sortable(container, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: () => saveNewOrder(container)
  });
}

async function saveNewOrder(container) {
  const cards = container.querySelectorAll('.command-card');
  const batch = writeBatch(db);
  
  cards.forEach((card, index) => {
    const id = card.dataset.id;
    const docRef = doc(db, "commands", id);
    // Base order on grid (1-100 for main, 101-200 for gamble)
    const base = container.id === 'main-grid' ? 0 : 100;
    batch.update(docRef, { order: base + index + 1 });
  });

  await batch.commit();
}

function loadCommands() {
  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "commands"), orderBy("order", "asc"));
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    mainGrid.innerHTML = '';
    extraGrid.innerHTML = '';

    snapshot.forEach((doc) => {
      const cmd = doc.data();
      const id = doc.id;
      
      const card = document.createElement('div');
      card.className = 'command-card';
      card.dataset.id = id;
      card.innerHTML = `
        <div class="cmd-header">
          <span class="cmd-name" ${cmd.aliases ? `data-aliases="${cmd.aliases}"` : ''}>${cmd.name}</span>
          ${cmd.args ? `<span class="cmd-args">${cmd.args}</span>` : ''}
        </div>
        <div class="cmd-desc">${cmd.description}</div>
        <div class="admin-actions">
          <button class="admin-btn btn-small edit-btn" data-id="${id}">Edit</button>
          <button class="admin-btn btn-small btn-delete delete-btn" data-id="${id}">Delete</button>
        </div>
      `;
      
      if (cmd.category === 'main') {
        mainGrid.appendChild(card);
      } else {
        extraGrid.appendChild(card);
      }
    });

    // Add listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); openModal(e.target.dataset.id); };
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); deleteCommand(e.target.dataset.id); };
    });
  });
}

async function openModal(id = null) {
  commandForm.reset();
  document.getElementById('command-id').value = id || '';
  
  if (id) {
    modalTitle.textContent = 'Edit Command';
    const snapshot = await getDocs(collection(db, "commands"));
    const cmd = snapshot.docs.find(d => d.id === id).data();
    document.getElementById('cmd-name').value = cmd.name;
    document.getElementById('cmd-aliases').value = cmd.aliases || '';
    document.getElementById('cmd-args').value = cmd.args || '';
    document.getElementById('cmd-desc').value = cmd.description;
    document.getElementById('cmd-category').value = cmd.category;
    document.getElementById('cmd-order').value = cmd.order || 0;
  } else {
    modalTitle.textContent = 'Add New Command';
    document.getElementById('cmd-order').value = 999; // Default to end
  }
  
  commandModal.style.display = 'flex';
}

addCommandBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', () => commandModal.style.display = 'none');

commandForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('command-id').value;
  const data = {
    name: document.getElementById('cmd-name').value,
    aliases: document.getElementById('cmd-aliases').value,
    args: document.getElementById('cmd-args').value,
    description: document.getElementById('cmd-desc').value,
    category: document.getElementById('cmd-category').value,
    order: parseInt(document.getElementById('cmd-order').value, 10),
    updatedAt: new Date()
  };

  try {
    if (id) {
      await updateDoc(doc(db, "commands", id), data);
    } else {
      data.createdAt = new Date();
      await addDoc(collection(db, "commands"), data);
    }
    commandModal.style.display = 'none';
  } catch (err) {
    alert("Error saving command: " + err.message);
  }
});

async function deleteCommand(id) {
  if (confirm("Are you sure you want to delete this command?")) {
    await deleteDoc(doc(db, "commands", id));
  }
}
