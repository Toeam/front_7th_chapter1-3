import { Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../types';

interface OverlapDialogProps {
  open: boolean;
  overlappingEvents: Event[];
  onClose: () => void;
  onProceed: () => void;
}

interface RecurringDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (editSingleOnly: boolean) => void;
  event: Event | null;
  mode: 'edit' | 'delete';
}

interface NotificationItem {
  message: string;
}

interface DialogsPanelProps {
  overlap: OverlapDialogProps;
  recurring: RecurringDialogProps;
  notifications: NotificationItem[];
  onDismissNotification: (index: number) => void;
}

const DialogsPanel = ({
  overlap,
  recurring,
  notifications,
  onDismissNotification,
}: DialogsPanelProps) => {
  return (
    <>
      <Dialog open={overlap.open} onClose={overlap.onClose}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
          {overlap.overlappingEvents.map((event) => (
            <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={overlap.onClose}>취소</Button>
          <Button color="error" onClick={overlap.onProceed}>계속 진행</Button>
        </DialogActions>
      </Dialog>

      <RecurringEventDialog
        open={recurring.open}
        onClose={recurring.onClose}
        onConfirm={recurring.onConfirm}
        event={recurring.event}
        mode={recurring.mode}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
              <IconButton size="small" onClick={() => onDismissNotification(index)}>
                <Close />
              </IconButton>
            }>
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </>
  );
};

export default DialogsPanel;
