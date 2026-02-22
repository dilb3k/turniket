function RegisterForm({
  form,
  onInputChange,
  onSubmit,
  registering,
  isLoadingUsers,
  modelsLoaded,
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        margin: '28px auto 0',
        maxWidth: '480px',
        display: 'grid',
        gap: '10px',
        textAlign: 'left',
      }}
    >
      <h2 style={{ margin: 0, textAlign: 'center' }}>Yangi user ro'yxatdan o'tkazish</h2>

      <input
        name="name"
        value={form.name}
        onChange={onInputChange}
        placeholder="F.I.O"
        autoComplete="off"
        required
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <input
        name="className"
        value={form.className}
        onChange={onInputChange}
        placeholder="Sinf (masalan 9-A)"
        autoComplete="off"
        required
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <input
        name="rollNumber"
        value={form.rollNumber}
        onChange={onInputChange}
        placeholder="Roll number"
        autoComplete="off"
        required
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <button
        type="submit"
        disabled={registering || isLoadingUsers || !modelsLoaded}
        style={{
          padding: '10px 14px',
          border: 'none',
          borderRadius: '8px',
          background: '#0f62fe',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {registering ? 'Saqlanmoqda...' : "Face bilan ro'yxatdan o'tkazish"}
      </button>
    </form>
  );
}

export default RegisterForm;
