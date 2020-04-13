import { isEmpty, isEqual, curryRight } from "lodash";
import { Cell, Coordinate, Coordinable, Direction } from "./definitions";
import { getRow, getColumn } from './utils'

export const navigateBoard = (
  board: Coordinable[][],
  currentPosition: Coordinate,
  direction: string
): Coordinate => {
  const { x, y } = currentPosition;
  if (isEmpty(board[x][y])) {
    return { x: 0, y: 0 };
  }
  switch (direction) {
    case Direction.LEFT: {
      return !isEmpty(board[x][y - 1]) ?  board[x][y - 1].coordinate : currentPosition; 
    }
    case Direction.RIGHT: {
      return !isEmpty(board[x][y + 1]) ?  board[x][y + 1].coordinate : currentPosition; 
    }
    case Direction.UP: {
      return !isEmpty(board[x - 1]) && !isEmpty(board[x - 1][y])
        ? board[x - 1][y].coordinate
        : currentPosition;
    }
    case Direction.DOWN: {
      return !isEmpty(board[x + 1]) && !isEmpty(board[x + 1][y])
        ? board[x + 1][y].coordinate
        : currentPosition;
    }
    default:
      return currentPosition;
  }
};

export const findNextByCriteria = <T extends Cell>(
  list: T[],
  startCoordinate: Coordinate,
  includeStartIndex: boolean = false,
  criteria: (element: T) => boolean
): Coordinate | undefined => {
  const coordinateIndex = list.findIndex(curryRight(filterByCoordinate)(startCoordinate))
  const start = includeStartIndex ? coordinateIndex : coordinateIndex + 1
  // console.error('@args', includeStartIndex, start)
  for (let index = start; index < list.length; index++) {
    const element = list[index];
    // console.error('@index el', index, element)
    if (criteria(element)) {
      // console.error('@found', element.coordinate)
      return element.coordinate;
    }
  }
  return startCoordinate;
}

// cell is available when is has not been autogenerated or correctly filled
const cellIsAvailable = (cell: Cell) => !(cell.autogenerated || cell.value && cell.solution === cell.value)

const findNextSudokuAvailableCell = curryRight(findNextByCriteria)(cellIsAvailable)

export const nextLeftAvailable = <T extends Cell>(
  board: T[][],
  currentPosition: Coordinate,
  includeStartIndex: boolean = false
): Coordinate => {
  const list = getRow(board, currentPosition).reverse()
  return findNextSudokuAvailableCell(list, currentPosition, includeStartIndex)
};

export const nextRightAvailable = <T extends Cell>(
  board: T[][],
  currentPosition: Coordinate,
  includeStartIndex: boolean = false
): Coordinate => {
  const list = getRow(board, currentPosition)
  return findNextSudokuAvailableCell(list, currentPosition, includeStartIndex)
};

export const nextDownAvailable = <T extends Cell>(
  board: T[][],
  currentPosition: Coordinate,
  includeStartIndex: boolean = false
): Coordinate => {
  const list = getColumn(board, currentPosition)
  return findNextSudokuAvailableCell(list, currentPosition, includeStartIndex)
};

export const nextUpAvailable = <T extends Cell>(
  board: T[][],
  currentPosition: Coordinate,
  includeStartIndex: boolean = false
): Coordinate => {
  const list = getColumn(board, currentPosition).reverse()
  return findNextSudokuAvailableCell(list, currentPosition, includeStartIndex)
};

export const navigateBoardNextAvailable = (
  board: Cell[][],
  currentPosition: Coordinate,
  direction: string,
): Coordinate => {
  const { x, y } = currentPosition; 
  if (isEmpty(board[x][y])) {
    return { x: 0, y: 0 };
  }
  switch (direction) {
    case Direction.LEFT: {
      return nextLeftAvailable(board, currentPosition)
    }
    case Direction.RIGHT: {
      return nextRightAvailable(board, currentPosition)
    }
    case Direction.UP: {
      return nextUpAvailable(board, currentPosition)
    }
    case Direction.DOWN: {
      return nextDownAvailable(board, currentPosition)
    }
    default:
      return currentPosition;
  }
};

export const filterOutCoordinate = (coordinate: Coordinate) => (
  item: Coordinable
) =>
  [item.coordinate.x, item.coordinate.y].join() !==
  [coordinate.x, coordinate.y].join();

export const filterByCoordinate = (coordinate: Coordinate) => (
  item: Coordinable
) =>
  [item.coordinate.x, item.coordinate.y].join() ===
  [coordinate.x, coordinate.y].join();

export const getBoardDimensions = (board: Cell[][]): Coordinate => {
  const coordinate: Coordinate = { x: 0, y: 0 }
  if (board.length) {
    coordinate.x = board.length
  }
  if (board[0]) {
    coordinate.y = board[0].length
  }
  return coordinate
}

