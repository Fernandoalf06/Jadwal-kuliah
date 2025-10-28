// --- IMPOR FIREBASE ---
// Impor fungsi yang Anda perlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  onSnapshot,
  deleteDoc,
  setLogLevel
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// --- KONFIGURASI FIREBASE ---
// Dapatkan config dari global variable (disediakan oleh Canvas)
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

// Dapatkan token auth awal
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Dapatkan App ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('Debug'); // Aktifkan log debug Firebase

// --- DATABASE JADWAL (LOKAL) ---
const allClasses = [
  // Monday
  { id: 'M1', day: 'Monday', startTime: '09:30', endTime: '12:30', subject: 'Teknik Kompilasi **', lecturer: 'Mara Nugraha', location: 'E131', color: 'primary-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'M2', day: 'Monday', startTime: '13:30', endTime: '15:30', subject: 'Pengolahan Citra **', lecturer: 'Noor Vika Hizviani', location: 'E131', color: 'emerald-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'M3', day: 'Monday', startTime: '15:30', endTime: '17:30', subject: 'Bahasa Inggris Bisnis 1', lecturer: 'Hana Fauziah', location: 'E131', color: 'sky-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  
  // Tuesday
  { id: 'TU1', day: 'Tuesday', startTime: '07:30', endTime: '09:30', subject: 'Pengolahan Citra', lecturer: 'Salman Alfarizi', location: 'Lab F8427', color: 'blue-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'TU2', day: 'Tuesday', startTime: '13:30', endTime: '15:30', subject: 'Rekayasa Perangkat Lunak 2', lecturer: 'Satya Bara Justitia', location: 'Online', color: 'cyan-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },

  // Wednesday
  { id: 'W1', day: 'Wednesday', startTime: '09:30', endTime: '11:30', subject: 'Rekayasa Perangkat Lunak 2 */**', lecturer: 'Linda Handayani', location: 'E332', color: 'amber-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'W2', day: 'Wednesday', startTime: '12:30', endTime: '14:30', subject: 'Algoritma Deep Learning', lecturer: 'Fauziah Supardi', location: 'E348', color: 'rose-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'W3', day: 'Wednesday', startTime: '14:30', endTime: '17:30', subject: 'Pengel. Proyek Perangkat Lunak', lecturer: 'Nuryuliani', location: 'E443', color: 'violet-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  
  // Thursday
  { id: 'T1', day: 'Thursday', startTime: 'TBD', endTime: 'TBD', subject: 'Robotika Cerdas', lecturer: 'Team Teaching', location: 'UGTV (V-CLASS)', color: 'indigo-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  
  // Friday
  { id: 'F1', day: 'Friday', startTime: '07:30', endTime: '09:30', subject: 'Praktikum Robotika Cerdas', lecturer: 'Tim Dosen', location: 'V-CLASS', color: 'fuchsia-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  
  // Saturday
  { id: 'S1', day: 'Saturday', startTime: '09:30', endTime: '11:30', subject: 'Forensik Teknologi Informasi', lecturer: 'Arum Tri Iswari Purwanti', location: 'G124', color: 'teal-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
  { id: 'S2', day: 'Saturday', startTime: '11:30', endTime: '14:30', subject: 'Pemodelan dan Simulasi', lecturer: 'Koko Bachrudin', location: 'G124', color: 'orange-500', vclassLink: '#', lecturerEmail: 'dosen@example.com' },
];

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const daysOfWeekEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayIndexMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0 };
const dayNameMap = { 'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu' };

// --- STATE ---
let currentView = 'weekly';
let currentDailyDay = new Date().getDay();
let currentSearch = '';

// State untuk Data Firebase (akan diisi saat login)
let allNotes = {};
let allTodos = {};
let userId = null; // ID pengguna yang sedang login
let notesListener = null; // Penyimpan listener snapshot
let todosListener = null; // Penyimpan listener snapshot

let currentLiveClassId = null;
let currentNextClassId = null;
let nextClassCountdown = '';
let toastTimeout;
let sentNotifications = {}; // Direset setiap sesi, kita tidak pakai localStorage lagi

// --- DOM ELEMENTS ---
// Layar UI
const authScreen = document.getElementById('auth-screen');
const loadingScreen = document.getElementById('loading-screen');
const mainApp = document.getElementById('main-app');

// Form Autentikasi
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authToggle = document.getElementById('auth-toggle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authMessage = document.getElementById('auth-message');
const authTitle = document.getElementById('auth-title');

// UI Utama
const logoutButton = document.getElementById('logout-button');
const liveClassBanner = document.getElementById('live-class-banner');
const scheduleGrid = document.getElementById('schedule-grid');
const tasksView = document.getElementById('tasks-view');
const noResultsEl = document.getElementById('no-results');
const searchInput = document.getElementById('search-all');
const viewToggleButtons = document.querySelectorAll('.btn-toggle button');
const dailyViewControls = document.getElementById('daily-view-controls');
const daySelect = document.getElementById('day-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeIcon = document.getElementById('dark-mode-icon');

// Modal Detail
const detailsModal = document.getElementById('details-modal');
const detailsModalContent = detailsModal.querySelector('.modal-content');
const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
const closeDetailsModalBtnBottom = document.getElementById('close-details-modal-btn-bottom');
const detailsModalClassId = document.getElementById('details-modal-class-id');
const detailsModalSubjectTitle = document.getElementById('details-modal-subject-title');

// Tab Modal
const tabBtnNotes = document.getElementById('tab-btn-notes');
const tabBtnTodos = document.getElementById('tab-btn-todos');
const notesPanel = document.getElementById('notes-panel');
const todoPanel = document.getElementById('todo-panel');

// Panel Catatan
const saveNotesBtn = document.getElementById('save-notes-btn');
const modalNotesTextarea = document.getElementById('modal-notes-textarea');

// Panel Tugas
const addTodoForm = document.getElementById('add-todo-form');
const newTodoInput = document.getElementById('new-todo-input');
const newTodoDeadline = document.getElementById('new-todo-deadline');
const todoListContainer = document.getElementById('todo-list-container');

// Toast
const toastEl = document.getElementById('toast');
const toastContent = document.getElementById('toast-content');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

// --- FUNGSI-FUNGSI UTAMA ---

/**
 * Titik masuk aplikasi. Mengatur listener status autentikasi.
 */
function initializeAppCore() {
  // Daftarkan Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker terdaftar.', reg))
        .catch(err => console.log('Pendaftaran Service Worker gagal:', err));
    });
  }

  // Listener status autentikasi Firebase
  onAuthStateChanged(auth, async (user) => {
    // Hapus listener data lama jika ada
    if (notesListener) notesListener();
    if (todosListener) todosListener();
    
    if (user) {
      // --- PENGGUNA LOGIN ---
      userId = user.uid;
      console.log('Pengguna login:', userId);

      // Tampilkan loading, sembunyikan auth
      authScreen.classList.add('hidden');
      mainApp.classList.add('hidden');
      loadingScreen.classList.remove('hidden');

      // Muat data pengguna
      await loadAllUserData();

      // Sembunyikan loading, tampilkan aplikasi
      loadingScreen.classList.add('hidden');
      mainApp.classList.remove('hidden');

      // Jalankan logika UI utama
      runMainAppLogic();

    } else {
      // --- PENGGUNA LOGOUT ---
      userId = null;
      console.log('Pengguna logout.');

      // Reset state lokal
      allNotes = {};
      allTodos = {};
      
      // Tampilkan layar login
      loadingScreen.classList.add('hidden');
      mainApp.classList.add('hidden');
      authScreen.classList.remove('hidden');
      
      // Pastikan listener login disetel
      setupAuthListeners();
    }
  });

  // Coba login dengan token kustom jika ada
  if (initialAuthToken) {
    signInWithCustomToken(auth, initialAuthToken).catch((error) => {
      console.error("Gagal login dengan token:", error);
      // Jika gagal, biarkan onAuthStateChanged menangani (akan fallback ke anonim atau login manual)
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(err => console.error("Gagal login anonim:", err));
      }
    });
  } else if (!auth.currentUser) {
    // Fallback ke login anonim jika tidak ada token
    signInAnonymously(auth).catch(err => console.error("Gagal login anonim:", err));
  }
}

/**
 * Mengatur listener untuk data pengguna (Catatan & Tugas) dari Firestore.
 */
async function loadAllUserData() {
  if (!userId) return;

  // Path ke data pengguna
  const notesPath = `artifacts/${appId}/users/${userId}/notes`;
  const todosPath = `artifacts/${appId}/users/${userId}/todos`;
  
  // Buat promise untuk kedua listener
  const notesPromise = new Promise((resolve) => {
    const notesQuery = collection(db, notesPath);
    notesListener = onSnapshot(notesQuery, (snapshot) => {
      allNotes = {}; // Reset state lokal
      snapshot.forEach((doc) => {
        allNotes[doc.id] = doc.data().text; // Simpan catatan berdasarkan ID kelas
      });
      console.log('Data Catatan dimuat/diperbarui.');
      if(currentView !== 'tasks') renderSchedule(); // Render ulang jika di tampilan jadwal
      resolve();
    }, (error) => {
        console.error("Error memuat catatan:", error);
        resolve(); // Tetap resolve agar aplikasi lanjut
    });
  });

  const todosPromise = new Promise((resolve) => {
    const todosQuery = collection(db, todosPath);
    todosListener = onSnapshot(todosQuery, (snapshot) => {
      allTodos = {}; // Reset state lokal
      snapshot.forEach((doc) => {
        allTodos[doc.id] = doc.data().tasks; // Simpan tugas berdasarkan ID kelas
      });
      console.log('Data Tugas dimuat/diperbarui.');
      // Render ulang tampilan yang relevan
      if(currentView === 'tasks') renderAllTasksView();
      if(currentView !== 'tasks') renderSchedule();
      checkDeadlinesToast(); // Cek toast deadline
      checkTaskDeadlineReminders(); // Cek notifikasi deadline
      resolve();
    }, (error) => {
        console.error("Error memuat tugas:", error);
        resolve(); // Tetap resolve agar aplikasi lanjut
    });
  });

  // Tunggu kedua data setidaknya dimuat sekali
  await Promise.all([notesPromise, todosPromise]);
  console.log('Semua data pengguna selesai dimuat.');
}

/**
 * Menjalankan logika UI setelah login berhasil dan data dimuat.
 */
function runMainAppLogic() {
  // Setel listener logout
  logoutButton.addEventListener('click', () => {
    signOut(auth);
  });
  
  // Setel listener UI utama (pencarian, toggle, dll)
  setupMainEventListeners();

  // Logika Dark Mode
  if (localStorage.getItem('darkMode') === 'true' || 
     (!localStorage.getItem('darkMode') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setDarkMode(true);
  } else {
    setDarkMode(false);
  }
  
  // Kembalikan tampilan terakhir
  const savedView = localStorage.getItem('lastView4IA16');
  if (savedView) {
    currentView = savedView;
  }
  
  // Atur tampilan awal
  currentDailyDay = new Date().getDay();
  daySelect.value = currentDailyDay;
  
  viewToggleButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === currentView);
  });
  
  dailyViewControls.classList.toggle('hidden', currentView !== 'daily');
  scheduleGrid.classList.toggle('hidden', currentView === 'tasks');
  tasksView.classList.toggle('hidden', currentView !== 'tasks');

  if (currentView === 'tasks') {
    renderAllTasksView();
    searchInput.disabled = true;
    searchInput.placeholder = 'Pencarian di non-aktifkan di Tampilan Tugas';
  } else {
    renderSchedule();
    searchInput.disabled = false;
    searchInput.placeholder = 'Cari mata kuliah atau dosen...';
  }
  
  // Jalankan interval pengecekan notifikasi & status live
  const checkAllReminders = () => {
    updateLiveStatusAndReminders();
    checkTaskDeadlineReminders();
  };
  
  checkAllReminders(); // Jalankan sekali
  setInterval(checkAllReminders, 60000); // Ulangi setiap menit
  
  checkDeadlinesToast(); // Tampilkan toast deadline saat muat
  
  // Minta izin notifikasi setelah 5 detik
  setTimeout(requestNotificationPermission, 5000);
}

