import "server-only";

export type LogContext = {
  requestId: string;
  operation: string;
  outfitId?: string;
  result?: string;
  durationMs?: number;
  errorCode?: string;
};

export function log(context: LogContext): void {
  console.info(
    JSON.stringify({ timestamp: new Date().toISOString(), ...context }),
  );
}
