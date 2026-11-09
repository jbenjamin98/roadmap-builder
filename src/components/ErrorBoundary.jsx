import { Component } from 'react';
import { readRawDraft } from '../data/persistence';
import { downloadText } from '../utils/download';

/** Last line of defence: a render crash must never trap or hide the user's data. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  handleDownload = () => {
    const raw = readRawDraft();
    if (raw) downloadText(raw, 'roadmap-draft-rescue.json');
  };

  render() {
    if (!this.state.error) return this.props.children;
    const hasDraft = Boolean(readRawDraft());
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The app hit an unexpected error. Your saved draft has not been touched.
            {hasDraft ? ' Download a copy before doing anything else if you can.' : ''}
          </p>
          <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-slate-100 p-2 text-[11px] text-rose-700 dark:bg-slate-800 dark:text-rose-300">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Reload
            </button>
            {hasDraft && (
              <button
                type="button"
                onClick={this.handleDownload}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Download my data
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