// --- FUNGSI AUTENTIKASI ---

let isLoginMode = true;

/**
 * Mengatur listener untuk form login/register.
 */
function setupAuthListeners() {
  // Toggle antara Login dan Register
  authToggle.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      authTitle.textContent = 'Login';
      authSubmitBtn.textContent = 'Login';
      authToggle.textContent = 'Belum punya akun? Daftar';
    } else {
      authTitle.textContent = 'Daftar Akun Baru';
      authSubmitBtn.textContent = 'Daftar';
      authToggle.textContent = 'Sudah punya akun? Login';
    }
    authMessage.textContent = '';
    authMessage.classList.add('hidden');
  });

  // Handle submit form
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmail.value;
    const password = authPassword.value;
    authMessage.textContent = '';
    authMessage.classList.add('hidden');
    authSubmitBtn.disabled = true;

    if (isLoginMode) {
      // --- Mode Login ---
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Login berhasil, onAuthStateChanged akan menangani sisanya
          console.log('Login berhasil:', userCredential.user.uid);
          authSubmitBtn.disabled = false;
        })
        .catch((error) => {
          authMessage.textContent = `Error: ${error.message}`;
          authMessage.classList.remove('hidden');
          authSubmitBtn.disabled = false;
        });
    } else {
      // --- Mode Register ---
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Daftar berhasil, onAuthStateChanged akan menangani sisanya
          console.log('Daftar berhasil:', userCredential.user.uid);
          authSubmitBtn.disabled = false;
        })
        .catch((error) => {
          authMessage.textContent = `Error: ${error.message}`;
          authMessage.classList.remove('hidden');
          authSubmitBtn.disabled = false;
        });
    }
  });
}

