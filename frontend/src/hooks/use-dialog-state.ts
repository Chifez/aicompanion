import * as React from 'react';

export function useDialogState(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen);

  const openDialog = React.useCallback(() => setOpen(true), []);
  const closeDialog = React.useCallback(() => setOpen(false), []);
  const toggleDialog = React.useCallback(() => setOpen((prev) => !prev), []);

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}
