# Azure Static Web Apps Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provision an Azure Static Web App (`VibrantCommunity`) in resource group `rg-vibrantcommunity` (`australiaeast`) and configure a GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) for automated CI/CD deployment.

**Architecture:** A Vite + React + TypeScript static web build deployed to Azure Static Web Apps service via GitHub Actions triggered on pushes to the `main` branch.

**Tech Stack:** Azure Static Web Apps, Azure CLI (`az`), GitHub Actions (`Azure/static-web-apps-deploy`), Vite, Node.js 18+.

---

## Target Resource Details

- **Azure Resource Group:** `rg-vibrantcommunity`
- **Azure App Name:** `VibrantCommunity`
- **Region:** `australiaeast`
- **Build Output Location:** `dist`
- **App Location:** `/`
- **SKU:** `Free` (Standard available if needed)

---

### Task 1: Create Static Web Apps Configuration File

**Files:**
- Create: `staticwebapp.config.json`

- [ ] **Step 1: Create `staticwebapp.config.json` for fallback routing and header security**

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*.{png,jpg,jpeg,gif,svg,css,js}", "/favicon.ico"]
  },
  "mimeTypes": {
    ".json": "text/json"
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  }
}
```

- [ ] **Step 2: Verify production build includes `staticwebapp.config.json` in dist output**

Run: `npm run build`
Expected: Output folder `dist` is generated containing `index.html` and assets.

- [ ] **Step 3: Commit staticwebapp config**

```bash
git add staticwebapp.config.json
git commit -m "chore: add Azure Static Web App configuration"
```

---

### Task 2: Create GitHub Actions CI/CD Workflow

**Files:**
- Create: `.github/workflows/azure-static-web-apps.yml`

- [ ] **Step 1: Create `.github/workflows/azure-static-web-apps.yml`**

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Project
        run: npm run build

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_VIBRANTCOMMUNITY }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_VIBRANTCOMMUNITY }}
          action: "close"
```

- [ ] **Step 2: Commit workflow file**

```bash
git add .github/workflows/azure-static-web-apps.yml
git commit -m "ci: add Azure Static Web Apps deployment workflow"
```

---

### Task 3: Azure Resource Provisioning Script & Setup Instructions

**Files:**
- Create: `scripts/azure-deploy-setup.sh`

- [ ] **Step 1: Create `scripts/azure-deploy-setup.sh` shell script for automated resource provisioning via Azure CLI**

```bash
#!/bin/bash
set -e

RESOURCE_GROUP="rg-vibrantcommunity"
APP_NAME="VibrantCommunity"
LOCATION="australiaeast"

echo "Checking Azure CLI login status..."
az account show > /dev/null 2>&1 || az login

echo "Creating Resource Group: $RESOURCE_GROUP in $LOCATION..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "Creating Azure Static Web App: $APP_NAME..."
az staticwebapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Free

echo "Retrieving Deployment Token..."
TOKEN=$(az staticwebapp secrets list --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.apiKey" -o tsv)

echo "===================================================="
echo "Azure Static Web App created successfully!"
echo "Deployment Secret Token:"
echo "$TOKEN"
echo "===================================================="
echo "Add this token to your GitHub Repository Secrets:"
echo "Secret Name: AZURE_STATIC_WEB_APPS_API_TOKEN_VIBRANTCOMMUNITY"
echo "===================================================="
```

- [ ] **Step 2: Commit setup script**

```bash
git add scripts/azure-deploy-setup.sh
git commit -m "chore: add Azure CLI provisioning script"
```

---

## Verification Plan

### Automated Verification
- Run `npm run build` to verify clean production build output.
- Validate JSON formatting of `staticwebapp.config.json` and YAML syntax of `.github/workflows/azure-static-web-apps.yml`.

### Manual Verification Steps
1. Execute `bash scripts/azure-deploy-setup.sh` or run the Azure CLI commands to create `rg-vibrantcommunity` and `VibrantCommunity` in `australiaeast`.
2. Copy the resulting `apiKey` from Azure CLI.
3. In GitHub repository settings -> **Secrets and variables** -> **Actions**, add a new Repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_VIBRANTCOMMUNITY` containing the API token.
4. Push changes to the `main` branch to trigger the GitHub Actions workflow and confirm deployment on Azure Static Web Apps.
