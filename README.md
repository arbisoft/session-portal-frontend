# Arbisoft Sessions Portal
![NodeJS](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) ![VITE](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
## React Atomic Pattern
This project uses React Atomic Patter read more below:
```html
https://rjroopal.medium.com/atomic-design-pattern-structuring-your-react-application-970dd57520f8
```
## Setup
### Installing nvm and activating the correct node version
Install [nvm](https://github.com/nvm-sh/nvm) a program for managing different node versions. 
Then in the root of the project run nvm use. This will switch your node version to the one specified in .nvmrc
If required follow the instructions to download node build.

### Install dependencies
Run the following command to install dependencies
```bash
$ npm install
```
### Environment variable
Copy the example env
```bash
$ cp .env.example .env.local
```
Set the variables in .env.local as required

## Development
### Start the server
Start the server using
```bash
$ npm run dev
```