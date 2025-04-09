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
  const inputRef = useRef(null);

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
      }
    };
    startCamera();

    const recognitionTimeout = setTimeout(() => {
      setIsRecognizing(true);
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          setRecognitionStatus({
            message: 'Điểm danh thành công!',
            user: 'Tâm Anh Solutions',
            timestamp: new Date().toLocaleString()
          });
          setFrameClass('success');
        } else {
          setRecognitionStatus({
            message: 'Không nhận diện được, vui lòng thử lại',
            user: '',
            timestamp: ''
          });
          setFrameClass('fail');
        }
        setIsRecognizing(false);
        setTimeout(() => setFrameClass(''), 1000);
      }, 2000);
    }, 2000);

    return () => clearTimeout(recognitionTimeout);
  }, []);

  const handleRetry = () => {
    setRecognitionStatus({
      message: 'Vui lòng nhìn vào camera để điểm danh',
      user: '',
      timestamp: ''
    });
    setIsRecognizing(true);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        setRecognitionStatus({
          message: 'Điểm danh thành công!',
          user: 'Nguyễn Văn A',
          timestamp: new Date().toLocaleString()
        });
        setFrameClass('success');
      } else {
        setRecognitionStatus({
          message: 'Không nhận diện được, vui lòng thử lại',
          user: '',
          timestamp: ''
        });
        setFrameClass('fail');
      }
      setIsRecognizing(false);
      setTimeout(() => setFrameClass(''), 1000);
    }, 2000);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!employeeCode) {
      setErrorMessage('Không được để trống mã nhân viên');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      if (employeeCode === '123456') {
        setRecognitionStatus({
          message: 'Đăng nhập thành công!',
          user: employeeCode,
          timestamp: new Date().toLocaleString()
        });
        setIsLoginModalOpen(false);
        setEmployeeCode('');
      } else {
        setErrorMessage('Mã nhân viên không tồn tại');
      }
      setIsSubmitting(false);
    }, 1000);
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
        <div className={`recognition-frame ${frameClass}`}>
          {isRecognizing && <div className="spinner"></div>}
        </div>
      </div>
      <div className="status-section">
        <div className="status-message">
          <p>
            {recognitionStatus.message === 'Điểm danh thành công!' || recognitionStatus.message === 'Đăng nhập thành công!' ? (
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
        <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>✍ Nhập mã thay thế</button>
      </div>
      {isLoginModalOpen && (
        <div className="login-modal" onClick={handleCloseModal}>
          <div className="modal-content">
            <h3>Nhập mã nhân viên</h3>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Mã nhân viên:</label>
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
                {isSubmitting ? <div className="spinner small"></div> : 'Đăng nhập'}
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