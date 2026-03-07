export enum ApiMode {
  Live = 'live',
  Test = 'test',
}

export enum WidgetMode {
  SearchOnly = 'search-only',
  Connect = 'connect',
  Tefca = 'tefca',
}

export enum ConnectionStatus {
  Authorized = 'authorized',
  Revoked = 'revoked',
}

export enum ConnectMode {
  Redirect = 'redirect',
  Popup = 'popup',
  Websocket = 'websocket',
}

export enum CspType {
  ClearCsp = 'clear_csp',
  IdmeCsp = 'idme_csp',
}

export enum SourceCredentialType {
  SourceCredentialTypeSmartOnFhir = 'smart_on_fhir',
  SourceCredentialTypeTefcaDirect = 'tefca_direct',
  SourceCredentialTypeTefcaFacilitated = 'tefca_facilitated',
}

export enum EventTypes {
  EventTypeWidgetConfigError = 'widget.config_error',
  EventTypeWidgetClose = 'widget.close',
  EventTypeWidgetComplete = 'widget.complete',

  EventTypeConnectionPending = 'patient.connection_pending',
  EventTypeConnectionSuccess = 'patient.connection_success',
  EventTypeConnectionFailed = 'patient.connection_failed',

  EventTypeSearchQuery = 'search.query',
}

export enum SDKMode {
  None = 'none',
  ReactNative = 'react-native',
}

export enum CommunicationEntity {
  PrimaryWebView = 'FASTEN_CONNECT_PRIMARY_WEBVIEW',
  ModalWebView = 'FASTEN_CONNECT_MODAL_WEBVIEW',
  ReactNativeComponent = 'FASTEN_CONNECT_REACT_WEBVIEW',
  External = 'FASTEN_CONNECT_EXTERNAL',
}

export const ConnectWindowTimeout = 20 * 60 * 1000; // 20 minutes
