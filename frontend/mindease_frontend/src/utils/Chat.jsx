import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getTherapistInfo, getUserInfo } from '../api/therapist';
import { basicUrl, routerBaseUrl } from '../api/axiosInstance';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [therapist, setTherapist] = useState({});
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { userId, therapistId } = useParams();
  const roomName = `${userId}-${therapistId}`;
  const role = localStorage.getItem('current_role');

  // Role-based sender/receiver logic
  const sender = role === 'therapist' ? therapistId : userId;
  const receiver = role === 'therapist' ? userId : therapistId;

  // Format time for messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const msgDate = new Date(timestamp);
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message groups
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return 'Today';
    
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch all messages between user and therapist
    setIsLoading(true);

    const fetchTherapistInfo = async () => {
      const info = await getTherapistInfo(therapistId);
      if (info.success) {
        setTherapist(info.data);
      } else {
        console.log('Failed to load therapist information.');
      }
    };
    
    const fetchUserInfo = async () => {
      const info = await getUserInfo(userId);
      if (info.success) {
        setUser(info.data);
      } else {
        console.log('Failed to load user information.');
      }
    };
    
    fetchUserInfo();
    fetchTherapistInfo();

    const current_role = localStorage.getItem('current_role');

    const url = current_role === 'therapist'
      ? `${basicUrl}api/users/chat/conversation/${therapistId}/${userId}/`
      : `${basicUrl}api/users/chat/conversation/${userId}/${therapistId}/`;

    axios
      .get(url)
      .then((res) => {
        setMessages(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
        setIsLoading(false);
      });

    // Set up WebSocket
    socketRef.current = new WebSocket(`${routerBaseUrl}wss/chat/${roomName}/`);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      
      // If message is from the other person, clear typing indicator
      if (data.sender.toString() !== sender.toString()) {
        setIsTyping(false);
      }
    };

    socketRef.current.onerror = () => {
      setIsConnected(false);
      setError('Connection error. Messages may not be delivered.');
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [userId, therapistId, roomName, sender]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();

    if ((!message.trim() && !previewFile) || !isConnected) return;

    if (previewFile) {
      // Handle file upload
      uploadFile();
    } else {
      // Send text message
      socketRef.current.send(
        JSON.stringify({
          message: message.trim(),
          sender,
          receiver
        })
      );
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const uploadFile = async () => {
    if (!previewFile) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', previewFile.file);
    formData.append('sender', sender);
    formData.append('receiver', receiver);
    
    try {
      const response = await axios.post(
        `${basicUrl}api/users/chat/upload-media/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Send message with media reference through WebSocket
      socketRef.current.send(
        JSON.stringify({
          message: message.trim(),
          media: response.data.media_url,
          media_type: response.data.media_type,
          sender,
          receiver
        })
      );
      
      setMessage('');
      setPreviewFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum 10MB allowed.');
      return;
    }

    // Create preview based on file type
    const fileType = file.type.split('/')[0];
    let previewUrl = '';

    if (fileType === 'image') {
      previewUrl = URL.createObjectURL(file);
    } else if (fileType === 'video') {
      previewUrl = URL.createObjectURL(file);
    }

    setPreviewFile({
      file,
      previewUrl,
      type: fileType,
      name: file.name
    });
  };

  const removePreview = () => {
    if (previewFile?.previewUrl) {
      URL.revokeObjectURL(previewFile.previewUrl);
    }
    setPreviewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLeaveChat = () => {
    socketRef.current?.close();
    if(role === 'therapist'){
       navigate('/therapistAppointments');
    }else{
      navigate('/appointments');
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = msg.timestamp ? formatMessageDate(msg.timestamp) : 'Today';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const renderMediaMessage = (msg) => {
    if (!msg.media) return null;

    switch (msg.media_type) {
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img 
              src={`http://localhost:8000${msg.media.replace('/media/media/', '/media/')}`}  
              alt="Sent image" 
              className="max-w-full max-h-64 object-contain rounded-lg"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 rounded-lg overflow-hidden">
            <video controls className="max-w-full max-h-64 rounded-lg">
              <source src={`${import.meta.env.VITE_BASE_URL}${msg.media.replace('/media/media/', '/media/')}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'document':
        return (
          <div className="mt-2 p-3 bg-white bg-opacity-20 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{msg.media.split('/').pop()}</p>
              <a 
                href={`http://localhost:8000${msg.media.replace('/media/media/', '/media/')}`} 
                download
                className="text-xs text-blue-400 hover:text-blue-600"
              >
                Download
              </a>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-2 p-3 bg-white bg-opacity-20 rounded-lg">
            <a 
              href={`http://localhost:8000${msg.media.replace('/media/media/', '/media/')}`} 
              download
              className="text-blue-400 hover:text-blue-600"
            >
              Download file
            </a>
          </div>
        );
    }
  };

  const groupedMessages = groupMessagesByDate(messages);
  console.log('mmmm',messages)

  return (
    <div className="max-w-4xl mx-auto rounded-lg shadow-xl h-[85vh] flex flex-col bg-slate-50 border border-slate-200">
      {/* Header */}
      <div className="w-full bg-slate-800 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 flex-shrink-0 border-2 border-teal-400 shadow-md">
            {therapist.profile_image && role === 'user' ? (
              <img 
                className="h-full w-full object-cover" 
                src={`${import.meta.env.VITE_BASE_URL}${therapist.profile_image}`}
                alt={therapist.fullname || "Therapist"}
              />
            ) : user.profile_image && role === 'therapist' ? (
              <img 
                className="h-full w-full object-cover" 
                src={`${import.meta.env.VITE_BASE_URL}${user.profile_image}`}
                alt={user.fullname || "User"}
              />
            ) : (
              <div className="h-full w-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
                {role === 'user' 
                  ? therapist.fullname?.charAt(0) || "T" 
                  : user.username?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          <div className="ml-4">
            <h1 className="font-semibold text-lg">
              {role === 'user' 
                ? therapist.fullname || therapist.username 
                : user.fullname || user.username}
            </h1>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 text-red-300 hover:text-red-500 hover:bg-slate-700 rounded-md transition"
            onClick={() => setLeaveConfirmOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Leave confirmation modal */}
      {leaveConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Leave Conversation</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to leave this conversation? You can always return later.</p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
                onClick={() => setLeaveConfirmOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={handleLeaveChat}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 pt-4 pb-2 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg shadow-sm text-center border border-red-200 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center space-y-2">
              <div className="rounded-full bg-slate-300 h-12 w-12"></div>
              <div className="h-4 bg-slate-300 rounded w-24"></div>
              <div className="h-2 bg-slate-300 rounded w-16"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation with {role === 'user' ? therapist.fullname : user.fullname}</p>
          </div>
        ) : (
          Object.keys(groupedMessages).map((date) => (
            <div key={date} className="space-y-4">
              <div className="text-center">
                <span className="px-4 py-1 bg-slate-200 rounded-full text-xs font-medium text-slate-600">
                  {date}
                </span>
              </div>
              
              {groupedMessages[date].map((msg, idx) => {
                const isSender = msg.sender.toString() === sender.toString();
                
                return (
                  <div
                    key={idx}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'} ${
                      idx > 0 && groupedMessages[date][idx - 1]?.sender.toString() === msg.sender.toString() 
                        ? 'mt-1' 
                        : 'mt-4'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[75%] ${
                        isSender
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-slate-800 border border-slate-200'
                      } ${
                        (idx < groupedMessages[date].length - 1 && 
                        groupedMessages[date][idx + 1]?.sender.toString() === msg.sender.toString())
                          ? isSender ? 'rounded-br-sm' : 'rounded-bl-sm'
                          : ''
                      }`}
                    >
                      {msg.text || msg.message ? (
                        <p className="whitespace-pre-wrap">{msg.text || msg.message}</p>
                      ) : null}
                      {msg.media && renderMediaMessage(msg)}
                      <div className={`text-right mt-1 ${
                        isSender ? 'text-teal-200' : 'text-slate-400'
                      } text-xs`}>
                        {formatMessageTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 bg-slate-100 border-t border-slate-200 rounded-b-lg">
        {/* File preview */}
        {previewFile && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200 relative">
            <button 
              onClick={removePreview}
              className="absolute top-2 right-2 p-1 bg-slate-200 rounded-full hover:bg-slate-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {previewFile.type === 'image' ? (
              <img 
                src={previewFile.previewUrl} 
                alt="Preview" 
                className="max-h-40 max-w-full rounded-md"
              />
            ) : previewFile.type === 'video' ? (
              <video 
                src={previewFile.previewUrl} 
                controls 
                className="max-h-40 max-w-full rounded-md"
              />
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="ml-2 text-sm font-medium truncate max-w-xs">{previewFile.name}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <div className="relative">
            <button 
              type="button"
              className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-200 rounded-full transition"
              onClick={() => fileInputRef.current.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*, video/*, .pdf, .doc, .docx, .txt"
            />
          </div>
          
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 pr-10 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected || uploading}
            />
            
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={uploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-xl border border-slate-200 w-64 h-36 flex flex-wrap gap-1 content-start overflow-y-auto">
                {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-xl hover:bg-slate-100 p-1 rounded"
                    onClick={() => setMessage(prev => prev + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className={`p-3 rounded-full ${
              isConnected && (message.trim() || previewFile) && !uploading
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            } transition-all`}
            disabled={!isConnected || (!message.trim() && !previewFile) || uploading}
          >
            {uploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;