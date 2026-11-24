'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { JourneyFormDialog, type FormRequest } from './JourneyFormDialog';

/**
 * The journey page's forms, opened as pop-ups (Ishika's notes of 9 Nov, items
 * 17-21): an enquiry ("Make an enquiry"), and two booking requests, one for the
 * group journey ("Book this journey") and one for the same trip as a private
 * journey ("Book as a private journey").
 *
 * The page wraps its content in `JourneyFormsProvider` with the journey, and
 * places `OpenJourneyForm` buttons wherever a form should open; a component of
 * its own can open one with `useJourneyForms()`. The provider holds a single
 * dialog (JourneyFormDialog), which is added to the page the first time a
 * form is opened and then kept, so what was typed is still there when it opens
 * again. Each form sends to /api/enquiry with the journey, the type and the
 * page it came from.
 */
export type JourneyFormKind = 'enquiry' | 'group' | 'private';

export type JourneyRef = {
  slug: string;
  title: string;
  /** The journey's departures, when it has any, for the booking forms' date choice. */
  departures?: { value: string; label: string }[];
};

type FormsApi = { open: (kind: JourneyFormKind, opts?: { departure?: string }) => void };

const FormsContext = createContext<FormsApi | null>(null);

export function JourneyFormsProvider({
  journey,
  children,
}: {
  journey: JourneyRef;
  children: ReactNode;
}) {
  const [request, setRequest] = useState<FormRequest | null>(null);
  const [open, setOpen] = useState(false);
  /** The control that opened the form; focus goes back to it when the dialog closes. */
  const opener = useRef<HTMLElement | null>(null);

  const openForm = useCallback<FormsApi['open']>((kind, opts) => {
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setRequest((last) => ({ kind, departure: opts?.departure, n: (last?.n ?? 0) + 1 }));
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const api = useMemo<FormsApi>(() => ({ open: openForm }), [openForm]);

  return (
    <FormsContext.Provider value={api}>
      {children}
      {request && (
        <JourneyFormDialog
          journey={journey}
          request={request}
          open={open}
          onClose={close}
          returnFocus={opener}
        />
      )}
    </FormsContext.Provider>
  );
}

export function useJourneyForms(): FormsApi | null {
  return useContext(FormsContext);
}

/**
 * A button that opens one of the journey's forms; it must sit inside
 * JourneyFormsProvider. Outside one it goes to the plan page's form instead.
 */
export function OpenJourneyForm({
  kind,
  departure,
  className,
  children,
}: {
  kind: JourneyFormKind;
  departure?: string;
  className?: string;
  children: ReactNode;
}) {
  const forms = useJourneyForms();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={(event) => {
        if (!forms) {
          window.location.assign('/plan#contact');
          return;
        }
        // Safari does not focus a button it clicks; focus has to be here to
        // come back here when the dialog closes.
        event.currentTarget.focus({ preventScroll: true });
        forms.open(kind, departure ? { departure } : undefined);
      }}
    >
      {children}
    </button>
  );
}
