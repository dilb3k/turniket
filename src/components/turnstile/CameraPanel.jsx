import Webcam from 'react-webcam';

function CameraPanel({ webcamRef, canvasRef, videoConstraints, onPlay, showCanvas = true }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        videoConstraints={videoConstraints}
        onPlay={onPlay}
        style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
      />

      {showCanvas && (
        <canvas
          ref={canvasRef}
          width={videoConstraints.width}
          height={videoConstraints.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            borderRadius: '12px',
          }}
        />
      )}
    </div>
  );
}

export default CameraPanel;
