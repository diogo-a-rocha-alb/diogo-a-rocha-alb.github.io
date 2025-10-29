// Global variables
let chartsInitialized = false;
let coverageChart, qualityChart;

// Configuration from Jekyll
const config = window.dashboardConfig || {
    refreshInterval: 300000,
    colors: {
        excellent: '#4CAF50',
        good: '#8BC34A',
        fair: '#FFC107',
        poor: '#FF9800',
        critical: '#F44336',
        noData: '#9E9E9E'
    },
    baseUrl: ''
};

/**
 * Format numbers with K/M suffixes
 */
function formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

/**
 * Format percentages with one decimal place
 */
function formatPercentage(num) {
    if (num === null || num === undefined) return 'N/A';
    return num.toFixed(1) + '%';
}

/**
 * Get CSS class for coverage color coding
 */
function getCoverageClass(coverage) {
    if (coverage === null || coverage === undefined) return '';
    if (coverage >= 80) return 'coverage-excellent';
    if (coverage >= 60) return 'coverage-good';
    if (coverage >= 40) return 'coverage-fair';
    if (coverage >= 20) return 'coverage-poor';
    return 'coverage-bad';
}

/**
 * Create HTML for coverage bar visualization
 */
function createCoverageBar(coverage) {
    if (coverage === null || coverage === undefined) {
        return '<span class="coverage-bar"><div class="coverage-fill" style="width: 0%"></div></span>N/A';
    }
    
    const fillClass = getCoverageClass(coverage);
    return `<span class="coverage-bar"><div class="coverage-fill ${fillClass}" style="width: ${coverage}%"></div></span>${coverage.toFixed(1)}%`;
}

/**
 * Initialize charts using Chart.js
 */
function initializeCharts(data) {
    if (chartsInitialized) return;

    const projects = data.projects || [];
    
    // Coverage Distribution Chart
    const coverageRanges = {
        'Excellent (80%+)': 0,
        'Good (60-79%)': 0,
        'Fair (40-59%)': 0,
        'Poor (20-39%)': 0,
        'Critical (<20%)': 0,
        'No Data': 0
    };

    projects.forEach(project => {
        const coverage = project.coverage;
        if (coverage === null || coverage === undefined) {
            coverageRanges['No Data']++;
        } else if (coverage >= 80) {
            coverageRanges['Excellent (80%+)']++;
        } else if (coverage >= 60) {
            coverageRanges['Good (60-79%)']++;
        } else if (coverage >= 40) {
            coverageRanges['Fair (40-59%)']++;
        } else if (coverage >= 20) {
            coverageRanges['Poor (20-39%)']++;
        } else {
            coverageRanges['Critical (<20%)']++;
        }
    });

    const ctx1 = document.getElementById('coverageChart').getContext('2d');
    coverageChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: Object.keys(coverageRanges),
            datasets: [{
                data: Object.values(coverageRanges),
                backgroundColor: [
                    config.colors.excellent,
                    config.colors.good,
                    config.colors.fair,
                    config.colors.poor,
                    config.colors.critical,
                    config.colors.noData
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Quality Overview Chart (Top 10 projects by issues)
    const projectsWithIssues = projects
        .map(p => ({
            key: p.key,
            totalIssues: (p.bugs || 0) + (p.vulnerabilities || 0) + (p.code_smells || 0)
        }))
        .sort((a, b) => b.totalIssues - a.totalIssues)
        .slice(0, 10);

    const ctx2 = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: projectsWithIssues.map(p => p.key.length > 20 ? p.key.substring(0, 20) + '...' : p.key),
            datasets: [{
                label: 'Total Issues',
                data: projectsWithIssues.map(p => p.totalIssues),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 10 Projects by Total Issues'
                }
            }
        }
    });

    chartsInitialized = true;
}

/**
 * Populate the projects table with data
 */
function populateTable(projects) {
    const tbody = document.getElementById('projects-tbody');
    tbody.innerHTML = '';

    // Sort projects by coverage (descending, null values last)
    const sortedProjects = [...projects].sort((a, b) => {
        if (a.coverage === null && b.coverage === null) return 0;
        if (a.coverage === null) return 1;
        if (b.coverage === null) return -1;
        return b.coverage - a.coverage;
    });

    sortedProjects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${project.key}</strong></td>
            <td>${createCoverageBar(project.coverage)}</td>
            <td>${formatNumber(project.ncloc)}</td>
            <td>${project.bugs || 0}</td>
            <td>${project.vulnerabilities || 0}</td>
            <td>${project.code_smells || 0}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update the entire dashboard with new data
 */
function updateDashboard(data) {
    const summary = data.summary || {};
    
    // Update summary metrics
    document.getElementById('total-projects').textContent = summary.total_projects || 0;
    document.getElementById('global-coverage').textContent = formatPercentage(summary.global_coverage);
    document.getElementById('average-coverage').textContent = formatPercentage(summary.average_coverage);
    document.getElementById('total-vulnerabilities').textContent = formatNumber(summary.total_vulnerabilities);
    document.getElementById('total-bugs').textContent = formatNumber(summary.total_bugs);
    document.getElementById('total-code-smells').textContent = formatNumber(summary.total_code_smells);
    
    // Update timestamp
    const timestamp = new Date(data.timestamp).toLocaleString();
    document.getElementById('last-updated').textContent = timestamp;
    
    // Initialize charts
    initializeCharts(data);
    
    // Populate project table
    populateTable(data.projects || []);
    
    // Show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

/**
 * Show error message to user
 */
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').style.display = 'block';
}

/**
 * Load metrics data from JSON file
 */
async function loadData() {
    try {
        const response = await fetch(`${config.baseUrl}/data/latest-metrics.json`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Failed to load metrics:', error);
        showError(`Failed to load metrics data: ${error.message}`);
    }
}

/**
 * Initialize dashboard when DOM is ready
 */
function initializeDashboard() {
    // Load initial data
    loadData();
    
    // Set up auto-refresh using Jekyll config
    setInterval(loadData, config.refreshInterval);
    
    console.log('🚀 SonarQube Metrics Dashboard initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);