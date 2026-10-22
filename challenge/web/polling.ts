// Whether the tab is hidden, and a way to hear when that changes.
// Injectable so polling can be tested without a browser.
export type Visibility = {
  isHidden: () => boolean;
  onChange: (listener: () => void) => () => void;
};

const documentVisibility: Visibility = {
  isHidden: () => document.hidden,
  onChange: (listener) => {
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  },
};

type Options<T> = {
  load: () => Promise<T>;
  intervalMs: number;
  onData: (data: T) => void;
  onError: (error: Error) => void;
  visibility?: Visibility;
};

// Loads right away, then every `intervalMs`. Skips while the tab is hidden or a
// previous load is still running, and loads as soon as the tab is visible again.
// Returns a function that stops polling and ignores any load still in flight.
export function startPolling<T>({
  load,
  intervalMs,
  onData,
  onError,
  visibility = documentVisibility,
}: Options<T>): () => void {
  let stopped = false;
  let inFlight = false;

  async function poll() {
    if (stopped || inFlight || visibility.isHidden()) return;
    inFlight = true;
    try {
      const data = await load();
      if (!stopped) onData(data);
    } catch (err) {
      if (!stopped) onError(err as Error);
    } finally {
      inFlight = false;
    }
  }

  poll();
  const timer = setInterval(poll, intervalMs);
  const unsubscribe = visibility.onChange(poll);

  return () => {
    stopped = true;
    clearInterval(timer);
    unsubscribe();
  };
}
