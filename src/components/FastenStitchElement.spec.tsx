import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FastenStitchElement,
  type FastenStitchElementHandle,
} from './FastenStitchElement';
import { ConnectMode, EventTypes } from '../constants';

// jsdom doesn't implement HTMLDialogElement.showModal / close natively,
// so we polyfill them for testing.
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Rendering tests
// ---------------------------------------------------------------------------

describe('FastenStitchElement — rendering', () => {
  it('renders a default button with "Share Records" label', () => {
    render(<FastenStitchElement publicId="test-id" />);
    const button = screen.getByRole('button', { name: 'Share Records' });
    expect(button).toBeInTheDocument();
  });

  it('renders custom buttonLabel', () => {
    render(<FastenStitchElement publicId="test-id" buttonLabel="Connect Health" />);
    const button = screen.getByRole('button', { name: 'Connect Health' });
    expect(button).toBeInTheDocument();
  });

  it('renders children instead of default button', () => {
    render(
      <FastenStitchElement publicId="test-id">
        <span data-testid="custom-trigger">Custom</span>
      </FastenStitchElement>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('renders a dialog element', () => {
    render(<FastenStitchElement publicId="test-id" />);
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('renders an iframe inside the dialog', () => {
    render(<FastenStitchElement publicId="test-id" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.title).toBe('Fasten Connect');
  });

  it('injects a scoped <style> tag', () => {
    render(<FastenStitchElement publicId="test-id" />);
    const style = document.querySelector('style');
    expect(style).toBeInTheDocument();
    expect(style?.textContent).toContain(':hover');
    expect(style?.textContent).toContain('::backdrop');
  });
});

// ---------------------------------------------------------------------------
// Button styling tests
// ---------------------------------------------------------------------------

describe('FastenStitchElement — button styling', () => {
  it('applies default inline styles when no className is given', () => {
    render(<FastenStitchElement publicId="test-id" />);
    const button = screen.getByRole('button');
    // jsdom normalizes hex colours to rgb()
    expect(button.style.backgroundColor).toBe('rgb(29, 78, 216)');
    expect(button.style.color).toBe('rgb(255, 255, 255)');
    expect(button.style.borderRadius).toBe('0.5rem');
  });

  it('applies custom buttonStyle merged with defaults', () => {
    render(
      <FastenStitchElement publicId="test-id" buttonStyle={{ fontSize: '20px' }} />,
    );
    const button = screen.getByRole('button');
    // Custom style applied
    expect(button.style.fontSize).toBe('20px');
    // Default styles still present (jsdom normalizes hex to rgb)
    expect(button.style.backgroundColor).toBe('rgb(29, 78, 216)');
  });

  it('uses buttonClassName instead of scoped class when provided', () => {
    render(
      <FastenStitchElement publicId="test-id" buttonClassName="my-custom-btn" />,
    );
    const button = screen.getByRole('button');
    expect(button.className).toBe('my-custom-btn');
    // When custom className is used, default inline styles should NOT be applied
    // (only explicit buttonStyle would be)
    expect(button.style.backgroundColor).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Dialog open / close
// ---------------------------------------------------------------------------

describe('FastenStitchElement — dialog open / close', () => {
  it('opens the dialog when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<FastenStitchElement publicId="test-id" environment="development" />);

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(false);

    await user.click(screen.getByRole('button'));
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('sets the iframe src with correct query params when opened', async () => {
    const user = userEvent.setup();
    render(
      <FastenStitchElement
        publicId="pub-123"
        externalId="ext-456"
        environment="development"
      />,
    );

    await user.click(screen.getByRole('button'));

    const iframe = document.querySelector('iframe')!;
    const url = new URL(iframe.src);
    expect(url.origin).toBe('https://embed.connect.fastenlabs.com');
    expect(url.searchParams.get('public-id')).toBe('pub-123');
    expect(url.searchParams.get('external-id')).toBe('ext-456');
  });

  it('uses production embed URL by default', async () => {
    const user = userEvent.setup();
    render(<FastenStitchElement publicId="test-id" />);

    await user.click(screen.getByRole('button'));

    const iframe = document.querySelector('iframe')!;
    expect(iframe.src).toContain('https://embed.connect.fastenhealth.com');
  });

  it('uses local embed URL when environment is "local"', async () => {
    const user = userEvent.setup();
    render(<FastenStitchElement publicId="test-id" environment="local" />);

    await user.click(screen.getByRole('button'));

    const iframe = document.querySelector('iframe')!;
    expect(iframe.src).toContain('https://localhost:4201');
  });

  it('uses a custom URL when environment is a full URL', async () => {
    const user = userEvent.setup();
    render(
      <FastenStitchElement
        publicId="test-id"
        environment="https://custom.example.com"
      />,
    );

    await user.click(screen.getByRole('button'));

    const iframe = document.querySelector('iframe')!;
    expect(iframe.src).toContain('https://custom.example.com');
  });

  it('opens the dialog when children are clicked', async () => {
    const user = userEvent.setup();
    render(
      <FastenStitchElement publicId="test-id" environment="development">
        <span data-testid="trigger">Click me</span>
      </FastenStitchElement>,
    );

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(false);

    await user.click(screen.getByTestId('trigger'));
    expect(dialog.hasAttribute('open')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Imperative handle (ref)
// ---------------------------------------------------------------------------

describe('FastenStitchElement — imperative ref', () => {
  it('exposes show() and hide() via ref', () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
      />,
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current!.show).toBe('function');
    expect(typeof ref.current!.hide).toBe('function');
  });

  it('show() opens the dialog', () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
      />,
    );

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(false);

    act(() => ref.current!.show());
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('hide() closes the dialog and resets iframe src', () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
      />,
    );

    const dialog = document.querySelector('dialog')!;
    const iframe = document.querySelector('iframe')!;

    act(() => ref.current!.show());
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(iframe.src).toContain('embed.connect.fastenlabs.com');

    act(() => ref.current!.hide());
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(iframe.src).toBe('about:blank');
  });
});

// ---------------------------------------------------------------------------
// Query string building
// ---------------------------------------------------------------------------

describe('FastenStitchElement — query string', () => {
  async function getIframeSrcParams(
    props: Partial<React.ComponentProps<typeof FastenStitchElement>> & {
      publicId: string;
    },
  ) {
    const user = userEvent.setup();
    render(
      <FastenStitchElement environment="development" {...props} />,
    );
    await user.click(screen.getByRole('button'));
    const iframe = document.querySelector('iframe')!;
    return new URL(iframe.src).searchParams;
  }

  it('includes public-id and external-id', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      externalId: 'ext-2',
    });
    expect(params.get('public-id')).toBe('pub-1');
    expect(params.get('external-id')).toBe('ext-2');
  });

  it('includes connect-mode when specified', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      connectMode: ConnectMode.Websocket,
    });
    expect(params.get('connect-mode')).toBe('websocket');
  });

  it('includes reconnect-org-connection-id', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      reconnectOrgConnectionId: 'conn-99',
    });
    expect(params.get('reconnect-org-connection-id')).toBe('conn-99');
  });

  it('includes direct selection params (brand-id, portal-id, endpoint-id)', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      brandId: 'brand-a',
      portalId: 'portal-b',
      endpointId: 'endpoint-c',
    });
    expect(params.get('brand-id')).toBe('brand-a');
    expect(params.get('portal-id')).toBe('portal-b');
    expect(params.get('endpoint-id')).toBe('endpoint-c');
  });

  it('defaults to search-only=true', async () => {
    const params = await getIframeSrcParams({ publicId: 'pub-1' });
    expect(params.get('search-only')).toBe('true');
  });

  it('includes search params when searchOnly is true', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      searchQuery: 'kaiser',
      searchSortBy: 'name',
      searchSortByOpts: '{"direction":"asc"}',
      showSplash: true,
    });
    expect(params.get('search-only')).toBe('true');
    expect(params.get('search-query')).toBe('kaiser');
    expect(params.get('search-sort-by')).toBe('name');
    // searchSortByOpts should be base64url encoded
    expect(params.get('search-sort-by-opts')).toBeTruthy();
    expect(params.get('show-splash')).toBe('true');
  });

  it('does not include search params in tefca mode', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      tefcaMode: true,
      searchQuery: 'should-not-appear',
    });
    expect(params.get('tefca-mode')).toBe('true');
    expect(params.get('search-only')).toBe('false');
    expect(params.get('search-query')).toBeNull();
  });

  it('includes tefca-csp-prompt-force when tefcaMode and tefcaCspPromptForce are true', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      tefcaMode: true,
      tefcaCspPromptForce: true,
    });
    expect(params.get('tefca-csp-prompt-force')).toBe('true');
  });

  it('includes event-types', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      eventTypes: 'search.query,patient.connection_success',
    });
    expect(params.get('event-types')).toBe('search.query,patient.connection_success');
  });

  it('includes static-backdrop when true', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      staticBackdrop: true,
    });
    expect(params.get('static-backdrop')).toBe('true');
  });

  it('does not include static-backdrop when false', async () => {
    const params = await getIframeSrcParams({
      publicId: 'pub-1',
      staticBackdrop: false,
    });
    expect(params.get('static-backdrop')).toBeNull();
  });

  it('does not include optional params when not provided', async () => {
    const params = await getIframeSrcParams({ publicId: 'pub-1' });
    expect(params.get('external-id')).toBeNull();
    expect(params.get('connect-mode')).toBeNull();
    expect(params.get('reconnect-org-connection-id')).toBeNull();
    expect(params.get('brand-id')).toBeNull();
    expect(params.get('portal-id')).toBeNull();
    expect(params.get('endpoint-id')).toBeNull();
    expect(params.get('event-types')).toBeNull();
    expect(params.get('static-backdrop')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// postMessage handling
// ---------------------------------------------------------------------------

describe('FastenStitchElement — postMessage', () => {
  it('calls onEventBus when a postMessage is received from the iframe', async () => {
    const onEventBus = vi.fn();
    const ref = React.createRef<FastenStitchElementHandle>();

    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
        onEventBus={onEventBus}
      />,
    );

    // Open the modal so the iframe has a src
    act(() => ref.current!.show());

    const iframe = document.querySelector('iframe')!;

    // Simulate a postMessage from the iframe's contentWindow
    const payload = {
      event_type: EventTypes.EventTypeConnectionSuccess,
      data: { connection_id: '123' },
    };

    // We need to dispatch a message event with source = iframe.contentWindow
    // In jsdom, iframe.contentWindow may be null, so we mock it
    const fakeContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: fakeContentWindow,
      writable: true,
    });

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(payload),
      source: fakeContentWindow as Window,
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });

    expect(onEventBus).toHaveBeenCalledTimes(1);
    expect(onEventBus).toHaveBeenCalledWith(messageEvent);
  });

  it('auto-closes the dialog on EventTypeWidgetClose', async () => {
    const onEventBus = vi.fn();
    const ref = React.createRef<FastenStitchElementHandle>();

    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
        onEventBus={onEventBus}
      />,
    );

    act(() => ref.current!.show());

    const dialog = document.querySelector('dialog')!;
    const iframe = document.querySelector('iframe')!;

    expect(dialog.hasAttribute('open')).toBe(true);

    const fakeContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: fakeContentWindow,
      writable: true,
    });

    const payload = { event_type: EventTypes.EventTypeWidgetClose };
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(payload),
      source: fakeContentWindow as Window,
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });

    // Dialog should be closed
    expect(dialog.hasAttribute('open')).toBe(false);
    // onEventBus should NOT be called for widget.close (it returns early)
    expect(onEventBus).not.toHaveBeenCalled();
  });

  it('ignores messages not from the iframe', () => {
    const onEventBus = vi.fn();
    render(
      <FastenStitchElement
        publicId="test-id"
        environment="development"
        onEventBus={onEventBus}
      />,
    );

    const payload = { event_type: EventTypes.EventTypeConnectionSuccess };
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(payload),
      source: window, // from the parent window, not the iframe
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });

    expect(onEventBus).not.toHaveBeenCalled();
  });

  it('ignores non-JSON messages', () => {
    const onEventBus = vi.fn();
    const ref = React.createRef<FastenStitchElementHandle>();

    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
        onEventBus={onEventBus}
      />,
    );

    act(() => ref.current!.show());

    const iframe = document.querySelector('iframe')!;
    const fakeContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: fakeContentWindow,
      writable: true,
    });

    const messageEvent = new MessageEvent('message', {
      data: 'not-json',
      source: fakeContentWindow as Window,
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });

    // Should not throw and should not call onEventBus
    expect(onEventBus).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Backdrop click
