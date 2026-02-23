import { memo } from 'react';

function TurnstileActions({
  isScanning,
  onToggleScanning,
  onRefreshUsers,
  onClearLogs,
  onExportLogs,
}) {
  return (
    <section className="actions-row">
      <button type="button" className="btn btn-primary" onClick={onToggleScanning}>
        {isScanning ? 'Skanerni to\'xtatish' : 'Skanerni ishga tushirish'}
      </button>
      <button type="button" className="btn btn-neutral" onClick={onRefreshUsers}>
        Userlarni yangilash
      </button>
      <button type="button" className="btn btn-neutral" onClick={onExportLogs}>
        Loglarni eksport
      </button>
      <button type="button" className="btn btn-danger" onClick={onClearLogs}>
        Session logini tozalash
      </button>
    </section>
  );
}

export default memo(TurnstileActions);
