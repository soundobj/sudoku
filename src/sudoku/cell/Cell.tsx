import React, { useRef } from "react";

import { Cell as CellProps, Coordinate, MoveTypes } from "../lib/definitions";
import Candidates from "./candidates/Candidates";
import "./Cell.scss";

interface Props extends CellProps {
  selectCell: (coordinate: Coordinate) => void;
}

export const useCountRenders = (coordinate: Coordinate) => {
  const renders = useRef(0);
  console.error(
    `@renders x:${coordinate.x}y:${coordinate.y}`,
    renders.current++
  );
};

const Cell = (props: Props): JSX.Element => {
  const {
    value,
    autogenerated,
    coordinate,
    solution,
    selectCell,
    selected,
    candidates,
    conflicting,
    related,
    sameAsSelected,
  } = props;
  // useCountRenders(coordinate)
  return (
    <div className="grid__item" onClick={() => selectCell(coordinate)}>
      <div
        className={`content ${related ? "sudoku__cell--related " : ""} ${
          selected ? "sudoku__cell--selected " : ""
        }`}
      >
        <div
          className={`content-inside ${
            conflicting ? "sudoku__cell--conflicting " : ""
          } ${
            sameAsSelected && sameAsSelected.type === MoveTypes.NUMBER
              ? "sudoku__cell--same-as-selected "
              : ""
          }`}
        >
          {autogenerated && <h2 className="">{solution}</h2>}
          {!autogenerated && value && (
            <h2 className={`${value !== solution ? "incorrect" : ""}`}>
              {value}
            </h2>
          )}
          {!autogenerated && !value && candidates && (
            <Candidates
              candidates={candidates}
              selected={selected}
              sameAsSelected={sameAsSelected}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Cell);
