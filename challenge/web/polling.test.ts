import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EVENTS_REFRESH_INTERVAL_MS } from './hooks/useEvents';
import { startPolling, type Visibility } from './polling';

const INTERVAL = 30_000;

// Stands in for `document.visibilityState` so tests can hide and show the tab.
function fakeVisibility(hidden = false) {
  let listener: (() => void) | null = null;
  const visibility: Visibility = {
    isHidden: () => hidden,
    onChange: (callback) => {
      listener = callback;
      return () => {
        listener = null;
      };
    },
  };
  return {
    visibility,
    hide() {
      hidden = true;
      listener?.();
    },
    show() {
      hidden = false;
      listener?.();
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function setup(load = vi.fn(async () => ['event'])) {
  const tab = fakeVisibility();
  const onData = vi.fn();
  const onError = vi.fn();
  const stop = startPolling({ load, intervalMs: INTERVAL, onData, onError, visibility: tab.visibility });
  return { load, onData, onError, stop, tab };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('events refresh', () => {
  it('refreshes every 30 seconds', () => {
    expect(EVENTS_REFRESH_INTERVAL_MS).toBe(30_000);
  });
});

describe('startPolling', () => {
  it('loads right away', async () => {
    const { load, onData } = setup();
    await vi.advanceTimersByTimeAsync(0);

    expect(load).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith(['event']);
  });

  it('loads again on every interval', async () => {
    const { load } = setup();
    await vi.advanceTimersByTimeAsync(0);

    await vi.advanceTimersByTimeAsync(INTERVAL);
    expect(load).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(INTERVAL);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('delivers each fresh result', async () => {
    let call = 0;
    const { onData } = setup(vi.fn(async () => [`v${++call}`]));

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(INTERVAL);

    expect(onData).toHaveBeenNthCalledWith(1, ['v1']);
    expect(onData).toHaveBeenNthCalledWith(2, ['v2']);
  });

  it('skips the interval while the tab is hidden', async () => {
    const { load, tab } = setup();
    await vi.advanceTimersByTimeAsync(0);

    tab.hide();
    await vi.advanceTimersByTimeAsync(INTERVAL * 3);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads right away when the tab becomes visible again', async () => {
    const { load, tab } = setup();
    await vi.advanceTimersByTimeAsync(0);
    tab.hide();
    await vi.advanceTimersByTimeAsync(INTERVAL);

    tab.show();
    await vi.advanceTimersByTimeAsync(0);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not load when the tab becomes hidden', async () => {
    const { load, tab } = setup();
    await vi.advanceTimersByTimeAsync(0);

    tab.hide();
    await vi.advanceTimersByTimeAsync(0);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('skips the interval while the previous load is still running', async () => {
    const slow = deferred<string[]>();
    const { load } = setup(vi.fn(() => slow.promise));
    await vi.advanceTimersByTimeAsync(0);

    await vi.advanceTimersByTimeAsync(INTERVAL);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reports a failed load and keeps polling', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('Request failed (500)'))
      .mockResolvedValue(['event']);
    const { onData, onError } = setup(load);

    await vi.advanceTimersByTimeAsync(0);
    expect(onError).toHaveBeenCalledWith(new Error('Request failed (500)'));
    expect(onData).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(INTERVAL);
    expect(onData).toHaveBeenCalledWith(['event']);
  });

  it('stops loading once stopped', async () => {
    const { load, stop, tab } = setup();
    await vi.advanceTimersByTimeAsync(0);

    stop();
    await vi.advanceTimersByTimeAsync(INTERVAL * 3);
    tab.hide();
    tab.show();
    await vi.advanceTimersByTimeAsync(0);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('ignores a response that arrives after stopping', async () => {
    const slow = deferred<string[]>();
    const { onData, stop } = setup(vi.fn(() => slow.promise));
    await vi.advanceTimersByTimeAsync(0);

    stop();
    slow.resolve(['stale']);
    await vi.advanceTimersByTimeAsync(0);

    expect(onData).not.toHaveBeenCalled();
  });
});
