#!/bin/bash

yarn install
yarn build

rm -rf packaged
mkdir packaged
mkdir ./packaged/.next
mkdir ./packaged/.next/static
cp ./package.json ./packaged/package.json
cp -R ./public/ ./packaged/public/
cp -R ./.next/standalone/ ./packaged/
cp -R ./.next/static/ ./packaged/.next/static/
