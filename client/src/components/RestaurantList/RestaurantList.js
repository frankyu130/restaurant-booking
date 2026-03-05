import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import RestaurantCard from '../RestaurantCard/RestaurantCard';
import api from '../../services/api';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await api.deployWorker();
      setPublishResult(result);
    } catch (err) {
      setPublishResult({ success: false, error: err.message });
    } finally {
      setPublishing(false);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await api.getRestaurants();
        setRestaurants(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading restaurants...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Available Restaurants
        </Typography>
        {process.env.REACT_APP_SHOW_PUBLISH === 'true' && (
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={publishing}
            startIcon={publishing ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              px: 3,
              py: 1,
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#4f46e5' },
              '&:disabled': { backgroundColor: '#a5b4fc', color: 'white' },
            }}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
            <RestaurantCard restaurant={restaurant} />
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={publishResult?.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {publishResult?.success
            ? <span>{publishResult.message}{publishResult.workerUrl && <> — <a href={publishResult.workerUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{publishResult.workerUrl}</a></>}</span>
            : `Deploy failed: ${publishResult?.error}`}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RestaurantList; 