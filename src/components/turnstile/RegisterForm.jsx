import { memo } from 'react';

function RegisterForm({
  form,
  onInputChange,
  onSubmit,
  registering,
  isLoadingUsers,
  modelsLoaded,
  classQuickPicks,
  onClassQuickPick,
}) {
  return (
    <form onSubmit={onSubmit} className="panel form-grid">
      <div className="panel-header">
        <h3>Yangi user ro'yxatdan o'tkazish</h3>
      </div>

      <label className="field">
        <span>F.I.O</span>
        <input
          className="input"
          name="name"
          value={form.name}
          onChange={onInputChange}
          placeholder="Masalan: Ali Valiyev"
          autoComplete="off"
          required
        />
      </label>

      <label className="field">
        <span>Sinf</span>
        <input
          className="input"
          name="className"
          value={form.className}
          onChange={onInputChange}
          placeholder="Masalan: 9-A"
          autoComplete="off"
          required
        />
      </label>

      <div className="quick-picks">
        {classQuickPicks?.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            onClick={() => onClassQuickPick(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Roll number</span>
        <input
          className="input"
          name="rollNumber"
          value={form.rollNumber}
          onChange={onInputChange}
          placeholder="Masalan: 0901"
          autoComplete="off"
          required
        />
      </label>

      <button
        type="submit"
        disabled={registering || isLoadingUsers || !modelsLoaded}
        className="btn btn-primary"
      >
        {registering ? 'Saqlanmoqda...' : "Face bilan ro'yxatdan o'tkazish"}
      </button>
    </form>
  );
}

export default memo(RegisterForm);
