// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.apiBaseUrl = window.location.origin
        this.token = localStorage.getItem('adminToken')
        this.currentSection = 'dashboard'
        this.charts = {}
        this.mode = 'create' // create | edit for agent modal
        this.init()
    }

    init() {
        this.setupEventListeners()
        this.checkAuth()
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault()
            this.login()
        })

        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const section = e.target.getAttribute('data-section') || 
                              e.target.closest('[data-section]').getAttribute('data-section')
                this.showSection(section)
            })
        })

        // Sidebar toggle
        document.getElementById('sidebarCollapse').addEventListener('click', () => {
            this.toggleSidebar()
        })

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault()
            this.logout()
        })

        // Agent form
        document.getElementById('saveAgent').addEventListener('click', () => {
            this.saveAgent()
        })

        // Auto refresh dashboard every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboard()
            }
        }, 30000)
    }

    checkAuth() {
        if (!this.token) {
            this.showLogin()
        } else {
            this.showMainContent()
            this.loadDashboard()
        }
    }

    showLogin() {
        document.getElementById('mainContent').style.display = 'none'
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'))
        loginModal.show()
    }

    showMainContent() {
        document.getElementById('mainContent').style.display = 'block'
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'))
        if (loginModal) {
            loginModal.hide()
        }
    }

    async login() {
        const username = document.getElementById('username').value
        const password = document.getElementById('password').value

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (data.success) {
                this.token = data.token
                localStorage.setItem('adminToken', this.token)
                document.getElementById('adminUsername').textContent = data.user.username
                this.showMainContent()
                this.loadDashboard()
                this.showAlert('Login realizado com sucesso!', 'success')
            } else {
                this.showAlert(data.message, 'error')
            }
        } catch (error) {
            console.error('Login error:', error)
            this.showAlert('Erro ao fazer login', 'error')
        }
    }

    logout() {
        localStorage.removeItem('adminToken')
        this.token = null
        window.location.reload()
    }

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active')
        document.getElementById('content').classList.toggle('active')
    }

    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active')
        })
        document.querySelector(`[data-section="${section}"]`).classList.add('active')

        // Show section content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active')
        })
        document.getElementById(`${section}-section`).classList.add('active')

        this.currentSection = section

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboard()
                break
            case 'agents':
                this.loadAgents()
                break
            case 'users':
                this.loadUsers()
                break
            case 'games':
                this.loadGames()
                break
            case 'reports':
                this.loadReports()
                break
        }
    }

    async apiRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            ...options
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config)
            const data = await response.json()

            if (response.status === 401) {
                this.logout()
                return null
            }

            return data
        } catch (error) {
            console.error('API request error:', error)
            this.showAlert('Erro na comunicação com o servidor', 'error')
            return null
        }
    }

    async loadDashboard() {
        const data = await this.apiRequest('/api/admin/dashboard/stats')
        
        if (data && data.success) {
            const stats = data.data
            
            // Update stats cards
            document.getElementById('totalAgents').textContent = stats.totalAgents
            document.getElementById('totalUsers').textContent = stats.totalUsers
            document.getElementById('totalBalance').textContent = this.formatCurrency(stats.totalBalance)
            document.getElementById('avgRTP').textContent = this.formatPercentage(stats.avgRTP)
            
            // Update charts
            this.updateRevenueChart(stats)
            this.updateGamesChart()
        }
    }

    async loadAgents() {
        const data = await this.apiRequest('/api/admin/agents')
        
        if (data && data.success) {
            const tbody = document.querySelector('#agentsTable tbody')
            tbody.innerHTML = ''
            
            data.data.forEach(agent => {
                const row = document.createElement('tr')
                row.innerHTML = `
                    <td>${agent.id}</td>
                    <td>${agent.agentCode || 'N/A'}</td>
                    <td>${agent.agentToken ? agent.agentToken.substring(0, 20) + '...' : 'N/A'}</td>
                    <td>${this.formatCurrency(agent.saldo)}</td>
                    <td>${agent.callbackurl || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.editAgent(${agent.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteAgent(${agent.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `
                tbody.appendChild(row)
            })
        }
    }

    async openCreateAgentModal() {
        this.mode = 'create'
        document.getElementById('agentModalTitle').textContent = 'Novo Agente'
        document.getElementById('agentForm').reset()
        document.getElementById('agentId').value = ''
    }

    async editAgent(id) {
        // fetch agents and find the one by id
        const data = await this.apiRequest('/api/admin/agents')
        if (data && data.success) {
            const agent = data.data.find(a => a.id === id)
            if (!agent) return this.showAlert('Agente não encontrado', 'error')

            this.mode = 'edit'
            document.getElementById('agentModalTitle').textContent = `Editar Agente #${id}`
            document.getElementById('agentId').value = agent.id
            document.getElementById('agentCode').value = agent.agentCode || ''
            document.getElementById('agentToken').value = agent.agentToken || ''
            document.getElementById('secretKey').value = agent.secretKey || ''
            document.getElementById('saldo').value = agent.saldo || 0
            document.getElementById('callbackUrl').value = agent.callbackurl || ''

            document.getElementById('probganho').value = agent.probganho || ''
            document.getElementById('probbonus').value = agent.probbonus || ''
            document.getElementById('probganhortp').value = agent.probganhortp || ''
            document.getElementById('probganhoinfluencer').value = agent.probganhoinfluencer || ''
            document.getElementById('probbonusinfluencer').value = agent.probbonusinfluencer || ''
            document.getElementById('probganhoaposta').value = agent.probganhoaposta || ''
            document.getElementById('probganhosaldo').value = agent.probganhosaldo || ''

            const modal = new bootstrap.Modal(document.getElementById('agentModal'))
            modal.show()
        }
    }

    async saveAgent() {
        const agentData = {
            agentCode: document.getElementById('agentCode').value,
            agentToken: document.getElementById('agentToken').value,
            secretKey: document.getElementById('secretKey').value,
            saldo: parseFloat(document.getElementById('saldo').value || '0'),
            callbackurl: document.getElementById('callbackUrl').value,
            probganho: document.getElementById('probganho').value,
            probbonus: document.getElementById('probbonus').value,
            probganhortp: document.getElementById('probganhortp').value,
            probganhoinfluencer: document.getElementById('probganhoinfluencer').value,
            probbonusinfluencer: document.getElementById('probbonusinfluencer').value,
            probganhoaposta: document.getElementById('probganhoaposta').value,
            probganhosaldo: document.getElementById('probganhosaldo').value
        }

        if (this.mode === 'edit') {
            const id = document.getElementById('agentId').value
            const data = await this.apiRequest(`/api/admin/agents/${id}`, {
                method: 'PUT',
                body: JSON.stringify(agentData)
            })
            if (data && data.success) {
                this.showAlert('Agente atualizado com sucesso!', 'success')
                bootstrap.Modal.getInstance(document.getElementById('agentModal')).hide()
                this.loadAgents()
            } else {
                this.showAlert(data ? data.message : 'Erro ao atualizar agente', 'error')
            }
        } else {
            // create
            const data = await this.apiRequest('/api/admin/agents', {
                method: 'POST',
                body: JSON.stringify(agentData)
            })

            if (data && data.success) {
                this.showAlert('Agente criado com sucesso!', 'success')
                bootstrap.Modal.getInstance(document.getElementById('agentModal')).hide()
                document.getElementById('agentForm').reset()
                this.loadAgents()
            } else {
                this.showAlert(data ? data.message : 'Erro ao criar agente', 'error')
            }
        }
    }

    async deleteAgent(id) {
        if (confirm('Tem certeza que deseja excluir este agente?')) {
            const data = await this.apiRequest(`/api/admin/agents/${id}`, {
                method: 'DELETE'
            })

            if (data && data.success) {
                this.showAlert('Agente excluído com sucesso!', 'success')
                this.loadAgents()
            } else {
                this.showAlert(data ? data.message : 'Erro ao excluir agente', 'error')
            }
        }
    }

    async loadUsers(page = 1) {
        const data = await this.apiRequest(`/api/admin/users?page=${page}&limit=20`)
        
        if (data && data.success) {
            const tbody = document.querySelector('#usersTable tbody')
            tbody.innerHTML = ''
            
            data.data.users.forEach(user => {
                const row = document.createElement('tr')
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${this.formatCurrency(user.saldo)}</td>
                    <td>${this.formatCurrency(user.valorapostado)}</td>
                    <td>${this.formatCurrency(user.valorganho)}</td>
                    <td>${this.formatPercentage(user.rtp)}</td>
                    <td>${user.agentid}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.editUserBalance(${user.id}, ${user.saldo})">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="adminPanel.viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `
                tbody.appendChild(row)
            })

            // Update pagination
            this.updatePagination('usersPagination', data.data.pagination, page, (p) => this.loadUsers(p))
        }
    }

    async loadGames() {
        // This would load game statistics and configurations
        console.log('Loading games section...')
    }

    async loadReports() {
        // Load financial report
        const financialData = await this.apiRequest('/api/admin/reports/financial')
        if (financialData && financialData.success) {
            this.updateFinancialReport(financialData.data)
        }

        // Load game report
        const gameData = await this.apiRequest('/api/admin/reports/games')
        if (gameData && gameData.success) {
            this.updateGameReport(gameData.data)
        }
    }

    async viewUser(id) {
        const data = await this.apiRequest(`/api/admin/users/${id}`)
        if (data && data.success) {
            const u = data.data
            document.getElementById('u_hidden_id').value = u.id
            document.getElementById('u_id').textContent = u.id
            document.getElementById('u_username').textContent = u.username
            document.getElementById('u_saldo').textContent = this.formatCurrency(u.saldo)
            document.getElementById('u_valorapostado').textContent = this.formatCurrency(u.valorapostado)
            document.getElementById('u_valorganho').textContent = this.formatCurrency(u.valorganho)
            document.getElementById('u_rtp').textContent = this.formatPercentage(u.rtp)
            document.getElementById('u_new_balance').value = u.saldo

            const modal = new bootstrap.Modal(document.getElementById('userModal'))
            modal.show()
        }
    }

    async updateUserBalanceFromModal() {
        const id = document.getElementById('u_hidden_id').value
        const newBalance = parseFloat(document.getElementById('u_new_balance').value)
        if (isNaN(newBalance)) return this.showAlert('Saldo inválido', 'error')

        const data = await this.apiRequest(`/api/admin/users/${id}/balance`, {
            method: 'PUT',
            body: JSON.stringify({ balance: newBalance })
        })

        if (data && data.success) {
            this.showAlert('Saldo atualizado com sucesso!', 'success')
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide()
            this.loadUsers()
        } else {
            this.showAlert(data ? data.message : 'Erro ao atualizar saldo', 'error')
        }
    }

    async editUserBalance(userId, currentBalance) {
        const newBalance = prompt('Digite o novo saldo:', currentBalance)
        if (newBalance !== null && !isNaN(newBalance)) {
            const data = await this.apiRequest(`/api/admin/users/${userId}/balance`, {
                method: 'PUT',
                body: JSON.stringify({ balance: parseFloat(newBalance) })
            })

            if (data && data.success) {
                this.showAlert('Saldo atualizado com sucesso!', 'success')
                this.loadUsers()
            } else {
                this.showAlert(data ? data.message : 'Erro ao atualizar saldo', 'error')
            }
        }
    }

    updateRevenueChart(stats) {
        const ctx = document.getElementById('revenueChart').getContext('2d')
        
        if (this.charts.revenue) {
            this.charts.revenue.destroy()
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Receita',
                    data: [stats.totalWagered * 0.8, stats.totalWagered * 0.9, stats.totalWagered, stats.totalWagered * 1.1, stats.totalWagered * 1.2, stats.totalWagered],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1
                }, {
                    label: 'Pagamentos',
                    data: [stats.totalWon * 0.8, stats.totalWon * 0.9, stats.totalWon, stats.totalWon * 1.1, stats.totalWon * 1.2, stats.totalWon],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR')
                            }
                        }
                    }
                }
            }
        })
    }

    updateGamesChart() {
        const ctx = document.getElementById('gamesChart').getContext('2d')
        
        if (this.charts.games) {
            this.charts.games.destroy()
        }

        this.charts.games = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fortune Tiger', 'Fortune Dragon', 'Fortune Mouse', 'Outros'],
                datasets: [{
                    data: [45, 25, 15, 15],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        })
    }

    updateFinancialReport(data) {
        const container = document.getElementById('financialReport')
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <h6>Receita Total</h6>
                    <h4 class="text-success">${this.formatCurrency(data.totalRevenue)}</h4>
                </div>
                <div class="col-md-6 mb-3">
                    <h6>Total de Pagamentos</h6>
                    <h4 class="text-danger">${this.formatCurrency(data.totalPayouts)}</h4>
                </div>
                <div class="col-md-6 mb-3">
                    <h6>Lucro</h6>
                    <h4 class="text-primary">${this.formatCurrency(data.totalProfit)}</h4>
                </div>
                <div class="col-md-6 mb-3">
                    <h6>RTP Médio</h6>
                    <h4 class="text-warning">${this.formatPercentage(data.rtpAnalysis.averageRTP)}</h4>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-12">
                    <h6>Métricas de Usuários</h6>
                    <p>Total: <strong>${data.userMetrics.totalUsers}</strong></p>
                    <p>Ativos: <strong>${data.userMetrics.activeUsers}</strong></p>
                    <p>Aposta Média: <strong>${this.formatCurrency(data.userMetrics.avgBetPerUser)}</strong></p>
                </div>
            </div>
        `
    }

    updateGameReport(data) {
        const container = document.getElementById('gameReport')
        let html = '<div class="table-responsive"><table class="table table-sm">'
        html += '<thead><tr><th>Jogo</th><th>Calls</th><th>Total Premiado</th></tr></thead><tbody>'
        
        data.forEach(game => {
            html += `
                <tr>
                    <td>${game.gameName}</td>
                    <td>${game.totalCalls}</td>
                    <td>${this.formatCurrency(game.totalAwarded)}</td>
                </tr>
            `
        })
        
        html += '</tbody></table></div>'
        container.innerHTML = html
    }

    updatePagination(containerId, pagination, currentPage, callback) {
        const container = document.getElementById(containerId)
        let html = ''

        // Previous button
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="${callback.name}(${currentPage - 1}); return false;">Anterior</a>
                 </li>`

        // Page numbers
        for (let i = 1; i <= pagination.total; i++) {
            if (i === currentPage) {
                html += `<li class="page-item active"><span class="page-link">${i}</span></li>`
            } else if (i <= 5 || i > pagination.total - 5 || Math.abs(i - currentPage) <= 2) {
                html += `<li class="page-item"><a class="page-link" href="#" onclick="${callback.name}(${i}); return false;">${i}</a></li>`
            } else if (i === 6 && currentPage > 8) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`
            }
        }

        // Next button
        html += `<li class="page-item ${currentPage === pagination.total ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="${callback.name}(${currentPage + 1}); return false;">Próximo</a>
                 </li>`

        container.innerHTML = html
    }

    showAlert(message, type = 'info') {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info'
        
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `
        
        // Add to top of current content section
        const activeSection = document.querySelector('.content-section.active .container-fluid')
        if (activeSection) {
            activeSection.insertAdjacentHTML('afterbegin', alertHtml)
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                const alert = activeSection.querySelector('.alert')
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert)
                    bsAlert.close()
                }
            }, 5000)
        }
    }

    formatCurrency(value) {
        if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00'
        return 'R$ ' + parseFloat(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    formatPercentage(value) {
        if (isNaN(value) || value === null || value === undefined) return '0%'
        return parseFloat(value).toFixed(1) + '%'
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel()
})