<p align="center">
  <a href="https://github.com/fastenhealth/">
  <img width="400" alt="fasten_view" src="https://github.com/fastenhealth/brand-kit/raw/main/connect/banner-transparent.png">
  </a>
</p>

# @fastenhealth/fasten-stitch-element-react

React SDK for [Fasten Connect](https://www.fastenhealth.com) — embed health data connections in any React application.

Renders a trigger button that opens a modal dialog containing the Fasten Connect widget in an iframe. Handles all communication between your app and the widget via `postMessage`.

## Installation

Add the package to your project along with its React dependencies:

```bash
npm install @fastenhealth/fasten-stitch-element-react
# or
yarn add @fastenhealth/fasten-stitch-element-react
```

React 18+ is required as a peer dependency.

## Usage

```tsx
import { FastenStitchElement } from '@fastenhealth/fasten-stitch-element-react';

const CUSTOMER_PUBLIC_ID = 'public_test_...';

function App() {
  return (
    <FastenStitchElement
      publicId={CUSTOMER_PUBLIC_ID}
      externalId="user-123"
      onEventBus={(event) => {
          console.log('Fasten event:', event.data);
      }}
    />
  );
}
```

### Props

The component accepts the following options (matching the Stitch.js widget configuration):


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
| `onEventBus` | `(event: MessageEvent) => void` | — | Callback for widget postMessage events. |
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

## Feedback

Please open an issue with any bugs or requests. Your feedback will help us stabilize the public SDK interface.
