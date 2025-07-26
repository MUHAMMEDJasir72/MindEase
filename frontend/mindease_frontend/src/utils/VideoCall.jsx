import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { markAsAttended } from '../api/user';

const VideoCall = () => {
  const { userId, roomId, type } = useParams();
  const containerRef = useRef(null);
  const zegoRef = useRef(null);
  const navigate = useNavigate();
  const currentRole = localStorage.getItem('current_role');

  const isAudioOnly = type === 'voice';

  useEffect(() => {
    const appID = 975541984;
    const serverSecret = '1439e416fa1e4134b6803e361f322770';

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      userId,
      userId
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `${window.location.origin}/video/${userId}/${roomId}/${type}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showPreJoinView: false,

      // ✅ Disable video features if audio only
      turnOnCameraWhenJoining: !isAudioOnly,
      defaultCameraOpen: !isAudioOnly,
      showCameraToggleButton: !isAudioOnly,
      showMyCameraToggleButton: !isAudioOnly,
      showScreenSharingButton: !isAudioOnly,   

      // ✅ Always allow microphone
      turnOnMicrophoneWhenJoining: true,
      showMicrophoneToggleButton: true,

      onLeaveRoom: () => {
        if (currentRole === 'user') {
          navigate('/appointments');
        } else {
          navigate('/therapistAppointments');
        }
      },
    });

    // ✅ Optional: Inject CSS to hide leftover camera UI (failsafe)
    let styleTag;
    if (isAudioOnly) {
      styleTag = document.createElement('style');
      styleTag.innerHTML = `
        .zego-camera-preview,
        .zego-camera-btn,
        .zego-control-bar .zego-btn-camera,
        .zego-control-bar .zego-btn-screen-sharing {
          display: none !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    const markSessionAttend = async () => {
          const current_role = localStorage.getItem('current_role')
          const info = await markAsAttended(roomId,current_role);
          if (info.success) {
            console.log('marked as attended')
          } else {
            console.log('Failed to load therapist information.');
          }
        };
    markSessionAttend()

    // ✅ Cleanup on unmount
    return () => {
      if (zegoRef.current) {
        zegoRef.current.destroy();
        zegoRef.current = null;
      }
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    };
  }, [userId, roomId, type, navigate, currentRole]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '730px' }}></div>
    </div>
  );
};

export default VideoCall;
