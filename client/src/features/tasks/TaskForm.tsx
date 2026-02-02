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

const TaskForm = ({ open, task, isLoading = false, errorMessage, onClose, onSubmit }: TaskFormProps) => {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setStatus(task?.status ?? 'todo');
    setTitleError(null);
    setDescriptionError(null);
  }, [open, task]);

  const validate = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

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

    return ok;
  };

  const payload = useMemo<CreateTaskDto | UpdateTaskDto>(() => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // Keep payload clean: omit empty description.
    const descriptionValue = trimmedDescription ? trimmedDescription : undefined;

    if (!isEdit) {
      return {
        title: trimmedTitle,
        description: descriptionValue,
        status,
      };
    }

    return {
      title: trimmedTitle,
      description: descriptionValue,
      status,
    };
  }, [description, isEdit, status, title]);

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
