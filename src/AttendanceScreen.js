import React, { useState, useRef, useEffect } from 'react';
import './AttendanceScreen.css';

const AttendanceScreen = () => {
  const [recognitionStatus, setRecognitionStatus] = useState({
    message: 'Vui lòng nhìn vào camera để điểm danh',
    user: '',
    timestamp: ''
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [frameClass, setFrameClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlight, setHighlight] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // URL cơ bản của API backend
  const API_BASE_URL = 'http://192.168.1.10:5000/attendances'; // Thay bằng IP thực tế

  useEffect(() => {
    if (isLoginModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Không thể truy cập camera:', error);
        setRecognitionStatus({
          message: 'Không thể truy cập camera',
          user: '',
          timestamp: ''
        });
      }
    };
    startCamera();

    // Bắt đầu nhận diện khuôn mặt mỗi 3 giây
    const recognitionInterval = setInterval(() => {
      if (!isRecognizing && videoRef.current && canvasRef.current) {
        recognizeFace();
      }
    }, 3000);

    return () => clearInterval(recognitionInterval);
  }, []);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const recognizeFace = async () => {
    setIsRecognizing(true);
    setRecognitionStatus({
      message: 'Đang nhận diện khuôn mặt...',
      user: '',
      timestamp: ''
    });

    try {
      const imageDataUrl = captureFrame();
      if (!imageDataUrl) {
        throw new Error('Không thể chụp khung hình');
      }

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const recognizeResponse = await fetch(`${API_BASE_URL}/recognize_face`, {
        method: 'POST',
        body: formData,
      });

      const recognizeData = await recognizeResponse.json();

      if (recognizeResponse.ok) {
        const { employee_id, employee_name } = recognizeData;
        await recordAttendance(employee_id, employee_name, 'Nhận diện khuôn mặt');
      } else {
        setRecognitionStatus({
          message: recognizeData.error || 'Không nhận diện được khuôn mặt',
          user: '',
          timestamp: ''
        });
        setFrameClass('fail');
        setTimeout(() => setFrameClass(''), 1000);
      }
    } catch (error) {
      console.error('Lỗi khi nhận diện khuôn mặt:', error);
      setRecognitionStatus({
        message: 'Lỗi kết nối hoặc nhận diện thất bại',
        user: '',
        timestamp: ''
      });
      setFrameClass('fail');
      setTimeout(() => setFrameClass(''), 1000);
    } finally {
      setIsRecognizing(false);
    }
  };

  const recordAttendance = async (employeeId, employeeName, source) => {
    try {
      const response = await fetch(`${API_BASE_URL}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id: parseInt(employeeId) }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecognitionStatus({
          message: data.message || `Điểm danh thành công qua ${source}!`,
          user: employeeName || employeeId,
          timestamp: new Date().toLocaleString()
        });
        setFrameClass('success');
        setTimeout(() => setFrameClass(''), 1000);
      } else {
        setRecognitionStatus({
          message: data.error || 'Điểm danh thất bại',
          user: '',
          timestamp: ''
        });
        setFrameClass('fail');
        setTimeout(() => setFrameClass(''), 1000);
      }
    } catch (error) {
      console.error('Lỗi khi ghi nhận điểm danh:', error);
      setRecognitionStatus({
        message: 'Lỗi kết nối server',
        user: '',
        timestamp: ''
      });
      setFrameClass('fail');
      setTimeout(() => setFrameClass(''), 1000);
    }
  };

  const handleRetry = () => {
    recognizeFace();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!employeeCode) {
      setErrorMessage('Không được để trống mã nhân viên');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d+$/.test(employeeCode)) {
      setErrorMessage('Mã nhân viên chỉ được chứa số');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id: parseInt(employeeCode) }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecognitionStatus({
          message: data.message || 'Điểm danh thành công!',
          user: employeeCode, // Backend không trả employee_name
          timestamp: new Date().toLocaleString()
        });
        setIsLoginModalOpen(false);
        setEmployeeCode('');
        setFrameClass('success');
        setTimeout(() => setFrameClass(''), 1000);
      } else {
        setErrorMessage(data.error || 'Mã nhân viên không tồn tại');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      setErrorMessage('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'Clear') {
      setEmployeeCode('');
    } else if (key === 'Backspace') {
      setEmployeeCode(employeeCode.slice(0, -1));
    } else if (key === 'Enter') {
      handleLoginSubmit(new Event('submit'));
    } else {
      setEmployeeCode(employeeCode + key);
      setHighlight(true);
      setTimeout(() => setHighlight(false), 200);
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.className === 'login-modal') {
      setIsLoginModalOpen(false);
      setEmployeeCode('');
      setErrorMessage('');
    }
  };

  const NumericKeyboard = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Backspace', '0', 'Clear'],
      ['Enter']
    ];

    return (
      <div className="numeric-keyboard">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <div key={key} className="key-wrapper">
                <button
                  className={`keyboard-key ${key === 'Backspace' || key === 'Enter' || key === 'Clear' ? 'special-key' : ''} ${key === 'Enter' ? 'enter' : ''}`}
                  onClick={() => handleKeyPress(key)}
                >
                  {key === 'Backspace' ? '⌫' : key === 'Enter' ? '➜' : key === 'Clear' ? '🗑️' : key}
                </button>
                {key === 'Backspace' && <span className="key-label">Xóa</span>}
                {key === 'Clear' && <span className="key-label">Xóa toàn bộ</span>}
              </div>
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
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className={`recognition-frame ${frameClass}`}>
          {isRecognizing && <div className="spinner"></div>}
        </div>
      </div>
      <div className="status-section">
        <div className="status-message">
          <p>
            {recognitionStatus.message.includes('thành công') ? (
              <span className="icon">✔️ </span>
            ) : null}
            {recognitionStatus.message}
          </p>
          {recognitionStatus.user && (
            <p>
              <span className="icon">👋 </span>
              Chào {recognitionStatus.user}
            </p>
          )}
          {recognitionStatus.timestamp && (
            <p>
              <span className="icon">⏰ </span>
              {recognitionStatus.timestamp}
            </p>
          )}
        </div>
      </div>
      <div className="support-buttons">
        <button className="retry-btn" onClick={handleRetry}>🔁 Quét lại khuôn mặt</button>
        <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>✍ Nhập mã nhân viên</button>
      </div>
      {isLoginModalOpen && (
        <div className="login-modal" onClick={handleCloseModal}>
          <div className="modal-content">
            <h3>Nhập mã nhân viên</h3>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  required
                  ref={inputRef}
                  className={highlight ? 'highlight' : ''}
                />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner small"></div> : 'Điểm danh'}
              </button>
            </form>
            <NumericKeyboard />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;