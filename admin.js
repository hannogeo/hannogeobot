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
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { migrate } from './migrate.js';

const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const migrateBtn = document.getElementById('migrate-btn');
const commandsList = document.getElementById('commands-list');
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
    .then(() => {
      loginError.style.display = 'none';
    })
    .catch((error) => {
      console.error(error);
      loginError.style.display = 'block';
    });
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

migrateBtn.addEventListener('click', () => {
  migrate();
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    loadCommands();
  } else {
    loginSection.style.display = 'block';
    dashboard.style.display = 'none';
  }
});

// --- Commands CRUD ---

let unsubscribe = null;

function loadCommands() {
  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "commands"), orderBy("order", "asc"));
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    commandsList.innerHTML = '';
    if (snapshot.empty) {
      commandsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No commands found. Add your first one!</p>';
      return;
    }

    snapshot.forEach((doc) => {
      const cmd = doc.data();
      const id = doc.id;
      
      const item = document.createElement('div');
      item.className = 'command-item';
      item.innerHTML = `
        <div class="command-info">
          <h3>${cmd.name} <span style="font-size: 0.8rem; opacity: 0.6; color: white;">(${cmd.category})</span></h3>
          <p>${cmd.args || ''}</p>
          <p style="color: var(--text-primary); margin-top: 5px;">${cmd.description}</p>
        </div>
        <div class="action-btns">
          <button class="admin-btn btn-small edit-btn" data-id="${id}">Edit</button>
          <button class="admin-btn btn-small btn-delete delete-btn" data-id="${id}">Delete</button>
        </div>
      `;
      commandsList.appendChild(item);
    });

    // Add listeners to new buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openModal(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => deleteCommand(e.target.dataset.id));
    });
  });
}

async function openModal(id = null) {
  commandForm.reset();
  document.getElementById('command-id').value = id || '';
  
  if (id) {
    modalTitle.textContent = 'Edit Command';
    // Fetch current data (could also get from local state if we kept it)
    const snapshot = await getDocs(collection(db, "commands"));
    const cmd = snapshot.docs.find(d => d.id === id).data();
    document.getElementById('cmd-name').value = cmd.name;
    document.getElementById('cmd-args').value = cmd.args || '';
    document.getElementById('cmd-desc').value = cmd.description;
    document.getElementById('cmd-category').value = cmd.category;
    document.getElementById('cmd-order').value = cmd.order || 0;
  } else {
    modalTitle.textContent = 'Add New Command';
    document.getElementById('cmd-order').value = 0;
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
