import React, { useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import AdminTherapistChat from '../../components/Therapist/AdminTherapistChat';
import { getAdmin } from '../../api/therapist';
import { Box, CircularProgress, Typography } from '@mui/material';

function ChatToAdmin() {
  const [admin, setAdmin] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [roomName, setRoomName] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) setTherapist(id);

    const fetchAdmin = async () => {
      const res = await getAdmin();
      if (res.success) {
        setAdmin(res.data.id);
      }
    };

    fetchAdmin();
  }, []);

  useEffect(() => {
    if (admin && therapist) {
      setRoomName(`${admin}-${therapist}`);
    }
  }, [admin, therapist]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar - fixed width */}
      <Box sx={{ 
        width: '220px',
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <TherapistSidebar />
      </Box>

      {/* Main content - offset by sidebar width */}
      <Box sx={{ 
        flexGrow: 1,
        p: 3,
        ml: '220px', // Matches sidebar width
        width: 'calc(100% - 220px)',
        backgroundColor: '#f5f7fb',
        minHeight: '100vh'
      }}>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          color: '#3f51b5', 
          fontWeight: 'medium',
          position: 'sticky',
          top: 0,
          backgroundColor: '#f5f7fb',
          zIndex: 10,
          pt: 2,
          pb: 2
        }}>
          Support Chat
        </Typography>
        
        {roomName && admin && therapist ? (
          <AdminTherapistChat roomName={roomName} sender={therapist} receiver={admin} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh' 
          }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ChatToAdmin;