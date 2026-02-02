import { Box, Container, Typography, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            DoneAI
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Task Management Application
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Your project is set up and ready for development!
          </Typography>
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Backend API: <strong>http://localhost:5000/api</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Frontend: <strong>http://localhost:5173</strong>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
