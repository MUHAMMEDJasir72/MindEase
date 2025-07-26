import React, { useEffect, useState, useRef } from 'react';
import { getAdminTherapistChat } from '../../api/therapist';
import { 
  Box, 
  TextField, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Typography,
  Paper,
  Divider,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import { deepPurple, green } from '@mui/material/colors';
import { routerBaseUrl } from '../../api/axiosInstance';

function AdminTherapistChat({ roomName, sender, receiver }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    // Get current user ID from localStorage
    const userId = localStorage.getItem('id');
    if (userId) {
      setCurrentUser(String(userId)); // Ensure currentUser is always a string
    }
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!sender || !receiver) return;
        setIsLoading(true);
        
        const response = await getAdminTherapistChat(sender, receiver);
        if (response.success) {
          // Normalize message data to ensure consistent structure
          const normalizedMessages = response.data.map(msg => ({
            ...msg,
            sender: String(msg.sender),
            receiver: String(msg.receiver),
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          setMessages(normalizedMessages);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [sender, receiver]);

  useEffect(() => {
    if (!roomName) return;

    ws.current = new WebSocket(`${routerBaseUrl}wss/chatAdminTherapist/${roomName}/`);

   ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const normalizedMessage = {
        ...data,
        sender: String(data.sender),
        receiver: String(data.receiver),
        timestamp: data.timestamp || new Date().toISOString(), 
      };
      setMessages((prev) => [...prev, normalizedMessage]);
    };


    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (input.trim() && ws.current && sender && receiver) {
      const messageData = {
        sender: String(sender),
        receiver: String(receiver),
        message: input,
        timestamp: new Date().toISOString()
      };
      ws.current.send(JSON.stringify(messageData));
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log(roomName)

  return (
    <Box sx={{ 
      height: 'calc(100vh - 150px)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Paper elevation={3} sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Chat header */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}>
          <Typography variant="h6">Chat with {currentUser === String(sender) ? 'Therapist' : 'Admin'}</Typography>
        </Box>
        
        {/* Messages area */}
        <Box sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <List sx={{ pb: 0 }}>
            {messages.map((msg, idx) => {
              const isCurrentUser = String(msg.sender) === currentUser;
              return (
                <ListItem 
                  key={idx} 
                  sx={{ 
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    py: 1
                  }}
                >
                  {!isCurrentUser && (
                    <ListItemAvatar sx={{ minWidth: '40px' }}>
                      <Avatar sx={{ 
                        bgcolor: isCurrentUser ? green[500] : deepPurple[500], 
                        width: 32, 
                        height: 32 
                      }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  <Box sx={{ 
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                  }}>
                    <Paper elevation={1} sx={{ 
                      p: 1.5,
                      mb: 0.5,
                      backgroundColor: isCurrentUser ? '#e3f2fd' : 'white',
                      borderRadius: isCurrentUser 
                        ? '18px 18px 0 18px' 
                        : '18px 18px 18px 0'
                    }}>
                      <Typography variant="body1">{msg.message}</Typography>
                    </Paper>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                  {isCurrentUser && (
                    <ListItemAvatar sx={{ minWidth: '40px' }}>
                      <Avatar sx={{ 
                        bgcolor: green[500], 
                        ml: 1, 
                        width: 32, 
                        height: 32 
                      }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                  )}
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        
        {/* Input area */}
        <Divider />
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={sendMessage}
            disabled={!input.trim() || !sender || !receiver}
            sx={{ 
              height: '56px',
              width: '56px',
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabled
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminTherapistChat;