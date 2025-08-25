import React, { useEffect, useState } from 'react';
import TherapistSidebar from '../../components/Therapist/TherapistSidebar';
import AdminTherapistChat from '../../components/Therapist/AdminTherapistChat';
import { getAdmin } from '../../api/therapist';
import { Box, CircularProgress, Typography } from '@mui/material';
import TherapistNotification from '../../components/Therapist/TherapistNotifications';
import { getMYInfo } from '../../api/user';

function ChatToAdmin() {
  const [admin, setAdmin] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchMyInfo = async () => {
    const res = await getMYInfo();
    if (res?.status === 200) {
      setTherapist(res.data.id)
      setRole(res.data.current_role)
    }
  }
    const fetchAdmin = async () => {
      const res = await getAdmin();
      if (res.success) {
        setAdmin(res.data.id);
      }
    };
    fetchMyInfo()
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
        <div className='fixed right-4 md:right-10 top-4 md:top-8 z-50'>
        <TherapistNotification /> 
      </div>
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