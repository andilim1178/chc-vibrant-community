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
