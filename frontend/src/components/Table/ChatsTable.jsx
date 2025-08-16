export default function ChatsTable({ columnNames = [], columnValues = [], onClick }) {
  console.log("columnValues:", columnValues);
  const rows = Array.isArray(columnValues) ? columnValues : [];
  
  return (
    <table className="table">
      <thead>
        <tr>
          {columnNames.map((item, index) => (
            <th key={index} className="table-item">{item}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((item, index) => {
          if (!item) return null;
          return (
            <tr key={index}>
              <td
                className="table-item"
                onClick={() => onClick && onClick(item.id)}
              >
                {item.name || "N/A"}
              </td>
              <td className="table-item">{item.participants_count ?? "N/A"}</td>
              <td className="table-item">{item.messages_count ?? "N/A"}</td>
              <td className="table-item">{item.message_frequency ?? "N/A"}</td>
              <td className="table-item">{item.last_activity ?? "N/A"}</td>
              <td className="table-item">{item.risk_level ?? "N/A"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
