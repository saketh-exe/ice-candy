import { cn } from "@/lib/utils";

const Table = ({ headers, data, renderRow, columns, className }) => {
  // Support both old format (headers + renderRow) and new format (columns)
  const isColumnsFormat = columns && columns.length > 0;
  const tableHeaders = isColumnsFormat
    ? columns.map((col) => col.header)
    : headers || [];

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-muted/50 transition-colors">
                {isColumnsFormat
                  ? // New columns format
                    columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        {col.cell ? col.cell(item, index) : item[col.accessor]}
                      </td>
                    ))
                  : // Old renderRow format
                    renderRow(item, index)}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={tableHeaders.length}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
