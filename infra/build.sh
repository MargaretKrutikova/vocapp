#!/bin/bash

yarn install
yarn build

rm -rf packaged
mkdir packaged
mkdir ./packaged/.next
mkdir ./packaged/.next/static
cp ./package.json ./packaged/package.json
cp -a ./public/. ./packaged/public/
cp -a ./.next/standalone/. ./packaged/
cp -a ./.next/static/. ./packaged/.next/static/
