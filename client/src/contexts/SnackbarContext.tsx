import type { ReactNode, SyntheticEvent } from 'react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

interface SnackbarMessage {
  key: number;
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbar = (): SnackbarContextValue => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return ctx;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const counterRef = useRef(0);
  const queueRef = useRef<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrent(next);
      setOpen(true);
    }
  }, []);

  const enqueue = useCallback(
    (message: string, severity: SnackbarSeverity) => {
      counterRef.current += 1;
      queueRef.current.push({ key: counterRef.current, message, severity });
      if (!open) {
        processQueue();
      }
    },
    [open, processQueue]
  );

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrent(null);
    processQueue();
  };

  const value = useMemo<SnackbarContextValue>(
    () => ({
      showSuccess: (message: string) => enqueue(message, 'success'),
      showInfo: (message: string) => enqueue(message, 'info'),
      showWarning: (message: string) => enqueue(message, 'warning'),
      showError: (message: string) => enqueue(message, 'error'),
    }),
    [enqueue]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {current ? (
          <Alert onClose={handleClose} severity={current.severity} variant="filled" sx={{ width: '100%' }}>
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
