<p align="center">
  <a href="https://github.com/fastenhealth/">
  <img width="400" alt="fasten_view" src="https://github.com/fastenhealth/brand-kit/raw/main/connect/banner-transparent.png">
  </a>
</p>

# Fasten Connect React SDK (Beta)

A lightweight React SDK that embeds the Fasten Connect experience inside any React web application.
The package wraps the Stitch.js workflow in an `<iframe>` so you can authenticate with provider portals
and receive connection events without leaving your app.

> **Status:** Beta – APIs may change and you should validate the integration in your environment before
> shipping to production.

## Installation

```bash
npm install @fastenhealth/fasten-stitch-element-react
# or
yarn add @fastenhealth/fasten-stitch-element-react
```

## Usage

```tsx
import { FastenStitchElement } from '@fastenhealth/fasten-stitch-element-react';

const CUSTOMER_PUBLIC_ID = 'public_test_...';

export const ConnectPage = () => (
  <div style={{ width: '100%', height: '600px' }}>
    <FastenStitchElement
      publicId={CUSTOMER_PUBLIC_ID}
      debugModeEnabled
      onEventBus={(event) => {
        console.log('Fasten event', event);
      }}
    />
  </div>
);
```

`FastenStitchElement` renders an `<iframe>` that defaults to `width: 100%; height: 100%`, so wrap it
in a container with a defined height.

### Props

The component accepts the following options (matching the Stitch.js widget configuration):

- `publicId` (**required**) – Your Fasten Connect public identifier.
- `externalId` – Identifier you want to associate with the patient/session.
- `reconnectOrgConnectionId` – Reconnect a previously established patient connection.
- `searchOnly`, `searchQuery`, `searchSortBy`, `searchSortByOpts`, `showSplash` – Configure the
  provider search experience.
- `brandId`, `portalId`, `endpointId` – Restrict the experience to a specific brand/portal/endpoint.
- `tefcaMode` – Enable TEFCA flows.
- `tefcaCspPromptForce` – Force the TEFCA CSP prompt.
- `eventTypes` – Comma-delimited list of event types to receive.
- `debugModeEnabled` – Enables additional console logging for debugging.
- `onEventBus` – Callback invoked with parsed payloads sent from Fasten Connect (e.g., when a
  connection is created).
- `style` – Inline styles applied to the `<iframe>` element (defaults to `width: 100%; height: 100%;
  border: none`).
- `className` – Optional CSS class name applied to the `<iframe>` element.

Refer to `FastenStitchElementOptions` in `src/FastenStitchElement.tsx` for the complete, documented
type definition.

## How it works

The component renders an `<iframe>` that loads `https://embed.connect.fastenhealth.com/`. When a
patient authenticates with their health provider, the embed opens a popup window (browser-native) for
the OAuth consent flow. Once the connection is established, the embed sends a `postMessage` event that
the component forwards to your `onEventBus` callback.

Refer to the [Fasten Connect documentation](https://docs.connect.fastenhealth.com) for details on the
event payload shape.

## Building the SDK locally

Transpile TypeScript to the distributable `dist/` folder:

```bash
npm install
npm run build
```

## Feedback

Please open an issue with any bugs or requests. Your feedback will help us stabilise the public SDK
interface.