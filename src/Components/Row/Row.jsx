import React from 'react'
import Cell from '../Cell/Cell'
const Row = props => {
  const cells = []
  const y = props.y
  for (let x = 0; x < props.x; x += 1) {
    console.log('====================================');
    console.log(props.rowData[x]);
    console.log('====================================');
    cells.push(
        <Cell
          key={`${x}-${y}`}
          y={y}
          x={x}
          onChangedValue={props.handleChangedCell}
          updateCells={props.updateCells}
          value={props.rowData[x] || ''}
          executeFormula={props.executeFormula}
        />,
    )
  }
  return <div>{cells}</div>
}
export default Row