// --- FUNGSI RENDER TAMPILAN ---

function createClassCard(classItem) {
  if (!classItem) return ''; // Pengaman jika classItem null
  
  const timeDisplay = (classItem.startTime === 'TBD') ? 'Waktu TBD' : `${classItem.startTime} - ${classItem.endTime}`;
  
  // Ambil data dari state yang disinkronkan Firebase
  const hasNote = allNotes[classItem.id] && allNotes[classItem.id].trim() !== '';
  const noteIconClass = hasNote ? 'filled' : '';
  
  const todos = allTodos[classItem.id] || [];
  const activeTodoCount = todos.filter(todo => !todo.completed).length;
  const todoBadgeHTML = activeTodoCount > 0 
    ? `<span class="todo-badge">${activeTodoCount}</span>` 
    : '';
  
  let statusHTML = '';
  let cardClass = '';

  if (classItem.id === currentLiveClassId) {
    cardClass = 'is-live';
    statusHTML = `<span class="live-status bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">SEKARANG</span>`;
  } else if (classItem.id === currentNextClassId) {
    cardClass = 'is-next';
    statusHTML = `<span class="live-status bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">${nextClassCountdown}</span>`;
  }
  
  const borderColorClass = `border-${classItem.color}`;
  const textColorClass = `text-${classItem.color.split('-')[0]}-700 dark:text-${classItem.color.split('-')[0]}-400`;

  // Tombol kalender dinonaktifkan jika TBD
  const calendarBtnDisabled = classItem.startTime === 'TBD' ? 'disabled' : '';
  const calendarBtnClass = classItem.startTime === 'TBD' ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-primary hover:text-primary-700 dark:hover:text-primary-300';
  const calendarBtnText = classItem.startTime === 'TBD' ? 'Waktu TBD' : 'Add to Calendar';

  return `
    <div class="card bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border-l-4 ${borderColorClass} ${cardClass}" data-class-id="${classItem.id}">
      <!-- Bagian atas kartu yang bisa diklik -->
      <div class="p-4 cursor-pointer card-main-content" data-class-id="${classItem.id}" data-tab="notes">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider ${textColorClass}">4IA16</span>
          ${statusHTML}
        </div>
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">${classItem.subject}</h3>
        
        <a href="mailto:${classItem.lecturerEmail}" title="Email ${classItem.lecturer}" class="text-sm text-slate-600 dark:text-slate-400 mb-3 block hover:underline" data-action="email">
          ${classItem.lecturer}
        </a>
        
        <div class="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2 gap-2">
          <span class="material-symbols-outlined">schedule</span>
          <span>${timeDisplay}</span>
        </div>
        <div class="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
          <span class="material-symbols-outlined">location_on</span>
          <span>${classItem.location}</span>
        </div>
      </div>
      
      <!-- Bagian bawah kartu (tombol aksi) -->
      <div class="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex justify-between items-center">
        <button class="flex-1 text-center text-sm font-medium ${calendarBtnClass} flex items-center justify-center gap-2 btn-add-calendar" ${calendarBtnDisabled}>
          <span class="material-symbols-outlined">add</span>
          ${calendarBtnText}
        </button>
        <div class="flex gap-1">
          <a href="${classItem.vclassLink}" target="_blank" class="p-1 -m-1 text-slate-400 hover:text-primary dark:hover:text-primary-300" title="Buka V-Class/Link" data-action="link">
            <span class="material-symbols-outlined">link</span>
          </a>
          <button class="p-1 -m-1 text-slate-400 hover:text-primary dark:hover:text-primary-300 btn-open-details relative" data-tab="todos" title="Daftar Tugas">
            <span class="material-symbols-outlined">checklist</span>
            ${todoBadgeHTML}
          </button>
          <button class="p-1 -m-1 text-slate-400 hover:text-primary dark:hover:text-primary-300 btn-open-details" data-tab="notes" title="Catatan Mata Kuliah">
            <span class="material-symbols-outlined ${noteIconClass}">note</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderLiveClassBanner() {
  if (currentLiveClassId) {
    const classItem = allClasses.find(c => c.id === currentLiveClassId);
    if (classItem) {
      liveClassBanner.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="live-status bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">SEKARANG</span>
              <span class="font-semibold text-slate-900 dark:text-slate-100">${classItem.subject}</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-12 sm:ml-0">
              di ${classItem.location} (berakhir pkl ${classItem.endTime})
            </p>
          </div>
          <div class="flex-shrink-0 flex items-center gap-3">
            <a href="${classItem.vclassLink}" target="_blank" class="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined">link</span> Buka Link
            </a>
            <button class="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 btn-open-details" data-class-id="${classItem.id}" data-tab="notes">
              <span class="material-symbols-outlined">note</span> Catatan
            </button>
          </div>
        </div>
      `;
      liveClassBanner.classList.remove('hidden');
    }
  } else {
    liveClassBanner.classList.add('hidden');
    liveClassBanner.innerHTML = '';
  }
}

