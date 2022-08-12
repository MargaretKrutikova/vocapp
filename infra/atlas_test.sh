#!/bin/bash

KYA_PUBLIC_KEY=$1
KYA_PRIVATE_KEY=$2

echo "KYA_PUBLIC_KEY:"
echo $KYA_PUBLIC_KEY

echo "KYA_PRIVATE_KEY:"
echo $KYA_PRIVATE_KEY

# echo "IP: "
# ifconfig

echo "curl groups:"
curl -v \
  'https://cloud.mongodb.com/api/atlas/v1.0/groups' \
  --digest -u $KYA_PUBLIC_KEY:$KYA_PRIVATE_KEY
