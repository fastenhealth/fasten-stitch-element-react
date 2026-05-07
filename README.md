# @fastenhealth/fasten-stitch-element-react

React SDK for [Fasten Connect](https://connect.fastenhealth.com) — embed health data connections in any React application.

Renders a trigger button that opens a modal dialog containing the Fasten Connect widget in an iframe. Handles all communication between your app and the widget via `postMessage`.

## Installation

```bash
npm install @fastenhealth/fasten-stitch-element-react
```

React 18+ is required as a peer dependency.

## Quick Start

```tsx
import { FastenStitchElement } from '@fastenhealth/fasten-stitch-element-react';

function App() {
  return (
    <FastenStitchElement
      publicId="your-public-id"
      externalId="user-123"
      onEvent={(event) => console.log('Fasten event:', event.data)}
    />
  );
}
```

## Usage Examples

### Custom Button Label

```tsx
<FastenStitchElement publicId="your-public-id" buttonLabel="Connect Health Records" />
```

### Custom Trigger Element

Pass `children` to replace the default button with your own trigger UI:

```tsx
<FastenStitchElement publicId="your-public-id">
  <span className="my-custom-link">Link my records</span>
</FastenStitchElement>
```

### Programmatic Control via Ref

Use a ref to call `show()` and `hide()` imperatively:

```tsx
import { useRef } from 'react';
import {
  FastenStitchElement,
  type FastenStitchElementHandle,
} from '@fastenhealth/fasten-stitch-element-react';

function App() {
  const ref = useRef<FastenStitchElementHandle>(null);

  return (
    <>
      <button onClick={() => ref.current?.show()}>Open Connect</button>
      <button onClick={() => ref.current?.hide()}>Close Connect</button>
      <FastenStitchElement ref={ref} publicId="your-public-id" />
    </>
  );
}
```

### Event Handling

```tsx
import { FastenStitchElement, EventTypes } from '@fastenhealth/fasten-stitch-element-react';

function App() {
  return (
    <FastenStitchElement
      publicId="your-public-id"
      eventTypes="patient.connection_success,patient.connection_failed"
      onEvent={(event) => {
        const payload = JSON.parse(event.data);
        if (payload.event_type === EventTypes.EventTypeConnectionSuccess) {
          console.log('Connection succeeded!');
        }
      }}
    />
  );
}
```

### Reconnect Flow

```tsx
<FastenStitchElement
  publicId="your-public-id"
  reconnectOrgConnectionId="existing-connection-id"
/>
```

### Pre-select a Brand, Portal, or Endpoint

```tsx
<FastenStitchElement
  publicId="your-public-id"
  brandId="some-brand-id"
  portalId="some-portal-id"
  endpointId="some-endpoint-id"
/>
```

### Search-Only Mode (default)

```tsx
<FastenStitchElement
  publicId="your-public-id"
  searchOnly={true}
  searchQuery="Kaiser"
  showSplash={true}
/>
```

### TEFCA Mode

```tsx
<FastenStitchElement
  publicId="your-public-id"
  tefcaMode={true}
  tefcaCspPromptForce={true}
/>
```

### Static Backdrop (prevent dismiss on backdrop click)

```tsx
<FastenStitchElement publicId="your-public-id" staticBackdrop={true} />
```

### Custom Styling

When you provide a `className` prop for an element, default inline styles are omitted so your CSS has full control. When you provide only a `style` prop, it merges with the defaults.

```tsx
<FastenStitchElement
  publicId="your-public-id"
  buttonClassName="my-btn"
  buttonStyle={{ padding: '1rem 2rem' }}
  dialogClassName="my-dialog"
  iframeStyle={{ minHeight: '900px' }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publicId` | `string` | — | **(required)** Your Fasten Connect public ID. |
| `externalId` | `string` | — | External identifier for the patient/user. |
| `reconnectOrgConnectionId` | `string` | — | Existing org-connection-id for reconnect flow. |
| `brandId` | `string` | — | Pre-select a specific brand. |
| `portalId` | `string` | — | Pre-select a specific portal. |
| `endpointId` | `string` | — | Pre-select a specific endpoint. |
| `searchQuery` | `string` | — | Pre-fill the search input. |
| `searchSortBy` | `string` | — | Field to sort search results by. |
| `searchSortByOpts` | `string` | — | JSON string of sort options (Base64URL-encoded automatically). |
| `searchOnly` | `boolean` | `true` | Only allow searching (no sign-in). |
| `showSplash` | `boolean` | `false` | Show splash screen before search. |
| `tefcaMode` | `boolean` | `false` | Enable TEFCA mode (identity verification + record locator). |
| `tefcaCspPromptForce` | `boolean` | `false` | Force CSP selection prompt in TEFCA mode. |
| `eventTypes` | `string` | — | Comma-separated event types to subscribe to. |
| `onEvent` | `(event: MessageEvent) => void` | — | Callback for widget postMessage events. |
| `staticBackdrop` | `boolean` | `false` | Prevent closing on backdrop click. |
| `buttonLabel` | `string` | `"Share Records"` | Default button text (ignored when `children` is provided). |
| `buttonClassName` | `string` | — | CSS class for the trigger button. |
| `buttonStyle` | `CSSProperties` | — | Inline styles for the trigger button. |
| `dialogClassName` | `string` | — | CSS class for the `<dialog>` element. |
| `dialogStyle` | `CSSProperties` | — | Inline styles for the `<dialog>`. |
| `iframeClassName` | `string` | — | CSS class for the `<iframe>` element. |
| `iframeStyle` | `CSSProperties` | — | Inline styles for the `<iframe>`. |
| `environment` | `string` | `"production"` | `"production"`, `"development"`, `"local"`, or a full URL. |
| `children` | `ReactNode` | — | Custom trigger element (replaces default button). |

## Ref Methods

| Method | Description |
|--------|-------------|
| `show()` | Open the connect modal programmatically. |
| `hide()` | Close the connect modal programmatically. |

## Environments

| Name | URL |
|------|-----|
| `production` | `https://embed.connect.fastenhealth.com` |
| `development` | `https://embed.connect-dev.fastenhealth.com` |
| `local` | `https://localhost:4201` |

Pass a full URL to `environment` to target a custom endpoint.

## Exports

The package also exports all Fasten Connect TypeScript types, enums, and utilities:

```ts
// Enums
import {
  ApiMode,
  WidgetMode,
  ConnectionStatus,
  ConnectMode,
  CspType,
  SourceCredentialType,
  EventTypes,
  SDKMode,
  CommunicationEntity,
} from '@fastenhealth/fasten-stitch-element-react';

// Types (import as type-only)
import type {
  CallbackPayload,
  Organization,
  ConnectPayload,
  MessageBusEventPayload,
  ResponseWrapper,
  // ... and many more
} from '@fastenhealth/fasten-stitch-element-react';

// Utilities
import { Base64UrlEncode, Base64UrlDecode } from '@fastenhealth/fasten-stitch-element-react';
```

## License

MIT
