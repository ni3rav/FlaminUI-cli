
# FlaminUI CLI

A barebone CLI tool to initiate and use FlaminUI components in your NextJS application. 
## Pre-Requisites

- A NextJS Application
- NextJS Application must be written in TypeScript (as of now)
- Tailwind CSS must be configured in the NextJS Application
- Import alias must be  configured to @ 
- As of now we only support NPM as the package manager



## Configure FlaminUI in Your Project

Once you've setup a NextJS project with above requirements you can easily initiate FlaminUI in your project by executing

```bash
npx flamin-ui init
```

This command will setup all configuration files and install required dependencies allowing you to start adding components as needed, for an example you can add Button by executing

```bash
npx flamin-ui add Button
```

### Dependencies

The init command will install following dependencies

- clsx
- framer-motion
- tw-merge
- tailwind-merge

### Configuration files

Following files will be configured by the init command

- @/lib/util.ts 
- @/tsconfig.js (will overwrite existing file's contents)
- @/tailwind.config.ts (will overwrite existing file's contents)
- @/utils/cn.ts

### Components

FlaminUI will store it's components in the following directory

```text
@/lib/components
```