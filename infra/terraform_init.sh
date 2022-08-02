#!/bin/bash

RESOURCE_GROUP_NAME=tfstatevocapp
STORAGE_ACCOUNT_NAME=vocappstorage
CONTAINER_NAME=tfstate

ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)
export ARM_ACCESS_KEY=$ACCOUNT_KEY

terraform init
