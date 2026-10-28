// Mocha re-emits unhandled rejections from user code on `process`, where they are silently dropped
// unless something listens. In PROD nothing listens either, so Node's default mode kills the pod.
export function trackUnhandledRejections() {
  const reasons: unknown[] = [];
  const listener = (reason: unknown) => reasons.push(reason);
  process.on("unhandledRejection", listener);

  return {
    reasons,
    // unhandledRejection fires after the microtask queue drains, so give it a turn of the event loop.
    settle: () => new Promise((resolve) => setImmediate(resolve)),
    stop: () => process.removeListener("unhandledRejection", listener)
  };
}
