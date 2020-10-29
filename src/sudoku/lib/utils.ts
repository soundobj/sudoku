import {
  isEmpty,
  compact,
  shuffle,
  isEqual,
  random,
  concat,
  uniqBy,
  last,
  curry,
  find,
  head,
  cloneDeep,
} from "lodash";
import produce from 'immer'
import { pipe, map, filter } from 'lodash/fp'
import memoize from 'fast-memoize'

import { Cell, Coordinate, Coordinable, NumberMap, GameLevel, VALID_NUMBERS } from './definitions'

export const generateCell = (
  coordinate: Coordinate,
  solution: number = 0,
  autogenerated: boolean = false
): Cell => ({
  autogenerated,
  coordinate,
  solution
});

export const generateBoard = (): Cell[][] => {
  let board: Cell[][] = [];
  let backtrackingCount = 0;
  rowLoop: for (let x = 0; x < 9; x++) {
    board.push([]);
    const foundValues = [];
    for (let y = 0; y < 9; y++) {
      const coordinate = { x, y };
      const value = findValue(board, coordinate, foundValues);
      if (!value) {
        /*
          sometimes the random sudoku generation gets stuck in an imposible solution:
          this happens when multiple rows start and end with the same number eg

          7,6,9,8,3,4,5,1,2
          2,5,1,9,7,6,3,4,8
          8,3,4,1,2,5,9,7,6
          6,1,5,4,8,2,7,9,3
          9,2,8,3,6,7,4,5,1
          3,

          here the 2,8,6 and 3 are both in column 1 and column 9. On these occasions
          after a large number of backtracking attempts, it is best to clear the 
          whole sudoku and start afresh
        */
        if (backtrackingCount > 40) {
          x = -1; // reset to 0 once we continue
          backtrackingCount = 0;
          board = []; // clear board
          continue rowLoop;
        }

        /*
          if no value is found then the row is wrong and it needs to be backtracked
        */
        board.splice(x, 1); // delete row exisiting values
        x--;
        backtrackingCount++;
        continue rowLoop;
      }
      board[x][y] = generateCell(coordinate, value);
      foundValues.push(value);
    }
  }
  return board;
};

const findValue = (
  board: Cell[][],
  coordinate: Coordinate,
  foundValues: number[]
): number | undefined => {
  const possibleValues = shuffle(VALID_NUMBERS); // randomise solution
  for (let i = 0; i < 9; i++) {
    if (foundValues.includes(possibleValues[i])) {
      continue;
    }
    if (canSetValueInBoard(possibleValues[i], coordinate, board)) {
      return possibleValues[i];
    }
  }
};

export const printBoard = (board: Cell[][]): string =>
  board.reduce(
    (acc, cur) => (acc += `${cur.map(y => y.solution).join(",")}\n`),
    ""
  );

export const printGame = (board: Cell[][]): string =>
  board.reduce(
    (acc, cur) => (acc += `${cur.map(y => y.autogenerated? y.solution : " ").join(",")}\n`),
    ""
  );

export const valueEqualsCellSolution = (value: number) => (
  cell: Cell
): boolean => !isEmpty(cell) && cell.solution === value;

// cells solutions that are seen in the board: autogenerated by the game or completed by the player
export const valueEqualsVisibleCellSolution = (value: number) => (
  cell: Cell
): boolean =>
  (!isEmpty(cell) && cell.value === value && cell.solution === value) ||
  (!isEmpty(cell) && cell.solution === value && cell.autogenerated);

export const getCoordinateWithValueMatchingCriteria = (
  list: Cell[],
  criteria: (value: number) => (cell: Cell) => boolean,
  value: number,
): Coordinate | undefined => list.find(curry(criteria)(value))?.coordinate

export const doesValueConflictWithRowValues = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate | number
): Coordinate | undefined => {
  const list = getRow(board, coordinate);
  return getCoordinateWithValueMatchingCriteria(
    list,
    valueEqualsVisibleCellSolution,
    value
  );
};

export const doesValueConflictWithColumnValues = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate | number
): Coordinate | undefined => {
  const list = getColumn(board, coordinate);
  return getCoordinateWithValueMatchingCriteria(
    list,
    valueEqualsVisibleCellSolution,
    value
  );
};

