// --- DATABASE ---
// In a real app, this would come from an API.
const allClasses = [
  // Monday
  { id: 'M1', day: 'Monday', startTime: '09:30', endTime: '12:30', subject: 'Teknik Kompilasi **', lecturer: 'Mara Nugraha', location: 'E131', color: 'primary-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=102506', lecturerEmail: 'dosen@example.com' },
  { id: 'M2', day: 'Monday', startTime: '13:30', endTime: '15:30', subject: 'Pengolahan Citra **', lecturer: 'Noor Vika Hizviani', location: 'E131', color: 'emerald-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=100430', lecturerEmail: 'dosen@example.com' },
  { id: 'M3', day: 'Monday', startTime: '15:30', endTime: '17:30', subject: 'Bahasa Inggris Bisnis 1', lecturer: 'Hana Fauziah', location: 'E131', color: 'sky-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=102892', lecturerEmail: 'dosen@example.com' },
  
  // Tuesday
  { id: 'TU1', day: 'Tuesday', startTime: '07:30', endTime: '09:30', subject: 'Pengolahan Citra', lecturer: 'Salman Alfarizi', location: 'Lab F8427', color: 'blue-500', vclassLink: 'https://praktikum-iflab.gunadarma.ac.id/course/view.php?id=597', lecturerEmail: 'dosen@example.com' },
  { id: 'TU2', day: 'Tuesday', startTime: '13:30', endTime: '15:30', subject: 'Rekayasa Perangkat Lunak 2', lecturer: 'Satya Bara Justitia', location: 'Online', color: 'cyan-500', vclassLink: 'https://praktikum.gunadarma.ac.id/course/view.php?id=64', lecturerEmail: 'dosen@example.com' },

  // Wednesday
  { id: 'W1', day: 'Wednesday', startTime: '09:30', endTime: '11:30', subject: 'Rekayasa Perangkat Lunak 2 */**', lecturer: 'Linda Handayani', location: 'E332', color: 'amber-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=97517', lecturerEmail: 'dosen@example.com' },
  { id: 'W2', day: 'Wednesday', startTime: '12:30', endTime: '14:30', subject: 'Algoritma Deep Learning', lecturer: 'Fauziah Supardi', location: 'E348', color: 'rose-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=96457', lecturerEmail: 'dosen@example.com' },
  { id: 'W3', day: 'Wednesday', startTime: '14:30', endTime: '17:30', subject: 'Pengel. Proyek Perangkat Lunak', lecturer: 'Nuryuliani', location: 'E443', color: 'violet-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=101923', lecturerEmail: 'dosen@example.com' },
  
  // Thursday
  { id: 'T1', day: 'Thursday', startTime: 'TBD', endTime: 'TBD', subject: 'Robotika Cerdas', lecturer: 'Team Teaching', location: 'UGTV (V-CLASS)', color: 'indigo-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=96433', lecturerEmail: 'dosen@example.com' },
  
  // Friday
  { id: 'F1', day: 'Friday', startTime: '07:30', endTime: '09:30', subject: 'Praktikum Robotika Cerdas', lecturer: 'Tim Dosen', location: 'V-CLASS', color: 'fuchsia-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=96417', lecturerEmail: 'dosen@example.com' },
  
  // Saturday
  { id: 'S1', day: 'Saturday', startTime: '09:30', endTime: '11:30', subject: 'Forensik Teknologi Informasi', lecturer: 'Arum Tri Iswari Purwanti', location: 'G124', color: 'teal-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=98315', lecturerEmail: 'dosen@example.com' },
  { id: 'S2', day: 'Saturday', startTime: '11:30', endTime: '14:30', subject: 'Pemodelan dan Simulasi', lecturer: 'Koko Bachrudin', location: 'G124', color: 'orange-500', vclassLink: 'https://v-class.gunadarma.ac.id/course/view.php?id=97433', lecturerEmail: 'dosen@example.com' },
];

 const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
 const daysOfWeekEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 const dayIndexMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0 };
 const dayNameMap = { 'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu' };

