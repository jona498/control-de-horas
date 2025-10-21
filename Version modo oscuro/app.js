document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS AL DOM (¡ACTUALIZADO!) ---
    const navCalendarBtn = document.getElementById('nav-calendar-btn');
    const navSummaryBtn = document.getElementById('nav-summary-btn');
    const navSettingsBtn = document.getElementById('nav-settings-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn'); // ¡NUEVO!
    const calendarView = document.getElementById('calendar-view');
    const summaryView = document.getElementById('summary-view');
    const settingsView = document.getElementById('settings-view');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const sidebarDateDisplay = document.getElementById('sidebar-date-display');
    const totalHoursDisplay = document.getElementById('total-hours-display');
    const taskList = document.getElementById('task-list');
    const remainingHoursDisplay = document.getElementById('remaining-hours-display');
    const unimputedHoursDisplay = document.getElementById('unimputed-hours-display');
    const dayActionsContainer = document.querySelector('.day-actions');
    const setWorkdayBtn = document.getElementById('set-workday-btn');
    const setVacationBtn = document.getElementById('set-vacation-btn');
    const setHolidayBtn = document.getElementById('set-holiday-btn');
    const addTaskForm = document.querySelector('.add-task-form');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskProjectInput = document.getElementById('task-project-input');
    const taskNameInput = document.getElementById('task-name-input');
    const taskHoursInput = document.getElementById('task-hours-input');
    const taskJpInput = document.getElementById('task-jp-input');
    const projectDatalist = document.getElementById('project-suggestions');
    const jpDatalist = document.getElementById('jp-suggestions');
    
    // Vista de Resumen
    const summaryTitle = document.getElementById('summary-title');
    const downloadCsvBtn = document.getElementById('download-csv-btn');
    const projectSummaryContainer = document.getElementById('project-summary-container');
    const jpSummaryContainer = document.getElementById('jp-summary-container');
    const summaryStartDateInput = document.getElementById('summary-start-date');
    const summaryEndDateInput = document.getElementById('summary-end-date');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');
    const projectChartCtx = document.getElementById('project-pie-chart').getContext('2d');
    const jpChartCtx = document.getElementById('jp-pie-chart').getContext('2d');

    // Vista de Configuración
    const defaultHoursInput = document.getElementById('default-hours-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const exportBackupBtn = document.getElementById('export-backup-btn');
    const importBackupBtn = document.getElementById('import-backup-btn');
    const importFileInput = document.getElementById('import-file-input');
    const projectSuggestionsManager = document.getElementById('project-suggestions-manager');
    const jpSuggestionsManager = document.getElementById('jp-suggestions-manager');

    // --- ESTADO DE LA APLICACIÓN (¡ACTUALIZADO!) ---
    let currentDate = new Date(2025, 9, 1);
    let selectedDate = null; 
    let allTasks = {};
    let projectSuggestions = [];
    let jpSuggestions = [];
    let dayTypes = {};
    let settings = { defaultHours: 8.0 };
    let projectChartInstance = null;
    let jpChartInstance = null;

    // --- FUNCIONES DE ALMACENAMIENTO (Sin cambios) ---
    function loadFromStorage() {
        const tasksJSON = localStorage.getItem('myTasks');
        if (tasksJSON) allTasks = JSON.parse(tasksJSON);
        const projectsJSON = localStorage.getItem('myProjects');
        if (projectsJSON) projectSuggestions = JSON.parse(projectsJSON);
        const jpsJSON = localStorage.getItem('myJPs');
        if (jpsJSON) jpSuggestions = JSON.parse(jpsJSON);
        const dayTypesJSON = localStorage.getItem('myDayTypes');
        if (dayTypesJSON) dayTypes = JSON.parse(dayTypesJSON);
        const settingsJSON = localStorage.getItem('mySettings');
        if (settingsJSON) settings = JSON.parse(settingsJSON);
    }
    function saveTasksToStorage() { localStorage.setItem('myTasks', JSON.stringify(allTasks)); }
    function saveSuggestionsToStorage() {
        localStorage.setItem('myProjects', JSON.stringify(projectSuggestions));
        localStorage.setItem('myJPs', JSON.stringify(jpSuggestions));
    }
    function saveDayTypesToStorage() { localStorage.setItem('myDayTypes', JSON.stringify(dayTypes)); }
    function saveSettingsToStorage() { localStorage.setItem('mySettings', JSON.stringify(settings)); }
    function saveAllDataToStorage() {
        saveTasksToStorage();
        saveSuggestionsToStorage();
        saveDayTypesToStorage();
        saveSettingsToStorage();
    }
    
    // --- FUNCIONES DE CONFIGURACIÓN Y BACKUP (Sin cambios) ---
    function loadSettingsIntoUI() {
        defaultHoursInput.value = settings.defaultHours.toFixed(1);
    }
    function handleSaveSettings() {
        const newHours = parseFloat(defaultHoursInput.value);
        if (isNaN(newHours) || newHours <= 0) {
            alert('Por favor, introduce un número de horas válido.');
            return;
        }
        settings.defaultHours = newHours;
        saveSettingsToStorage();
        alert('¡Configuración guardada!');
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    }
    function prepareBackupData() {
        return { settings, allTasks, dayTypes, projectSuggestions, jpSuggestions };
    }
    function handleExportBackup() {
        const backupData = prepareBackupData();
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const isoDate = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `control-horario-backup-${isoDate}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    function handleImportBackup() {
        importFileInput.click();
    }
    function handleFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== 'application/json') {
             alert('Error: El archivo seleccionado no es un .json');
             event.target.value = null;
             return;
        }
        if (!confirm('¿Estás seguro?\n\nEsto SOBRESCRIBIRÁ todos los datos actuales. Esta acción no se puede deshacer.')) {
            event.target.value = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!importedData.settings || !importedData.allTasks || !importedData.dayTypes) {
                    throw new Error('El archivo no tiene la estructura de backup esperada.');
                }
                settings = importedData.settings;
                allTasks = importedData.allTasks;
                dayTypes = importedData.dayTypes;
                projectSuggestions = importedData.projectSuggestions || [];
                jpSuggestions = importedData.jpSuggestions || [];
                saveAllDataToStorage();
                alert('¡Importación completada con éxito!');
                loadSettingsIntoUI();
                populateSuggestionDatalists();
                renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            } catch (error) {
                alert('Error al importar el archivo: ' + error.message);
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    }
    
    // --- FUNCIONES DE GESTIÓN DE SUGERENCIAS (Sin cambios) ---
    function renderSuggestionManagers() {
        let projectHtml = '<table class="suggestion-manager-table"><thead><tr><th>Proyecto</th><th>Nuevo Nombre</th><th class="rename-btn-cell"></th><th class="delete-btn-cell"></th></tr></thead><tbody>';
        projectSuggestions.sort().forEach(name => {
            projectHtml += `<tr><td>${name}</td><td><input type="text" class="rename-input" data-type="project" value="${name}"></td><td><button class="rename-btn" data-type="project" data-original-name="${name}">Renombrar</button></td><td><button class="delete-suggestion-btn" data-type="project" data-name="${name}">Borrar</button></td></tr>`;
        });
        projectHtml += '</tbody></table>';
        projectSuggestionsManager.innerHTML = projectHtml;
        let jpHtml = '<table class="suggestion-manager-table"><thead><tr><th>Jefe de Proyecto</th><th>Nuevo Nombre</th><th class="rename-btn-cell"></th><th class="delete-btn-cell"></th></tr></thead><tbody>';
        jpSuggestions.sort().forEach(name => {
            jpHtml += `<tr><td>${name}</td><td><input type="text" class="rename-input" data-type="jp" value="${name}"></td><td><button class="rename-btn" data-type="jp" data-original-name="${name}">Renombrar</button></td><td><button class="delete-suggestion-btn" data-type="jp" data-name="${name}">Borrar</button></td></tr>`;
        });
        jpHtml += '</tbody></table>';
        jpSuggestionsManager.innerHTML = jpHtml;
    }
    function handleDeleteSuggestion(e) {
        const dataType = e.target.dataset.type;
        const nameToDelete = e.target.dataset.name;
        if (!confirm(`¿Seguro que quieres borrar "${nameToDelete}" de la lista de sugerencias?\n\n(Esto NO afectará a las tareas ya existentes)`)) {
            return;
        }
        if (dataType === 'project') {
            projectSuggestions = projectSuggestions.filter(s => s !== nameToDelete);
        } else {
            jpSuggestions = jpSuggestions.filter(s => s !== nameToDelete);
        }
        saveSuggestionsToStorage();
        renderSuggestionManagers();
        populateSuggestionDatalists();
    }
    function handleRenameSuggestion(e) {
        const dataType = e.target.dataset.type;
        const originalName = e.target.dataset.originalName;
        const input = e.target.closest('tr').querySelector('.rename-input');
        const newName = input.value.trim();
        if (!newName || newName === originalName) {
            alert('Introduce un nombre nuevo y diferente.');
            input.value = originalName;
            return;
        }
        if (!confirm(`¿Seguro que quieres renombrar "${originalName}" a "${newName}"?\n\n¡Esto actualizará TODAS las tareas existentes! Esta acción es permanente.`)) {
            return;
        }
        for (const date in allTasks) {
            allTasks[date].forEach(task => {
                if (dataType === 'project' && task.project === originalName) {
                    task.project = newName;
                } else if (dataType === 'jp' && task.jp === originalName) {
                    task.jp = newName;
                }
            });
        }
        if (dataType === 'project') {
            projectSuggestions = projectSuggestions.map(s => s === originalName ? newName : s);
            projectSuggestions = [...new Set(projectSuggestions)];
        } else {
            jpSuggestions = jpSuggestions.map(s => s === originalName ? newName : s);
            jpSuggestions = [...new Set(jpSuggestions)];
        }
        saveTasksToStorage();
        saveSuggestionsToStorage();
        renderSuggestionManagers();
        populateSuggestionDatalists();
        alert(`"${originalName}" se ha renombrado a "${newName}" en todas las tareas.`);
    }

    // --- FUNCIONES DE NAVEGACIÓN (Sin cambios) ---
    function navigateTo(view) {
        calendarView.classList.remove('active');
        summaryView.classList.remove('active');
        settingsView.classList.remove('active');
        navCalendarBtn.classList.remove('active');
        navSummaryBtn.classList.remove('active');
        navSettingsBtn.classList.remove('active');

        if (view === 'calendar') {
            calendarView.classList.add('active');
            navCalendarBtn.classList.add('active');
        } else if (view === 'summary') {
            summaryView.classList.add('active');
            navSummaryBtn.classList.add('active');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            summaryStartDateInput.value = new Date(year, month, 1).toISOString().split('T')[0];
            summaryEndDateInput.value = new Date(year, month + 1, 0).toISOString().split('T')[0];
            handleGenerateSummary();
        } else if (view === 'settings') {
            settingsView.classList.add('active');
            navSettingsBtn.classList.add('active');
            loadSettingsIntoUI();
            renderSuggestionManagers();
        }
    }

    // --- FUNCIONES DE RESUMEN (Refactorizadas) ---
    function handleGenerateSummary() {
        const startDate = summaryStartDateInput.value;
        const endDate = summaryEndDateInput.value;
        if (!startDate || !endDate) {
            alert("Por favor, selecciona una fecha de inicio y fin.");
            return;
        }
        if (startDate > endDate) {
            alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
            return;
        }
        summaryTitle.textContent = `Resumen de ${startDate} a ${endDate}`;
        const tasks = getTasksForDateRange(startDate, endDate);
        const projectData = aggregateProjectData(tasks);
        const jpData = aggregateJpData(tasks);
        renderCharts(projectData, jpData); // ¡ACTUALIZADO!
        renderProjectTable(projectData);
        renderJpTable(jpData);
    }
    function getTasksForDateRange(startDateStr, endDateStr) {
        let tasks = [];
        for (const date in allTasks) {
            if (date >= startDateStr && date <= endDateStr) {
                allTasks[date].forEach(task => {
                    tasks.push({ ...task, date: date });
                });
            }
        }
        return tasks;
    }
    function aggregateProjectData(tasks) {
        const projectData = {};
        tasks.forEach(task => {
            if (!projectData[task.project]) {
                projectData[task.project] = { totalHours: 0, imputedHours: 0, unimputedHours: 0, breakdown: [] };
            }
            projectData[task.project].totalHours += task.hours;
            if (task.imputed) {
                projectData[task.project].imputedHours += task.hours;
            } else {
                projectData[task.project].unimputedHours += task.hours;
            }
            projectData[task.project].breakdown.push(task);
        });
        return projectData;
    }
    function aggregateJpData(tasks) {
        const jpData = {};
        tasks.forEach(task => {
            jpData[task.jp] = (jpData[task.jp] || 0) + task.hours;
        });
        return jpData;
    }
    function renderProjectTable(projectData) {
        if (Object.keys(projectData).length === 0) {
            projectSummaryContainer.innerHTML = "<p>No hay tareas con horas en este rango de fechas.</p>";
            return;
        }
        let tableHtml = '<table><thead><tr><th>Proyecto</th><th>Total Horas</th><th>Imputadas</th><th>Pendientes</th><th>Desglose por Día</th></tr></thead><tbody>';
        let grandTotal = 0, totalImputed = 0, totalUnimputed = 0;
        const sortedProjects = Object.keys(projectData).sort();
        sortedProjects.forEach(project => {
            const data = projectData[project];
            grandTotal += data.totalHours;
            totalImputed += data.imputedHours;
            totalUnimputed += data.unimputedHours;
            let breakdownHtml = '<ul class="task-breakdown">';
            data.breakdown.sort((a, b) => a.date.localeCompare(b.date));
            data.breakdown.forEach(task => {
                const day = new Date(task.date + 'T00:00:00').getDate();
                const statusTag = task.imputed ? '<span class="status-tag status-imputed">Imputado</span>' : '<span class="status-tag status-pending">Pendiente</span>';
                breakdownHtml += `<li>(Día ${day}) - ${task.hours.toFixed(1)}h ${statusTag}</li>`;
            });
            breakdownHtml += '</ul>';
            tableHtml += `<tr><td>${project}</td><td><strong>${data.totalHours.toFixed(1)}h</strong></td><td>${data.imputedHours.toFixed(1)}h</td><td>${data.unimputedHours.toFixed(1)}h</td><td>${breakdownHtml}</td></tr>`;
        });
        tableHtml += `<tr class="summary-total-row"><td>Total General</td><td>${grandTotal.toFixed(1)}h</td><td>${totalImputed.toFixed(1)}h</td><td>${totalUnimputed.toFixed(1)}h</td><td></td></tr>`;
        tableHtml += '</tbody></table>';
        projectSummaryContainer.innerHTML = tableHtml;
    }
    function renderJpTable(jpData) {
        if (Object.keys(jpData).length === 0) {
            jpSummaryContainer.innerHTML = "<p>No hay horas asignadas a JPs en este rango de fechas.</p>";
            return;
        }
        let tableHtml = '<table><thead><tr><th>Jefe de Proyecto (JP)</th><th>Horas Totales</th></tr></thead><tbody>';
        let grandTotal = 0;
        const sortedJPs = Object.keys(jpData).sort();
        sortedJPs.forEach(jp => {
            const hours = jpData[jp];
            grandTotal += hours;
            tableHtml += `<tr><td>${jp}</td><td>${hours.toFixed(1)}h</td></tr>`;
        });
        tableHtml += `<tr class="summary-total-row"><td>Total General</td><td>${grandTotal.toFixed(1)}h</td></tr>`;
        tableHtml += '</tbody></table>';
        jpSummaryContainer.innerHTML = tableHtml;
    }

    /**
     * ¡MODIFICADO! Dibuja los gráficos teniendo en cuenta el modo oscuro.
     */
    function renderCharts(projectData, jpData) {
        if (projectChartInstance) projectChartInstance.destroy();
        if (jpChartInstance) jpChartInstance.destroy();

        // Determinar el color del texto basado en el tema
        const isDarkMode = document.body.classList.contains('dark-mode');
        const chartTextColor = isDarkMode ? '#e0e0e0' : '#333';

        // --- Gráfico de Proyectos ---
        const projectLabels = Object.keys(projectData);
        const projectValues = Object.values(projectData).map(d => d.totalHours);
        const projectColors = projectLabels.map(() => getRandomColor());
        
        projectChartInstance = new Chart(projectChartCtx, {
            type: 'pie',
            data: { labels: projectLabels, datasets: [{ data: projectValues, backgroundColor: projectColors, hoverOffset: 4 }] },
            options: {
                responsive: true,
                legend: { 
                    position: 'top',
                    labels: { color: chartTextColor } // ¡Color de leyenda dinámico!
                }
            }
        });

        // --- Gráfico de JPs ---
        const jpLabels = Object.keys(jpData);
        const jpValues = Object.values(jpData);
        const jpColors = jpLabels.map(() => getRandomColor());

        jpChartInstance = new Chart(jpChartCtx, {
            type: 'pie',
            data: { labels: jpLabels, datasets: [{ data: jpValues, backgroundColor: jpColors, hoverOffset: 4 }] },
            options: {
                responsive: true,
                legend: { 
                    position: 'top',
                    labels: { color: chartTextColor } // ¡Color de leyenda dinámico!
                }
            }
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    function generateAndDownloadCSV() {
        const startDate = summaryStartDateInput.value;
        const endDate = summaryEndDateInput.value;
        if (!startDate || !endDate) {
            alert("Por favor, genera un resumen con fechas válidas primero.");
            return;
        }
        const tasks = getTasksForDateRange(startDate, endDate);
        let csvRows = [ ["Fecha", "Proyecto", "Jefe de Proyecto (JP)", "Descripcion", "Horas", "Imputado"] ];
        const sanitize = (field) => {
            if (field === null || field === undefined) return '';
            let str = String(field);
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        tasks.forEach(task => {
            csvRows.push([
                task.date,
                sanitize(task.project),
                sanitize(task.jp),
                sanitize(task.description),
                task.hours,
                task.imputed ? 'Si' : 'No'
            ]);
        });
        let csvContent = csvRows.map(row => row.join(",")).join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Resumen_Horas_${startDate}_a_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- FUNCIONES DE CALENDARIO (Sin cambios) ---
    function populateSuggestionDatalists() {
        if (!projectDatalist || !jpDatalist) return;
        projectDatalist.innerHTML = '';
        projectSuggestions.forEach(project => {
            projectDatalist.innerHTML += `<option value="${project}">`;
        });
        jpDatalist.innerHTML = '';
        jpSuggestions.forEach(jp => {
            jpDatalist.innerHTML += `<option value="${jp}">`;
        });
    }
    function renderCalendar(year, month) {
        calendarGrid.innerHTML = '';
        const monthName = new Date(year, month).toLocaleString('es-ES', { month: 'long' });
        monthYearDisplay.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        let firstDayOfMonth = new Date(year, month, 1).getDay();
        let startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('dia-celda', 'other-month');
            dayCell.innerHTML = `<div class="dia-numero">${daysInPrevMonth - i}</div>`;
            calendarGrid.appendChild(dayCell);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('dia-celda');
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = fullDate; 
            const dayOfWeek = new Date(year, month, day).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { dayCell.classList.add('weekend'); }
            const dayType = dayTypes[fullDate];
            if (dayType === 'vacaciones') { dayCell.classList.add('vacaciones'); } 
            else if (dayType === 'festivo') { dayCell.classList.add('festivo'); }
            dayCell.innerHTML = `
                <div class="dia-numero">${day}</div>
                <div class="dia-resumen" id="resumen-${fullDate}"></div>
            `;
            updateDaySummaryInGrid(fullDate);
            dayCell.addEventListener('click', () => {
                selectDay(dayCell, fullDate);
            });
            calendarGrid.appendChild(dayCell);
        }
    }
    function selectDay(clickedCell, dateString) {
        const previouslySelected = document.querySelector('.dia-celda.selected');
        if (previouslySelected) { previouslySelected.classList.remove('selected'); }
        clickedCell.classList.add('selected');
        selectedDate = dateString;
        const dateObj = new Date(dateString + 'T00:00:00');
        const dateDisplay = dateObj.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        sidebarDateDisplay.textContent = dateDisplay.charAt(0).toUpperCase() + dateDisplay.slice(1);
        dayActionsContainer.style.display = 'flex';
        const dayType = dayTypes[dateString];
        if (dayType === 'festivo' || dayType === 'vacaciones') {
            const typeText = dayType === 'festivo' ? 'Día Festivo' : 'Día de Vacaciones';
            taskList.innerHTML = `<p style="color: #888; text-align: center; padding: 20px 0;">${typeText}</p>`;
            addTaskForm.style.display = 'none';
        } else {
            addTaskForm.style.display = 'block';
            renderTasksInSidebar(dateString);
        }
        updateSidebarSummary(dateString);
    }
    function renderTasksInSidebar(dateString) {
        taskList.innerHTML = '';
        const tasksForDay = allTasks[dateString] || [];
        if (tasksForDay.length === 0) {
            taskList.innerHTML = '<p style="color: #888; text-align: center;">No hay tareas para este día.</p>';
            return;
        }
        tasksForDay.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.dataset.taskId = task.id; 
            taskItem.innerHTML = `
                <div class="task-info">
                    <strong>${task.project}</strong>
                    <span class="task-jp">JP: ${task.jp}</span>
                    <span>${task.description}</span>
                </div>
                <div class="task-details">
                    <span class="task-hours">${task.hours.toFixed(1)}h</span>
                    <input type="checkbox" class="impute-checkbox" ${task.imputed ? 'checked' : ''} title="¿Imputado?">
                    <button class="delete-task-btn" title="Borrar tarea">&times;</button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    }
    
    // --- FUNCIONES DE LÓGICA DE CALENDARIO (Sin cambios) ---
    function updateSidebarSummary(dateString) {
        const dayType = dayTypes[dateString];
        const defaultHours = settings.defaultHours;
        if (dayType) {
            totalHoursDisplay.textContent = `${defaultHours.toFixed(1)}h / ${defaultHours.toFixed(1)}h`;
            remainingHoursDisplay.textContent = '0.0h (Completo)';
            remainingHoursDisplay.parentElement.style.color = '#5cb85c';
            unimputedHoursDisplay.textContent = '0.0h';
            unimputedHoursDisplay.parentElement.style.color = '#5cb85c';
            return;
        }
        const tasksForDay = allTasks[dateString] || [];
        const totalHours = tasksForDay.reduce((sum, task) => sum + task.hours, 0);
        totalHoursDisplay.textContent = `${totalHours.toFixed(1)}h / ${defaultHours.toFixed(1)}h`;
        const remainingHours = defaultHours - totalHours;
        if (remainingHours > 0) {
            remainingHoursDisplay.textContent = `${remainingHours.toFixed(1)}h`;
            remainingHoursDisplay.parentElement.style.color = '#007bff';
        } else if (remainingHours === 0) {
            remainingHoursDisplay.textContent = `0.0h (Completo)`;
            remainingHoursDisplay.parentElement.style.color = '#5cb85c';
        } else {
            remainingHoursDisplay.textContent = `${Math.abs(remainingHours).toFixed(1)}h (Extra)`;
            remainingHoursDisplay.parentElement.style.color = '#f0ad4e';
        }
        const unimputedHours = tasksForDay.filter(task => !task.imputed).reduce((sum, task) => sum + task.hours, 0);
        unimputedHoursDisplay.textContent = `${unimputedHours.toFixed(1)}h`;
        unimputedHoursDisplay.parentElement.style.color = (unimputedHours > 0) ? '#d9534f' : '#5cb85c';
    }
    function updateDaySummaryInGrid(dateString) {
        const daySummaryEl = document.getElementById(`resumen-${dateString}`);
        const dayCell = document.querySelector(`.dia-celda[data-date="${dateString}"]`);
        if (!daySummaryEl || !dayCell) return; 
        const defaultHours = settings.defaultHours;
        const dayType = dayTypes[dateString];
        const tasksForDay = allTasks[dateString] || [];
        const totalHours = tasksForDay.reduce((sum, task) => sum + task.hours, 0);
        const unimputedHours = tasksForDay.filter(task => !task.imputed).reduce((sum, task) => sum + task.hours, 0);
        daySummaryEl.classList.remove('incomplete', 'complete');
        if (dayType === 'festivo') {
            daySummaryEl.textContent = 'Festivo';
            daySummaryEl.classList.add('complete');
        } else if (dayType === 'vacaciones') {
            daySummaryEl.textContent = 'Vacaciones';
            daySummaryEl.classList.add('complete');
        } else if (totalHours === 0) {
            daySummaryEl.textContent = `0.0h / ${defaultHours.toFixed(1)}h`;
            daySummaryEl.classList.add('incomplete');
        } else if (totalHours >= defaultHours) {
            daySummaryEl.textContent = `${totalHours.toFixed(1)}h`;
            daySummaryEl.classList.add(unimputedHours > 0 ? 'incomplete' : 'complete');
        } else {
            daySummaryEl.textContent = `${totalHours.toFixed(1)}h`;
            daySummaryEl.classList.add('incomplete');
        }
        dayCell.classList.remove('workday-empty', 'workday-unimputed', 'workday-complete');
        if (dayType || dayCell.classList.contains('weekend')) { return; }
        if (totalHours === 0) {
            dayCell.classList.add('workday-empty');
        } else if (unimputedHours > 0) {
            dayCell.classList.add('workday-unimputed');
        } else {
            dayCell.classList.add('workday-complete');
        }
    }
    function handleAddTask() {
        if (!selectedDate) return;
        const project = taskProjectInput.value.trim();
        const jp = taskJpInput.value.trim();
        const description = taskNameInput.value.trim();
        const hours = parseFloat(taskHoursInput.value);
        if (!project || !jp || isNaN(hours) || hours <= 0) {
            alert('Por favor, rellena Proyecto, JP y Horas válidas.');
            return;
        }
        const newTask = { id: Date.now(), project: project, jp: jp, description: description || '...', hours: hours, imputed: false };
        if (!allTasks[selectedDate]) allTasks[selectedDate] = [];
        allTasks[selectedDate].push(newTask);
        saveTasksToStorage();
        let suggestionsChanged = false;
        if (!projectSuggestions.includes(project)) { projectSuggestions.push(project); suggestionsChanged = true; }
        if (!jpSuggestions.includes(jp)) { jpSuggestions.push(jp); suggestionsChanged = true; }
        if (suggestionsChanged) { saveSuggestionsToStorage(); populateSuggestionDatalists(); }
        renderTasksInSidebar(selectedDate);
        updateSidebarSummary(selectedDate);
        updateDaySummaryInGrid(selectedDate);
        taskProjectInput.value = '';
        taskJpInput.value = '';
        taskNameInput.value = '';
        taskHoursInput.value = '';
    }
    function handleTaskListClick(event) {
        const target = event.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem || !selectedDate) return;
        const taskId = Number(taskItem.dataset.taskId);
        if (target.classList.contains('delete-task-btn')) {
            allTasks[selectedDate] = allTasks[selectedDate].filter(task => task.id !== taskId);
        }
        if (target.classList.contains('impute-checkbox')) {
            const task = allTasks[selectedDate].find(task => task.id === taskId);
            if (task) { task.imputed = target.checked; }
        }
        saveTasksToStorage();
        renderTasksInSidebar(selectedDate);
        updateSidebarSummary(selectedDate);
        updateDaySummaryInGrid(selectedDate);
    }
    function setDayType(type) {
        if (!selectedDate) return;
        if (type !== 'workday' && allTasks[selectedDate] && allTasks[selectedDate].length > 0) {
            if (!confirm(`Este día tiene ${allTasks[selectedDate].length} tarea(s). ¿Quieres borrarlas y marcarlo como '${type}'?`)) {
                return;
            }
            delete allTasks[selectedDate];
            saveTasksToStorage();
        }
        if (type === 'workday') { delete dayTypes[selectedDate]; } 
        else { dayTypes[selectedDate] = type; }
        saveDayTypesToStorage();
        const selectedCell = document.querySelector(`.dia-celda[data-date="${selectedDate}"]`);
        if (selectedCell) {
            selectedCell.classList.remove('vacaciones', 'festivo');
            if (type === 'vacaciones' || type === 'festivo') {
                selectedCell.classList.add(type);
            }
            updateDaySummaryInGrid(selectedDate);
            selectDay(selectedCell, selectedDate);
        }
    }

    // --- ¡NUEVO! LÓGICA DE MODO OSCURO ---
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = 'Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = 'Modo Oscuro';
        }
        // ¡Importante! Si la vista de resumen está activa, regenera los gráficos con los nuevos colores
        if (summaryView.classList.contains('active')) {
            handleGenerateSummary();
        }
    }


    // --- EVENT LISTENERS (¡ACTUALIZADO!) ---
    navCalendarBtn.addEventListener('click', () => navigateTo('calendar'));
    navSummaryBtn.addEventListener('click', () => navigateTo('summary'));
    navSettingsBtn.addEventListener('click', () => navigateTo('settings'));
    
    // ¡NUEVO! Listener para el botón de tema
    themeToggleBtn.addEventListener('click', () => {
        let theme = 'light';
        if (!document.body.classList.contains('dark-mode')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
        setTheme(theme);
    });

    // Resumen
    downloadCsvBtn.addEventListener('click', generateAndDownloadCSV);
    generateSummaryBtn.addEventListener('click', handleGenerateSummary);
    
    // Calendario
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    addTaskBtn.addEventListener('click', handleAddTask);
    taskList.addEventListener('click', handleTaskListClick);
    setWorkdayBtn.addEventListener('click', () => setDayType('workday'));
    setVacationBtn.addEventListener('click', () => setDayType('vacaciones'));
    setHolidayBtn.addEventListener('click', () => setDayType('festivo'));
    
    // Configuración
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
    exportBackupBtn.addEventListener('click', handleExportBackup);
    importBackupBtn.addEventListener('click', handleImportBackup);
    importFileInput.addEventListener('change', handleFileSelected);
    projectSuggestionsManager.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-suggestion-btn')) { handleDeleteSuggestion(e); }
        if (e.target.classList.contains('rename-btn')) { handleRenameSuggestion(e); }
    });
    jpSuggestionsManager.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-suggestion-btn')) { handleDeleteSuggestion(e); }
        if (e.target.classList.contains('rename-btn')) { handleRenameSuggestion(e); }
    });

    // --- INICIALIZACIÓN (¡ACTUALIZADO!) ---

    // ¡NUEVO! Aplicar tema guardado AL PRINCIPIO
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        setTheme(currentTheme);
    }

    loadFromStorage();
    populateSuggestionDatalists();
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    navigateTo('calendar');

});