// --- CONFIGURACIÓN INICIAL Y DATOS ---

// Verificar si ya existen datos en LocalStorage, si no, crearlos
function initData() {
    if (!localStorage.getItem('crecermas_users')) {
        const initialData = [
            // Administrador
            { 
                role: 'admin', 
                rut: '11.111.111-1', 
                name: 'Administrador', 
                surname: 'Principal' 
            },
            // 5 Estudiantes
            { 
                role: 'student', 
                rut: '12.345.678-9', 
                name: 'Juan', 
                surname: 'Pérez', 
                phone: '+56911111111', 
                grades: 5.5, 
                attendance: 85 // %
            },
            { 
                role: 'student', 
                rut: '13.456.789-0', 
                name: 'María', 
                surname: 'González', 
                phone: '+56922222222', 
                grades: 6.8, 
                attendance: 95 
            },
            { 
                role: 'student', 
                rut: '14.567.890-K', 
                name: 'Carlos', 
                surname: 'Tapia', 
                phone: '+56933333333', 
                grades: 4.2, 
                attendance: 60 // Alerta baja asistencia
            },
            { 
                role: 'student', 
                rut: '15.678.901-2', 
                name: 'Ana', 
                surname: 'López', 
                phone: '+56944444444', 
                grades: 5.0, 
                attendance: 72 // Alerta baja asistencia
            },
            { 
                role: 'student', 
                rut: '16.789.012-3', 
                name: 'Pedro', 
                surname: 'Soto', 
                phone: '+56955555555', 
                grades: 6.0, 
                attendance: 88 
            }
        ];
        localStorage.setItem('crecermas_users', JSON.stringify(initialData));
    }
}

// Variables Globales para Gráficos
let adminChart = null;

// Ejecutar al cargar
window.onload = initData;

// --- FUNCIONES DE NAVEGACIÓN ---

function showView(viewId) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    // Mostrar la deseada
    document.getElementById(viewId).classList.add('active');
    
    // Manejo del botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (viewId === 'login-view') {
        logoutBtn.style.display = 'none';
    } else {
        logoutBtn.style.display = 'block';
    }
}

// --- LOGICA LOGIN ---

function login() {
    const rutInput = document.getElementById('rutInput').value.trim();
    const errorMsg = document.getElementById('loginError');
    
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const user = users.find(u => u.rut === rutInput);

    if (user) {
        errorMsg.textContent = '';
        localStorage.setItem('currentUser', JSON.stringify(user)); // Guardar sesión temporal

        if (user.role === 'admin') {
            loadAdminDashboard();
            showView('admin-view');
        } else {
            loadStudentView(user);
            showView('student-view');
        }
    } else {
        errorMsg.textContent = 'RUT no encontrado en el sistema.';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('rutInput').value = '';
    showView('login-view');
}

// --- LOGICA VISTA ESTUDIANTE ---

function loadStudentView(user) {
    document.getElementById('studentName').textContent = `${user.name} ${user.surname}`;
    document.getElementById('studentRut').textContent = user.rut;
    document.getElementById('studentGrade').textContent = user.grades;
    document.getElementById('studentAttendance').textContent = user.attendance + '%';

    // Lógica de Alerta (Umbral definido en 75%)
    const warningBox = document.getElementById('attendanceWarning');
    if (user.attendance < 75) {
        warningBox.classList.remove('hidden');
    } else {
        warningBox.classList.add('hidden');
    }
}

// --- LOGICA VISTA ADMIN (DASHBOARD) ---

function loadAdminDashboard() {
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const students = users.filter(u => u.role === 'student');
    
    // 1. Llenar Tabla
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = ''; // Limpiar
    
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name} ${student.surname}</td>
            <td>${student.rut}</td>
            <td style="color: ${student.attendance < 75 ? 'red' : 'green'}">
                ${student.attendance}%
            </td>
            <td>
                <button class="link-btn" onclick="openStudentDetail('${student.rut}')">Ver Detalle</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 2. Cargar Gráfico Inicial (Promedio Notas)
    updateChart('grades');
}

function updateChart(type) {
    const users = JSON.parse(localStorage.getItem('crecermas_users'));
    const students = users.filter(u => u.role === 'student');

    // Preparar datos
    const labels = students.map(s => s.name); // Eje X: Nombres
    let dataValues = [];
    let labelText = '';
    let color = '';

    if (type === 'grades') {
        dataValues = students.map(s => s.grades);
        labelText = 'Promedio de Notas';
        color = 'rgba(54, 162, 235, 0.6)';
    } else {
        dataValues = students.map(s => s.attendance);
        labelText = 'Porcentaje de Asistencia';
        color = 'rgba(75, 192, 192, 0.6)';
    }

    // Destruir gráfico anterior si existe
    if (adminChart) {
        adminChart.destroy();
    }

    const ctx = document.getElementById('generalChart').getContext('2d');
    adminChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: labelText,
                data: dataValues,
                backgroundColor: color,
                borderColor: color.replace('0.6', '1'),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: type === 'grades' ? 7 : 100 // Escala 1-7 o 0-100%
                }
            }
        }
    });
}

// --- LOGICA VISTA DETALLE ESPECÍFICO ---

function openStudentDetail(rut) {
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