function getFilteredClasses() {
  return allClasses.filter(classItem => {
    const searchMatch = currentSearch === '' ||
      classItem.subject.toLowerCase().includes(currentSearch) ||
      classItem.lecturer.toLowerCase().includes(currentSearch) ||
      classItem.location.toLowerCase().includes(currentSearch);
    return searchMatch;
  });
}

function renderSchedule() {
  scheduleGrid.innerHTML = '';
  const filteredClasses = getFilteredClasses();
  
  let daysToRender;
  if (currentView === 'weekly') {
      daysToRender = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      scheduleGrid.classList.remove('xl:grid-cols-1', 'max-w-2xl', 'mx-auto');
      scheduleGrid.classList.add('sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-6');
  } else {
      daysToRender = [daysOfWeekEN[currentDailyDay]];
      scheduleGrid.classList.remove('sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-6');
      scheduleGrid.classList.add('xl:grid-cols-1', 'max-w-2xl', 'mx-auto');
  }
  
  let totalClassesRendered = 0;

  for (const day of daysToRender) {
    const classesForDay = filteredClasses.filter(c => c.day === day).sort((a, b) => {
        if (a.startTime === 'TBD') return 1;
        if (b.startTime === 'TBD') return -1;
        const timeA = parseInt(a.startTime.replace(':', ''), 10);
        const timeB = parseInt(b.startTime.replace(':', ''), 10);
        return timeA - timeB;
    });
    
    const dayColumn = document.createElement('div');
    dayColumn.className = 'space-y-4';
    
    const dayHeader = document.createElement('h2');
    dayHeader.className = 'text-lg font-semibold text-center text-slate-800 dark:text-slate-200 sticky top-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm py-2 z-10';
    dayHeader.textContent = dayNameMap[day];
    dayColumn.appendChild(dayHeader);

    if (classesForDay.length > 0) {
      classesForDay.forEach(classItem => {
        dayColumn.innerHTML += createClassCard(classItem);
        totalClassesRendered++;
      });
    } else {
      dayColumn.innerHTML += `
        <div class="text-center pt-4">
          <p class="text-slate-500 dark:text-slate-400">Tidak ada kelas.</p>
        </div>
      `;
    }
    scheduleGrid.appendChild(dayColumn);
  }
  
  noResultsEl.classList.toggle('hidden', totalClassesRendered > 0 || filteredClasses.length === allClasses.length);
}

function renderAllTasksView() {
  tasksView.innerHTML = '';
  
  const allActiveTasks = Object.entries(allTodos)
    .flatMap(([classId, todos]) => 
      (todos || []).map(todo => ({
        ...todo,
        classId: classId,
        classItem: allClasses.find(c => c.id === classId)
      }))
    )
    .filter(task => !task.completed && task.classItem);

  allActiveTasks.sort((a, b) => {
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
  
  if (allActiveTasks.length === 0) {
    tasksView.innerHTML = `
      <div class="text-center py-12">
        <span class="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600">task_alt</span>
        <h3 class="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Semua Tugas Selesai!</h3>
        <p class="mt-1 text-slate-500 dark:text-slate-400">Anda tidak memiliki tugas aktif.</p>
      </div>
    `;
    return;
  }
  
  const { today, tomorrow, thisWeek, nextWeek, later, noDeadline } = groupTasksByDeadline(allActiveTasks);

  tasksView.innerHTML += createTaskGroupHTML('Jatuh Tempo Hari Ini', today, 'text-red-600 dark:text-red-400');
  tasksView.innerHTML += createTaskGroupHTML('Jatuh Tempo Besok', tomorrow, 'text-orange-600 dark:text-orange-400');
  tasksView.innerHTML += createTaskGroupHTML('Minggu Ini', thisWeek, 'text-yellow-600 dark:text-yellow-400');
  tasksView.innerHTML += createTaskGroupHTML('Minggu Depan', nextWeek, 'text-sky-600 dark:text-sky-400');
  tasksView.innerHTML += createTaskGroupHTML('Nanti', later, 'text-slate-600 dark:text-slate-400');
  tasksView.innerHTML += createTaskGroupHTML('Tanpa Deadline', noDeadline, 'text-slate-500 dark:text-slate-500');
}

function groupTasksByDeadline(tasks) {
  const groups = { today: [], tomorrow: [], thisWeek: [], nextWeek: [], later: [], noDeadline: [] };
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - now.getDay()) + 1); // Akhir hari Minggu
  endOfWeek.setHours(23, 59, 59, 999);
  
  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfWeek.getDate() + 7);

  for (const task of tasks) {
    if (!task.deadline) {
      groups.noDeadline.push(task);
      continue;
    }
    
    // Penting: Gunakan T23:59:59 untuk menghindari masalah timezone
    const taskDate = new Date(task.deadline + 'T23:59:59'); 
    
    if (task.deadline === todayStr) {
      groups.today.push(task);
    } else if (task.deadline === tomorrowStr) {
      groups.tomorrow.push(task);
    } else if (taskDate > tomorrow && taskDate <= endOfWeek) {
      groups.thisWeek.push(task);
    } else if (taskDate > endOfWeek && taskDate <= endOfNextWeek) {
      groups.nextWeek.push(task);
    } else if (taskDate > endOfNextWeek) {
      groups.later.push(task);
    }
  }
  return groups;
}

