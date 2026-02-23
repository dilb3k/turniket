import { memo } from 'react';
import Webcam from 'react-webcam';

function CameraPanel({ webcamRef, canvasRef, videoConstraints, onPlay, showCanvas = true }) {
  return (
    <div className="camera-shell">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        videoConstraints={videoConstraints}
        onPlay={onPlay}
        className="camera-video"
      />

      {showCanvas && (
        <canvas
          ref={canvasRef}
          width={videoConstraints.width}
          height={videoConstraints.height}
          className="camera-overlay"
        />
      )}
    </div>
  );
}

export default memo(CameraPanel);
