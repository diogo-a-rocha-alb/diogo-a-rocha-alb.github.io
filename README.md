
# SonarQube Metrics Dashboard 📊

> **Nota:** O workflow automático de atualização de métricas está temporariamente desativado devido a problemas de autenticação no SonarQube. Os dados apresentados no dashboard são estáticos e atualizados manualmente. Para atualizar as métricas, gere o ficheiro `latest-metrics.json` localmente e faça upload para a pasta `data/` deste repositório.

Dashboard para visualização de métricas de qualidade de código do SonarQube em múltiplos projetos, construído com **GitHub Pages**. A atualização automática via **GitHub Actions** está em stand-by temporariamente.


## 🌟 Features

- **Atualização Manual Temporária**: Os dados são atualizados manualmente enquanto o workflow está desativado
- **Visualização de Métricas**: Cobertura global, bugs, vulnerabilidades, code smells, linhas de código e mais
- **Gráficos Interativos**: Visualização de distribuição de cobertura e qualidade
- **Detalhes por Projeto**: Tabela ordenável com métricas individuais
- **Design Responsivo**: Funciona em desktop e mobile

## 📈 Metrics Displayed

- **Coverage Metrics**: Global coverage, average coverage, coverage distribution
- **Quality Metrics**: Bugs, vulnerabilities, code smells
- **Size Metrics**: Total lines of code, number of projects
- **Project Details**: Individual project breakdowns with visual coverage bars


## 🚀 Como atualizar os dados manualmente

1. Gere o ficheiro `latest-metrics.json` localmente (por exemplo, usando um script Python para converter os dados exportados do SonarQube)
2. Faça upload/substitua o ficheiro em `data/latest-metrics.json` neste repositório
3. Faça commit e push para o branch principal
4. O dashboard será atualizado automaticamente com os novos dados

> Quando o problema de autenticação for resolvido, o workflow automático poderá ser reativado renomeando o ficheiro `.github/workflows.disabled/update-metrics.yml.disabled` para `.github/workflows/update-metrics.yml`.


## 🔧 Configuração (workflow desativado)

O workflow automático de atualização (`update-metrics.yml`) está desativado (ficheiro renomeado e movido para `.github/workflows.disabled/`).
Quando reativado, siga as instruções antigas para configurar secrets e agendamento.

## 📁 File Structure

```
├── .github/workflows/
│   └── workflows.disabled/update-metrics.yml.disabled    # Workflow desativado temporariamente
├── data/
│   └── latest-metrics.json   # Dados de métricas (atualizado manualmente)
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

*Last updated: Dados atualizados manualmente devido a problemas temporários de autenticação no SonarQube. Workflow automático desativado.*
Repositorio de frontend de github page para disponibilizar metricas globais do sonarQube dos 110 repositorios da alticelabs