// --- STATE ---
let currentView = 'weekly'; // 'weekly', 'daily', or 'tasks'
let currentDailyDay = new Date().getDay(); // 0 (Sun) - 6 (Sat)
let currentSearch = '';

// New State for Features
let allNotes = JSON.parse(localStorage.getItem('classNotes4IA16') || '{}');
let allTodos = JSON.parse(localStorage.getItem('classTodos4IA16') || '{}');

let currentLiveClassId = null;
let currentNextClassId = null;
let nextClassCountdown = '';
let toastTimeout;

// State Notifikasi
let sentNotifications = JSON.parse(localStorage.getItem('sentNotifications4IA16') || '{}');

// --- DOM ELEMENTS ---
const liveClassBanner = document.getElementById('live-class-banner');
const liveClassContent = document.getElementById('live-class-content');
const scheduleGrid = document.getElementById('schedule-grid');
const tasksView = document.getElementById('tasks-view'); // New Tasks View
const noResultsEl = document.getElementById('no-results');
const searchInput = document.getElementById('search-all');
const viewToggleButtons = document.querySelectorAll('.btn-toggle button');
const dailyViewControls = document.getElementById('daily-view-controls');
const daySelect = document.getElementById('day-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeIcon = document.getElementById('dark-mode-icon');

// Unified Details Modal DOM Elements
const detailsModal = document.getElementById('details-modal');
const detailsModalContent = detailsModal.querySelector('.modal-content');
const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
const closeDetailsModalBtnBottom = document.getElementById('close-details-modal-btn-bottom');
const detailsModalClassId = document.getElementById('details-modal-class-id');
const detailsModalSubjectTitle = document.getElementById('details-modal-subject-title');

// Tab Elements
const tabBtnNotes = document.getElementById('tab-btn-notes');
const tabBtnTodos = document.getElementById('tab-btn-todos');
const notesPanel = document.getElementById('notes-panel');
const todoPanel = document.getElementById('todo-panel');

// Notes Panel Elements
const saveNotesBtn = document.getElementById('save-notes-btn');
const modalNotesTextarea = document.getElementById('modal-notes-textarea');

// ToDo Panel Elements
const addTodoForm = document.getElementById('add-todo-form');
const newTodoInput = document.getElementById('new-todo-input');
const newTodoDeadline = document.getElementById('new-todo-deadline'); // New Deadline Input
const addTodoBtn = document.getElementById('add-todo-btn');
const todoListContainer = document.getElementById('todo-list-container');

// Toast DOM Elements
const toastEl = document.getElementById('toast');
const toastContent = document.getElementById('toast-content');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

// --- FUNCTIONS ---

/**
 * Creates the HTML string for a single class card.
 */
function createClassCard(classItem) {
  const timeDisplay = (classItem.startTime === 'TBD') ? 'Waktu TBD' : `${classItem.startTime} - ${classItem.endTime}`;
  
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

  return `
    <div class="card bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border-l-4 ${borderColorClass} ${cardClass}" data-class-id="${classItem.id}">
      <!-- Area yang bisa diklik untuk membuka modal -->
      <div class="card-clickable-area p-4" data-tab="notes">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider ${textColorClass}">4IA16</span>
          ${statusHTML}
        </div>
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">${classItem.subject}</h3>
        
        <!-- Email Dosen yang Dapat Diklik -->
        <a href="mailto:${classItem.lecturerEmail}" title="Email ${classItem.lecturer}" class="text-sm text-slate-600 dark:text-slate-400 mb-3 block hover:underline" onclick="(event) => event.stopPropagation()">
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
      
      <!-- Tombol Aksi Bawah -->
      <div class="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex justify-between items-center">
        <button class="flex-1 text-center text-sm font-medium text-primary hover:text-primary-700 dark:hover:text-primary-300 flex items-center justify-center gap-2 btn-add-calendar">
          <span class="material-symbols-outlined">add</span>
          Add to Calendar
        </button>
        <div class="flex gap-1">
          <!-- Link V-Class -->
          <a href="${classItem.vclassLink}" target="_blank" class="p-1 -m-1 text-slate-400 hover:text-primary dark:hover:text-primary-300" title="Buka V-Class/Link" onclick="(event) => event.stopPropagation()">
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

/**
 * Menampilkan banner untuk kelas yang sedang berlangsung.
 */
function renderLiveClassBanner() {
  if (currentLiveClassId) {
    const classItem = allClasses.find(c => c.id === currentLiveClassId);
    if (!classItem) return;

    liveClassContent.innerHTML = `
      <div class="flex-grow">
        <span class="flex items-center text-sm font-semibold text-blue-800 dark:text-blue-200">
          <span class="material-symbols-outlined !text-[18px] mr-1 animate-pulse">sensors</span>
          SEDANG BERLANGSUNG
        </span>
        <h4 class="font-semibold text-slate-900 dark:text-slate-100">${classItem.subject}</h4>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          ${classItem.location} • Berakhir pkl ${classItem.endTime}
        </p>
      </div>
      <div class="flex flex-shrink-0 gap-2 mt-3 sm:mt-0">
        <a href="${classItem.vclassLink}" target="_blank" class="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-100 rounded-md shadow-sm hover:bg-white dark:hover:bg-slate-700 text-sm font-medium">
          Buka Link
        </a>
        <button class="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-100 rounded-md shadow-sm hover:bg-white dark:hover:bg-slate-700 text-sm font-medium btn-open-details" data-tab="notes" data-class-id="${classItem.id}">
          Catatan
        </button>
      </div>
    `;
    liveClassBanner.classList.remove('hidden');
  } else {
    liveClassBanner.classList.add('hidden');
    liveClassContent.innerHTML = '';
  }
}

/**
 * Filters the class list based on current search and filters.
 */
function getFilteredClasses() {
  return allClasses.filter(classItem => {
    const searchMatch = currentSearch === '' ||
      classItem.subject.toLowerCase().includes(currentSearch) ||
      classItem.lecturer.toLowerCase().includes(currentSearch) ||
      classItem.location.toLowerCase().includes(currentSearch);
    
    return searchMatch;
  });
}

/**
 * Renders the entire schedule grid based on current state.
 */
function renderSchedule() {
  scheduleGrid.innerHTML = '';
  const filteredClasses = getFilteredClasses();
  
  let daysToRender;
  if (currentView === 'weekly') {
      daysToRender = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      scheduleGrid.classList.remove('xl:grid-cols-1', 'max-w-2xl', 'mx-auto');
      scheduleGrid.classList.add('sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-6');
  } else {
      // Daily view
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
  
  if (totalClassesRendered === 0 && filteredClasses.length < allClasses.length) {
    noResultsEl.classList.remove('hidden');
  } else {
    noResultsEl.classList.add('hidden');
  }
}

/**
 * Renders the new "All Tasks" view.
 */
function renderAllTasksView() {
  tasksView.innerHTML = '';
  
  const allActiveTasks = Object.entries(allTodos)
    .flatMap(([classId, todos]) => 
      todos.map(todo => ({
        ...todo,
        classId: classId,
        classItem: allClasses.find(c => c.id === classId)
      }))
    )
    .filter(task => !task.completed && task.classItem); // Filter out completed and tasks from deleted classes

  // Sort tasks: by deadline (earliest first), nulls last
  allActiveTasks.sort((a, b) => {
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1; // a has deadline, b doesn't
    if (b.deadline) return 1;  // b has deadline, a doesn't
    return 0; // neither has deadline
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
  
  // Group tasks by deadline
  const { today, tomorrow, thisWeek, nextWeek, later, noDeadline } = groupTasksByDeadline(allActiveTasks);

  tasksView.innerHTML += createTaskGroupHTML('Jatuh Tempo Hari Ini', today, 'text-red-600 dark:text-red-400');
  tasksView.innerHTML += createTaskGroupHTML('Jatuh Tempo Besok', tomorrow, 'text-orange-600 dark:text-orange-400');
  tasksView.innerHTML += createTaskGroupHTML('Minggu Ini', thisWeek, 'text-yellow-600 dark:text-yellow-400');
  tasksView.innerHTML += createTaskGroupHTML('Minggu Depan', nextWeek, 'text-sky-600 dark:text-sky-400');
  tasksView.innerHTML += createTaskGroupHTML('Nanti', later, 'text-slate-600 dark:text-slate-400');
  tasksView.innerHTML += createTaskGroupHTML('Tanpa Deadline', noDeadline, 'text-slate-500 dark:text-slate-500');
}

/**
 * Helper for renderAllTasksView: Groups tasks by deadline.
 */
function groupTasksByDeadline(tasks) {
  const groups = { today: [], tomorrow: [], thisWeek: [], nextWeek: [], later: [], noDeadline: [] };
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - now.getDay()) + 1); // End of Sunday
  
  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfWeek.getDate() + 7);

  for (const task of tasks) {
    if (!task.deadline) {
      groups.noDeadline.push(task);
      continue;
    }
    
    const taskDate = new Date(task.deadline + 'T00:00:00'); // Set to start of day
    
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

/**
 * Helper for renderAllTasksView: Creates HTML for a task group.
 */
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

/**
 * Updates the "is-live" and "is-next" status AND checks for class reminders.
 */
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

        // Cek kelas yang sedang berlangsung
        if (!foundLive && currentTimeInt >= startTimeInt && currentTimeInt < endTimeInt) {
            currentLiveClassId = classItem.id;
            foundLive = true;
            // Hapus notifikasi terkirim jika kelas sudah dimulai
            if (sentNotifications['class-' + classItem.id]) {
              delete sentNotifications['class-' + classItem.id];
              saveSentNotifications();
            }
        }

        // Cek kelas selanjutnya
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
            // Kirim notifikasi jika 60 menit sebelum mulai
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
    
    // Panggil render banner
    renderLiveClassBanner();
    // Render ulang jadwal jika perlu
    if (currentView !== 'tasks') {
       renderSchedule();
    }
}

/**
 * Pengecekan Deadline Tugas untuk Notifikasi
 */
function checkTaskDeadlineReminders() {
  const now = new Date();
  const allActiveTasks = Object.values(allTodos)
    .flat()
    .filter(task => !task.completed && task.deadline);

  for (const task of allActiveTasks) {
    const deadlineTime = new Date(task.deadline + 'T09:00:00'); // Set pengingat jam 9 pagi H-1
    deadlineTime.setDate(deadlineTime.getDate() - 1); // Mundur 1 hari
    
    const diffMs = deadlineTime.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    const notificationId = 'task-' + task.id;

    // Kirim notifikasi jika 1 hari sebelumnya (misal, < 60 menit dari jam 9 pagi H-1)
    if (diffMins > 0 && diffMins <= 60 && !sentNotifications[notificationId]) {
      const classItem = allClasses.find(c => c.id === task.classId);
      showBrowserNotification(
        `Deadline Tugas: ${task.text}`,
        {
          body: `Untuk mata kuliah: ${classItem.subject}\nJatuh tempo: Besok`,
          icon: 'https://placehold.co/192x192/f59e0b/white?text=!',
          tag: notificationId
        },
        notificationId
      );
    }
  }
}

/**
 * Handles Google Calendar link generation.
 */
function getGoogleCalendarLink(classItem) {
  const { subject, startTime, endTime, day, location } = classItem;
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';

  let startDate, endDate;

  if (startTime === 'TBD') {
    const nextDay = getNextDay(dayIndexMap[day]);
    const dateStr = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;
    startDate = dateStr;
    endDate = dateStr;
  } else {
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');
    const nextDay = getNextDay(dayIndexMap[day]);
    const nextDayEnd = new Date(nextDay.getTime());
    const startDateTime = new Date(nextDay.setHours(startHour, startMin, 0, 0));
    const endDateTime = new Date(nextDayEnd.setHours(endHour, endMin, 0, 0));
    startDate = startDateTime.toISOString().replace(/-|:|\.\d+/g, '');
    endDate = endDateTime.toISOString().replace(/-|:|\.\d+/g, '');
  }

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

/**
 * Helper to get the next date for a given weekday.
 */
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

// --- Unified Details Modal Functions ---

function openDetailsModal(classId, initialTab = 'notes') {
    const classItem = allClasses.find(c => c.id === classId);
    if (!classItem) return;
    
    // Set common info
    detailsModalClassId.value = classId;
    detailsModalSubjectTitle.textContent = classItem.subject;
    
    // Populate notes
    modalNotesTextarea.value = allNotes[classId] || '';
    
    // Populate todos
    renderTodoList(classId);
    
    // Show modal
    detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      detailsModalContent.style.transform = 'scale(1)';
      detailsModalContent.style.opacity = '1';
    }, 10);
    
    // Set initial tab
    showTab(initialTab);
}

function closeDetailsModal() {
    detailsModalContent.classList.add('modal-closing');
    setTimeout(() => {
        detailsModal.classList.add('hidden');
        document.body.style.overflow = '';
        detailsModalContent.classList.remove('modal-closing');
        
        // Clear deadline input
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

// --- Notes Functions ---

function saveNotes() {
    const classId = detailsModalClassId.value;
    const noteText = modalNotesTextarea.value;
    
    if (noteText.trim() === '') {
        delete allNotes[classId];
    } else {
        allNotes[classId] = noteText;
    }
    
    localStorage.setItem('classNotes4IA16', JSON.stringify(allNotes));
    
    // Update card icon
    const card = scheduleGrid.querySelector(`.card[data-class-id="${classId}"]`);
    if (card) {
        const icon = card.querySelector('.btn-open-details[data-tab="notes"] span');
        if (noteText.trim() === '') {
            icon.classList.remove('filled');
        } else {
            icon.classList.add('filled');
        }
    }
    
    showToast("Catatan disimpan!");
}

// --- To-Do Functions ---

/**
 * Renders the full list (on modal open or toggle)
 */
function renderTodoList(classId) {
    todoListContainer.innerHTML = '';
    const todos = allTodos[classId] || [];
    
    if (todos.length === 0) {
        todoListContainer.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada tugas.</p>`;
        return;
    }
    
    // Sort: active first, then by deadline (nulls last)
    todos.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed - b.completed;
        }
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return a.deadline ? -1 : 1;
    });

    todos.forEach(todo => {
        const todoEl = createTodoElement(todo);
        todoListContainer.appendChild(todoEl);
    });
}

