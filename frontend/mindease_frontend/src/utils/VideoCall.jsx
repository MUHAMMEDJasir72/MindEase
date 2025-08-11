import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { markAsAttended } from '../api/user';
import { routerBaseUrl } from '../api/axiosInstance';

const VideoCall = () => {
  const { roomName, type } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'voice'); // video off if voice call

  const current_role = localStorage.getItem('current_role')

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const markSessionAttend = async () => {
          const info = await markAsAttended(roomName,current_role);
          if (info.success) {
            console.log('marked as attended')
          } else {
            console.log('Failed to load therapist information.');
          }
        };
   

  useEffect(() => {
    socketRef.current = new W3CWebSocket(
      `${routerBaseUrl}ws/call/${roomName}/`
    );

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
      startCall();
    };

     markSessionAttend()

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [roomName]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'voice' ? false : true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      pcRef.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.send(
            JSON.stringify({
              type: 'candidate',
              data: event.candidate,
            })
          );
        }
      };

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socketRef.current.send(
        JSON.stringify({
          type: 'offer',
          data: offer,
        })
      );

      socketRef.current.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        if (!pcRef.current) return;

        switch (data.type) {
          case 'offer':
            if (!isCallStarted) {
              await handleOffer(data.data);
            }
            break;
          case 'answer':
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.data)
            );
            break;
          case 'candidate':
            try {
              await pcRef.current.addIceCandidate(
                new RTCIceCandidate(data.data)
              );
            } catch (e) {
              console.error('Error adding ICE candidate', e);
            }
            break;
          case 'leave':
            // Remote peer left the call
            cleanupAndRedirect();
            break;
          default:
            break;
        }
      };

      setIsCallStarted(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'voice' ? false : true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      pcRef.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.send(
            JSON.stringify({
              type: 'candidate',
              data: event.candidate,
            })
          );
        }
      };

      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socketRef.current.send(
        JSON.stringify({
          type: 'answer',
          data: answer,
        })
      );

      setIsCallStarted(true);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const toggleMute = () => {
    const stream = localVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);
  };

  const cleanupAndRedirect = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCallStarted(false);
    if (current_role === 'user'){
        navigate('/appointments')
    }else if (current_role === 'therapist'){
        navigate('/therapistAppointments')
    }else{
      navigate('/')
    }
  };

  const endCall = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave' }));
    }
    cleanupAndRedirect();
  };

  return (
    <div style={styles.container}>
      <div style={styles.videoGrid}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={styles.localVideo}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.remoteVideo}
        />
      </div>

      <div style={styles.controls}>
        {isCallStarted && (
          <>
            <button onClick={toggleMute} style={styles.controlButton}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {/* Hide video toggle button if it's a voice-only call */}
            {type !== 'voice' && (
              <button onClick={toggleVideo} style={styles.controlButton}>
                {isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              </button>
            )}

            <button onClick={endCall} style={styles.endButton}>
              End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '10px',
    flexGrow: 1,
    padding: '10px',
    backgroundColor: '#333',
  },
  localVideo: {
    width: '100%',
    maxWidth: '300px',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    backgroundColor: '#000',
    transform: 'scaleX(-1)',
    marginLeft: '10%',
  },
  remoteVideo: {
    width: '100%',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    backgroundColor: '#000',
    marginLeft: '-40%', // adjust as you like
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    gap: '15px',
    backgroundColor: '#f5f5f5',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  },
  controlButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    transition: 'all 0.3s ease',
  },
  endButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    transition: 'all 0.3s ease',
  },
};

export default VideoCall;
