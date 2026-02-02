import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '../../types';
import { parseDateInputToUtcSeconds, utcSecondsToDateInputValue } from '../../utils/dates';

interface TaskFormProps {
  open: boolean;
  task?: Task;
  isLoading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => void;
}

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 9;

const TaskForm = ({ open, task, isLoading = false, errorMessage, onClose, onSubmit }: TaskFormProps) => {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priorityText, setPriorityText] = useState('');
  const [dueDateText, setDueDateText] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setStatus(task?.status ?? 'todo');
    setPriorityText(task?.priority !== undefined ? String(task.priority) : '');
    setDueDateText(utcSecondsToDateInputValue(task?.dueDate));
    setTitleError(null);
    setDescriptionError(null);
    setPriorityError(null);
    setDueDateError(null);
  }, [open, task]);

  const validate = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPriority = priorityText.trim();
    const trimmedDueDate = dueDateText.trim();

    let ok = true;
    if (!trimmedTitle) {
      setTitleError('Title is required');
      ok = false;
    } else if (trimmedTitle.length > MAX_TITLE) {
      setTitleError(`Title cannot exceed ${MAX_TITLE} characters`);
      ok = false;
    } else {
      setTitleError(null);
    }

    if (trimmedDescription.length > MAX_DESCRIPTION) {
      setDescriptionError(`Description cannot exceed ${MAX_DESCRIPTION} characters`);
      ok = false;
    } else {
      setDescriptionError(null);
    }

    if (!trimmedPriority) {
      setPriorityError(null);
    } else {
      const parsed = Number(trimmedPriority);
      if (!Number.isInteger(parsed)) {
        setPriorityError('Priority must be an integer');
        ok = false;
      } else if (parsed < MIN_PRIORITY || parsed > MAX_PRIORITY) {
        setPriorityError(`Priority must be between ${MIN_PRIORITY} and ${MAX_PRIORITY}`);
        ok = false;
      } else {
        setPriorityError(null);
      }
    }

    if (!trimmedDueDate) {
      setDueDateError(null);
    } else {
      const seconds = parseDateInputToUtcSeconds(trimmedDueDate);
      if (seconds === null) {
        setDueDateError('Due date must be a valid date');
        ok = false;
      } else {
        setDueDateError(null);
      }
    }

    return ok;
  };

  const payload = useMemo<CreateTaskDto | UpdateTaskDto>(() => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPriority = priorityText.trim();
    const trimmedDueDate = dueDateText.trim();

    // Keep payload clean: omit empty description.
    const descriptionValue = trimmedDescription ? trimmedDescription : undefined;

    const priorityValue = trimmedPriority ? Number(trimmedPriority) : null;
    const dueDateValue = trimmedDueDate ? parseDateInputToUtcSeconds(trimmedDueDate) : null;

    if (!isEdit) {
      return {
        title: trimmedTitle,
        description: descriptionValue,
        status,
        priority: Number.isFinite(priorityValue as number) ? (priorityValue as number) : null,
        dueDate: dueDateValue,
      };
    }

    return {
      title: trimmedTitle,
      description: descriptionValue,
      status,
      priority: Number.isFinite(priorityValue as number) ? (priorityValue as number) : null,
      dueDate: dueDateValue,
    };
  }, [description, dueDateText, isEdit, priorityText, status, title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <TextField
              label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              required
              fullWidth
              autoFocus
              error={Boolean(titleError)}
              helperText={titleError ?? `${title.length}/${MAX_TITLE}`}
              inputProps={{ maxLength: MAX_TITLE + 20 }}
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError(null);
              }}
              fullWidth
              multiline
              rows={4}
              error={Boolean(descriptionError)}
              helperText={descriptionError ?? `${description.length}/${MAX_DESCRIPTION}`}
            />

            <TextField
              label="Priority"
              value={priorityText}
              onChange={(e) => {
                setPriorityText(e.target.value);
                if (priorityError) setPriorityError(null);
              }}
              fullWidth
              type="number"
              error={Boolean(priorityError)}
              helperText={priorityError ?? `Optional. ${MIN_PRIORITY}–${MAX_PRIORITY}`}
              inputProps={{ min: MIN_PRIORITY, max: MAX_PRIORITY, step: 1 }}
            />

            <TextField
              label="Due date"
              value={dueDateText}
              onChange={(e) => {
                setDueDateText(e.target.value);
                if (dueDateError) setDueDateError(null);
              }}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              error={Boolean(dueDateError)}
              helperText={dueDateError ?? 'Optional. Stored in UTC; shown in your locale.'}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <MenuItem value="todo">To do</MenuItem>
                <MenuItem value="in-progress">In progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