function createTaskGroupHTML(title, tasks, titleColor) {
  if (tasks.length === 0) return '';
  
  const taskItemsHTML = tasks.map(task => `
    <div class="flex items-start justify-between p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">
      <div>
        <p class="font-medium text-slate-900 dark:text-slate-100">${task.text}</p>
        <p class="text-sm text-primary-700 dark:text-primary-400">${task.classItem.subject}</p>
      </div>
      <div class="text-right flex-shrink-0 ml-4">
        <p class="text-sm font-medium ${titleColor}">${task.deadline ? formatDate(task.deadline) : '...'}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">(${getDaysRemaining(task.deadline)})</p>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="space-y-3">
      <h3 class="text-lg font-semibold ${titleColor}">${title}</h3>
      <div class="space-y-2">
        ${taskItemsHTML}
      </div>
    </div>
  `;
}

// --- FUNGSI STATUS & PENGINGAT ---

function updateLiveStatusAndReminders() {
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentDayName = daysOfWeekEN[currentDayIndex];
    const currentTimeInt = now.getHours() * 100 + now.getMinutes(); 

    let foundLive = false;
    let foundNext = false;
    currentLiveClassId = null;
    currentNextClassId = null;
    nextClassCountdown = '';

    const todayClasses = allClasses
        .filter(c => c.day === currentDayName && c.startTime !== 'TBD')
        .sort((a, b) => {
            const timeA = parseInt(a.startTime.replace(':', ''), 10);
            const timeB = parseInt(b.startTime.replace(':', ''), 10);
            return timeA - timeB;
        });

    for (const classItem of todayClasses) {
        const startTimeInt = parseInt(classItem.startTime.replace(':', ''), 10);
        const endTimeInt = parseInt(classItem.endTime.replace(':', ''), 10);

        if (!foundLive && currentTimeInt >= startTimeInt && currentTimeInt < endTimeInt) {
            currentLiveClassId = classItem.id;
            foundLive = true;
            if (sentNotifications['class-' + classItem.id]) {
              delete sentNotifications['class-' + classItem.id];
            }
        }

        if (!foundLive && !foundNext && currentTimeInt < startTimeInt) {
            currentNextClassId = classItem.id;
            foundNext = true;
            
            const startHour = Math.floor(startTimeInt / 100);
            const startMinute = startTimeInt % 100;
            const classStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
            const diffMs = classStartTime - now;
            const diffMins = Math.ceil(diffMs / 60000);

            if (diffMins > 60) {
                const diffHours = Math.ceil(diffMins / 60);
                nextClassCountdown = `Mulai ${diffHours} jam lagi`;
            } else if (diffMins > 0) {
                 nextClassCountdown = `Mulai ${diffMins} mnt lagi`;
            } else {
                nextClassCountdown = `Segera Mulai`;
            }
            
            // Logika Notifikasi Kelas
            const notificationId = 'class-' + classItem.id;
            if (diffMins > 0 && diffMins <= 60 && !sentNotifications[notificationId]) {
              showBrowserNotification(
                `Kelas Segera Mulai: ${classItem.subject}`,
                {
                  body: `Lokasi: ${classItem.location}\nWaktu: ${classItem.startTime}`,
                  icon: 'https://placehold.co/192x192/A91D3A/white?text=SK',
                  tag: notificationId
                },
                notificationId
              );
            }
            break; 
        }
    }
    
    renderLiveClassBanner();
    if (currentView !== 'tasks') {
       renderSchedule();
    }
}

function checkTaskDeadlineReminders() {
  const now = new Date();
  const allActiveTasks = Object.values(allTodos)
    .flat()
    .filter(task => !task.completed && task.deadline);

  for (const task of allActiveTasks) {
    const deadlineTime = new Date(task.deadline + 'T00:00:00'); // Awal hari deadline
    
    const diffMs = deadlineTime.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000); // Menit tersisa
    const notificationId = 'task-' + task.id;

    // Kirim notifikasi jika deadline kurang dari 24 jam (1440 menit)
    if (diffMins > 0 && diffMins <= 1440 && !sentNotifications[notificationId]) {
      const classItem = allClasses.find(c => c.id === task.classId);
      showBrowserNotification(
        `Deadline Tugas: ${task.text}`,
        {
          body: `Mata kuliah: ${classItem.subject}\nJatuh tempo: Besok`,
          icon: 'https://placehold.co/192x192/f59e0b/white?text=!',
          tag: notificationId
        },
        notificationId
      );
    }
  }
}

function checkDeadlinesToast() {
    const allActiveTasks = Object.values(allTodos)
        .flat()
        .filter(task => !task.completed && task.deadline);
        
    if (allActiveTasks.length === 0) return;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dueTodayCount = allActiveTasks.filter(t => t.deadline === todayStr).length;
    const dueTomorrowCount = allActiveTasks.filter(t => t.deadline === tomorrowStr).length;

    let message = '';
    if (dueTodayCount > 0 && dueTomorrowCount > 0) {
        message = `Anda punya ${dueTodayCount} tugas hari ini & ${dueTomorrowCount} besok.`;
    } else if (dueTodayCount > 0) {
        message = `Anda punya ${dueTodayCount} tugas jatuh tempo hari ini!`;
    } else if (dueTomorrowCount > 0) {
        message = `Anda punya ${dueTomorrowCount} tugas jatuh tempo besok.`;
    }
    
    if (message) {
        showToast(message, 'warning', 6000);
    }
}

// --- FUNGSI MODAL DETAIL (CATATAN & TUGAS) ---

