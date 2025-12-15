export default function UnauthorizedPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Доступ запрещён 🚫</h1>
      <p>У вас нет прав для просмотра этой страницы.</p>
      <a href="/dashboard" style={{ color: "blue" }}>Вернуться на главную</a>
    </div>
  );
}