/**
 * Creates a DOM element for a single todo
 */
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
        <div class="flex items-center gap-3">
            <input type="checkbox" data-todo-id="${todo.id}" class="todo-checkbox w-5 h-5 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-600 dark:bg-slate-700" ${todo.completed ? 'checked' : ''}>
            <label class="flex-1 text-slate-800 dark:text-slate-200 cursor-pointer todo-text-label" data-todo-id="${todo.id}">${todo.text}</label>
        </div>
        <button data-todo-id="${todo.id}" class="todo-delete-btn text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1">
            <span class="material-symbols-outlined">delete</span>
        </button>
    </div>
    ${deadlineHTML}
  `;
  return todoEl;
}

/**
 * Adds a new todo item with animation
 */
function addTodo(event) {
    event.preventDefault(); // Prevent form submission
    const classId = detailsModalClassId.value;
    const text = newTodoInput.value.trim();
    const deadline = newTodoDeadline.value || null; // Get deadline value
    
    if (text === '') return;
    
    if (!allTodos[classId]) {
        allTodos[classId] = [];
    }
    
    const newTodo = {
        id: `todo-${Date.now()}`,
        text: text,
        completed: false,
        deadline: deadline // Save deadline
    };
    
    allTodos[classId].push(newTodo);
    saveTodos();
    
    const emptyMsg = todoListContainer.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    
    const todoEl = createTodoElement(newTodo);
    todoEl.classList.add('todo-item-entering');
    todoListContainer.appendChild(todoEl);
    
    // Re-sort the list in the DOM after animation
    setTimeout(() => {
      renderTodoList(classId); // This re-sorts everything
    }, 300); 
    
    updateTodoBadge(classId);
    newTodoInput.value = '';
    newTodoDeadline.value = ''; // Clear deadline input
    
    showToast("Tugas berhasil ditambahkan!");
}

/**
 * Toggles a todo's completed state
 */
function toggleTodo(classId, todoId) {
    const todo = allTodos[classId]?.find(t => t.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodoList(classId); // Re-render to sort list
        updateTodoBadge(classId);
        
        // Hapus notifikasi jika tugas selesai
        const notificationId = 'task-' + todo.id;
        if (todo.completed && sentNotifications[notificationId]) {
          delete sentNotifications[notificationId];
          saveSentNotifications();
        }
        
        // Re-render tasks view if it's active
        if(currentView === 'tasks') {
          renderAllTasksView();
        }
    }
}

/**
 * Deletes a todo item with animation
 */
function deleteTodo(classId, todoId, element) {
    element.classList.add('todo-item-exiting');
    
    setTimeout(() => {
      element.remove();
      allTodos[classId] = allTodos[classId]?.filter(t => t.id !== todoId);
      saveTodos();
      updateTodoBadge(classId);
      
      if (!allTodos[classId] || allTodos[classId].length === 0) {
         todoListContainer.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada tugas.</p>`;
      }
      
      // Hapus notifikasi jika tugas dihapus
      const notificationId = 'task-' + todoId;
      if (sentNotifications[notificationId]) {
        delete sentNotifications[notificationId];
        saveSentNotifications();
      }
      
      // Re-render tasks view if it's active
      if(currentView === 'tasks') {
        renderAllTasksView();
      }
    }, 300);
}