function openDetailsModal(classId, initialTab = 'notes') {
    const classItem = allClasses.find(c => c.id === classId);
    if (!classItem) return;
    
    detailsModalClassId.value = classId;
    detailsModalSubjectTitle.textContent = classItem.subject;
    
    // Ambil catatan dari state
    modalNotesTextarea.value = allNotes[classId] || '';
    
    // Render tugas dari state
    renderTodoList(classId);
    
    detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      detailsModalContent.style.transform = 'scale(1)';
      detailsModalContent.style.opacity = '1';
    }, 10);
    
    showTab(initialTab);
}

function closeDetailsModal() {
    detailsModalContent.classList.add('modal-closing');
    setTimeout(() => {
        detailsModal.classList.add('hidden');
        document.body.style.overflow = '';
        detailsModalContent.classList.remove('modal-closing');
        newTodoDeadline.value = '';
        newTodoInput.value = '';
    }, 200);
}

function showTab(tabName) {
    if (tabName === 'notes') {
        notesPanel.classList.remove('hidden');
        todoPanel.classList.add('hidden');
        tabBtnNotes.classList.add('active');
        tabBtnTodos.classList.remove('active');
    } else {
        notesPanel.classList.add('hidden');
        todoPanel.classList.remove('hidden');
        tabBtnNotes.classList.remove('active');
        tabBtnTodos.classList.add('active');
        newTodoInput.focus();
    }
}

/**
 * Menyimpan catatan ke Firestore.
 */
async function saveNotes() {
    if (!userId) return showToast('Error: Anda tidak login.', 'warning');
    
    const classId = detailsModalClassId.value;
    const noteText = modalNotesTextarea.value;
    const notesPath = `artifacts/${appId}/users/${userId}/notes`;
    
    try {
      if (noteText.trim() === '') {
        // Hapus catatan jika kosong
        await deleteDoc(doc(db, notesPath, classId));
        showToast("Catatan dihapus!");
      } else {
        // Simpan catatan
        await setDoc(doc(db, notesPath, classId), { text: noteText });
        showToast("Catatan disimpan!");
      }
      
      // onSnapshot akan otomatis memperbarui UI, tapi kita tutup modal
      closeDetailsModal();
      
    } catch (error) {
      console.error("Error menyimpan catatan:", error);
      showToast(`Error: ${error.message}`, 'warning');
    }
}

// --- FUNGSI-FUNGSI TUGAS (TODO) ---

function renderTodoList(classId) {
    todoListContainer.innerHTML = '';
    const todos = allTodos[classId] || [];
    
    if (todos.length === 0) {
        todoListContainer.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada tugas.</p>`;
        return;
    }
    
    // Salin dan urutkan
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed - b.completed;
        }
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return a.deadline ? -1 : 1;
    });

    sortedTodos.forEach(todo => {
        const todoEl = createTodoElement(todo);
        todoListContainer.appendChild(todoEl);
    });
}

function createTodoElement(todo) {
  const todoEl = document.createElement('div');
  todoEl.className = `todo-item p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${todo.completed ? 'completed' : ''}`;
  todoEl.dataset.todoId = todo.id;
  
  const deadlineHTML = todo.deadline 
    ? `<div class="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8">
         <span class="material-symbols-outlined !text-[16px] -mb-[3px]">calendar_today</span>
         ${formatDate(todo.deadline)} (${getDaysRemaining(todo.deadline)})
       </div>`
    : '';
  
  todoEl.innerHTML = `
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 flex-1 min-w-0">
            <input type="checkbox" data-todo-id="${todo.id}" class="todo-checkbox w-5 h-5 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-600 dark:bg-slate-700 flex-shrink-0" ${todo.completed ? 'checked' : ''}>
            <label class="flex-1 text-slate-800 dark:text-slate-200 cursor-pointer todo-text-label truncate" data-todo-id="${todo.id}">${todo.text}</label>
        </div>
        <button data-todo-id="${todo.id}" class="todo-delete-btn text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 flex-shrink-0">
            <span class="material-symbols-outlined">delete</span>
        </button>
    </div>
    ${deadlineHTML}
  `;
  return todoEl;
}

function addTodo(event) {
    event.preventDefault();
    if (!userId) return showToast('Error: Anda tidak login.', 'warning');
    
    const classId = detailsModalClassId.value;
    const text = newTodoInput.value.trim();
    const deadline = newTodoDeadline.value || null;
    
    if (text === '') return;
    
    // Perbarui state lokal
    if (!allTodos[classId]) {
        allTodos[classId] = [];
    }
    
    const newTodo = {
        id: `todo-${Date.now()}`,
        text: text,
        completed: false,
        deadline: deadline
    };
    
    allTodos[classId].push(newTodo);
    
    // Simpan ke Firestore
    saveTodosForClass(classId);
    
    // Render ulang list (untuk animasi)
    const emptyMsg = todoListContainer.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    
    const todoEl = createTodoElement(newTodo);
    todoEl.classList.add('todo-item-entering');
    todoListContainer.appendChild(todoEl);
    
    setTimeout(() => {
      renderTodoList(classId); // Render ulang untuk pengurutan
    }, 300); 
    
    updateTodoBadge(classId);
    newTodoInput.value = '';
    newTodoDeadline.value = '';
    
    showToast("Tugas berhasil ditambahkan!");
}

function toggleTodo(classId, todoId) {
    if (!userId) return;
    
    const todo = allTodos[classId]?.find(t => t.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodosForClass(classId); // Simpan ke Firestore
        
        // Hapus notifikasi jika tugas selesai
        if (todo.completed) {
          const notificationId = 'task-' + todo.id;
          if (sentNotifications[notificationId]) {
            delete sentNotifications[notificationId];
          }
        }
        
        // onSnapshot akan menangani render ulang, tapi kita panggil manual agar instan
        renderTodoList(classId); 
        updateTodoBadge(classId);
        if(currentView === 'tasks') renderAllTasksView();
    }
}

function deleteTodo(classId, todoId, element) {
    if (!userId) return;
    
    element.classList.add('todo-item-exiting');
    
    setTimeout(() => {
      allTodos[classId] = allTodos[classId]?.filter(t => t.id !== todoId);
      saveTodosForClass(classId); // Simpan ke Firestore
      
      // Hapus notifikasi
      const notificationId = 'task-' + todoId;
      if (sentNotifications[notificationId]) {
        delete sentNotifications[notificationId];
      }
      
      // onSnapshot akan menangani render, tapi kita panggil manual
      element.remove();
      if (!allTodos[classId] || allTodos[classId].length === 0) {
         todoListContainer.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada tugas.</p>`;
      }
      updateTodoBadge(classId);
      if(currentView === 'tasks') renderAllTasksView();
      
    }, 300);
}

