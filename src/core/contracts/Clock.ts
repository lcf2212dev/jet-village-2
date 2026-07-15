/** Time source in milliseconds. Injected so the GameLoop is testable without wall time. */
export interface Clock {
  now(): number;
}