/**
 * Replaces a todo label with an input field for editing.
 */
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
    
    // Save on blur
    inputElement.addEventListener('blur', () => {
        saveTodoEdit(inputElement, todoId);
    });
    
    // Save on Enter, cancel on Escape
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputElement.blur(); // Triggers the blur event
        } else if (e.key === 'Escape') {
            // Revert
            labelContainer.replaceChild(labelElement, inputElement);
        }
    });
}

/**
 * Saves the edited todo text.
 */
function saveTodoEdit(inputElement, todoId) {
    const classId = detailsModalClassId.value;
    const newText = inputElement.value.trim();
    const todo = allTodos[classId]?.find(t => t.id === todoId);
    
    if (todo && newText) {
        todo.text = newText;
        saveTodos();
    }
    
    // Re-render the list to show the label again
    renderTodoList(classId);
    
    // Re-render tasks view if it's active
    if(currentView === 'tasks') {
      renderAllTasksView();
    }
}

function saveTodos() {
    localStorage.setItem('classTodos4IA16', JSON.stringify(allTodos));
}

function saveSentNotifications() {
  localStorage.setItem('sentNotifications4IA16', JSON.stringify(sentNotifications));
}

function updateTodoBadge(classId) {
    const card = scheduleGrid.querySelector(`.card[data-class-id="${classId}"]`);
    if (!card) return;
    
    const todos = allTodos[classId] || [];
    const activeTodoCount = todos.filter(todo => !todo.completed).length;
    const badgeBtn = card.querySelector('.btn-open-details[data-tab="todos"]');
    
    const existingBadge = badgeBtn.querySelector('.todo-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    if (activeTodoCount > 0) {
        badgeBtn.innerHTML += `<span class="todo-badge">${activeTodoCount}</span>`;
    }
}

