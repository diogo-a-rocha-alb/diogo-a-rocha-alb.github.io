# SonarQube Metrics Dashboard 📊

An automated dashboard for visualizing SonarQube code quality metrics across multiple projects, built with **GitHub Pages** and **GitHub Actions only** (no Python dependencies required).

## 🌟 Features

- **Pure GitHub Actions**: No Python scripts needed - everything runs in the workflow
- **Real-time Metrics**: Automatically fetches and displays SonarQube metrics using curl and jq
- **Global Coverage**: Weighted global code coverage calculation across all projects
- **Interactive Charts**: Visual representation of coverage distribution and quality metrics
- **Project Details**: Sortable table with individual project metrics
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-refresh**: Dashboard updates every 5 minutes
- **Automated Updates**: GitHub Actions workflow runs daily at 7 AM UTC

## 📈 Metrics Displayed

- **Coverage Metrics**: Global coverage, average coverage, coverage distribution
- **Quality Metrics**: Bugs, vulnerabilities, code smells
- **Size Metrics**: Total lines of code, number of projects
- **Project Details**: Individual project breakdowns with visual coverage bars

## 🚀 Setup Instructions

### 1. Repository Secrets

Add the following secrets to your GitHub repository settings:

- `SONAR_HOST_URL`: Your SonarQube server URL (e.g., `https://sonarqube.company.com`)
- `SONAR_TOKEN`: Your SonarQube authentication token

### 2. GitHub Pages

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `main` or `master`
4. Select folder: `/ (root)`
5. Save

### 3. Enable Actions

The workflow will automatically run daily at **7 AM UTC**, or you can trigger it manually:

1. Go to Actions tab
2. Select "Update SonarQube Metrics Dashboard"
3. Click "Run workflow"

## 🔧 Configuration

### Update Frequency

Modify the cron schedule in `.github/workflows/update-metrics.yml`:

```yaml
schedule:
  - cron: '0 7 * * *'  # Daily at 7 AM UTC (current setting)
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 9,17 * * 1-5'  # Twice daily on weekdays
```

### Project Filtering

To filter projects by name, add a filter to the API call in the workflow:

```bash
# In the workflow file, modify the API call:
"$SONAR_URL/api/projects/search?p=$PAGE&ps=500&q=your-filter-here"
```

### SSL Certificate Issues

The workflow includes `--insecure` flag for curl commands to handle corporate SSL certificates. Remove this if not needed:

```yaml
# Remove --insecure from curl commands if SSL certificates are valid
curl -s -u "$SONAR_TOKEN:" "$SONAR_URL/api/projects/search"
```

## 📁 File Structure

```
├── .github/workflows/
│   └── update-metrics.yml    # GitHub Actions workflow (all logic here)
├── data/
│   └── latest-metrics.json   # Generated metrics data (auto-created)
├── index.html               # Dashboard frontend
└── README.md               # This file
```

## 🛠️ Local Development

### Testing the Dashboard Locally

1. Clone the repository
2. Create sample data:
   ```powershell
   # Windows PowerShell
   mkdir data -Force
   echo '{"timestamp":"2024-10-29T07:00:00Z","summary":{"total_projects":5,"global_coverage":75.5,"average_coverage":70.2,"total_vulnerabilities":3,"total_bugs":8,"total_code_smells":45,"total_lines_of_code":50000},"projects":[{"key":"test-project","coverage":85.2,"ncloc":12000,"bugs":2,"vulnerabilities":1,"code_smells":8}]}' > data/latest-metrics.json
   ```

3. Serve the dashboard:
   ```powershell
   # Using Python's built-in server
   python -m http.server 8000
   # Or using Node.js
   npx serve .
   ```

4. Open `http://localhost:8000` in your browser

### Manual Testing of SonarQube API

Test your SonarQube connection manually:

```powershell
# Windows PowerShell - replace with your values
$sonarUrl = "https://your-sonarqube-server.com"
$sonarToken = "your-token-here"

# Test projects endpoint
curl -u "$sonarToken:" "$sonarUrl/api/projects/search" --insecure

# Test specific project metrics
curl -u "$sonarToken:" "$sonarUrl/api/measures/component?component=PROJECT_KEY&metricKeys=coverage,bugs" --insecure
```

## 📊 Dashboard Components

### Summary Cards
- **Total Projects**: Number of projects analyzed
- **Global Coverage**: Weighted coverage across all projects  
- **Average Coverage**: Simple average of project coverages
- **Total Issues**: Bugs, vulnerabilities, and code smells

### Charts
- **Coverage Distribution**: Pie chart showing coverage ranges
- **Quality Overview**: Bar chart of projects with most issues

### Project Table
- Sortable table with all project details
- Visual coverage bars with color coding:
  - 🟢 Excellent (80%+)
  - 🟡 Good (60-79%)
  - 🟠 Fair (40-59%)
  - 🔴 Poor (20-39%)
  - ⚫ Critical (<20%)

## ⚙️ How It Works

The GitHub Actions workflow:

1. **Fetches Projects**: Uses curl to call SonarQube's `/api/projects/search` with pagination
2. **Processes Each Project**: For each project, calls `/api/measures/component` to get metrics
3. **Calculates Summaries**: Uses `jq` and `bc` to compute global coverage and totals
4. **Generates JSON**: Creates the dashboard data file with all metrics
5. **Commits Changes**: Automatically commits the updated data to the repository
6. **Serves Dashboard**: GitHub Pages serves the HTML dashboard that reads the JSON data

## 🔍 Troubleshooting

### No Data Showing
1. Check GitHub Actions logs for errors in the "Actions" tab
2. Verify repository secrets are set correctly
3. Ensure SonarQube server is accessible from GitHub runners
4. Check that `data/latest-metrics.json` exists and has valid JSON

### API Connection Errors
1. Verify SonarQube token has read permissions
2. Check SonarQube server URL format (include `https://`)
3. Test the connection manually using curl
4. For SSL issues, ensure `--insecure` flag is present in curl commands

### Workflow Failures
1. Check if `jq` and `bc` are available (they should be pre-installed on ubuntu-latest)
2. Verify the JSON structure being generated
3. Check for network connectivity issues
4. Ensure repository has Actions enabled

### Permission Errors
1. Ensure the repository has Actions enabled
2. Check that the GITHUB_TOKEN has write permissions
3. Verify the repository is public (for GitHub Pages) or has Pro/Team plan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Modify the workflow file for new features
4. Test locally with sample data
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review GitHub Actions logs in the "Actions" tab
3. Test SonarQube connectivity manually
4. Create an issue in this repository

---

**Dashboard URL**: https://diogo-a-rocha-alb.github.io

*Last updated: Generated automatically by GitHub Actions at 7 AM UTC daily*
Repositorio de frontend de github page para disponibilizar metricas globais do sonarQube dos 110 repositorios da alticelabs
