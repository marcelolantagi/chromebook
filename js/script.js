// ===== SISTEMA DE AUTENTICAÇÃO =====
const users = {
    'admin': { password: 'admin123', name: 'Administrador' },
    'professor': { password: 'prof123', name: 'Professor' },
    'coordenacao': { password: 'coord123', name: 'Coordenação' }
};

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hora em milissegundos

// ===== SISTEMA DE LOGIN =====
function initializeLoginSystem() {
    // Verificar se já está logado
    if (checkExistingLogin()) {
        showMainSystem();
        return;
    }

    // Configurar evento do formulário de login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Validar credenciais
    if (authenticateUser(username, password)) {
        createSession(username, rememberMe);
        showMainSystem();
        showWelcomeMessage(users[username].name);
    } else {
        showLoginError();
    }
}

function authenticateUser(username, password) {
    return users[username] && users[username].password === password;
}

function createSession(username, rememberMe) {
    const sessionData = {
        username: username,
        loginTime: Date.now(),
        expires: Date.now() + SESSION_TIMEOUT
    };
    
    if (rememberMe) {
        localStorage.setItem('chromebookSession', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('chromebookSession', JSON.stringify(sessionData));
    }
}

function checkExistingLogin() {
    let sessionData = sessionStorage.getItem('chromebookSession') || 
                     localStorage.getItem('chromebookSession');
    
    if (sessionData) {
        sessionData = JSON.parse(sessionData);
        
        // Verificar se a sessão expirou
        if (Date.now() > sessionData.expires) {
            logout();
            return false;
        }
        
        return true;
    }
    
    return false;
}

function showMainSystem() {
    document.getElementById('login-system').style.display = 'none';
    document.getElementById('main-system').style.display = 'block';
    
    // Inicializar o sistema principal
    initializeMainSystem();
}

function showLoginSystem() {
    document.getElementById('login-system').style.display = 'flex';
    document.getElementById('main-system').style.display = 'none';
    
    // Limpar formulário
    document.getElementById('login-form').reset();
}

function showWelcomeMessage(userName) {
    // Feedback visual de login bem-sucedido
    const originalTitle = document.title;
    document.title = `✓ Bem-vindo(a) - ${document.title}`;
    
    setTimeout(() => {
        document.title = originalTitle;
    }, 3000);
}

function showLoginError() {
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    
    // Feedback visual de erro
    loginBtn.innerHTML = '❌ Credenciais inválidas';
    loginBtn.style.background = '#dc2626';
    
    setTimeout(() => {
        loginBtn.innerHTML = originalText;
        loginBtn.style.background = '';
    }, 2000);
}

function logout() {
    sessionStorage.removeItem('chromebookSession');
    localStorage.removeItem('chromebookSession');
    localStorage.removeItem('chromebookStorage'); // Opcional: limpar dados também
    
    showLoginSystem();
}

// ===== SISTEMA PRINCIPAL (seu código atual) =====
let cabinets = {
    1: Array(72).fill(null),
    2: Array(72).fill(null)
};

function initializeMainSystem() {
    loadFromLocalStorage();
    updateStats();
    setupImageErrorHandling();
    initializeSearchSystem();
    
    // Event listeners do sistema principal
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('chromebook-form').addEventListener('submit', saveChromebook);
    document.getElementById('remove-chromebook').addEventListener('click', removeChromebook);
    document.getElementById('back-button').addEventListener('click', showCabinetSelection);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.querySelectorAll('.cabinet-card').forEach(card => {
        card.addEventListener('click', function() {
            const cabinetNum = parseInt(this.dataset.cabinet);
            showCabinetDetails(cabinetNum);
        });
    });
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('chromebook-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Verificar timeout da sessão periodicamente
    setInterval(checkSessionTimeout, 60000); // Verificar a cada minuto
}

function checkSessionTimeout() {
    let sessionData = sessionStorage.getItem('chromebookSession') || 
                     localStorage.getItem('chromebookSession');
    
    if (sessionData) {
        sessionData = JSON.parse(sessionData);
        if (Date.now() > sessionData.expires) {
            alert('Sessão expirada. Por favor, faça login novamente.');
            logout();
        }
    }
}

// ===== FUNÇÕES DO SISTEMA PRINCIPAL (mantidas iguais) =====
function setupImageErrorHandling() {
    document.querySelectorAll('.cabinet-photo').forEach(img => {
        img.addEventListener('error', function() {
            this.parentElement.classList.add('image-error');
        });
    });
}

function showCabinetSelection() {
    const cabinetSelection = document.getElementById('cabinet-selection');
    const cabinetDetails = document.getElementById('cabinet-details');
    
    cabinetDetails.style.display = 'none';
    cabinetSelection.style.display = 'grid';
    void cabinetSelection.offsetHeight;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCabinetDetails(cabinetNum) {
    const cabinetSelection = document.getElementById('cabinet-selection');
    const cabinetDetails = document.getElementById('cabinet-details');
    
    cabinetSelection.style.display = 'none';
    cabinetDetails.style.display = 'block';
    
    const container = document.getElementById('cabinet-view-container');
    container.innerHTML = '';
    
    const cabinetView = document.createElement('div');
    cabinetView.className = 'cabinet-view';
    cabinetView.innerHTML = `<h2>Gabinete ${cabinetNum} - Movplan</h2>`;
    
    const rowsContainer = document.createElement('div');
    rowsContainer.className = 'cabinet-rows';
    
    for (let row = 0; row < 3; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'cabinet-row';
        
        for (let i = 0; i < 24; i++) {
            const slotIndex = row * 24 + i;
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.slot = slotIndex + 1;
            
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = slotIndex + 1;
            
            const studentName = document.createElement('div');
            studentName.className = 'student-name';
            
            slot.appendChild(slotNumber);
            slot.appendChild(studentName);
            
            if (cabinets[cabinetNum][slotIndex]) {
                slot.classList.add('occupied');
                studentName.textContent = cabinets[cabinetNum][slotIndex].studentName;
            } else {
                slot.classList.add('available');
                studentName.textContent = 'Livre';
            }
            
            slot.addEventListener('click', function() {
                openModal(cabinetNum, slotIndex + 1);
            });
            
            rowDiv.appendChild(slot);
        }
        
        rowsContainer.appendChild(rowDiv);
    }
    
    cabinetView.appendChild(rowsContainer);
    container.appendChild(cabinetView);
    updateStats();
}

function openModal(cabinetNum, slotNum) {
    const modal = document.getElementById('chromebook-modal');
    const currentChromebook = cabinets[cabinetNum][slotNum - 1];
    
    document.getElementById('cabinet-id').value = cabinetNum;
    document.getElementById('slot-number').value = slotNum;
    
    if (currentChromebook) {
        document.getElementById('modal-title').textContent = 'Editar Chromebook';
        document.getElementById('student-name').value = currentChromebook.studentName;
        document.getElementById('chromebook-id').value = currentChromebook.chromebookId || '';
        document.getElementById('remove-chromebook').style.display = 'block';
    } else {
        document.getElementById('modal-title').textContent = 'Adicionar Chromebook';
        document.getElementById('student-name').value = '';
        document.getElementById('chromebook-id').value = '';
        document.getElementById('remove-chromebook').style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('chromebook-modal').style.display = 'none';
}

function saveChromebook(event) {
    event.preventDefault();
    
    const cabinetNum = parseInt(document.getElementById('cabinet-id').value);
    const slotNum = parseInt(document.getElementById('slot-number').value);
    const studentName = document.getElementById('student-name').value.trim();
    
    if (!studentName) {
        alert('Por favor, insira o nome do aluno.');
        return;
    }
    
    cabinets[cabinetNum][slotNum - 1] = {
        studentName: studentName,
        chromebookId: document.getElementById('chromebook-id').value.trim()
    };
    
    if (document.getElementById('cabinet-details').style.display === 'block') {
        showCabinetDetails(cabinetNum);
    }
    
    updateStats();
    closeModal();
    saveToLocalStorage();
}

function removeChromebook() {
    const cabinetNum = parseInt(document.getElementById('cabinet-id').value);
    const slotNum = parseInt(document.getElementById('slot-number').value);
    
    if (confirm('Tem certeza que deseja remover este Chromebook?')) {
        cabinets[cabinetNum][slotNum - 1] = null;
        
        if (document.getElementById('cabinet-details').style.display === 'block') {
            showCabinetDetails(cabinetNum);
        }
        
        updateStats();
        closeModal();
        saveToLocalStorage();
    }
}

function updateStats() {
    let totalChromebooks = 0;
    for (let cabinetNum = 1; cabinetNum <= 2; cabinetNum++) {
        totalChromebooks += cabinets[cabinetNum].filter(slot => slot !== null).length;
    }
    
    const availableSlots = 144 - totalChromebooks;
    const occupancyRate = ((totalChromebooks / 144) * 100).toFixed(1);
    
    document.getElementById('total-chromebooks').textContent = totalChromebooks;
    document.getElementById('available-slots').textContent = availableSlots;
    document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
}

// ===== SISTEMA DE BUSCA (mantido igual) =====
function initializeSearchSystem() {
    const searchToggle = document.getElementById('search-toggle');
    const searchPanel = document.getElementById('search-panel');
    const searchBtn = document.getElementById('search-btn');
    const clearResults = document.getElementById('clear-results');

    searchToggle.addEventListener('click', () => {
        searchPanel.classList.toggle('active');
        searchToggle.querySelector('span').textContent = 
            searchPanel.classList.contains('active') ? '▲' : '⌄';
    });

    searchBtn.addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    ['filter-occupied', 'filter-available', 'filter-cabinet'].forEach(id => {
        document.getElementById(id).addEventListener('change', performSearch);
    });

    clearResults.addEventListener('click', clearSearchResults);
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const filterOccupied = document.getElementById('filter-occupied').checked;
    const filterAvailable = document.getElementById('filter-available').checked;
    const filterCabinet = document.getElementById('filter-cabinet').value;

    const results = [];
    
    Object.keys(cabinets).forEach(cabinetNum => {
        if (filterCabinet !== 'all' && filterCabinet !== cabinetNum) return;

        cabinets[cabinetNum].forEach((slot, index) => {
            if (!slot && !filterAvailable) return;
            if (slot && !filterOccupied) return;

            const slotNumber = index + 1;
            const matchesSearch = !searchTerm || 
                (slot && slot.studentName.toLowerCase().includes(searchTerm)) ||
                (slot && slot.chromebookId && slot.chromebookId.toLowerCase().includes(searchTerm)) ||
                slotNumber.toString().includes(searchTerm);

            if (matchesSearch) {
                results.push({
                    cabinet: parseInt(cabinetNum),
                    slot: slotNumber,
                    studentName: slot ? slot.studentName : 'Slot Disponível',
                    chromebookId: slot ? slot.chromebookId : null,
                    type: slot ? 'occupied' : 'available'
                });
            }
        });
    });

    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsList = document.getElementById('results-list');
    const resultsCount = document.getElementById('results-count');

    resultsCount.textContent = `${results.length} resultado(s) encontrado(s)`;
    
    if (results.length === 0) {
        resultsList.innerHTML = '<div class="empty-state">Nenhum resultado encontrado</div>';
        resultsList.classList.add('empty');
        return;
    }

    resultsList.classList.remove('empty');
    resultsList.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.type}`;
        resultItem.innerHTML = `
            <div class="result-info">
                <div class="result-student">${result.studentName}</div>
                <div class="result-details">
                    Gabinete ${result.cabinet} • Slot ${result.slot}
                    ${result.chromebookId ? ` • ID: ${result.chromebookId}` : ''}
                </div>
            </div>
            <button class="result-action" onclick="navigateToSlot(${result.cabinet}, ${result.slot})">
                ${result.type === 'occupied' ? '→ Ver' : '+ Add'}
            </button>
        `;
        resultsList.appendChild(resultItem);
    });
}

function clearSearchResults() {
    document.getElementById('search-input').value = '';
    document.getElementById('results-list').innerHTML = '';
    document.getElementById('results-count').textContent = '0 resultados encontrados';
    document.getElementById('results-list').classList.add('empty');
}

function navigateToSlot(cabinetNum, slotNum) {
    const searchPanel = document.getElementById('search-panel');
    const searchToggle = document.getElementById('search-toggle');
    
    if (searchPanel.classList.contains('active')) {
        searchPanel.classList.remove('active');
        searchToggle.querySelector('span').textContent = '⌄';
    }
    
    showCabinetDetails(cabinetNum);
    
    setTimeout(() => {
        const slotElement = document.querySelector(`[data-slot="${slotNum}"]`);
        if (slotElement) {
            slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            slotElement.style.transform = 'scale(1.1)';
            slotElement.style.boxShadow = '0 0 20px rgba(0, 111, 254, 0.8)';
            setTimeout(() => {
                slotElement.style.transform = '';
                slotElement.style.boxShadow = '';
            }, 2000);
        }
    }, 500);
}

function saveToLocalStorage() {
    localStorage.setItem('chromebookStorage', JSON.stringify(cabinets));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('chromebookStorage');
    if (savedData) cabinets = JSON.parse(savedData);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginSystem();
});