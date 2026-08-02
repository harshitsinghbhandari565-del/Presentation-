import React from 'react';

interface VaultTableProps {
  headers: string[];
  children: React.ReactNode;
  responsive?: boolean;
}

export const VaultTable: React.FC<VaultTableProps> = ({
  headers,
  children,
  responsive = true,
}) => {
  return (
    <div className={`ov-table-container ${responsive ? 'ov-table-container--responsive' : ''}`}>
      <table className="ov-table">
        <thead className="ov-table__thead">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="ov-table__header-cell">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const VaultTableRow: React.FC<{ children: React.ReactNode; striped?: boolean }> = ({
  children,
  striped = false,
}) => (
  <tr className={`ov-table__row ${striped ? 'ov-table__row--striped' : ''}`}>
    {children}
  </tr>
);

export const VaultTableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="ov-table__cell">{children}</td>
);
