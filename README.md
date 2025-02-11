<!-- badges -->

![REACT](https://img.shields.io/badge/React%2018.3.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NEXT JS](https://img.shields.io/badge/next%20js%2014.2.15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TYPESCRIPT](https://img.shields.io/badge/TypeScript%205.5.4-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MATERIAL UI](https://img.shields.io/badge/Material%20UI%206.6.1-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![PLAYWRIGHT](https://img.shields.io/badge/Playwright%201.43.1-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)
![ESLINT](https://img.shields.io/badge/eslint%208.57.1-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)
![GITHUB ACTIONS](https://img.shields.io/badge/Github%20Actions-282a2e?style=for-the-badge&logo=githubactions&logoColor=367cfe)

# Arbisoft Sessions Portal Frontend

## Getting Started

1. Clone repository

   ```bash
   git clone https://github.com/arbisoft/session-portal-frontend.git session-portal
   ```

2. Install dependencies

   ```bash
   cd session-portal
   npm install
   ```

3. Copy example environment file

   ```bash
   cp example.env.local .env.local
   ```

4. Run development server

   ```bash
   npm run dev
   ```

## For Testing

### Installation

```bash
npx playwright install
```

### Running tests

1. Run development server

   ```bash
   npm run dev
   ```

1. Run Playwright

   ```bash
    npx playwright test --ui
   ```

   or

   ```bash
   npx playwright test
   ```

## Jest Configuration Overview

### 1. **Next.js Jest Setup**
   - The configuration uses `next/jest` to load the Next.js app's configuration (`next.config.js`) and environment variables (`.env`) into the test environment.
   - The `dir: "./"` option specifies the root directory of the Next.js app.

   ```typescript
   const createJestConfig = nextJest({
     dir: "./",
   });
   ```

### 2. **Custom Jest Configuration**
   The following custom settings are applied to the Jest configuration:

   - **`coverageProvider: "v8"`**: Uses the V8 engine for code coverage analysis, which is faster and more reliable.
   - **`testEnvironment: "jsdom"`**: Sets the test environment to `jsdom`, enabling DOM-based testing for components.
   - **`setupFilesAfterEnv`**: Specifies a setup file (`jest.setup.ts`) to run before each test. This is useful for configuring global test setups, such as mocking libraries or initializing test utilities.
     ```typescript
     setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
     ```
   - **`moduleNameMapper`**: Maps CSS and SCSS files to `identity-obj-proxy` to avoid errors when importing styles in tests.
     ```typescript
     moduleNameMapper: {
       "\\.(css|less|scss|sass)$": "identity-obj-proxy",
     },
     ```
   - **`testMatch`**: Defines the pattern for locating test files. It includes:
     - Files in the `__tests__` directory.
     - Files with `.test.[jt]s(x)?` or `.spec.[jt]s(x)?` extensions.
     ```typescript
     testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(test).[jt]s?(x)"],
     ```
      - Ensure your test files follow the naming conventions specified in `testMatch`.
   - **`coverageThreshold`**: Sets minimum coverage thresholds for the entire project:
     - Branches: 80%
     - Functions: 80%
     - Lines: 80%
     - Statements: -10 (no threshold, but included for reference)
     ```typescript
     coverageThreshold: {
       global: { branches: 80, functions: 80, lines: 80, statements: -10 },
     },
     ```
   - **`coverageDirectory`**: Specifies the directory where coverage reports will be saved.
     ```typescript
     coverageDirectory: "./coverage/",
     ```

### 3. **View Coverage**:
   After running tests, check the `./coverage/` directory for detailed coverage reports.

# **Using `nvm use` to Switch to Node.js 22 LTS**

## **Overview**
This guide explains how to use `nvm` (Node Version Manager) to switch to **Node.js 22 LTS** and ensure that the correct version is being used in your project.

## **1. Install NVM (If Not Installed)**
If you don’t have `nvm` installed, follow these steps:

### **For macOS & Linux:**
Run the following command:
```sh
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
```
Then restart your terminal or run:
```sh
source ~/.nvm/nvm.sh
```

### **For Windows:**
Use **nvm-windows**: [Download Here](https://github.com/coreybutler/nvm-windows/releases)

## **2. Verify NVM Installation**
To check if `nvm` is installed, run:
```sh
nvm --version
```
You should see the version number displayed.

## **3. Install and Use Node.js 22 LTS**
Run the following command to install Node.js 22 LTS:
```sh
nvm install 22
```

Once installed, switch to Node.js 22:
```sh
nvm use 22
```

To verify that the correct version is active, run:
```sh
node -v
```
This should output something like:
```sh
v22.x.x
```

## **4. Set Node.js 22 as the Default Version (Optional)**
If you want Node.js 22 LTS to be the default version when opening a new terminal, set it globally:
```sh
nvm alias default 22
```
Now, every time you open a new terminal session, Node.js 22 will be used.

## **6. Troubleshooting**
- If `nvm use 22` does not work, make sure you have installed Node.js 22 using `nvm install 22`.  
- If `nvm` commands are not recognized, restart your terminal or run:
  ```sh
  source ~/.nvm/nvm.sh
  ```
- On Windows, ensure you're using `nvm-windows` and check `nvm list` for installed versions.

## Inspiration

Boilerplate Inspiration (https://github.com/brocoders/extensive-react-boilerplate).
