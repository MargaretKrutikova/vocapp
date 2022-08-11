#!/bin/bash

# TODO: Can this be moved into a pipeline step?
export ARM_CLIENT_ID=$servicePrincipalId
export ARM_CLIENT_SECRET=$servicePrincipalKey
export ARM_SUBSCRIPTION_ID=$(az account show --query id | xargs)
export ARM_TENANT_ID=$(az account show --query tenantId | xargs)

PUBLISH_FILE=$1

RESOURCE_GROUP_NAME=tfstatevocapp
STORAGE_ACCOUNT_NAME=vocappstorage
CONTAINER_NAME=tfstate

ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)
export ARM_ACCESS_KEY=$ACCOUNT_KEY

# terraform plan --out=main.tfplan

echo "Testing vars:"

echo "test_var1:"
echo $TEST_VAR1
echo $test_var1
echo $(test_var1)

echo "TF_VAR_test_tf_var1:"
echo $TF_VAR_TEST_TF_VAR1
echo $TF_VAR_test_tf_var1
echo $(TF_VAR_test_tf_var1)

# terraform plan \
#   -var "atlas_org_id=$ATLAS_ORG_ID" \
#   -var "mongodbatlas_private_key=$MONGODBATLAS_PRIVATE_KEY" \
#   -var "mongodbatlas_public_key=$MONGODBATLAS_PUBLIC_KEY" \
#   --out=main.tfplan

# terraform apply main.tfplan

# az webapp deploy \
#     --resource-group "VocAppGroup" \
#     --name "vocwebapp" \
#     --type=zip \
#     --src-path $PUBLISH_FILE
