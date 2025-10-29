// Global variables
let chartsInitialized = false;
let coverageBarChart, vulnerabilitiesBarChart;

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
 * Initialize ApexCharts bar charts for coverage and vulnerabilities
 */
function initializeCharts(data) {
    if (chartsInitialized) return;

    const projects = data.projects || [];
    const projectNames = projects.map(p => p.key);
    const coverageData = projects.map(p => p.coverage !== null && p.coverage !== undefined ? p.coverage : 0);
    const vulnerabilitiesData = projects.map(p => p.vulnerabilities !== null && p.vulnerabilities !== undefined ? p.vulnerabilities : 0);

    // Coverage Bar Chart
    var coverageOptions = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false }
        },
        series: [{
            name: 'Coverage (%)',
            data: coverageData
        }],
        xaxis: {
            categories: projectNames,
            labels: { rotate: -45 }
        },
        colors: ['#8456ea'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '50%'
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) { return val ? val.toFixed(1) + '%' : 'N/A'; }
        },
        yaxis: {
            min: 0,
            max: 100,
            title: { text: 'Coverage (%)' }
        },
        grid: { borderColor: '#f3f1f7' },
        background: '#faf9fc',
        tooltip: { y: { formatter: val => val + '%' } }
    };
    coverageBarChart = new ApexCharts(document.querySelector("#coverage-bar-chart"), coverageOptions);
    coverageBarChart.render();

    // Vulnerabilities Bar Chart
    var vulnerabilitiesOptions = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false }
        },
        series: [{
            name: 'Vulnerabilities',
            data: vulnerabilitiesData
        }],
        xaxis: {
            categories: projectNames,
            labels: { rotate: -45 }
        },
        colors: ['#f44336'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '50%'
            }
        },
        dataLabels: {
            enabled: true
        },
        yaxis: {
            min: 0,
            title: { text: 'Vulnerabilities' }
        },
        grid: { borderColor: '#f3f1f7' },
        background: '#faf9fc',
        tooltip: { y: { formatter: val => val } }
    };
    vulnerabilitiesBarChart = new ApexCharts(document.querySelector("#vulnerabilities-bar-chart"), vulnerabilitiesOptions);
    vulnerabilitiesBarChart.render();

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
        const response = await fetch('data/latest-metrics.json');
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
    
    // Set up auto-refresh every 5 minutes
    setInterval(loadData, 5 * 60 * 1000);
    
    console.log('🚀 SonarQube Metrics Dashboard initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);