/**
 * Checks for upcoming deadlines and shows a summary toast.
 */
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
        showToast(message, 'warning', 6000); // Show for 6 seconds
    }
}

// --- General Functions ---

/**
 * Formats a date string (YYYY-MM-DD) to "DD MMMM YYYY" in Indonesian.
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Set time to avoid timezone issues
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Calculates days remaining for a deadline.
 */
function getDaysRemaining(dateString) {
    if (!dateString) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    const deadline = new Date(dateString + 'T00:00:00');
    
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Terlewat';
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    return `${diffDays} hari lagi`;
}

/**
 * Shows a toast notification.
 * type: 'success' (default) or 'warning'
 * duration: time in ms. 3000 default.
 */
function showToast(message, type = 'success', duration = 3000) {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastEl.classList.add('hidden');
        if (toastEl.firstElementChild) {
            toastEl.firstElementChild.classList.remove('animate-fadeOut');
        }
    }
    
    // Customize based on type
    if (type === 'warning') {
        toastContent.classList.remove('bg-slate-900', 'dark:bg-slate-100', 'text-white', 'dark:text-slate-900');
        toastContent.classList.add('bg-warning-100', 'dark:bg-warning-900', 'text-warning-800', 'dark:text-warning-100');
        toastIcon.textContent = 'warning';
    } else {
        // Default success
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

// --- Fungsi Notifikasi Browser ---

/**
 * Meminta izin notifikasi kepada pengguna.
 */
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

/**
 * Menampilkan notifikasi browser jika diizinkan.
 */
function showBrowserNotification(title, options, notificationId) {
  if (!('Notification' in window)) {
    return; // Browser tidak mendukung
  }

  if (Notification.permission === 'granted') {
    // Gunakan service worker untuk menampilkan notifikasi
    // Ini lebih baik untuk PWA
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });

    // Tandai sebagai terkirim
    sentNotifications[notificationId] = true;
    saveSentNotifications();
    
  } else if (Notification.permission === 'default') {
    // Jika belum ditanya, minta izin
    requestNotificationPermission();
  }
  // Jika 'denied', tidak melakukan apa-apa
}

