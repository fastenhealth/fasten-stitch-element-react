import React, { useCallback, useEffect, useRef, CSSProperties } from 'react';

/**
 * This component embeds the Fasten Connect Stitch.js widget inside a React web application.
 *
 * The Stitch.js Widget is responsible for the following:
 * 1. Allowing patients to find their healthcare providers
 * 2. Opening a popup to the Fasten Connect API `connect` endpoint –
 *    https://docs.connect.fastenhealth.com/api-reference/registration/connect
 * 3. Redirecting the user to the Patient Portal for their healthcare institution to login and consent
 * 4. Redirecting back to the Fasten Connect API Callback endpoint
 * 5. Sending data back to the customer regarding the connection Fasten Connect has established
 *    with the patient and their healthcare provider
 *
 * The widget is embedded in an <iframe>. Authentication popups are opened by the embed itself as
 * normal browser windows (allow="popups"). Events from the widget are received via window.postMessage
 * and forwarded to the `onEventBus` callback.
 */

const FASTEN_EMBED_BASE_URL = 'https://embed.connect.fastenhealth.com';
const COMMUNICATION_ENTITY_EXTERNAL = 'FASTEN_CONNECT_EXTERNAL';

export interface FastenStitchElementOptions {
  /** Your Fasten Connect public identifier (required). */
  publicId: string;
  /** Surfaces additional debug logging when true. */
  debugModeEnabled?: boolean;
  /** Identifier you want to associate with the patient/session. */
  externalId?: string;
  /** Reconnect a previously established patient connection. */
  reconnectOrgConnectionId?: string;
  /** Restrict the experience to a specific brand. */
  brandId?: string;
  /** Restrict the experience to a specific portal. */
  portalId?: string;
  /** Restrict the experience to a specific endpoint. */
  endpointId?: string;
  /** Pre-populate the provider search field. */
  searchQuery?: string;
  /** Field to sort search results by. */
  searchSortBy?: string;
  /** JSON-serialised sort options (will be base64-encoded before being sent). */
  searchSortByOpts?: string;
  /** When true, only the provider search UI is shown (no connection flow). */
  searchOnly?: boolean;
  /** Show the splash screen before the search UI. */
  showSplash?: boolean;
  /** Enable TEFCA flows. */
  tefcaMode?: boolean;
  /** Force the TEFCA CSP prompt. */
  tefcaCspPromptForce?: boolean;
  /** Comma-delimited list of event types to receive. */
  eventTypes?: string;
  /** Callback invoked with parsed payloads sent from Fasten Connect. */
  onEventBus?: (data: unknown) => void;
  /** Inline styles applied to the <iframe> element. Defaults to width/height 100% with no border. */
  style?: CSSProperties;
  /** Optional CSS class name applied to the <iframe> element. */
  className?: string;
}

type FastenStitchElementQueryParams = Omit<
  FastenStitchElementOptions,
  'onEventBus' | 'debugModeEnabled' | 'style' | 'className'
>;

interface FastenStitchElementMessage {
  to?: string;
  payload?: string;
}

const DEFAULT_IFRAME_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
};

const FastenStitchElement = ({
  onEventBus,
  debugModeEnabled,
  style,
  className,
  ...queryParams
}: FastenStitchElementOptions) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from the Fasten Connect embed origin.
      if (event.origin !== FASTEN_EMBED_BASE_URL) {
        return;
      }

      const { data } = event;
      if (!data) {
        if (debugModeEnabled) {
          console.warn('[FastenStitchElement] empty message received');
        }
        return;
      }

      let message: FastenStitchElementMessage;
      try {
        message = typeof data === 'string' ? JSON.parse(data) : (data as FastenStitchElementMessage);
      } catch (error) {
        if (debugModeEnabled) {
          console.error('[FastenStitchElement] failed to parse message', error);
        }
        return;
      }

      if (message.to === COMMUNICATION_ENTITY_EXTERNAL) {
        if (debugModeEnabled) {
          console.debug('[FastenStitchElement] received event bus message', message);
        }
        if (!message.payload) {
          if (debugModeEnabled) {
            console.warn('[FastenStitchElement] empty payload received');
          }
          return;
        }
        try {
          if (onEventBus) {
            onEventBus(
              typeof message.payload === 'string' ? JSON.parse(message.payload) : message.payload,
            );
          } else if (debugModeEnabled) {
            console.warn('[FastenStitchElement] onEventBus handler missing');
          }
        } catch (error) {
          if (debugModeEnabled) {
            console.error('[FastenStitchElement] failed to parse payload', error);
          }
        }
      }
    },
    [onEventBus, debugModeEnabled],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const queryString = encodeOptionsAsQueryStringParameters(queryParams);

  return (
    <iframe
      ref={iframeRef}
      src={`${FASTEN_EMBED_BASE_URL}/?${queryString}`}
      style={style ?? DEFAULT_IFRAME_STYLE}
      className={className}
      allow="popups"
      title="Fasten Connect"
    />
  );
};

function encodeOptionsAsQueryStringParameters(sdkOptions: FastenStitchElementQueryParams): string {
  const params = new URLSearchParams();
  params.append('public-id', sdkOptions.publicId);

  if (sdkOptions.externalId) {
    params.append('external-id', sdkOptions.externalId);
  }
  if (sdkOptions.reconnectOrgConnectionId) {
    params.append('reconnect-org-connection-id', sdkOptions.reconnectOrgConnectionId);
  }
  if (sdkOptions.searchOnly) {
    params.append('search-only', sdkOptions.searchOnly.toString());
    if (sdkOptions.searchQuery) {
      params.append('search-query', sdkOptions.searchQuery);
    }
    if (sdkOptions.searchSortBy) {
      params.append('search-sort-by', sdkOptions.searchSortBy);
      if (sdkOptions.searchSortByOpts) {
        params.append('search-sort-by-opts', btoa(sdkOptions.searchSortByOpts));
      }
    }
    if (sdkOptions.showSplash) {
      params.append('show-splash', sdkOptions.showSplash.toString());
    }
  }

  if (sdkOptions.brandId) {
    params.append('brand-id', sdkOptions.brandId);
  }
  if (sdkOptions.portalId) {
    params.append('portal-id', sdkOptions.portalId);
  }
  if (sdkOptions.endpointId) {
    params.append('endpoint-id', sdkOptions.endpointId);
  }

  if (sdkOptions.tefcaMode) {
    params.append('tefca-mode', sdkOptions.tefcaMode.toString());
    params.append('search-only', 'false');
    if (sdkOptions.tefcaCspPromptForce) {
      params.append('tefca-csp-prompt-force', sdkOptions.tefcaCspPromptForce.toString());
    }
  }

  if (sdkOptions.eventTypes) {
    params.append('event-types', sdkOptions.eventTypes);
  }

  params.append('sdk-mode', 'react');

  return params.toString();
}

export default FastenStitchElement;
