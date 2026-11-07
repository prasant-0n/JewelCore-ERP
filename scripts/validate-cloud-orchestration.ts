import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

async function validateFileExists(filePath: string, desc: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    console.log(`  ✓ Found ${desc}: ${path.basename(filePath)} (${content.length} bytes)`);
    return content;
  } catch (err) {
    throw new Error(`Missing required file ${desc} at ${filePath}: ${err}`);
  }
}

async function validateYaml(filePath: string, desc: string): Promise<any> {
  const content = await validateFileExists(filePath, desc);
  try {
    const parsed = YAML.parse(content);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("YAML parsed to non-object");
    }
    console.log(`  ✓ Valid YAML structure in ${path.basename(filePath)}`);
    return parsed;
  } catch (err) {
    throw new Error(`Invalid YAML in ${filePath}: ${err}`);
  }
}

async function validateHelmTemplate(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, "utf8");
  const fileName = path.basename(filePath);

  // Validate balanced brackets {{ ... }}
  const openCount = (content.match(/\{\{/g) || []).length;
  const closeCount = (content.match(/\}\}/g) || []).length;
  if (openCount !== closeCount) {
    throw new Error(`Unbalanced Helm template brackets in ${fileName}: ${openCount} open vs ${closeCount} close`);
  }

  // Validate presence of Kubernetes Kind
  if (!content.includes("kind:") && !fileName.startsWith("_")) {
    throw new Error(`Helm template ${fileName} lacks a Kubernetes 'kind' definition`);
  }

  console.log(`  ✓ Valid Helm template syntax: ${fileName} (${openCount} template interpolation blocks)`);
}

async function main() {
  console.log("==================================================================");
  console.log(" JEWELCORE ENTERPRISE CLOUD ORCHESTRATION & HELM VALIDATION SUITE ");
  console.log("==================================================================");

  const rootDir = process.cwd();

  // 1. Validate Chart.yaml and Values files
  console.log("\n[1/5] Validating Helm Chart Package Metadata & Values Profiles...");
  const chartYaml = await validateYaml(path.join(rootDir, "charts/jewelcore/Chart.yaml"), "Chart.yaml");
  if (chartYaml.name !== "jewelcore" || chartYaml.apiVersion !== "v2") {
    throw new Error("Invalid Chart.yaml metadata");
  }

  const valuesProd = await validateYaml(path.join(rootDir, "charts/jewelcore/values.yaml"), "Base values.yaml");
  const valuesDev = await validateYaml(path.join(rootDir, "charts/jewelcore/values.dev.yaml"), "Development values.dev.yaml");
  const valuesStaging = await validateYaml(path.join(rootDir, "charts/jewelcore/values.staging.yaml"), "Staging values.staging.yaml");
  const valuesProdHa = await validateYaml(path.join(rootDir, "charts/jewelcore/values.prod.yaml"), "Production values.prod.yaml");

  if (!valuesProd.postgresql || !valuesProd.api || !valuesProd.web || !valuesProd.backup) {
    throw new Error("Base values.yaml missing required component configurations");
  }

  // 2. Validate Helm Templates
  console.log("\n[2/5] Validating Helm Templates in charts/jewelcore/templates/...");
  const templateDir = path.join(rootDir, "charts/jewelcore/templates");
  const templateFiles = await fs.readdir(templateDir);
  for (const file of templateFiles) {
    if (file.endsWith(".yaml") || file.endsWith(".tpl")) {
      await validateHelmTemplate(path.join(templateDir, file));
    }
  }

  // 3. Validate Disaster Recovery Manifests & PITR Script
  console.log("\n[3/5] Validating Disaster Recovery & PITR Automation...");
  await validateYaml(path.join(rootDir, "k8s/disaster-recovery/backup-cronjob.yaml"), "Disaster Recovery Backup CronJob");
  const restoreScript = await validateFileExists(path.join(rootDir, "k8s/disaster-recovery/restore-pitr.sh"), "PITR Restore Tool");
  if (!restoreScript.includes("openssl enc -d -aes-256-cbc") || !restoreScript.includes("pg_restore")) {
    throw new Error("PITR restore script missing required OpenSSL decryption or pg_restore logic");
  }

  // 4. Validate Monitoring & Alertmanager Rules
  console.log("\n[4/5] Validating Prometheus Alertmanager Rules & Routing...");
  const alertRules = await validateYaml(path.join(rootDir, "k8s/monitoring/alertmanager-rules.yaml"), "Alertmanager Rules");
  if (!alertRules.spec?.groups?.[0]?.rules || alertRules.spec.groups[0].rules.length < 4) {
    throw new Error("Alertmanager rules missing expected alert definitions");
  }

  const alertConfig = await validateYaml(path.join(rootDir, "k8s/monitoring/alertmanager-config.yaml"), "Alertmanager Routing Config");
  if (!alertConfig.receivers || !alertConfig.route) {
    throw new Error("Alertmanager config missing route or receivers");
  }

  // 5. Validate Terraform Infrastructure as Code
  console.log("\n[5/5] Validating Terraform Multi-AZ Infrastructure as Code...");
  const mainTf = await validateFileExists(path.join(rootDir, "terraform/main.tf"), "Terraform main.tf");
  const varsTf = await validateFileExists(path.join(rootDir, "terraform/variables.tf"), "Terraform variables.tf");
  const outputsTf = await validateFileExists(path.join(rootDir, "terraform/outputs.tf"), "Terraform outputs.tf");
  const prodTfvars = await validateFileExists(path.join(rootDir, "terraform/environments/prod.tfvars"), "Terraform prod.tfvars");

  if (!mainTf.includes("module \"eks\"") || !mainTf.includes("aws_s3_bucket") || !varsTf.includes("variable \"cluster_name\"")) {
    throw new Error("Terraform configuration missing required EKS or S3 components");
  }

  console.log("\n==================================================================");
  console.log(" ALL 5 CLOUD ORCHESTRATION & HELM ARTIFACTS PASSED VALIDATION!   ");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Cloud orchestration validation failed:", err);
  process.exit(1);
});
