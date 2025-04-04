import React, { useState, useRef, useEffect } from 'react';
import './AttendanceScreen.css';

const AttendanceScreen = () => {
  const [recognitionStatus, setRecognitionStatus] = useState('Vui lòng nhìn vào camera để điểm danh');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeInput, setActiveInput] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false); // Trạng thái nhận diện
  const [frameClass, setFrameClass] = useState(''); // Lớp CSS cho khung nhận diện
  const videoRef = useRef(null);

  // Âm thanh
  // const successSound = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
  // const failSound = new Audio('https://www.soundjay.com/buttons/beep-02.mp3');

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

    // Giả lập nhận diện khuôn mặt
    const recognitionTimeout = setTimeout(() => {
      setIsRecognizing(true); // Hiển thị spinner
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          setRecognitionStatus(`Điểm danh thành công! Chào Tâm Anh Solutions - ${new Date().toLocaleString()}`);
          setFrameClass('success'); // Khung xanh đậm
          // successSound.play(); // Phát âm thanh thành công
        } else {
          setRecognitionStatus('Không nhận diện được, vui lòng thử lại');
          setFrameClass('fail'); // Khung đỏ
          // failSound.play(); // Phát âm thanh thất bại
        }
        setIsRecognizing(false); // Tắt spinner
        // Reset khung sau 1 giây
        setTimeout(() => setFrameClass(''), 1000);
      }, 2000);
    }, 2000);

    return () => clearTimeout(recognitionTimeout);
  }, []);

  const handleRetry = () => {
    setRecognitionStatus('Vui lòng nhìn vào camera để điểm danh');
    setIsRecognizing(true);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        setRecognitionStatus(`Điểm danh thành công! Chào Nguyễn Văn A - ${new Date().toLocaleString()}`);
        setFrameClass('success');
        // successSound.play();
      } else {
        setRecognitionStatus('Không nhận diện được, vui lòng thử lại');
        setFrameClass('fail');
        // failSound.play();
      }
      setIsRecognizing(false);
      setTimeout(() => setFrameClass(''), 1000);
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

  const handleKeyPress = (key) => {
    if (activeInput === 'username') {
      if (key === 'Backspace') {
        setUsername(username.slice(0, -1));
      } else if (key === 'Space') {
        setUsername(username + ' ');
      } else {
        setUsername(username + key);
      }
    } else if (activeInput === 'password') {
      if (key === 'Backspace') {
        setPassword(password.slice(0, -1));
      } else if (key === 'Space') {
        setPassword(password + ' ');
      } else {
        setPassword(password + key);
      }
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.className === 'login-modal') {
      setIsLoginModalOpen(false);
      setActiveInput(null);
    }
  };

  const VirtualKeyboard = () => {
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Space', 'Backspace']
    ];

    return (
      <div className="virtual-keyboard">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`keyboard-key ${key === 'Backspace' || key === 'Space' ? 'special-key' : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'Backspace' ? '⌫' : key === 'Space' ? '␣' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="attendance-container">
      <div className="camera-section">
        <video ref={videoRef} autoPlay playsInline className="camera-feed" />
        <div className={`recognition-frame ${frameClass}`}>
          {isRecognizing && <div className="spinner"></div>}
        </div>
      </div>
      <div className="status-section">
        <p>{recognitionStatus}</p>
      </div>
      <div className="support-buttons">
        <button className="retry-btn" onClick={handleRetry}>Thử lại</button>
        <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>Đăng nhập bằng tài khoản</button>
        <button className="contact-btn">Liên hệ quản lý</button>
      </div>
      {isLoginModalOpen && (
        <div className="login-modal" onClick={handleCloseModal}>
          <div className="modal-content">
            <h3>Đăng nhập bằng tài khoản</h3>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Tài khoản:</label>
                <input
                  type="text"
                  value={username}
                  onFocus={() => setActiveInput('username')}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu:</label>
                <input
                  type="password"
                  value={password}
                  onFocus={() => setActiveInput('password')}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Đăng nhập</button>
            </form>
            {activeInput && <VirtualKeyboard />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;