// ---------------------------------------------------------------------------

describe('FastenStitchElement — backdrop click', () => {
  it('closes the dialog when clicking outside (backdrop click)', async () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
      />,
    );

    act(() => ref.current!.show());

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);

    // Simulate a click outside the dialog bounds
    // We need to mock getBoundingClientRect
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 440,
      height: 600,
      bottom: 700,
      right: 540,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Click outside the dialog rect (e.g. at 0, 0)
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', {
          clientX: 0,
          clientY: 0,
          bubbles: true,
        }),
      );
    });

    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('does NOT close the dialog when staticBackdrop is true', async () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
        staticBackdrop={true}
      />,
    );

    act(() => ref.current!.show());

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);

    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 440,
      height: 600,
      bottom: 700,
      right: 540,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', {
          clientX: 0,
          clientY: 0,
          bubbles: true,
        }),
      );
    });

    // Should remain open
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('does NOT close the dialog when clicking inside its bounds', async () => {
    const ref = React.createRef<FastenStitchElementHandle>();
    render(
      <FastenStitchElement
        ref={ref}
        publicId="test-id"
        environment="development"
      />,
    );

    act(() => ref.current!.show());

    const dialog = document.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);

    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 440,
      height: 600,
      bottom: 700,
      right: 540,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Click inside the dialog rect
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', {
          clientX: 200,
          clientY: 300,
          bubbles: true,
        }),
      );
    });

    // Should remain open
    expect(dialog.hasAttribute('open')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Debug logging
// ---------------------------------------------------------------------------

describe('FastenStitchElement — debug logging', () => {
  it('logs debug messages in non-production environments', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <FastenStitchElement publicId="test-id" environment="development" />,
    );

    await user.click(screen.getByRole('button'));

    expect(debugSpy).toHaveBeenCalledWith(
      '[FastenStitchElement]',
      expect.stringContaining('showModal'),
      expect.any(Object),
    );

    debugSpy.mockRestore();
  });

  it('does NOT log debug messages in production', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <FastenStitchElement publicId="test-id" environment="production" />,
    );

    await user.click(screen.getByRole('button'));

    const fastenCalls = debugSpy.mock.calls.filter(
      (call) => call[0] === '[FastenStitchElement]',
    );
    expect(fastenCalls).toHaveLength(0);

    debugSpy.mockRestore();
  });
});
