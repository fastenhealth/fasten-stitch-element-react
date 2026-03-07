import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
  useId,
  useMemo,
} from 'react';
import { ConnectMode, EventTypes } from '../constants';
import { Base64UrlEncode } from '../utils/base64';
import type { MessageBusEventPayload } from '../models/message-bus/message-bus-event-payload';

// ---------------------------------------------------------------------------
// Environment configuration
// ---------------------------------------------------------------------------

/** Known embed environments keyed by name. */
const EMBED_ENDPOINTS: Record<string, string> = {
  production: 'https://embed.connect.fastenhealth.com',
  development: 'https://embed.connect-dev.fastenhealth.com',
  local: 'https://localhost:4201',
};

const DEFAULT_ENVIRONMENT = 'production';

// ---------------------------------------------------------------------------
// Debug logger — only active when environment !== "production"
// ---------------------------------------------------------------------------

const LOG_PREFIX = '[FastenStitchElement]';

function createLogger(environment: string) {
  const enabled = environment !== 'production';
  return {
    debug: (...args: unknown[]) => {
      if (enabled) console.debug(LOG_PREFIX, ...args);
    },
    warn: (...args: unknown[]) => {
      if (enabled) console.warn(LOG_PREFIX, ...args);
    },
  };
}

// ---------------------------------------------------------------------------
// Injected stylesheet (handles pseudo-classes & pseudo-elements that inline
// styles cannot express). Uses a stable class prefix to avoid collisions.
// ---------------------------------------------------------------------------

const STYLE_CLASS_PREFIX = 'fse';

/**
 * Build a scoped CSS string for the component.
 * The `id` parameter is a unique React-generated ID used to scope styles
 * so multiple instances on the same page don't collide.
 */