/**
 * Membersihkan notifikasi lama sekali sehari
 */
function clearOldNotifications() {
  const lastCleared = localStorage.getItem('lastClearedNotificationsDay');
  const today = new Date().toLocaleDateString();

  if (lastCleared !== today) {
    sentNotifications = {};
    saveSentNotifications();
    localStorage.setItem('lastClearedNotificationsDay', today);
    console.log('Daftar notifikasi terkirim dibersihkan untuk hari ini.');
  }
}

// --- EVENT LISTENERS ---

// Search
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value.toLowerCase();
  // Re-render the correct view
  if (currentView === 'tasks') {
    // Note: Search doesn't apply to tasks view, but we could add it.
    // For now, do nothing.
  } else {
    renderSchedule();
  }
});

// View Toggle
viewToggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentView = button.dataset.view;
    localStorage.setItem('lastView4IA16', currentView); // Save the view
    
    // Update button UI
    viewToggleButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show/hide relevant parts
    dailyViewControls.classList.toggle('hidden', currentView !== 'daily');
    scheduleGrid.classList.toggle('hidden', currentView === 'tasks');
    tasksView.classList.toggle('hidden', currentView !== 'tasks');
    noResultsEl.classList.add('hidden'); // Hide no-results
    
    // Render the correct view
    if (currentView === 'tasks') {
      renderAllTasksView();
      searchInput.disabled = true; // Disable search for tasks view
      searchInput.placeholder = 'Pencarian di non-aktifkan di Tampilan Tugas';
    } else {
      renderSchedule();
      searchInput.disabled = false;
      searchInput.placeholder = 'Cari mata kuliah atau dosen...';
    }
  });
});

