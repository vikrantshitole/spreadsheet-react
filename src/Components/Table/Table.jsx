import React, { useState, useEffect } from 'react';
import Row from '../Row/Row';
import { Parser as FormulaParser } from 'hot-formula-parser';

const Table = (props) => {
  const [data, setData] = useState({});
  const parser = new FormulaParser();
    const [numOfRows, setNumOfRows] = useState(props.y)
    const [numOfColumns, setNumOfColumns] = useState(props.x)
  useEffect(() => {
    // Hook into the parser's callCellValue event
    parser.on('callCellValue', (cellCoord, done) => {
      const x = cellCoord.column.index + 1;
      const y = cellCoord.row.index + 1;

      if (x > numOfColumns || y > numOfRows) {
        throw parser.Error(parser.ERROR_NOT_AVAILABLE);
      }

      if (parser.cell.x === x && parser.cell.y === y) {
        throw parser.Error(parser.ERROR_REF);
      }

      if (!data[y] || !data[y][x]) {
        return done('');
      }

      return done(data[y][x]);
    });

    // Hook into the parser's callRangeValue event
    parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      const sx = startCellCoord.column.index + 1;
      const sy = startCellCoord.row.index + 1;
      const ex = endCellCoord.column.index + 1;
      const ey = endCellCoord.row.index + 1;
      const fragment = [];

      for (let y = sy; y <= ey; y += 1) {
        const row = data[y];
        if (!row) {
          continue;
        }
        const colFragment = [];
        for (let x = sx; x <= ex; x += 1) {
          let value = row[x] || '';
          if (value.slice(0, 1) === '=') {
            const res = executeFormula({ x, y }, value.slice(1));
            if (res.error) {
              throw parser.Error(res.error);
            }
            value = res.result;
          }
          colFragment.push(value);
        }
        fragment.push(colFragment);
      }

      if (fragment) {
        done(fragment);
      }
    });

    return () => {
      parser.off('callCellValue');
      parser.off('callRangeValue');
    };
  }, [data, parser, numOfColumns, numOfRows]);

  const handleChangedCell = ({ x, y }, value) => {
    setData((prevData) => {
      const modifiedData = { ...prevData };
      if (!modifiedData[y]) modifiedData[y] = {};
      modifiedData[y][x] = value;
      return modifiedData;
    });
  };

  const executeFormula = (cell, value) => {
    parser.cell = cell;

    let res = parser.parse(value);

    if (res.error != null) {
      return res;
    }
    if (res.result.toString() === '') {
      return res;
    }
    if (res.result.toString().slice(0, 1) === '=') {
      res = executeFormula(cell, res.result.slice(1));
    }
    return res;
  };

  const rows = [];
  for (let y = 0; y < numOfRows + 1; y += 1) {
    const rowData = data[y] || {};
    rows.push(
      <Row
        handleChangedCell={handleChangedCell}
        executeFormula={executeFormula}
        key={y}
        y={y}
        x={numOfColumns + 1}
        rowData={rowData}
      />
    );
  }

  const addRow = () =>{
    setNumOfRows((prevState)=>prevState+1)
  }

  const addColumn = () =>{
    setNumOfColumns((prevState)=>prevState+1)
  }
  
  return <>
    <div>{rows}</div>
    <div>
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button>Save Json</button>
        <button>Upload Json</button>
    </div>
  </>;
};

export default Table;