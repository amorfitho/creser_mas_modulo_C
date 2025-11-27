// --- CONFIGURACIÓN INICIAL ---
function initData() {
    if (!localStorage.getItem('crecermas_users')) {
        const initialData = [
            { role: 'admin', rut: '11.111.111-1', name: 'Administrador', surname: 'Principal' },
            { role: 'student', rut: '12.345.678-9', name: 'Juan', surname: 'Pérez', phone: '+56911111111', grades: 5.5, attendance: 85 },
            { role: 'student', rut: '13.456.789-0', name: 'María', surname: 'González', phone: '+56922222222', grades: 6.8, attendance: 95 },
            { role: 'student', rut: '14.567.890-K', name: 'Carlos', surname: 'Tapia', phone: '+56933333333', grades: 4.2, attendance: 60 },
            { role: 'student', rut: '15.678.901-2', name: 'Ana', surname: 'López', phone: '+56944444444', grades: 5.0, attendance: 72 },
            { role: 'student', rut: '16.789.012-3', name: 'Pedro', surname: 'Soto', phone: '+56955555555', grades: 6.0, attendance: 88 }
        ];
        localStorage.setItem('crecermas_users', JSON.stringify(initialData));
    }
}

let adminChart = null;
let currentDetailRut = null; // Para saber qué usuario se está viendo/editando

window.onload = initData;

// --- NAVEGACIÓN ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.style.display = (viewId === 'login-view') ? 'none' : 'block';
}

// --- LOGIN ---
function login() {
    const rutInput = document.getElementById('rutInput').value.trim();
    const errorMsg = document.getElementById('loginError');
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const user = users.find(u => u.rut === rutInput);

    if (user) {
        errorMsg.textContent = '';
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.role === 'admin') {
            loadAdminDashboard();
            showView('admin-view');
        } else {
            loadStudentView(user);
            showView('student-view');
        }
    } else {
        errorMsg.textContent = 'RUT no encontrado.';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('rutInput').value = '';
    showView('login-view');
}

// --- VISTA ESTUDIANTE ---
function loadStudentView(user) {
    document.getElementById('studentName').textContent = `${user.name} ${user.surname}`;
    document.getElementById('studentRut').textContent = user.rut;
    document.getElementById('studentGrade').textContent = user.grades;
    document.getElementById('studentAttendance').textContent = user.attendance + '%';
    
    const warningBox = document.getElementById('attendanceWarning');
    if (user.attendance < 75) warningBox.classList.remove('hidden');
    else warningBox.classList.add('hidden');
}

// --- DASHBOARD ADMIN ---
function loadAdminDashboard() {
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const students = users.filter(u => u.role === 'student');
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name} ${student.surname}</td>
            <td>${student.rut}</td>
            <td style="color: ${student.attendance < 75 ? 'red' : 'green'}">${student.attendance}%</td>
            <td><button class="link-btn" onclick="openStudentDetail('${student.rut}')">Ver Detalle</button></td>
        `;
        tbody.appendChild(tr);
    });
    updateChart('grades');
}

function updateChart(type) {
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const students = users.filter(u => u.role === 'student');
    const labels = students.map(s => s.name);
    let dataValues = [], labelText = '', color = '';

    if (type === 'grades') {
        dataValues = students.map(s => s.grades);
        labelText = 'Promedio Notas';
        color = 'rgba(54, 162, 235, 0.6)';
    } else {
        dataValues = students.map(s => s.attendance);
        labelText = '% Asistencia';
        color = 'rgba(75, 192, 192, 0.6)';
    }

    if (adminChart) adminChart.destroy();
    const ctx = document.getElementById('generalChart').getContext('2d');
    adminChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: labelText, data: dataValues, backgroundColor: color, borderWidth: 1 }]
        },
        options: { scales: { y: { beginAtZero: true, max: type === 'grades' ? 7 : 100 } } }
    });
}

// --- DETALLE & EDICIÓN ---
function openStudentDetail(rut) {
    currentDetailRut = rut; // Guardar referencia
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const student = users.find(u => u.rut === rut);

    if (student) {
        document.getElementById('detailName').textContent = `${student.name} ${student.surname}`;
        document.getElementById('detailRut').textContent = student.rut;
        document.getElementById('detailPhone').textContent = student.phone;
        document.getElementById('detailGrade').textContent = student.grades;
        document.getElementById('detailAttendance').textContent = student.attendance + '%';
        showView('detail-view');
    }
}

function openEditModal() {
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const student = users.find(u => u.rut === currentDetailRut);
    
    if (student) {
        // Rellenar formulario con datos actuales
        document.getElementById('editName').value = student.name;
        document.getElementById('editSurname').value = student.surname;
        document.getElementById('editPhone').value = student.phone;
        document.getElementById('editGrade').value = student.grades;
        document.getElementById('editAttendance').value = student.attendance;
        
        // Mostrar Modal
        document.getElementById('editModal').classList.remove('hidden');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function saveChanges(event) {
    event.preventDefault(); // Evitar recarga de pagina

    const newName = document.getElementById('editName').value;
    const newSurname = document.getElementById('editSurname').value;
    const newPhone = document.getElementById('editPhone').value;
    const newGrade = parseFloat(document.getElementById('editGrade').value);
    const newAttendance = parseInt(document.getElementById('editAttendance').value);

    // Actualizar datos en LocalStorage
    let users = JSON.parse(localStorage.getItem('crecermas_users'));
    const index = users.findIndex(u => u.rut === currentDetailRut);

    if (index !== -1) {
        users[index].name = newName;
        users[index].surname = newSurname;
        users[index].phone = newPhone;
        users[index].grades = newGrade;
        users[index].attendance = newAttendance;

        localStorage.setItem('crecermas_users', JSON.stringify(users));

        // Refrescar vistas
        alert("Datos actualizados correctamente.");
        closeEditModal();
        openStudentDetail(currentDetailRut); // Actualizar vista detalle visualmente
        loadAdminDashboard(); // Actualizar dashboard por debajo
    }
}