// Day Selector
daySelect.addEventListener('change', (e) => {
  currentDailyDay = parseInt(e.target.value, 10);
  renderSchedule();
});

// Dark Mode
darkModeToggle.addEventListener('click', () => {
    setDarkMode(!document.documentElement.classList.contains('dark'));
});

// Card Actions (Event Delegation)
scheduleGrid.addEventListener('click', (e) => {
  const calendarButton = e.target.closest('.btn-add-calendar');
  const detailsButton = e.target.closest('.btn-open-details');
  const clickableArea = e.target.closest('.card-clickable-area');
  
  const card = e.target.closest('.card');
  if (!card) return;
  const classId = card.dataset.classId;
  
  if (calendarButton) {
    e.stopPropagation(); // Hentikan event agar tidak membuka modal
    const classItem = allClasses.find(c => c.id === classId);
    if (classItem) {
      const link = getGoogleCalendarLink(classItem);
      window.open(link, '_blank');
    }
  } 
  else if (detailsButton) {
    e.stopPropagation(); // Hentikan event agar tidak membuka modal
    const tab = detailsButton.dataset.tab; // 'notes' or 'todos'
    openDetailsModal(classId, tab);
  }
  else if (clickableArea) {
    const tab = clickableArea.dataset.tab; // 'notes'
    openDetailsModal(classId, tab);
  }
});

