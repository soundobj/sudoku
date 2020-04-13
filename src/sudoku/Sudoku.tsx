import React, { useReducer, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
//@ts-ignore  @TODO: write missing typings for 3rd party dependency
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { sudokuReducer, initialState, Actions} from './context'
import { GameLevel, Cell, Coordinate, VALID_NUMBERS, MoveTypes, Direction } from './definitions'
// import { navigateBoardNextAvailable as navigateBoard } from './board'
import { navigateBoardNextAvailableOverflow as navigateBoard } from './board'
import BoardCell  from './cell/Cell'
import Controls from './controls/Controls'
import * as stateStub from './state-stub.json'
import './vars.css'
import './Sudoku.css'

interface NewGameModalProps {
  show: boolean
  onHide: (gameLevel?: string) => void
}

function NewGameModal(props: NewGameModalProps) {
  return (
    <Modal
      {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Choose difficulty
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          <li><Button onClick={() => props.onHide("EASY")}>Easy</Button></li>
          <li><Button onClick={() => props.onHide("MEDIUM")}>Medium</Button></li>
          <li><Button onClick={() => props.onHide("HARD")}>Hard</Button></li>
          <li><Button onClick={() => props.onHide("EXPERT")}>Expert</Button></li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.onHide()}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default () => {
  // const [state, dispatch] = useReducer(sudokuReducer, initialState)
  // @TODO: remove temp stub
  //@ts-ignore
  const [state, dispatch] = useReducer(sudokuReducer, stateStub.default)

  const [modalShow, setModalShow] = React.useState(false);
  const newGameOnHide = (gameLevel?: string) => {
    if (gameLevel && GameLevel.hasOwnProperty(gameLevel)) {
      dispatch({ type: Actions.START_GAME, payload: gameLevel})
    }
    setModalShow(false)
  }
  const selectCell = (coordinate: Coordinate) => dispatch({ type: Actions.SELECT_CELL, payload: coordinate })
  const resolveCell = () => dispatch({ type: Actions.RESOLVE_CELL })
  const setEditMode = (editMode: MoveTypes) => dispatch({ type: Actions.SET_EDIT_MODE, payload: editMode })
  const issueNumber = (number: number) => dispatch({ type: Actions.ISSUE_NUMBER, payload: number })
  console.error('@state', state)

  const { game, selectedCell, editMode } = state

  return (
    <>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        New Game
      </Button>
      <Controls
        editMode={state.editMode}
        setEditMode={setEditMode}
        issueNumber={issueNumber}
      />
      {state.gameLevel && (
        <div className="grid">
          {game &&
            game.map((x: Cell[], indexX: number) => {
              return x.map((y: Cell, indexY: number) => {
                return (
                  <BoardCell
                    {...y}
                    key={`x${indexX}y${indexY}`}
                    selectCell={selectCell}
                  />
                );
              });
            })}
        </div>
      )}
      <NewGameModal show={modalShow} onHide={newGameOnHide} />
      <KeyboardEventHandler
        handleKeys={[
          ...VALID_NUMBERS.map(String),
          "c",
          "s",
          "left",
          "right",
          "up",
          "down",
        ]}
        onKeyEvent={(key: string) => {
          console.error(`do something upon keydown event of ${key}`);
          // Toggle between the two only modes casting the opposite boolean that ! yields into it's digit counterpart using +
          if (key === "c") {
            setEditMode(+!editMode);
          }
          if (key === "s") {
            resolveCell();
          }
          const directions: string[] = Object.values(Direction)
          if (directions.includes(key)) {
            if (game && selectedCell) {
              selectCell(navigateBoard(game, selectedCell, key));
            } else {
              // if the board is not selected upon navigation shortcut input select the first cell
              // @TODO select the first cell that is not filled in already.
              selectCell({ x: 0, y: 0 });
            }
          }
          if (VALID_NUMBERS.map(String).includes(key)) {
            console.error("@handle number enter");
            issueNumber(parseInt(key, 10))
          }
        }}
      />
    </>
  );
}