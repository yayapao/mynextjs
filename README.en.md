# NextPier

**Web first. Desktop next.**

A Next.js starter for workbench apps. AnimateIcons, Cult UI, and compact styles are ready to use. Add a Wails desktop app in one command, keeping Server Actions.

[中文](README.md) · [Development guide](docs/development.md) · [Desktop guide](docs/desktop.md)

## Start building

```bash
npx create-next-app@latest my-app --example https://github.com/yayapao/mynextjs --use-npm
cd my-app
npm run dev
```

Open [localhost:3900](http://localhost:3900). Cloning the repository directly? Run `npm install` first.

## Go desktop

```bash
npm run upgrade:wails -- --name MyApp --id com.example.myapp
npm run desktop:doctor
npm run desktop:dev
```

The upgrade generates `desktop/`. Run `npm run desktop:build` to package the app; output goes to `desktop/build/bin/`.

Desktop development requires Go 1.25+, Wails CLI 2.15.0, and platform build dependencies. The app requires Node.js 20.9+ at runtime; Node is not bundled. See the [desktop guide](docs/desktop.md).

## Defaults with a point of view

- Next.js 16.2, React 19, TypeScript, Tailwind CSS 4.
- AnimateIcons for animated icons, Cult UI for visual components, shadcn/Radix for core interactions.
- Compact Chinese UI, 32px controls, 6px corner radius, semantic colors in both themes.
- Server Components read initial data; client components handle interactions. Forms use React Hook Form + Zod.
- Wails wraps a local Next.js server, keeping Server Actions, Flight, and SSE.

The homepage is an interactive workbench example. Items live in React state and reset on reload; replace them with your own data when building an app.

## Read on

[Development](docs/development.md) · [Components and styles](docs/design-system.md) · [Desktop](docs/desktop.md) · [AGENTS.md](AGENTS.md)

Component and style conventions come from [Niu](https://github.com/yayapao/niu). Code is licensed under [MIT](LICENSE); Cult UI source attribution and license are included with the components. Detailed guides are currently in Chinese.
