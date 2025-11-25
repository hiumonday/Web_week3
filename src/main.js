import { fetchUsers, createUser, updateUser, deleteUser } from './api.js';

// State
let state = {
  users: [],
  filteredUsers: [],
  currentPage: 1,
  itemsPerPage: 5,
  searchQuery: '',
  isLoading: false,
  editingUserId: null,
};

// DOM Elements
const elements = {
  usersTable: document.getElementById('users-table'),
  usersTbody: document.getElementById('users-tbody'),
  loadingSpinner: document.getElementById('loading-spinner'),
  emptyState: document.getElementById('empty-state'),
  searchInput: document.getElementById('search-input'),
  prevPageBtn: document.getElementById('prev-page-btn'),
  nextPageBtn: document.getElementById('next-page-btn'),
  pageInfo: document.getElementById('page-info'),
  addUserBtn: document.getElementById('add-user-btn'),
  userModal: document.getElementById('user-modal'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  userForm: document.getElementById('user-form'),
  modalTitle: document.getElementById('modal-title'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message'),
};

// Helpers
const showToast = (message, type = 'success') => {
  elements.toastMessage.textContent = message;
  elements.toast.className = `toast show ${type}`;
  setTimeout(() => {
    elements.toast.className = 'toast hidden';
  }, 3000);
};

const toggleModal = (show = true) => {
  if (show) {
    elements.userModal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => elements.userModal.classList.add('active'), 10);
  } else {
    elements.userModal.classList.remove('active');
    setTimeout(() => elements.userModal.classList.add('hidden'), 300);
  }
};

const setLoading = (loading) => {
  state.isLoading = loading;
  if (loading) {
    elements.loadingSpinner.classList.remove('hidden');
    elements.usersTbody.innerHTML = '';
    elements.emptyState.classList.add('hidden');
  } else {
    elements.loadingSpinner.classList.add('hidden');
  }
};

// Rendering
const renderTable = () => {
  elements.usersTbody.innerHTML = '';

  if (state.isLoading) return;

  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end = start + state.itemsPerPage;
  const paginatedUsers = state.filteredUsers.slice(start, end);

  if (paginatedUsers.length === 0) {
    elements.emptyState.classList.remove('hidden');
    return;
  } else {
    elements.emptyState.classList.add('hidden');
  }

  paginatedUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td class="actions-cell">
        <button class="btn-icon edit" data-id="${user.id}" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-icon delete" data-id="${user.id}" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    elements.usersTbody.appendChild(tr);
  });

  renderPagination();
};

const renderPagination = () => {
  const totalPages = Math.ceil(state.filteredUsers.length / state.itemsPerPage);
  elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages || 1}`;

  elements.prevPageBtn.disabled = state.currentPage === 1;
  elements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
};

// Logic
const filterUsers = () => {
  const query = state.searchQuery.toLowerCase();
  state.filteredUsers = state.users.filter(user =>
    user.name.toLowerCase().includes(query)
  );
  state.currentPage = 1; // Reset to first page on search
  renderTable();
};

const handleEdit = (id) => {
  const user = state.users.find(u => u.id === id);
  if (user) {
    state.editingUserId = id;
    elements.modalTitle.textContent = 'Edit User';
    elements.userForm.name.value = user.name;
    elements.userForm.email.value = user.email;
    elements.userForm.phone.value = user.phone;
    toggleModal(true);
  }
};

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await deleteUser(id);
      state.users = state.users.filter(u => u.id !== id);
      filterUsers(); // Re-filter and render
      showToast('User deleted successfully');
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  }
};

// Event Listeners
const initEventListeners = () => {
  // Search
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    filterUsers();
  });

  // Pagination
  elements.prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderTable();
    }
  });

  elements.nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(state.filteredUsers.length / state.itemsPerPage);
    if (state.currentPage < totalPages) {
      state.currentPage++;
      renderTable();
    }
  });

  // Modal
  elements.addUserBtn.addEventListener('click', () => {
    state.editingUserId = null;
    elements.modalTitle.textContent = 'Add New User';
    elements.userForm.reset();
    toggleModal(true);
  });

  elements.closeModalBtn.addEventListener('click', () => toggleModal(false));
  elements.cancelBtn.addEventListener('click', () => toggleModal(false));
  elements.userModal.addEventListener('click', (e) => {
    if (e.target === elements.userModal || e.target.classList.contains('modal-overlay')) {
      toggleModal(false);
    }
  });

  // Form Submit
  elements.userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: elements.userForm.name.value,
      email: elements.userForm.email.value,
      phone: elements.userForm.phone.value,
    };

    try {
      if (state.editingUserId) {
        // Update
        const updatedUser = await updateUser(state.editingUserId, formData);
        // Update local state (merge with existing to keep ID and other fields if any)
        state.users = state.users.map(u =>
          u.id === state.editingUserId ? { ...u, ...formData } : u
        );
        showToast('User updated successfully');
      } else {
        // Create
        const newUser = await createUser(formData);
        // Mock ID generation for visual consistency if API returns fixed ID
        // JSONPlaceholder always returns ID 101. We'll simulate a random ID if it's 101 and we already have it, or just use what they give but handle duplicates visually?
        // Let's just use a random ID for the UI to avoid duplicates if we add multiple
        newUser.id = state.users.length > 0 ? Math.max(...state.users.map(u => u.id)) + 1 : 1;

        state.users.unshift(newUser); // Add to top
        showToast('User created successfully');
      }
      toggleModal(false);
      filterUsers();
    } catch (error) {
      showToast('Operation failed', 'error');
    }
  });

  // Table Actions (Delegation)
  elements.usersTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    if (btn.classList.contains('edit')) {
      handleEdit(id);
    } else if (btn.classList.contains('delete')) {
      handleDelete(id);
    }
  });
};

// Init
const init = async () => {
  initEventListeners();
  setLoading(true);
  try {
    const users = await fetchUsers();
    state.users = users;
    state.filteredUsers = users;
  } catch (error) {
    showToast('Failed to load users', 'error');
  } finally {
    setLoading(false);
    renderTable();
  }
};

init();