const getNextUpColumnCoordinate = (c: Coordinate): Coordinate => c.y === 0 ? { x: 8, y: 8 } : { x: 9, y: c.y - 1 };
const getNextDownColumnCoordinate = (c: Coordinate): Coordinate => c.y === 8 ? { x: 0, y: 0 } : { x: -1, y: c.y + 1 };
const getNextLeftRowCoordinate = (c: Coordinate): Coordinate => c.x === 0 ? { x: 8, y: 8 } : { x: c.x - 1, y: 9 };
const getNextRightRowCoordinate = (c: Coordinate): Coordinate => c.x === 8 ? { x: 0, y: 0 } : { x: c.x + 1, y: -1 };
 
export const getCellByCoordinate = (coordinate: Coordinate, board: Cell[][]): Cell => {
  const {x, y} = coordinate
  return board[x][y]
}

export const getOppositeCoordinateInList = (currentPosition: Coordinate, direction: Direction): Coordinate => {
  const {x, y} = currentPosition
  switch (direction) {
    case Direction.UP: return ({x: 8, y})
    case Direction.DOWN: return ({x: 0, y})
    case Direction.LEFT: return ({x, y: 8})
    case Direction.RIGHT: return ({x, y: 0})
  }
}

type NextPositionDirectionHandler = (board: Cell[][], coordinate: Coordinate, includeStartIndex?: boolean) => Coordinate

export const getNextPositionDirectionHandler = (direction: Direction): NextPositionDirectionHandler => {
  switch (direction) {
    case Direction.UP: return nextUpAvailable
    case Direction.DOWN: return nextDownAvailable
    case Direction.LEFT: return nextLeftAvailable
    case Direction.RIGHT: return nextRightAvailable
  }
}

export const nextOverFlowAvailable = (
  board: Cell[][],
  currentPosition: Coordinate,
  direction: Direction 
): Coordinate | undefined => {
  // console.error('@current pos', currentPosition)
  const nextHandler = getNextPositionDirectionHandler(direction)
  const nextUp = nextHandler(board, currentPosition)
  if (!isEqual(nextUp, currentPosition) && cellIsAvailable(getCellByCoordinate(nextUp, board))) {
    return nextUp
  }
  const oppositeCoordinateInList = getOppositeCoordinateInList(currentPosition, direction)
  // console.error('@ocil', oppositeCoordinateInList)
  const nextUpFromOpposite = nextHandler(board, oppositeCoordinateInList, true)
  // console.error('@nufp', nextUpFromOpposite)
  if (!isEqual(nextUpFromOpposite, currentPosition) && cellIsAvailable(getCellByCoordinate(nextUpFromOpposite, board))) {
    return nextUpFromOpposite
  }
};

/*
  overflow navigation features:
  - selecting the opposite end of the row / column when the user uses the keyboard navigation control in the direction where there are not available cells to move
  - selecting the next row / column with available cells when the user uses the keyboard navigation control in the direction where there are not available cells to move and there is a single available cell in the column / row which is the one currently selected
*/
export const navigateBoardNextAvailableOverflow = (
  board: Cell[][],
  currentPosition: Coordinate,
  direction: string
): Coordinate => {
  switch (direction) {
    // case Direction.UP: {
    //   const newPosition = nextOverFlowAvailable(board, currentPosition, direction)
    //   if (newPosition) {
    //     return newPosition
    //   }
    //   return navigateBoardNextAvailableOverflow(
    //     board,
    //     getNextUpColumnCoordinate(currentPosition),
    //     direction
    //   );
    // }
    case Direction.UP:
      return (
        nextOverFlowAvailable(board, currentPosition, direction) ||
        navigateBoardNextAvailableOverflow(
          board,
          getNextUpColumnCoordinate(currentPosition),
          direction
        )
      );
    case Direction.DOWN: {
      const newPosition = nextOverFlowAvailable(
        board,
        currentPosition,
        direction
      );
      if (newPosition) {
        return newPosition;
      }
      return navigateBoardNextAvailableOverflow(
        board,
        getNextDownColumnCoordinate(currentPosition),
        direction
      );
    }
    case Direction.LEFT: {
      const newPosition = nextOverFlowAvailable(
        board,
        currentPosition,
        direction
      );
      if (newPosition) {
        return newPosition;
      }
      return navigateBoardNextAvailableOverflow(
        board,
        getNextLeftRowCoordinate(currentPosition),
        direction
      );
    }
    case Direction.RIGHT: {
      const newPosition = nextOverFlowAvailable(
        board,
        currentPosition,
        direction
      );
      if (newPosition) {
        return newPosition;
      }
      return navigateBoardNextAvailableOverflow(
        board,
        getNextRightRowCoordinate(currentPosition),
        direction
      );
    }
    default:
      return currentPosition;
  }
};