export const doesValueConflictWithSquareValues = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate
): Coordinate | undefined => {
  const list = getSquare(board, coordinate);
  return getCoordinateWithValueMatchingCriteria(
    list,
    valueEqualsVisibleCellSolution,
    value
  );
};

export const doesValueExistInRow = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate | number
): Coordinate | undefined => {
  const list = getRow(board, coordinate);
  return getCoordinateWithValueMatchingCriteria(
    list,
    valueEqualsCellSolution,
    value
  );
};

export const doesValueExistInColumn = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate | number
): Coordinate | undefined => {
  const list = getColumn(board, coordinate)
  return getCoordinateWithValueMatchingCriteria(list, valueEqualsCellSolution, value)
};

/*
  The Sudoku board is split in 9 squares of 3 x 3 cells. It is illegal to
  attempt to add a number in a square if that number already exists in
  such square

  we create a mapping (squareAreaMapping) to determine what square we are trying
  to add a number to, a square is composed of x and y coordinates i.e [0,1,2]
  and [3,4,5]

  by taking the x and y coordinates of the cell we attemp to enter a number to
  and dividing them by 3 (getSquareAreaMapping) we are able to extract the current
  square neighbouring cells
*/

const squareAreaMapping = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8]
];

const getSquareAreaMapping = (coordinate: number): number[] =>
  squareAreaMapping[Math.floor(coordinate / 3)];

export const doesValueExistInSquare = (
  board: Cell[][],
  value: number,
  coordinate: Coordinate
): Coordinate | undefined => {
  const list = getSquare(board, coordinate)
  return getCoordinateWithValueMatchingCriteria(list, valueEqualsCellSolution, value)  
}

export const canSetValueInBoard = (
  value: number,
  coordinate: Coordinate,
  board: Cell[][]
): boolean =>
  isEmpty(doesValueExistInRow(board, value, coordinate.x)) &&
  isEmpty(doesValueExistInColumn(board, value, coordinate.y)) &&
  isEmpty(doesValueExistInSquare(board, value, coordinate));

export const getConflicts = (
  value: number,
  coordinate: Coordinate,
  board: Cell[][]
): Coordinate[] => compact([
  doesValueConflictWithRowValues(board, value, coordinate.x),
  doesValueConflictWithColumnValues(board, value, coordinate.y),
  doesValueConflictWithSquareValues(board, value, coordinate)
])

export const getRow = <T extends Coordinable>(
  board: T[][],
  coordinate:  Coordinate | number
): T[] => cloneDeep(board[(typeof coordinate === "number") ? coordinate : coordinate.x])

export const getColumn = <T extends Coordinable>(board: T[][], coordinate: Coordinate | number): T[] => {
  const y = (typeof coordinate === "number") ? coordinate : coordinate.y
  return compact(
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x => {
      return board[x] && board[x][y];
    })
  );
}
 
export const getSquare = <T extends Coordinable>(
  board: T[][],
  coordinate: Coordinate
): T[] => {
  const x = getSquareAreaMapping(coordinate.x);
  const y = getSquareAreaMapping(coordinate.y);
  const values: T[] = [];
  x.forEach(xCoord => {
    y.forEach(yCoord => {
      const cell = board[xCoord] && board[xCoord][yCoord];
      values.push(cell);
    });
  });
  return compact(values);
};
  
export const getRowValues = (
  board: Cell[][],
  rowId: number
) => getRow(board, rowId).map(cell => cell.solution)

export const getColumnValues = (board: Cell[][], coordinate: Coordinate | number) =>
  getColumn(board, coordinate).map(cell => isEmpty(cell) ? undefined : cell.solution)

export const getSquareValues = (
  board: Cell[][],
  coordinate: Coordinate) =>
  getSquare(board, coordinate).map(cell => cell.solution) 

// every cell in the sudoku board belongs to a row, square and a column. get those related cells
export const getRelatedCells = (
  board: Coordinable[][],
  coordinate: Coordinate
): Coordinable[] =>
  uniqBy(
    concat(
      getRow(board, coordinate.x),
      getColumn(board, coordinate.y),
      getSquare(board, coordinate)
    ),
    (cell: Coordinable) => [cell.coordinate.x, cell.coordinate.y].join()
  );