function editTodoText(labelElement) {
    const todoId = labelElement.dataset.todoId;
    const currentText = labelElement.textContent;
    
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentText;
    inputElement.className = 'todo-edit-input';
    
    const labelContainer = labelElement.parentElement;
    labelContainer.replaceChild(inputElement, labelElement);
    inputElement.focus();
    
    const saveEdit = () => {
        if (!userId) return;
        const classId = detailsModalClassId.value;
        const newText = inputElement.value.trim();
        const todo = allTodos[classId]?.find(t => t.id === todoId);
        
        if (todo && newText && newText !== currentText) {
            todo.text = newText;
            saveTodosForClass(classId); // Simpan ke Firestore
        }
        
        // Kembalikan ke label (onSnapshot akan memperbarui, tapi ini instan)
        labelContainer.replaceChild(labelElement, inputElement);
        labelElement.textContent = newText || currentText;
        if(currentView === 'tasks') renderAllTasksView();
    };

    inputElement.addEventListener('blur', saveEdit);
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputElement.blur();
        } else if (e.key === 'Escape') {
            labelContainer.replaceChild(labelElement, inputElement);
        }
    });
}

/**
 * Menyimpan seluruh daftar tugas untuk satu kelas ke Firestore.
 */
async function saveTodosForClass(classId) {
    if (!userId) return;
    const todosPath = `artifacts/${appId}/users/${userId}/todos`;
    const tasks = allTodos[classId] || [];
    
    try {
      await setDoc(doc(db, todosPath, classId), { tasks: tasks });
      console.log('Tugas disimpan ke Firestore untuk kelas:', classId);
    } catch (error) {
      console.error("Error menyimpan tugas:", error);
      showToast(`Error menyimpan tugas: ${error.message}`, 'warning');
    }
}

function updateTodoBadge(classId) {
    const card = scheduleGrid.querySelector(`.card[data-class-id="${classId}"]`);
    if (!card) return;
    
    const todos = allTodos[classId] || [];
    const activeTodoCount = todos.filter(todo => !todo.completed).length;
    const badgeBtn = card.querySelector('.btn-open-details[data-tab="todos"]');
    if (!badgeBtn) return;
    
    const existingBadge = badgeBtn.querySelector('.todo-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    if (activeTodoCount > 0) {
        badgeBtn.innerHTML += `<span class="todo-badge">${activeTodoCount}</span>`;
    }
}

// --- FUNGSI UTILITAS & LAIN-LAIN ---

