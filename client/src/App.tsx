import { useMemo, useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateTaskMutation, useUpdateTaskMutation } from './api/tasksApi';
import { TaskList, TaskForm } from './features/tasks';
import { CreateTaskDto, Task, UpdateTaskDto } from './types';
import { useSnackbar } from './contexts';

const getApiErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  if (anyErr?.data?.message) return String(anyErr.data.message);
  if (anyErr?.error) return String(anyErr.error);
  return 'Something went wrong.';
};

function App() {
  const { showSuccess, showError } = useSnackbar();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const [createTask, createState] = useCreateTaskMutation();
  const [updateTask, updateState] = useUpdateTaskMutation();

  const isSaving = createState.isLoading || updateState.isLoading;
  const isEdit = Boolean(editingTask);

  const currentError = useMemo(() => {
    return formError;
  }, [formError]);

  const openCreate = () => {
    setEditingTask(undefined);
    setFormError(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormError(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingTask(undefined);
    setFormError(undefined);
  };

  const handleSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    setFormError(undefined);
    try {
      if (!isEdit) {
        await createTask(data as CreateTaskDto).unwrap();
        showSuccess('Task created');
        setIsFormOpen(false);
        return;
      }

      await updateTask({ id: editingTask!.id, updates: data as UpdateTaskDto }).unwrap();
      showSuccess('Task updated');
      setIsFormOpen(false);
    } catch (e) {
      const msg = getApiErrorMessage(e);
      setFormError(msg);
      showError(msg);
      // Keep form open and keep data on error.
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                DoneAI
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage tasks with quick status updates.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="large">
              New task
            </Button>
          </Box>
        </Paper>

        <TaskList onCreate={openCreate} onEdit={openEdit} />

        <TaskForm
          open={isFormOpen}
          task={editingTask}
          isLoading={isSaving}
          errorMessage={currentError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

export default App;
