#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Génère un rapport de coverage consolidé au format Markdown
 * Lit les données de coverage de tous les services et génère un rapport unique
 */

const services = [
  { name: 'GPT API', path: 'gpt-api/coverage/lcov.info' },
  { name: 'GPT Gateway', path: 'gpt-gateway/coverage/lcov.info' },
  { name: 'GPT Kafka Consumer', path: 'gpt-kafka-consumer/coverage/lcov.info' },
  { name: 'GPT Kafka Producer', path: 'gpt-kafka-producer/coverage/lcov.info' },
  { name: 'GPT UI', path: 'gpt-ui/coverage/lcov.info' }
];

const rootDir = path.join(__dirname, '..');

// Fonction pour parser le fichier coverage-final.json
function parseCoverageJson(filePath) {
  const fullPath = path.join(rootDir, filePath);
  try {
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const data = fs.readFileSync(fullPath, 'utf8');
    const coverage = JSON.parse(data);
    
    let linesFound = 0, linesHit = 0;
    let functionsFound = 0, functionsHit = 0;
    let branchesFound = 0, branchesHit = 0;
    let statementsFound = 0, statementsHit = 0;
    
    Object.values(coverage).forEach(file => {
      // Statements
      if (file.s) {
        Object.values(file.s).forEach(count => {
          statementsFound++;
          if (count > 0) statementsHit++;
        });
      }
      
      // Branches
      if (file.b) {
        Object.values(file.b).forEach(branches => {
          branches.forEach(count => {
            branchesFound++;
            if (count > 0) branchesHit++;
          });
        });
      }
      
      // Functions
      if (file.f) {
        Object.values(file.f).forEach(count => {
          functionsFound++;
          if (count > 0) functionsHit++;
        });
      }
      
      // Lines (from statementMap)
      if (file.statementMap) {
        linesFound += Object.keys(file.statementMap).length;
        if (file.s) {
          Object.values(file.s).forEach(count => {
            if (count > 0) linesHit++;
          });
        }
      }
    });
    
    return {
      lines: { found: linesFound || statementsFound, hit: linesHit || statementsHit },
      functions: { found: functionsFound, hit: functionsHit },
      branches: { found: branchesFound, hit: branchesHit }
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour parser le fichier LCOV
function parseLcovFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  try {
    if (!fs.existsSync(fullPath)) {
      // Fallback to coverage-final.json if lcov.info doesn't exist
      const jsonPath = filePath.replace('lcov.info', 'coverage-final.json');
      return parseCoverageJson(jsonPath);
    }
    
    const data = fs.readFileSync(fullPath, 'utf8');
    const lines = data.split('\n');
    
    let linesFound = 0, linesHit = 0;
    let functionsFound = 0, functionsHit = 0;
    let branchesFound = 0, branchesHit = 0;
    
    lines.forEach(line => {
      if (line.startsWith('LF:')) linesFound += parseInt(line.split(':')[1]) || 0;
      if (line.startsWith('LH:')) linesHit += parseInt(line.split(':')[1]) || 0;
      if (line.startsWith('FNF:')) functionsFound += parseInt(line.split(':')[1]) || 0;
      if (line.startsWith('FNH:')) functionsHit += parseInt(line.split(':')[1]) || 0;
      if (line.startsWith('BRF:')) branchesFound += parseInt(line.split(':')[1]) || 0;
      if (line.startsWith('BRH:')) branchesHit += parseInt(line.split(':')[1]) || 0;
    });
    
    return {
      lines: { found: linesFound, hit: linesHit },
      functions: { found: functionsFound, hit: functionsHit },
      branches: { found: branchesFound, hit: branchesHit }
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour extraire les métriques globales
function extractGlobalMetrics(coverageData) {
  if (!coverageData) {
    return null;
  }
  
  const calcPct = (hit, found) => found > 0 ? (hit / found) * 100 : 0;
  
  return {
    statements: calcPct(coverageData.lines.hit, coverageData.lines.found),
    branches: calcPct(coverageData.branches.hit, coverageData.branches.found),
    functions: calcPct(coverageData.functions.hit, coverageData.functions.found),
    lines: calcPct(coverageData.lines.hit, coverageData.lines.found)
  };
}

// Fonction pour obtenir le badge de couleur selon le pourcentage
function getCoverageBadge(percentage) {
  if (percentage >= 80) return '🟢';
  if (percentage >= 60) return '🟡';
  if (percentage >= 40) return '🟠';
  return '🔴';
}

// Fonction pour générer le rapport Markdown
function generateMarkdownReport() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const timeStr = now.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  let markdown = `# 📊 Rapport de Coverage - GPT Shoshizan\n\n`;
  markdown += `**Date:** ${dateStr} à ${timeStr}\n\n`;
  markdown += `---\n\n`;
  
  let totalStatements = 0;
  let totalBranches = 0;
  let totalFunctions = 0;
  let totalLines = 0;
  let serviceCount = 0;
  
  markdown += `## 📈 Coverage par Service\n\n`;
  
  services.forEach(service => {
    const coverageData = parseLcovFile(service.path);
    const metrics = extractGlobalMetrics(coverageData);
    
    if (metrics) {
      markdown += `### ${getCoverageBadge(metrics.lines)} ${service.name}\n\n`;
      markdown += `| Métrique | Coverage | Badge |\n`;
      markdown += `|----------|----------|-------|\n`;
      markdown += `| **Statements** | ${metrics.statements.toFixed(2)}% | ${getCoverageBadge(metrics.statements)} |\n`;
      markdown += `| **Branches** | ${metrics.branches.toFixed(2)}% | ${getCoverageBadge(metrics.branches)} |\n`;
      markdown += `| **Functions** | ${metrics.functions.toFixed(2)}% | ${getCoverageBadge(metrics.functions)} |\n`;
      markdown += `| **Lines** | ${metrics.lines.toFixed(2)}% | ${getCoverageBadge(metrics.lines)} |\n\n`;
      
      totalStatements += metrics.statements;
      totalBranches += metrics.branches;
      totalFunctions += metrics.functions;
      totalLines += metrics.lines;
      serviceCount++;
    } else {
      markdown += `### ⚠️ ${service.name}\n\n`;
      markdown += `*Données de coverage non disponibles*\n\n`;
    }
  });
  
  // Calcul des moyennes
  if (serviceCount > 0) {
    const avgStatements = totalStatements / serviceCount;
    const avgBranches = totalBranches / serviceCount;
    const avgFunctions = totalFunctions / serviceCount;
    const avgLines = totalLines / serviceCount;
    
    markdown += `---\n\n`;
    markdown += `## 🎯 Coverage Moyen Global\n\n`;
    markdown += `| Métrique | Coverage Moyen | Badge |\n`;
    markdown += `|----------|----------------|-------|\n`;
    markdown += `| **Statements** | ${avgStatements.toFixed(2)}% | ${getCoverageBadge(avgStatements)} |\n`;
    markdown += `| **Branches** | ${avgBranches.toFixed(2)}% | ${getCoverageBadge(avgBranches)} |\n`;
    markdown += `| **Functions** | ${avgFunctions.toFixed(2)}% | ${getCoverageBadge(avgFunctions)} |\n`;
    markdown += `| **Lines** | ${avgLines.toFixed(2)}% | ${getCoverageBadge(avgLines)} |\n\n`;
  }
  
  markdown += `---\n\n`;
  markdown += `## 📁 Rapports HTML Détaillés\n\n`;
  markdown += `Les rapports HTML complets sont disponibles dans:\n\n`;
  markdown += `- **Backend (Jest):**\n`;
  markdown += `  - API: \`gpt-api/coverage/lcov-report/index.html\`\n`;
  markdown += `  - Gateway: \`gpt-gateway/coverage/lcov-report/index.html\`\n`;
  markdown += `  - Kafka Consumer: \`gpt-kafka-consumer/coverage/lcov-report/index.html\`\n`;
  markdown += `  - Kafka Producer: \`gpt-kafka-producer/coverage/lcov-report/index.html\`\n\n`;
  markdown += `- **Frontend (Vitest):**\n`;
  markdown += `  - UI: \`gpt-ui/coverage/index.html\`\n\n`;
  
  markdown += `---\n\n`;
  markdown += `## 📝 Légende des Badges\n\n`;
  markdown += `- 🟢 **Excellent** (≥80%)\n`;
  markdown += `- 🟡 **Bon** (60-79%)\n`;
  markdown += `- 🟠 **Moyen** (40-59%)\n`;
  markdown += `- 🔴 **Faible** (<40%)\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Rapport généré automatiquement par \`npm run test:cov:all:report\`*\n`;
  
  return { markdown, timestamp };
}

// Génération et sauvegarde du rapport
try {
  const { markdown, timestamp } = generateMarkdownReport();
  const filename = `COVERAGE_REPORT_${timestamp}.md`;
  const filepath = path.join(rootDir, filename);
  
  fs.writeFileSync(filepath, markdown, 'utf8');
  
  console.log('\n✅ Rapport de coverage généré avec succès!');
  console.log(`📄 Fichier: ${filename}`);
  console.log(`📍 Chemin: ${filepath}\n`);
  
  // Créer également un lien symbolique vers le dernier rapport
  const latestPath = path.join(rootDir, 'COVERAGE_REPORT_LATEST.md');
  if (fs.existsSync(latestPath)) {
    fs.unlinkSync(latestPath);
  }
  fs.writeFileSync(latestPath, markdown, 'utf8');
  console.log(`📌 Lien vers le dernier rapport: COVERAGE_REPORT_LATEST.md\n`);
  
} catch (error) {
  console.error('❌ Erreur lors de la génération du rapport:', error.message);
  process.exit(1);
}
