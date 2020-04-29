import React, { useReducer, useCallback, useState } from 'react'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

import StopWatchUI from '../stopWatch/StopWatchUI'
import { stopWatch, CallbackPayload } from '../stopWatch/stopWatch'

import { sudokuReducer, initialState, Actions, Dialogs} from './reducer'
import { GameLevel, Coordinate, MoveTypes } from './definitions'
import UndoMove from './undoMove/UndoMove'
import Board from './board/Board'
import Numbers from './numbers/Numbers'
import EditMode from './editMode/EditMode'
import KeyboardInput from './keyboadInput/KeyboardInput'
import Dialog, { DialogContent } from './dialog/Dialog'
import NewGameOptions from './newGameOptions/NewGameOptions'
import EndGameModal from './endGameModal/EndGameModal'
import GameOverModal from './gameOverModal/GameOverModal'

// dev only
import * as stateStub from './state-stub.json'

import './vars.css'
import './Sudoku.css'

const watch = stopWatch()

export default () => {
  // @ts-ignore
  const [state, dispatch] = useReducer(sudokuReducer, initialState)
  // @TODO: remove temp stub
  // @ts-ignore
  // const [state, dispatch] = useReducer(sudokuReducer, stateStub.default)

  const [dialogShow, setDialogShow] = useState(false);

  const onHide = useCallback(() => {
    setDialogShow(false);
  }, []);

  const restartWatch = () => {
    watch.clear()
    watch.start()
    pauseGame(false)
  }
  
  const newGame = useCallback((gameLevel?: string) => {
    if (gameLevel && GameLevel.hasOwnProperty(gameLevel)) {
      startGame(gameLevel)
      restartWatch()
      // watch.clear()
      // watch.start()
      // pauseGame(false)
    }
  }, [])
  const selectCell = useCallback(
    (coordinate: Coordinate) =>
      dispatch({ type: Actions.SELECT_CELL, payload: coordinate }),
    []
  );
  const startGame = useCallback(
    (gameLevel: string) =>
      dispatch({ type: Actions.START_GAME, payload: gameLevel }),
    []
  );
  const restartGame = useCallback(() => {
    dispatch({ type: Actions.RESTART_GAME });
    restartWatch()

  }, []);
  const resolveCell = useCallback(
    () => dispatch({ type: Actions.RESOLVE_CELL }),
    []
  );
  const setEditMode = useCallback(
    (editMode: MoveTypes) =>
      dispatch({ type: Actions.SET_EDIT_MODE, payload: editMode }),
    []
  );
  const setCurrentDialog = useCallback(
    (dialog: Dialogs) =>
      dispatch({ type: Actions.SET_CURRENT_DIALOG, payload: dialog }),
    []
  );
  const issueNumber = useCallback(
    (number: number) =>
      dispatch({ type: Actions.ISSUE_NUMBER, payload: number }),
    []
  );
  const undoMove = useCallback(
    () =>
      dispatch({ type: Actions.UNDO_MOVE }),
    []
  );
  const pauseGame = useCallback(
    (payload: boolean) => dispatch({ type: Actions.PAUSE_GAME, payload }),
    []
  );
  const endGame = useCallback(() => dispatch({ type: Actions.END_GAME }), [])
  const getTimeToComplete = useCallback(
    (payload: any) =>
      dispatch({ type: Actions.SET_GAME_ELLAPSED_TIME, payload }),
    []
  );

  console.error('@state', state)
  const {
    game,
    selectedCell,
    cellsToComplete,
    moveHistory,
    isGamePlayed,
    gameElapsedTime,
    gameLevel,
    editMode,
    isGamePaused,
    currentDialog,
  } = state;

  const dialogs: Record<Dialogs, DialogContent> = {
    NEW_GAME: {
      header: "Choose difficulty",
      component: <NewGameOptions onHide={onHide} onNewGame={newGame} />,
    },
    END_GAME: {
      header: "Are you sure?",
      component: (
        <EndGameModal
          onHide={onHide}
          onEndGame={pauseGame}
          onConfirmEndGame={endGame}
        />
      ),
    },
    GAME_OVER: {
      header: "Game Over",
      component: (
        <GameOverModal
          onHide={onHide}
          onNewGame={newGame}
          onRestart={restartGame}
        />
      ),
    },
  };

  let showGameOver = false
  // show the game over modal if required
  if (currentDialog === 'GAME_OVER' && !isGamePlayed) {
    // dont use setShowGameOver() to avoid re-rendering the component
    showGameOver = true
  }

  return (
    <>
      <Button
        onClick={useCallback(() => {
          setCurrentDialog('NEW_GAME')
          setDialogShow(true)
        }, [])}
      >
        New Game
      </Button>
      <Dialog
        onEnter={() => {
          watch.stop();
          pauseGame(true);
        }}
        onEscapeKeyDown={() => {
          isGamePlayed && watch.start();
          pauseGame(false);
          !isGamePlayed && setCurrentDialog('NEW_GAME')
        }}
        onHide={onHide}
        //@ts-ignore
        content={dialogs[currentDialog]}
        show={dialogShow || showGameOver}
      />
      <EditMode editMode={editMode} setEditMode={setEditMode} />
      <Numbers issueNumber={issueNumber} />
      <StopWatchUI
        watch={watch}
        onPause={pauseGame}
        isGamePlayed={isGamePlayed}
      />
      <Button onClick={useCallback(() => {
          setCurrentDialog('END_GAME')
          setDialogShow(true)
        }, [])}
      >End Game</Button>
      <UndoMove moveHistory={moveHistory} undoMove={undoMove} />
      {gameLevel && (
        <Board
          game={game}
          selectCell={selectCell}
          isGamePaused={isGamePaused}
        />
      )}
      <KeyboardInput
        game={game}
        selectedCell={selectedCell}
        cellsToComplete={cellsToComplete}
        editMode={editMode}
        setEditMode={setEditMode}
        resolveCell={resolveCell}
        selectCell={selectCell}
        issueNumber={issueNumber}
      />
    </>
  );
}