// Tombol di Live Banner
liveClassBanner.addEventListener('click', (e) => {
    const detailsButton = e.target.closest('.btn-open-details');
    if (detailsButton) {
        const classId = detailsButton.dataset.classId;
        const tab = detailsButton.dataset.tab;
        openDetailsModal(classId, tab);
    }
});

// Unified Modal Actions
closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
closeDetailsModalBtnBottom.addEventListener('click', closeDetailsModal);
detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) closeDetailsModal();
});

// Tab switching
tabBtnNotes.addEventListener('click', () => showTab('notes'));
tabBtnTodos.addEventListener('click', () => showTab('todos'));

// Notes Panel Actions
saveNotesBtn.addEventListener('click', saveNotes);

// To-Do Panel Actions
addTodoForm.addEventListener('submit', addTodo); // Changed to form 'submit'

// To-Do List Item Actions (Event Delegation)
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
        // Check if another input is already open
        const existingInput = todoListContainer.querySelector('.todo-edit-input');
        if (existingInput) {
            existingInput.blur(); // Save any other open edit first
        }
        editTodoText(label);
    }
});

// --- INITIALIZATION ---
function init() {
  
  // Pendaftaran Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Gunakan path relatif './' agar berfungsi di GitHub Pages
      navigator.serviceWorker.register('./sw.js') 
        .then((registration) => {
          console.log('ServiceWorker Registered with scope: ', registration.scope);
        })
        .catch((error) => {
          console.log('ServiceWorker Registration Failed: ', error);
        });
    });
  }

  // Minta Izin Notifikasi & Bersihkan Notifikasi Lama
  clearOldNotifications();
  // Tunda permintaan izin agar tidak terlalu agresif
  setTimeout(requestNotificationPermission, 5000); // Minta izin setelah 5 detik

  // Restore last view
  const savedView = localStorage.getItem('lastView4IA16');
  if (savedView) {
      currentView = savedView;
  }

  currentDailyDay = new Date().getDay();
  daySelect.value = currentDailyDay;
  
  if (localStorage.getItem('darkMode') === 'true' || 
     (!localStorage.getItem('darkMode') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
  } else {
      setDarkMode(false);
  }
  
  // Update view toggle buttons based on currentView
  viewToggleButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === currentView);
  });
  
  // Show/hide relevant panels based on currentView
  dailyViewControls.classList.toggle('hidden', currentView !== 'daily');
  scheduleGrid.classList.toggle('hidden', currentView === 'tasks');
  tasksView.classList.toggle('hidden', currentView !== 'tasks');

  // Initial render based on default view
  if (currentView === 'tasks') {
    renderAllTasksView();
    searchInput.disabled = true;
    searchInput.placeholder = 'Pencarian di non-aktifkan di Tampilan Tugas';
  } else {
    renderSchedule();
    searchInput.disabled = false;
    searchInput.placeholder = 'Cari mata kuliah atau dosen...';
  }
  
  // Buat satu interval utama yang berjalan setiap menit
  const checkAllReminders = () => {
    updateLiveStatusAndReminders();
    checkTaskDeadlineReminders();
  };
  
  checkAllReminders(); // Jalankan sekali saat muat
  setInterval(checkAllReminders, 60000); // Jalankan setiap 60 detik
  
  // Panggil toast deadline (yang ini berbeda dari notifikasi)
  checkDeadlinesToast(); 
}

init();

