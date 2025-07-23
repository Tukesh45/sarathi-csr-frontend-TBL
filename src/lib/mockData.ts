// Mock Users
export const mockUsers = [
  {
    id: '1',
    email: 'admin@csr.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'client@csr.com',
    role: 'client',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'ngo@csr.com',
    role: 'ngo',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Projects
export const mockProjects = [
  {
    id: '1',
    title: 'Education for All',
    description: 'Providing quality education to underprivileged children',
    goal: 'Educate 1000 children',
    area: 'Education',
    measurement_unit: 'Students',
    admin_id: '1',
    ngo_id: '3',
    client_id: '2',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Clean Water Initiative',
    description: 'Installing water purification systems in rural areas',
    goal: 'Provide clean water to 500 families',
    area: 'Health & Sanitation',
    measurement_unit: 'Families',
    admin_id: '1',
    ngo_id: '3',
    client_id: '2',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Women Empowerment',
    description: 'Skill development and entrepreneurship training for women',
    goal: 'Train 200 women',
    area: 'Women Empowerment',
    measurement_unit: 'Women',
    admin_id: '1',
    ngo_id: '3',
    client_id: '2',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Budgets
export const mockBudgets = [
  {
    id: '1',
    project_id: '1',
    ngo_id: '3',
    quarter: 'Q1',
    allocated_amount: 50000,
    spent_amount: 35000,
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    ngo_id: '3',
    quarter: 'Q2',
    allocated_amount: 60000,
    spent_amount: 45000,
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    project_id: '2',
    ngo_id: '3',
    quarter: 'Q1',
    allocated_amount: 75000,
    spent_amount: 60000,
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Questionnaires
export const mockQuestionnaires = [
  {
    id: '1',
    project_id: '1',
    ngo_id: '3',
    quarter: 'Q1',
    year: 2024,
    responses: {
      students_enrolled: 250,
      teachers_trained: 15,
      infrastructure_improved: true,
      challenges: 'Limited classroom space',
      next_quarter_plan: 'Expand to 2 more schools'
    },
    status: 'submitted',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    ngo_id: '3',
    quarter: 'Q2',
    year: 2024,
    responses: {
      students_enrolled: 300,
      teachers_trained: 20,
      infrastructure_improved: true,
      challenges: 'Transportation for remote students',
      next_quarter_plan: 'Implement mobile learning units'
    },
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock File Uploads
export const mockFileUploads = [
  {
    id: '1',
    project_id: '1',
    ngo_id: '3',
    file_type: 'proposal',
    file_name: 'Education_Proposal_Q1.pdf',
    file_url: '/files/education_proposal_q1.pdf',
    file_size: 2048576,
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    ngo_id: '3',
    file_type: 'receipt',
    file_name: 'School_Supplies_Receipt.jpg',
    file_url: '/files/school_supplies_receipt.jpg',
    file_size: 512000,
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    project_id: '1',
    ngo_id: '3',
    file_type: 'photo',
    file_name: 'Students_Learning.jpg',
    file_url: '/files/students_learning.jpg',
    file_size: 1024000,
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Activity Logs
export const mockActivityLogs = [
  {
    id: '1',
    user_id: '3',
    action: 'created',
    table_name: 'questionnaires',
    record_id: '1',
    old_values: {},
    new_values: { project_id: '1', quarter: 'Q1' },
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: '3',
    action: 'updated',
    table_name: 'budgets',
    record_id: '1',
    old_values: { spent_amount: 30000 },
    new_values: { spent_amount: 35000 },
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    user_id: '1',
    action: 'created',
    table_name: 'projects',
    record_id: '2',
    old_values: {},
    new_values: { title: 'Clean Water Initiative' },
    created_at: '2024-02-01T00:00:00Z'
  }
];

// Mock Progress Data
export const mockProgress = [
  {
    id: '1',
    project_id: '1',
    ngo_id: '3',
    kpi_name: 'Students Enrolled',
    target_value: 1000,
    current_value: 320,
    unit: 'students',
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    ngo_id: '3',
    kpi_name: 'Teachers Trained',
    target_value: 50,
    current_value: 15,
    unit: 'teachers',
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    project_id: '2',
    ngo_id: '3',
    kpi_name: 'Families Served',
    target_value: 500,
    current_value: 180,
    unit: 'families',
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    project_id: '3',
    ngo_id: '3',
    kpi_name: 'Women Trained',
    target_value: 200,
    current_value: 200,
    unit: 'women',
    quarter: 'Q1',
    year: 2024,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Add subscribers for real-time updates
let subscribers: (() => void)[] = [];

// Mock Data Service
export class MockDataService {
  // Users
  static getUsers() {
    return mockUsers
  }

  static getUserById(id: string) {
    return mockUsers.find(user => user.id === id)
  }

  // Projects
  static getProjects() {
    return mockProjects
  }

  static getProjectsByRole(role: string, userId: string) {
    switch (role) {
      case 'admin':
        return mockProjects.filter(p => p.admin_id === userId)
      case 'client':
        return mockProjects.filter(p => p.client_id === userId)
      case 'ngo':
        return mockProjects.filter(p => p.ngo_id === userId)
      default:
        return []
    }
  }

  static getProjectById(id: string) {
    return mockProjects.find(project => project.id === id)
  }

  // Budgets
  static getBudgets() {
    return mockBudgets
  }

  static getBudgetsByProject(projectId: string) {
    return mockBudgets.filter(budget => budget.project_id === projectId)
  }

  static getBudgetsByNGO(ngoId: string) {
    return mockBudgets.filter(budget => budget.ngo_id === ngoId)
  }

  // Questionnaires
  static getQuestionnaires() {
    return mockQuestionnaires
  }

  static getQuestionnairesByProject(projectId: string) {
    return mockQuestionnaires.filter(q => q.project_id === projectId)
  }

  static getQuestionnairesByNGO(ngoId: string) {
    return mockQuestionnaires.filter(q => q.ngo_id === ngoId)
  }

  // File Uploads
  static getFileUploads() {
    return mockFileUploads
  }

  static getFileUploadsByProject(projectId: string) {
    return mockFileUploads.filter(f => f.project_id === projectId)
  }

  static getFileUploadsByNGO(ngoId: string) {
    return mockFileUploads.filter(f => f.ngo_id === ngoId)
  }

  // Activity Logs
  static getActivityLogs() {
    return mockActivityLogs
  }

  static getActivityLogsByUser(userId: string) {
    return mockActivityLogs.filter(log => log.user_id === userId)
  }

  static getProgress() {
    return mockProgress
  }

  static getProgressByProject(projectId: string) {
    return mockProgress.filter(progress => progress.project_id === projectId)
  }

  static getProgressByNGO(ngoId: string) {
    return mockProgress.filter(progress => progress.ngo_id === ngoId)
  }

  static updateProgress(progressId: string, newValue: number) {
    const progress = mockProgress.find(p => p.id === progressId);
    if (progress) {
      progress.current_value = newValue;
      progress.updated_at = new Date().toISOString();
      subscribers.forEach(cb => cb());
    }
  }

  static subscribe(cb: () => void) {
    subscribers.push(cb);
    return () => {
      subscribers = subscribers.filter(sub => sub !== cb);
    };
  }

  // Analytics
  static getAnalytics() {
    const totalProjects = mockProjects.length
    const activeProjects = mockProjects.filter(p => p.status === 'active').length
    const totalBudget = mockBudgets.reduce((sum, b) => sum + b.allocated_amount, 0)
    const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent_amount, 0)
    const totalFiles = mockFileUploads.length

    return {
      totalProjects,
      activeProjects,
      totalBudget,
      totalSpent,
      totalFiles,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    }
  }
} 