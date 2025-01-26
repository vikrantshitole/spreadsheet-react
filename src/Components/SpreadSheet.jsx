import React, { useState } from "react";

const Spreadsheet = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: 10 }, () => Array(10).fill(""))
  );

  const [selectedCell, setSelectedCell] = useState(null);
  const [jsonData, setJsonData] = useState(null);

  const updateCell = (rowIndex, colIndex, value) => {
    const updatedGrid = [...grid];
    updatedGrid[rowIndex][colIndex] = value;
    setGrid(updatedGrid);
  };

  const addRow = () => {
    setGrid([...grid, Array(grid[0].length).fill("")]);
  };

  const addColumn = () => {
    setGrid(grid.map((row) => [...row, ""]));
  };

  const formatCell = (rowIndex, colIndex, bold, color) => {
    const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
    if (bold) cell.style.fontWeight = "bold";
    if (color) cell.style.backgroundColor = color;
  };

  const saveToJson = () => {
    const json = JSON.stringify(grid);
    setJsonData(json);
  };

  const loadFromJson = (json) => {
    try {
      const data = JSON.parse(json);
      setGrid(data);
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  const handleCopy = (rowIndex, colIndex) => {
    const cellValue = grid[rowIndex][colIndex];
    navigator.clipboard.writeText(cellValue);
  };

  const handlePaste = (rowIndex, colIndex) => {
    navigator.clipboard.readText().then((text) => {
      updateCell(rowIndex, colIndex, text);
    });
  };

  const renderCell = (rowIndex, colIndex) => {
    return (
      <td
        key={`${rowIndex}-${colIndex}`}
        id={`cell-${rowIndex}-${colIndex}`}
        onClick={() => setSelectedCell({ rowIndex, colIndex })}
        onDoubleClick={() => handleCopy(rowIndex, colIndex)}
        onContextMenu={(e) => {
          e.preventDefault();
          handlePaste(rowIndex, colIndex);
        }}
      >
        <input
          value={grid[rowIndex][colIndex]}
          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
        />
      </td>
    );
  };

  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
      </tr>
    ));
  };

  return (
    <div className="spreadsheet">
      <table>
        <tbody>{renderGrid()}</tbody>
      </table>
      <div className="controls">
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={saveToJson}>Save to JSON</button>
        <button
          onClick={() => {
            const json = prompt("Paste JSON here:");
            if (json) loadFromJson(json);
          }}
        >
          Load from JSON
        </button>
      </div>
      {jsonData && (
        <div>
          <h3>Saved JSON:</h3>
          <pre>{jsonData}</pre>
        </div>
      )}
    </div>
  );
};

export default Spreadsheet;
