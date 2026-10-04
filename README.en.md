# NextPier

**Web first. Desktop next.**

A Next.js starter for workbench apps. AnimateIcons, Cult UI, and compact styles are ready to use. Add Wails desktop or Browser Harness AI chat through the CLI.

[中文](README.md) · [Development guide](docs/development.md) · [Desktop guide](docs/desktop.md)

## Start building

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/nextpier --use-npm
cd my-app
npm run dev
```

Open [localhost:3900](http://localhost:3900). Cloning the repository directly? Run `npm install` first.

## Hand it to an agent

Replace the brackets and send this to your coding agent:

```text
Use https://github.com/yayapao/nextpier to create [project name] in [target directory].
Goal: [who uses it and what they need to do]. Workflows: [list them].
Data: [API, database, or single-user local persistence]. Features: [Web / Web+AI / Wails / Wails+AI].
Create the project with create-next-app --example and install dependencies. Inspect a nonempty target before making changes.
Read AGENTS.md, docs/README.md, docs/ai-agent.md, and the installed Next.js docs first.
Build the business homepage, data reads and writes, validation, and loading, empty, and error states using the existing components and style rules.
For AI, run npm run upgrade:harness. For desktop, run npm run upgrade:wails with the app name and ID.
Update the name, metadata, and README. Run typecheck, lint, and test:cli; run test:harness when AI is enabled.
Complete the implementation. Do not start dev, build, or package by default. Report commands, check results, and anything still unverified.
```

The [AI agent guide](docs/ai-agent.md) has a fuller prompt and worked scenarios in Chinese.

## Go desktop

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
npm run desktop:doctor
npm run desktop:dev
```

The upgrade generates `desktop/`. Run `npm run desktop:build` to package the app; output goes to `desktop/build/bin/`.

Desktop development requires Go 1.25+, Wails CLI 2.15.0, and platform build dependencies. The app requires Node.js 20.9+ at runtime; Node is not bundled. See the [desktop guide](docs/desktop.md).

## Add AI

```bash
npm run upgrade:harness
npm run harness:doctor
```

Chat, call tools, and confirm writes at `/harness`. Demo mode works without an API key. Replace the model, plugins, or store as your app grows; see [Browser Harness](docs/harness.md). The same runtime works on the web and in Wails.

## Defaults with a point of view

- Next.js 16.2, React 19, TypeScript, Tailwind CSS 4.
- AnimateIcons for animated icons, Cult UI for visual components, shadcn/Radix for core interactions.
- Compact Chinese UI, 32px controls, 6px corner radius, semantic colors in both themes.
- Server Components read initial data; client components handle interactions. Forms use React Hook Form + Zod.
- Wails wraps a local Next.js server, keeping Server Actions, Flight, and SSE.
- Optional AI chat with replaceable models, storage, and business plugins. Users confirm write operations.

The homepage is an interactive workbench example. Items live in React state and reset on reload; replace them with your own data when building an app.

## Read on

[Agent prompts](docs/ai-agent.md) · [Development](docs/development.md) · [Components and styles](docs/design-system.md) · [Desktop](docs/desktop.md) · [Browser Harness](docs/harness.md) · [AGENTS.md](AGENTS.md)

Component and style conventions come from [Niu](https://github.com/yayapao/niu). Code is licensed under [MIT](LICENSE); Cult UI source attribution and license are included with the components. Detailed guides are currently in Chinese.
