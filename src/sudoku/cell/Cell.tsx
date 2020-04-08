import React from 'react'

import { Cell, Coordinate } from '../definitions'
import './Cell.css'

const Candidates = () => {

}

interface Props extends Cell {
  selectCell: (coordinate: Coordinate) => void
}

export default (props: Props): JSX.Element => {
  const { value, autogenerated, coordinate, solution, selectCell, selected } = props
  return (
    <div
      className="grid__item"
      onClick={() => !autogenerated && selectCell(coordinate)}
    >
      <div className={`content ${selected ? "sudoku__cell__selected" : ""}`}>
        <div className="content-inside">
          {autogenerated && <h2 className="autogenerated">{solution}</h2>}
          {value && (
            <h2 className={`${value === solution ? "completed" : "incorrect"}`}>
              {value}
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};