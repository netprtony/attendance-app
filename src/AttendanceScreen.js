import React, { useState, useRef, useEffect } from 'react';
import './AttendanceScreen.css';

const AttendanceScreen = () => {
  const [recognitionStatus, setRecognitionStatus] = useState('Vui lòng nhìn vào camera để điểm danh');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Không thể truy cập camera:', error);
      }
    };
    startCamera();

    const recognitionTimeout = setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        setRecognitionStatus(`Điểm danh thành công! Chào Nguyễn Văn A - ${new Date().toLocaleString()}`);
      } else {
        setRecognitionStatus('Không nhận diện được, vui lòng thử lại');
      }
    }, 2000);

    return () => clearTimeout(recognitionTimeout);
  }, []);

  const handleRetry = () => {
    setRecognitionStatus('Vui lòng nhìn vào camera để điểm danh');
    setTimeout(() => {
      setRecognitionStatus(`Điểm danh thành công! Chào Nguyễn Văn A - ${new Date().toLocaleString()}`);
    }, 2000);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      setRecognitionStatus(`Đăng nhập thành công! Chào ${username} - ${new Date().toLocaleString()}`);
      setIsLoginModalOpen(false);
    } else {
      alert('Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="attendance-container">
      <div className="camera-section">
        <video ref={videoRef} autoPlay playsInline className="camera-feed" />
        <div className="recognition-frame"></div>
      </div>
      <div className="status-section">
        <p>{recognitionStatus}</p>
      </div>
      <div className="support-buttons">
        <button onClick={handleRetry}>Thử lại</button>
        <button onClick={() => setIsLoginModalOpen(true)}>Đăng nhập bằng tài khoản</button>
        <button>Liên hệ quản lý</button>
      </div>
      {isLoginModalOpen && (
        <div className="login-modal">
          <div className="modal-content">
            <h3>Đăng nhập bằng tài khoản</h3>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Tài khoản:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Đăng nhập</button>
              <button type="button" onClick={() => setIsLoginModalOpen(false)}>Đóng</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;