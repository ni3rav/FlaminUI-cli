#!/usr/bin/env node

import chalk from "chalk";
import { program } from "commander";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import prompts from "prompts";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const requiredDependencies = [
  "framer-motion",
  "clsx",
  "tailwind-merge",
  "tw-merge",
];

program.version("1.0.0").description("CLI for Flamin-UI component library");

async function installDependencies() {
  console.log(chalk.yellow("Checking and installing required dependencies..."));

  // Ensure package.json exists
  if (!fs.existsSync("package.json")) {
    console.error(
      chalk.red(
        "Error: package.json not found. Make sure you are in a project directory."
      )
    );
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const missingDependencies = requiredDependencies.filter(
    (dep) =>
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );

  if (missingDependencies.length > 0) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `The following dependencies are required and will be installed: ${missingDependencies.join(
        ", "
      )}. Proceed?`,
    });

    if (!confirm) {
      console.log(chalk.red("Installation cancelled."));
      process.exit(1);
    }

    try {
      console.log(
        `Running npm install: npm install ${missingDependencies.join(" ")}`
      );
      execSync(`npm install ${missingDependencies.join(" ")}`, {
        stdio: "inherit",
      });
      console.log(chalk.green("✓ Dependencies installed successfully"));
    } catch (error) {
      console.error(
        chalk.red(`Failed to install dependencies: ${error.message}`)
      );
      process.exit(1);
    }
  } else {
    console.log(
      chalk.green("✓ All required dependencies are already installed")
    );
  }
}

async function copyTailwindConfig() {
  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts");

  // Create or overwrite the tailwind.config.ts file
  const tailwindConfigContent = `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
  `;

  fs.outputFileSync(tailwindConfigPath, tailwindConfigContent.trim());
  console.log(chalk.green("✓ Created or overwritten tailwind.config.ts"));
}

async function copyUtilFile() {
  const utilSourcePath = path.join(path.resolve(__dirname), "../src/util.ts");
  const utilDestPath = path.join(process.cwd(), "lib", "util.ts");

  if (fs.existsSync(utilDestPath)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "A util.ts file already exists. Do you want to overwrite it?",
      initial: false,
    });

    if (!overwrite) {
      console.log(chalk.yellow("Skipping util.ts update."));
      return;
    }
  }

  fs.copySync(utilSourcePath, utilDestPath);
  console.log(chalk.green("✓ Copied util.ts to lib/util.ts"));
}

async function copyCNFile() {
  const cnSourcePath = path.join(path.resolve(__dirname), "../src/cn.ts");
  const cnDestPath = path.join(process.cwd(), "utils", "cn.ts");

  if (fs.existsSync(cnDestPath)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "A cn.ts file already exists. Do you want to overwrite it?",
      initial: false,
    });

    if (!overwrite) {
      console.log(chalk.yellow("Skipping cn.ts update."));
      return;
    }
  }

  fs.ensureDirSync(path.dirname(cnDestPath));
  fs.copySync(cnSourcePath, cnDestPath);
  console.log(chalk.green("✓ Copied cn.ts to utils/cn.ts"));
}

program
  .command("init")
  .description("Initialize Flamin-UI in your Next.js project")
  .action(async () => {
    console.log(chalk.yellow("Initializing Flamin-UI..."));

    // Ensure we're in a Next.js project
    if (!fs.existsSync("package.json")) {
      console.error(
        chalk.red(
          "Error: package.json not found. Make sure you're in a Next.js project root."
        )
      );
      process.exit(1);
    }

    // Install dependencies
    await installDependencies();

    // Copy util.ts file
    await copyUtilFile();

    // Copy cn.ts file
    await copyCNFile();

    // Copy Tailwind config
    await copyTailwindConfig();

    // Create components directory
    fs.ensureDirSync(path.join(process.cwd(), "lib", "components"));
    console.log(chalk.green("✓ Created lib/components directory"));

    console.log(
      chalk.green(
        "\nFlamin-UI has been successfully initialized in your project!"
      )
    );
    console.log(
      chalk.blue(
        "You can now add components using: npx flamin-ui add <component-name>"
      )
    );
  });

program
  .command("add <component>")
  .description("Add a Flamin-UI component to your project")
  .action(async (component) => {
    console.log(chalk.yellow(`Adding ${component} component...`));

    const componentDir = path.join(process.cwd(), "lib", "components");
    const componentPath = path.join(componentDir, `${component}.tsx`);

    if (fs.existsSync(componentPath)) {
      console.error(chalk.red(`Error: ${component}.tsx already exists.`));
      process.exit(1);
    }

    // Fetch the component from your repository
    const componentUrl = `https://raw.githubusercontent.com/Vedant-Panchal/FlaminUI/refs/heads/main/lib/components/${component}/${component}.tsx`;

    try {
      const response = await fetch(componentUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const componentContent = await response.text();
      fs.outputFileSync(componentPath, componentContent);
      console.log(chalk.green(`✓ Created ${componentPath}`));
    } catch (error) {
      console.error(
        chalk.red(`Error fetching ${component} component: ${error.message}`)
      );
      process.exit(1);
    }

    console.log(
      chalk.green(
        `\n${
          component.charAt(0).toUpperCase() + component.slice(1)
        } component has been successfully added to your project!`
      )
    );
  });

program.parse(process.argv);