export const getRelatedCellsCoordinates = (
  coordinate: Coordinate,
  board: Cell[][]
): Coordinate[] => {
 return map("coordinate", getRelatedCells(board, coordinate) || []);
}

export const getRedundantCandidates = (
  cell: Cell,
  board: Cell[][]
): Coordinate[] | undefined =>
  pipe(
    filter(
      (c: Cell) =>
        c.candidates !== undefined &&
        cell.value === cell.solution &&
        cell.solution in c.candidates
    ),
    map("coordinate")
  )(getRelatedCells(board, cell.coordinate));
  
export const isSudokuValid = (board: Cell[][]): boolean => {
  for (let x = 0; x < board.length; x++) {
    if (!isEqual(getRowValues(board,x).sort(),VALID_NUMBERS)) {
      return false
    }
  }

  for (let x = 0; x < VALID_NUMBERS.length; x++) {
    if (!isEqual(getColumnValues(board,x).sort(),VALID_NUMBERS)) {
      return false
    }
  }
  const coordinates = [
    {x:0, y: 0},
    {x:0, y: 3},
    {x:0, y: 6},
    {x:3, y: 0},
    {x:3, y: 3},
    {x:3, y: 6},
    {x:6, y: 0},
    {x:6, y: 3},
    {x:6, y: 6},
  ]

  for (let x = 0; x < coordinates.length; x++) {
    if (!isEqual(getSquareValues(board,coordinates[x]).sort(),VALID_NUMBERS)) {
      return false
    }
  }
  return true
}

export const countAutoGeneratedCells = (difficulty: NumberMap): number => {
  return Object.values(difficulty).reduce((t, {count}) => t + count, 0)
}

export const difficulty: Record<GameLevel, number[]> = {
  [GameLevel.EASY]:   [2, 3, 3, 3, 3, 3, 4, 6, 6],
  [GameLevel.MEDIUM]: [1, 2, 3, 3, 3, 4, 4, 5, 6],
  [GameLevel.HARD]:   [1, 2, 2, 3, 3, 3, 4, 5, 5],
  [GameLevel.EXPERT]: [1, 2, 2, 2, 3, 3, 4, 4, 5]
}

export const isGameLevelDifficultyLow = (level: GameLevel): boolean =>
  [GameLevel.EASY, GameLevel.MEDIUM].includes(GameLevel[level]); 

/*
  Creates a map with the number of instances of every number visible in the board
*/
export const createNumberDifficultyMap = (
  level: GameLevel,
  numbers: number[]
): NumberMap => {
  const _difficulty = difficulty[level];
  const isDifficultyLow = isGameLevelDifficultyLow(level);
  return _difficulty.reduce((acc: NumberMap, cur: number, index) => {
    const num = cur;
    acc[numbers[index]] = {
      count: isDifficultyLow ? num : random(num - 1, num),
      coordinates: [],
      candidates: [],
    };
    return acc;
  }, {});
};

export const createGameCoordinates = (): Coordinate[] => {
  const coordinates: Coordinate[] = [];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(x => {
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(y => {
        coordinates.push({x, y})
      });
    });
    return coordinates
}

export interface GameState {
  game: Cell[][],
  numberMap: NumberMap
}

export const createGame = (state: GameState) => produce(state, (draft: GameState) => {
  const { game, numberMap } = draft
  shuffle(createGameCoordinates()).forEach(c => {
    const cell = game[c.x][c.y]
    if (numberMap[cell.solution].count) {
      cell.autogenerated = true
      numberMap[cell.solution].count--
      numberMap[cell.solution].coordinates.push(cell.coordinate)
    }
  });
  Object.keys(numberMap).forEach((key: string) => {
    const map = numberMap[parseInt(key, 10)]
    map.count = map.coordinates.length > 0 ? map.coordinates.length : 0
  })
})

const _getEnumValues = <T>(_enum: T): number[] => {
  const vals = []
  for (let key in _enum) {
    if (!isNaN(Number(key))) {
      vals.push(Number(key))
    }
  }
  return vals
}

export const getEnumValues = memoize(_getEnumValues)

export const getInitialBoardPosition = () => ({ x: 4, y: 4 });
