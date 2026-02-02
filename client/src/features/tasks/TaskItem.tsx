import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task, TaskStatus } from '../../types';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../../api/tasksApi';
import { ConfirmDialog } from '../../components';
import { useSnackbar } from '../../contexts';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const statusChipSx = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return {
        bgcolor: 'grey.200',
        color: 'text.primary',
      };
    case 'in-progress':
      return {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      };
    case 'done':
      return {
        bgcolor: 'success.main',
        color: 'success.contrastText',
      };
    default:
      return {};
  }
};

const statusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'To do';
    case 'in-progress':
      return 'In progress';
    case 'done':
      return 'Done';
    default:
      return status;
  }
};

const getApiErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  return anyErr?.data?.message || anyErr?.error || 'Something went wrong.';
};

const TaskItem = ({ task, onEdit }: TaskItemProps) => {
  const { showSuccess, showError } = useSnackbar();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const created = useMemo(() => {
    if (!task.createdAt) return null;
    return new Date(task.createdAt).toLocaleDateString();
  }, [task.createdAt]);

  const updated = useMemo(() => {
    if (!task.updatedAt) return null;
    return new Date(task.updatedAt).toLocaleDateString();
  }, [task.updatedAt]);

  const handleStatusChange = async (next: TaskStatus) => {
    try {
      await updateTask({ id: task.id, updates: { status: next } }).unwrap();
      showSuccess('Task updated');
    } catch (e) {
      showError(getApiErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      showSuccess('Task deleted');
      setConfirmOpen(false);
    } catch (e) {
      showError(getApiErrorMessage(e));
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Typography variant="h6" component="h2" sx={{ wordBreak: 'break-word' }}>
              {task.title}
            </Typography>
            <Chip label={statusLabel(task.status)} size="small" sx={statusChipSx(task.status)} />
          </Box>

          {task.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-word' }}>
              {task.description}
            </Typography>
          ) : null}

          {created || updated ? (
            <Box sx={{ mt: 2 }}>
              {created ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Created: {created}
                </Typography>
              ) : null}
              {updated ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Updated: {updated}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Box sx={{ mt: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                disabled={isUpdating || isDeleting}
              >
                <MenuItem value="todo">To do</MenuItem>
                <MenuItem value="in-progress">In progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => onEdit(task)}
              aria-label="edit"
              disabled={isDeleting}
              sx={{ color: 'warning.main' }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => setConfirmOpen(true)}
              aria-label="delete"
              disabled={isDeleting}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        isLoading={isDeleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TaskItem;
