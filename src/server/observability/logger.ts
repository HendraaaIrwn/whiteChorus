import "server-only";

export type LogContext = {
  requestId: string;
  operation: string;
  outfitId?: string;
  result?: string;
  durationMs?: number;
  errorCode?: string;
  /**
   * Server-side only diagnostic detail (e.g. the underlying error message).
   * Never echoed back to the client — see route-response.ts.
   */
  detail?: string;
};

export function log(context: LogContext): void {
  console.info(
    JSON.stringify({ timestamp: new Date().toISOString(), ...context }),
  );
}
