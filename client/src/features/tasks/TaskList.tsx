import { Box, Button, CircularProgress, Container, Grid, Paper, Alert, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGetTasksQuery } from '../../api/tasksApi';
import { Task } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  onCreate: () => void;
  onEdit: (task: Task) => void;
}

const TaskList = ({ onCreate, onEdit }: TaskListProps) => {
  const { data: tasks = [], isLoading, isFetching, error } = useGetTasksQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" disableGutters>
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load tasks. Please try again.
        </Alert>
      ) : null}

      {tasks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first task to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
            Create task
          </Button>
        </Paper>
      ) : (
        <>
          {isFetching ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Refreshing…
            </Typography>
          ) : null}
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <TaskItem task={task} onEdit={onEdit} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default TaskList;
