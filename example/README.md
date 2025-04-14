# Example Project
This is the example project for demonstrating the usage of the library.

## How to Use This Project
Follow these steps to set up and use the project:

### Step 1: Build the Library
Navigate to the library folder and build it:

```bash
cd ../package
npm ci
node --run build
```

### Step 2: Install Dependencies
Return to the example project folder and install the required dependencies:
```bash
cd ../example
npm ci
```

## How to Test the Library in This Project
You can test the library in various ways:

### Run the Source Code
Execute the source code directly:
```bash
npx bb-path-alias start ./src/index.ts
```

### Run with File Watching
Run the source code with file watching enabled for automatic reloads:
```bash
npx bb-path-alias watch ./src/index.ts
```

### Build the Project
Buil the project to generate the output files:
```bash
npx bb-path-alias build
```

### Run Unit Tests
Execute the unit tests to verify functionality:
```bash
npx ava
```