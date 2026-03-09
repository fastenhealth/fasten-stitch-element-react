export enum ConnectMode {
  Redirect = 'redirect',
  Popup = 'popup',
  Websocket = 'websocket',
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