function getGoogleCalendarLink(classItem) {
  const { subject, startTime, endTime, day, location } = classItem;
  if (startTime === 'TBD') return '#'; // Jangan buat link jika TBD

  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  let startDate, endDate;

  const [startHour, startMin] = startTime.split(':');
  const [endHour, endMin] = endTime.split(':');
  const nextDay = getNextDay(dayIndexMap[day]);
  const nextDayEnd = new Date(nextDay.getTime());
  const startDateTime = new Date(nextDay.setHours(startHour, startMin, 0, 0));
  const endDateTime = new Date(nextDayEnd.setHours(endHour, endMin, 0, 0));
  startDate = startDateTime.toISOString().replace(/-|:|\.\d+/g, '');
  endDate = endDateTime.toISOString().replace(/-|:|\.\d+/g, '');

  const params = new URLSearchParams({
    text: subject,
    dates: `${startDate}/${endDate}`,
    details: `Mata Kuliah: ${subject}\nDosen: ${classItem.lecturer}\nKelas: 4IA16`,
    location: location,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${day.substring(0, 2).toUpperCase()}`,
    ctz: 'Asia/Jakarta'
  });

  return `${baseUrl}&${params.toString()}`;
}

function getNextDay(dayIndex) {
  const today = new Date();
  const todayIndex = today.getDay();
  const diff = dayIndex - todayIndex;
  
  const nextDay = new Date(today.getTime()); 
  if (diff > 0) {
    nextDay.setDate(today.getDate() + diff);
  } else if (diff < 0) {
    nextDay.setDate(today.getDate() + diff + 7);
  } else {
    const now = new Date();
    const currentTimeInt = now.getHours() * 100 + now.getMinutes();
    const lastClassTime = Math.max(...allClasses
        .filter(c => c.day === daysOfWeekEN[dayIndex] && c.endTime !== 'TBD')
        .map(c => parseInt(c.endTime.replace(':', ''), 10))
    , 0);
    
    if (currentTimeInt > lastClassTime && lastClassTime !== 0) {
         nextDay.setDate(today.getDate() + 7);
    }
  }
  return nextDay;
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getDaysRemaining(dateString) {
    if (!dateString) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const deadline = new Date(dateString + 'T00:00:00');
    
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Terlewat';
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    return `${diffDays} hari lagi`;
}

function showToast(message, type = 'success', duration = 3000) {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastEl.classList.add('hidden');
        if (toastEl.firstElementChild) {
            toastEl.firstElementChild.classList.remove('animate-fadeOut');
        }
    }
    
    if (type === 'warning') {
        toastContent.classList.remove('bg-slate-900', 'dark:bg-slate-100', 'text-white', 'dark:text-slate-900');
        toastContent.classList.add('bg-warning-100', 'dark:bg-warning-900', 'text-warning-800', 'dark:text-warning-100');
        toastIcon.textContent = 'warning';
    } else {
        toastContent.classList.add('bg-slate-900', 'dark:bg-slate-100', 'text-white', 'dark:text-slate-900');
        toastContent.classList.remove('bg-warning-100', 'dark:bg-warning-900', 'text-warning-800', 'dark:text-warning-100');
        toastIcon.textContent = 'check_circle';
    }
    
    toastMessage.textContent = message;
    toastEl.classList.remove('hidden');
    
    if (toastEl.firstElementChild) {
        toastEl.firstElementChild.classList.remove('animate-fadeOut');
        toastEl.firstElementChild.classList.add('animate-slideIn');
    }

    toastTimeout = setTimeout(() => {
        if (toastEl.firstElementChild) {
            toastEl.firstElementChild.classList.add('animate-fadeOut');
            toastEl.firstElementChild.classList.remove('animate-slideIn');
        }
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, 500);
    }, duration);
}

function setDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        darkModeIcon.textContent = 'dark_mode';
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.classList.remove('dark');
        darkModeIcon.textContent = 'light_mode';
        localStorage.setItem('darkMode', 'false');
    }
}

// --- FUNGSI NOTIFIKASI BROWSER ---

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser ini tidak mendukung notifikasi desktop.');
    return;
  }
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showToast('Notifikasi diaktifkan!', 'success');
      } else {
        showToast('Notifikasi tidak diizinkan.', 'warning');
      }
    });
  }
}

function showBrowserNotification(title, options, notificationId) {
  if (!('Notification' in window)) {
    return; 
  }

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
    sentNotifications[notificationId] = true;
  }
}

// --- EVENT LISTENERS UI UTAMA ---

function setupMainEventListeners() {
  // Hanya pasang listener ini sekali saat aplikasi utama dimuat
  
  // Pencarian
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    if (currentView !== 'tasks') {
      renderSchedule();
    }
  });

  // Toggle Tampilan
  viewToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentView = button.dataset.view;
      localStorage.setItem('lastView4IA16', currentView);
      
      viewToggleButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      dailyViewControls.classList.toggle('hidden', currentView !== 'daily');
      scheduleGrid.classList.toggle('hidden', currentView === 'tasks');
      tasksView.classList.toggle('hidden', currentView !== 'tasks');
      noResultsEl.classList.add('hidden');
      
      if (currentView === 'tasks') {
        renderAllTasksView();
        searchInput.disabled = true;
        searchInput.placeholder = 'Pencarian di non-aktifkan di Tampilan Tugas';
      } else {
        renderSchedule();
        searchInput.disabled = false;
        searchInput.placeholder = 'Cari mata kuliah atau dosen...';
      }
    });
  });

  // Pilihan Hari
  daySelect.addEventListener('change', (e) => {
    currentDailyDay = parseInt(e.target.value, 10);
    renderSchedule();
  });
  
  // Dark Mode
  darkModeToggle.addEventListener('click', () => {
      setDarkMode(!document.documentElement.classList.contains('dark'));
  });

  // Aksi pada Kartu (Event Delegation)
  scheduleGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const classId = card.dataset.classId;
    const classItem = allClasses.find(c => c.id === classId);

    const calendarButton = e.target.closest('.btn-add-calendar');
    const detailsButton = e.target.closest('.btn-open-details');
    const mainContent = e.target.closest('.card-main-content');
    const emailLink = e.target.closest('[data-action="email"]');
    const vclassLink = e.target.closest('[data-action="link"]');

    if (emailLink || vclassLink) {
      // Biarkan link email dan vclass berfungsi normal
      return;
    }
    
    if (calendarButton) {
      if (classItem && classItem.startTime !== 'TBD') {
        const link = getGoogleCalendarLink(classItem);
        window.open(link, '_blank');
      }
    }
    else if (detailsButton) {
      const tab = detailsButton.dataset.tab;
      openDetailsModal(classId, tab);
    }
    else if (mainContent) {
      // Klik di area utama kartu -> buka modal tab 'notes'
      openDetailsModal(classId, 'notes');
    }
  });
  
  // Aksi pada Banner Live
  liveClassBanner.addEventListener('click', (e) => {
      const detailsButton = e.target.closest('.btn-open-details');
      if (detailsButton) {
          const classId = detailsButton.dataset.classId;
          const tab = detailsButton.dataset.tab;
          openDetailsModal(classId, tab);
      }
  });
  
  // Aksi pada Modal Detail
  closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
  closeDetailsModalBtnBottom.addEventListener('click', closeDetailsModal);
  detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) closeDetailsModal();
  });
  
  // Pilihan Tab Modal
  tabBtnNotes.addEventListener('click', () => showTab('notes'));
  tabBtnTodos.addEventListener('click', () => showTab('todos'));
  
  // Aksi Panel Catatan
  saveNotesBtn.addEventListener('click', saveNotes);
  
  // Aksi Panel Tugas
  addTodoForm.addEventListener('submit', addTodo);
  
  // Aksi Item Tugas (Event Delegation)
  todoListContainer.addEventListener('click', (e) => {
      const checkbox = e.target.closest('.todo-checkbox');
      const deleteBtn = e.target.closest('.todo-delete-btn');
      const label = e.target.closest('.todo-text-label');
      
      const classId = detailsModalClassId.value;
      
      if (checkbox) {
          toggleTodo(classId, checkbox.dataset.todoId);
      }
      else if (deleteBtn) {
          const itemEl = e.target.closest('.todo-item');
          deleteTodo(classId, deleteBtn.dataset.todoId, itemEl);
      }
      else if (label) {
          const existingInput = todoListContainer.querySelector('.todo-edit-input');
          if (existingInput) existingInput.blur();
          editTodoText(label);
      }
  });
}

// --- MULAI APLIKASI ---
initializeAppCore();