function buildScopedStyles(scopeId: string): string {
  const btn = `.${STYLE_CLASS_PREFIX}-btn-${scopeId}`;
  const dlg = `.${STYLE_CLASS_PREFIX}-dlg-${scopeId}`;

  return `
/* Button hover */
${btn}:hover {
  background-color: #1e40af;
}
/* Button focus */
${btn}:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.5);
}
/* Dark mode button */
@media (prefers-color-scheme: dark) {
  ${btn} {
    background-color: #2563eb;
  }
  ${btn}:hover {
    background-color: #1d4ed8;
  }
  ${btn}:focus {
    box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.5);
  }
}
/* Dialog backdrop */
${dlg}::backdrop {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FastenStitchElementProps {
  /** Your Fasten Connect public ID (required). */
  publicId: string;
  /** An external identifier for the patient / user. */
  externalId?: string;

  // ── Connect mode ────────────────────────────────────────────────────
  /**
   * How the OAuth connection flow is presented to the user.
   * `"popup"` (default) opens a popup window and listens via postMessage.
   * `"websocket"` opens a popup window and listens via WebSocket.
   * `"redirect"` navigates in the same window (server-side, not yet fully supported).
   */
  connectMode?: ConnectMode;
  /** Pass an existing org-connection-id to trigger a reconnect flow. */
  reconnectOrgConnectionId?: string;
  /** Pre-select a specific brand. */
  brandId?: string;
  /** Pre-select a specific portal. */
  portalId?: string;
  /** Pre-select a specific endpoint. */
  endpointId?: string;

  // ── Search mode ─────────────────────────────────────────────────────
  /** Pre-fill the search input. */
  searchQuery?: string;
  /** The field to sort search results by. */
  searchSortBy?: string;
  /** JSON-encoded options for the sort-by field. Will be Base64-URL-encoded before being sent. */
  searchSortByOpts?: string;
  /** When `true` the widget only allows searching (no sign-in). Defaults to `true`. */
  searchOnly?: boolean;
  /** Show the splash / welcome screen before the search. */
  showSplash?: boolean;

  // ── TEFCA mode ──────────────────────────────────────────────────────
  /** Enable TEFCA mode (identity verification + record locator). */
  tefcaMode?: boolean;
  /** Force the CSP selection prompt even when a prior verification exists. */
  tefcaCspPromptForce?: boolean;

  // ── Events ──────────────────────────────────────────────────────────
  /** Comma-separated list of event types to subscribe to (e.g. "search.query,patient.connection_success"). */
  eventTypes?: string;
  /**
   * Called when the embedded widget sends a postMessage event.
   * Receives the raw `MessageEvent` from the iframe.
   */
  onEvent?: (event: MessageEvent) => void;

  // ── Behaviour ───────────────────────────────────────────────────────
  /** When `true`, clicking the backdrop does not close the dialog. */
  staticBackdrop?: boolean;

  // ── Appearance ──────────────────────────────────────────────────────
  /** Override the default button label. If `children` is supplied this prop is ignored. */
  buttonLabel?: string;
  /** Custom class name(s) for the trigger button. */
  buttonClassName?: string;
  /** Custom inline styles for the trigger button. */
  buttonStyle?: React.CSSProperties;
  /** Custom class name(s) for the `<dialog>` element. */
  dialogClassName?: string;
  /** Custom inline styles for the `<dialog>` element. */
  dialogStyle?: React.CSSProperties;
  /** Custom class name(s) for the `<iframe>` element. */
  iframeClassName?: string;
  /** Custom inline styles for the `<iframe>` element. */
  iframeStyle?: React.CSSProperties;

  /**
   * The Fasten Connect environment to target.
   * Defaults to `"production"`.
   * Accepts `"production"`, `"development"`, `"local"`, or a full URL.
   */
  environment?: string;

  /** Render custom trigger UI instead of the default button. */
  children?: React.ReactNode;
}

/** Imperative handle exposed via `ref`. */
export interface FastenStitchElementHandle {
  /** Programmatically open the connect modal. */
  show: () => void;
  /** Programmatically close the connect modal. */
  hide: () => void;
}

// ---------------------------------------------------------------------------
// Default styles (mirror the Angular element's Tailwind classes)
// ---------------------------------------------------------------------------

const defaultButtonStyle: React.CSSProperties = {
  display: 'block',
  color: '#ffffff',
  backgroundColor: '#1d4ed8',
  fontWeight: 500,
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  padding: '0.625rem 1.25rem',
  textAlign: 'center',
  border: 'none',
  cursor: 'pointer',
};

const defaultDialogStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  border: 'none',
  padding: 0,
  width: '100%',
  maxWidth: '440px',
  minHeight: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '0.5rem',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
};

const defaultIframeStyle: React.CSSProperties = {
  border: 'none',
  width: '100%',
  minHeight: '800px',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const FastenStitchElement = forwardRef<
  FastenStitchElementHandle,
  FastenStitchElementProps
>(function FastenStitchElement(props, ref) {
  const {
    publicId,
    externalId,
    connectMode,
    reconnectOrgConnectionId,
    brandId,
    portalId,
    endpointId,
    searchQuery,
    searchSortBy,
    searchSortByOpts,
    searchOnly = true,
    showSplash = false,
    tefcaMode = false,
    tefcaCspPromptForce = false,
    eventTypes,
    onEvent,
    staticBackdrop = false,
    buttonLabel = 'Share Records',
    buttonClassName,
    buttonStyle,
    dialogClassName,
    dialogStyle,
    iframeClassName,
    iframeStyle,
    environment = DEFAULT_ENVIRONMENT,
    children,
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const log = useMemo(() => createLogger(environment), [environment]);

  // Scoped style classes — safe CSS identifier derived from React's useId
  const reactId = useId();
  const scopeId = reactId.replace(/:/g, '');
  const btnScopeClass = `${STYLE_CLASS_PREFIX}-btn-${scopeId}`;
  const dlgScopeClass = `${STYLE_CLASS_PREFIX}-dlg-${scopeId}`;

  // ── Resolve the embed base URL ────────────────────────────────────
  const embedBase =
    EMBED_ENDPOINTS[environment] ?? environment; // allow a full URL override

  // ── Build query string ────────────────────────────────────────────
  const buildQueryString = useCallback((): string => {
    const params = new URLSearchParams();

    // Identity
    if (publicId) params.set('public-id', publicId);
    if (externalId) params.set('external-id', externalId);

    // Connect mode & reconnection
    if (connectMode) params.set('connect-mode', connectMode);
    if (reconnectOrgConnectionId) params.set('reconnect-org-connection-id', reconnectOrgConnectionId);

    // Direct selection
    if (brandId) params.set('brand-id', brandId);
    if (portalId) params.set('portal-id', portalId);
    if (endpointId) params.set('endpoint-id', endpointId);

    // TEFCA — takes precedence over search-only
    if (tefcaMode) {
      params.set('tefca-mode', 'true');
      params.set('search-only', 'false');
      if (tefcaCspPromptForce) params.set('tefca-csp-prompt-force', 'true');
    } else if (searchOnly) {
      params.set('search-only', 'true');
      if (searchQuery) params.set('search-query', searchQuery);
      if (searchSortBy) {
        params.set('search-sort-by', searchSortBy);
        if (searchSortByOpts) params.set('search-sort-by-opts', Base64UrlEncode(searchSortByOpts));
      }
      if (showSplash) params.set('show-splash', 'true');
    }

    // Events & behaviour
    if (eventTypes) params.set('event-types', eventTypes);
    if (staticBackdrop) params.set('static-backdrop', 'true');

    return params.toString();
  }, [
    publicId,
    externalId,
    connectMode,
    reconnectOrgConnectionId,
    brandId,
    portalId,
    endpointId,
    searchQuery,
    searchSortBy,
    searchSortByOpts,
    searchOnly,
    showSplash,
    tefcaMode,
    tefcaCspPromptForce,
    eventTypes,
    staticBackdrop,
  ]);

  // ── Show / hide helpers ───────────────────────────────────────────
  const showModal = useCallback(() => {
    const dialog = dialogRef.current;
    const iframe = iframeRef.current;
    if (!dialog || !iframe) return;

    const qs = buildQueryString();
    const iframeSrc = `${embedBase}?${qs}`;

    log.debug('showModal — opening iframe', { embedBase, queryString: qs, iframeSrc });

    iframe.src = iframeSrc;
    dialog.showModal();
  }, [embedBase, buildQueryString, log]);

  const hideModal = useCallback(() => {
    const dialog = dialogRef.current;
    const iframe = iframeRef.current;
    if (!dialog) return;

    log.debug('hideModal — closing dialog');

    dialog.close();
    if (iframe) iframe.src = 'about:blank';
  }, [log]);

  // ── Expose show/hide via ref ──────────────────────────────────────
  useImperativeHandle(ref, () => ({ show: showModal, hide: hideModal }), [
    showModal,
    hideModal,
  ]);

  // ── Backdrop click handler ────────────────────────────────────────
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (staticBackdrop) return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!isInDialog) {
        log.debug('backdrop click — dismissing modal');
        hideModal();
      }
    },
    [staticBackdrop, hideModal, log],
  );

  // ── Listen for postMessage from the iframe ────────────────────────
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Only handle messages from our iframe
      if (event.source !== iframe.contentWindow) return;

      let payload: MessageBusEventPayload;
      try {
        payload = JSON.parse(event.data) as MessageBusEventPayload;
      } catch {
        // Not a JSON message we care about
        return;
      }

      log.debug('postMessage received', { eventType: payload.event_type, payload });

      // If the widget requests to close, close the modal
      if (payload.event_type === EventTypes.EventTypeWidgetClose) {
        log.debug('widget requested close');
        hideModal();
        return;
      }

      // Bubble all other events up
      onEvent?.(event);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [hideModal, onEvent, log]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Injected scoped styles for pseudo-classes & pseudo-elements */}
      <style dangerouslySetInnerHTML={{ __html: buildScopedStyles(scopeId) }} />

      {/* Trigger */}
      {children ? (
        <span onClick={showModal} style={{ cursor: 'pointer' }}>
          {children}
        </span>
      ) : (
        <button
          type="button"
          className={buttonClassName ? buttonClassName : btnScopeClass}
          style={buttonClassName ? buttonStyle : { ...defaultButtonStyle, ...buttonStyle }}
          onClick={showModal}
        >
          {buttonLabel}
        </button>
      )}

      {/* Modal */}
      <dialog
        ref={dialogRef}
        className={dialogClassName ?? dlgScopeClass}
        style={dialogClassName ? dialogStyle : { ...defaultDialogStyle, ...dialogStyle }}
        onClick={handleDialogClick}
      >
        <iframe
          ref={iframeRef}
          title="Fasten Connect"
          className={iframeClassName}
          style={iframeClassName ? iframeStyle : { ...defaultIframeStyle, ...iframeStyle }}
        />
      </dialog>
    </>
  );
});
