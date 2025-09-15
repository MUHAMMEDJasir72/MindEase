import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { markAsAttended } from "../api/user";
import { routerBaseUrl } from "../api/axiosInstance";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";

const VideoCall = () => {
  const { role, roomName, type } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === "voice");
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const user = useSelector((state) => state.user.user);

  const servers = {
    iceServers: [
      { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
    ],
    iceCandidatePoolSize: 10,
  };

  const markSessionAttend = async () => {
    const info = await markAsAttended(roomName, role);
    if (info.success) console.log("marked as attended");
  };

  useEffect(() => {
    socketRef.current = new W3CWebSocket(`${routerBaseUrl}ws/call/${roomName}/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket Connected");
      startCall();
    };

    markSessionAttend();

    socketRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (pcRef.current) pcRef.current.close();
    };
  }, [roomName]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "voice" ? false : true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      pcRef.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsRemoteConnected(true);
      };

      // 👇 detect when remote peer leaves
      pcRef.current.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pcRef.current.connectionState)) {
          console.log("Remote peer disconnected");
          setIsRemoteConnected(false);
          remoteVideoRef.current.srcObject = null;
        }
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.send(JSON.stringify({ type: "candidate", data: event.candidate }));
        }
      };

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socketRef.current.send(JSON.stringify({ type: "offer", data: offer }));

      socketRef.current.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        if (!pcRef.current) return;

        switch (data.type) {
          case "offer":
            if (!isCallStarted) await handleOffer(data.data);
            break;
          case "answer":
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.data));
            break;
          case "candidate":
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(data.data));
            } catch (e) {
              console.error("Error adding ICE candidate", e);
            }
            break;
          case "leave":
            setIsRemoteConnected(false); // 👈 reset waiting overlay
            remoteVideoRef.current.srcObject = null;
            break;
          default:
            break;
        }
      };

      setIsCallStarted(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "voice" ? false : true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      pcRef.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsRemoteConnected(true);
      };

      pcRef.current.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pcRef.current.connectionState)) {
          console.log("Remote peer disconnected");
          setIsRemoteConnected(false);
          remoteVideoRef.current.srcObject = null;
        }
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.send(JSON.stringify({ type: "candidate", data: event.candidate }));
        }
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socketRef.current.send(JSON.stringify({ type: "answer", data: answer }));

      setIsCallStarted(true);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const toggleMute = () => {
    const stream = localVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => (track.enabled = !track.enabled));
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
    setIsRemoteConnected(false);
    remoteVideoRef.current.srcObject = null;

    if (user.current_role === "user") navigate("/appointments");
    else if (user.current_role === "therapist") navigate("/therapistAppointments");
    else navigate("/");
    // navigate(`/${role}`)
  };

  const endCall = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "leave" }));
    }
    cleanupAndRedirect();
  };

  return (
    <div style={styles.container}>
      {/* Remote Video */}
      <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />

      {/* Local Video */}
      <video ref={localVideoRef} autoPlay muted playsInline style={styles.localVideo} />

      {/* Waiting Screen */}
      {!isRemoteConnected && (
        <div style={styles.waitingOverlay}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: "15px", fontSize: "18px", color: "#fff" }}>
            Waiting for other participant to join...
          </p>
        </div>
      )}

      {/* Controls */}
      {isCallStarted && (
        <div style={styles.controls}>
          <button onClick={toggleMute} style={styles.controlButton}>
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {type !== "voice" && (
            <button onClick={toggleVideo} style={styles.controlButton}>
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
          )}

          <button onClick={endCall} style={{ ...styles.controlButton, ...styles.endButton }}>
            <PhoneOff size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100vh",
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
  },
  localVideo: {
    position: "absolute",
    bottom: "100px",
    right: "20px",
    width: "200px",
    height: "150px",
    objectFit: "cover",
    border: "2px solid white",
    borderRadius: "8px",
    backgroundColor: "#000",
    transform: "scaleX(-1)",
  },
  controls: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "12px 20px",
    borderRadius: "40px",
  },
  controlButton: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "0.3s",
  },
  endButton: {
    backgroundColor: "#e53935",
  },
  waitingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
  styleSheet.cssRules.length
);

export default VideoCall;
