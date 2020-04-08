import { shuffle, cloneDeep } from 'lodash'
import { Cell, Direction, VALID_NUMBERS } from './definitions'
import * as utils from './utils'

const createBoardRow = (numbers: number[], rowId: number = 0): Cell[] =>
  numbers.map((number, index) =>
  utils.generateCell({x:rowId, y:index}, number)
  );


describe("sudoku/utils", () => {
  describe("doesValueExistInRow", () => {
    const board = [
      createBoardRow([1, 3, 0, 0, 0, 5, 0, 0, 0]),
      createBoardRow([0, 0, 0, 0, 0, 0, 0, 0, 0],1),
      createBoardRow([0, 0, 0, 0, 0, 0, 0, 0, 0],2),
      createBoardRow([0, 0, 0, 0, 0, 0, 0, 2, 0],3)
    ];
    it("returns the coordinate of the existing value in the row", () => {
      expect(utils.doesValueExistInRow(board, 5, 0)).toMatchObject({ x: 0, y: 5 });
      expect(utils.doesValueExistInRow(board, 2, 3)).toMatchObject({ x: 3, y: 7 });
    });
    it("returns undefined if the row does not contain the value", () => {
      expect(utils.doesValueExistInRow(board, 5, 1)).toBe(undefined);

      expect(utils.doesValueExistInRow(board, 9, 0)).toBe(undefined);
    });
  });
  describe("doesValueExistInColumn", () => {
    const board = [
      createBoardRow([1, 3, 0, 8, 2, 5, 4, 6, 7]),
      createBoardRow([2, 4, 1, 9, 3, 7, 8, 6, 5],1),
      createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
    ];

    it("returns the coordinate if the exising value in the column", () => {
      expect(utils.doesValueExistInColumn(board, 2, 0)).toMatchObject({ x: 1, y: 0 });
      expect(utils.doesValueExistInColumn(board, 3, 8)).toMatchObject({ x: 2, y: 8 });
      expect(utils.doesValueExistInColumn(board, 6, 2)).toMatchObject({ x: 2, y: 2 });
    });
    it('returns undefined if the column does not feature the value', () => {
      expect(utils.doesValueExistInColumn(board, 8, 0)).toBe(undefined);
      expect(utils.doesValueExistInColumn(board, 5, 3)).toBe(undefined);
    })
  });
  
  describe('doesValueExistInSquare',() => {
    const board = [
      createBoardRow([1, 3, 9, 8, 0, 5, 4, 6, 7]),
      createBoardRow([2, 4, 1, 9, 3, 7, 0, 6, 5],1),
      createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
    ];
    it('returns the coordinate of the existing value in the square', () => {
      expect(utils.doesValueExistInSquare(board, 5, {x: 0, y: 0})).toMatchObject({x: 2, y: 1})
      expect(utils.doesValueExistInSquare(board, 3, {x: 0, y: 8})).toMatchObject({x: 2, y: 8})
    })
    it('returns undefined if the value does not exist in the square', () => {
      expect(utils.doesValueExistInSquare(board, 2, {x: 0, y: 4})).toBe(undefined)
      expect(utils.doesValueExistInSquare(board, 1, {x: 1, y: 6})).toBe(undefined)
    })
  })

  describe('canSetValueInBoard',() => {
    const board = [
      createBoardRow([1, 3, 9, 8, 0, 5, 4, 6, 7]),
      createBoardRow([2, 4, 1, 9, 3, 7, 0, 6, 5],1),
      createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
    ];
    const doesValueExistInColumnMock =  jest.spyOn(utils, "doesValueExistInColumn")
    const doesValueExistInRowMock =  jest.spyOn(utils, "doesValueExistInRow")
    const doesValueExistInSquareMock =  jest.spyOn(utils, "doesValueExistInSquare")

    it('returns true if there are no duplicate values in the row, column or square of the provided cell', () => {
      doesValueExistInColumnMock.mockImplementationOnce(() => undefined)
      doesValueExistInRowMock.mockImplementationOnce(() => undefined)
      doesValueExistInSquareMock.mockImplementationOnce(() => undefined)
      expect(utils.canSetValueInBoard(3, {x:0, y:0}, board)).toBe(true)

      doesValueExistInColumnMock.mockRestore();
      doesValueExistInRowMock.mockRestore();
      doesValueExistInSquareMock.mockRestore();
    })
    
    it('returns false if there are duplicate values in the column of the provided cell', () => {
      doesValueExistInColumnMock.mockImplementationOnce(() => ({x:0, y:0}))
      doesValueExistInRowMock.mockImplementationOnce(() => undefined)
      doesValueExistInSquareMock.mockImplementationOnce(() => undefined)
      expect(utils.canSetValueInBoard(3, {x:0, y:0}, board)).toBe(false)

      doesValueExistInColumnMock.mockRestore();
      doesValueExistInRowMock.mockRestore();
      doesValueExistInSquareMock.mockRestore();
    }) 

    it('returns false if there are duplicate values in the row of the provided cell', () => {
      doesValueExistInRowMock.mockImplementationOnce(() => ({x:0, y:0}))
      doesValueExistInColumnMock.mockImplementationOnce(() => undefined)
      doesValueExistInSquareMock.mockImplementationOnce(() => undefined)
      expect(utils.canSetValueInBoard(3, {x:0, y:0}, board)).toBe(false)

      doesValueExistInColumnMock.mockRestore();
      doesValueExistInRowMock.mockRestore();
      doesValueExistInSquareMock.mockRestore();
    })  

    
    it('returns false if there are duplicate values in the square of the provided cell', () => {
      doesValueExistInSquareMock.mockImplementationOnce(() => ({x:0, y:0}))
      doesValueExistInColumnMock.mockImplementationOnce(() => undefined)
      doesValueExistInRowMock.mockImplementationOnce(() => undefined)
      expect(utils.canSetValueInBoard(3, {x:0, y:0}, board)).toBe(false)

      doesValueExistInColumnMock.mockRestore();
      doesValueExistInRowMock.mockRestore();
      doesValueExistInSquareMock.mockRestore();
    })  
  })
  describe('getRowValues',() => {
    it('gets the values in the row specified by the id supplied', () => {
      const board = [
        createBoardRow([1, 3, 9, 8, 2, 5, 4, 6, 7]),
        createBoardRow([2, 4, 1, 9, 3, 7, 8, 6, 5],1),
        createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
      ];
      expect(utils.getRowValues(board,2)).toMatchObject([4,5,6,7,1,8,9,2,3])
    })
  })
  
  describe('getColumnValues',() => {
    it('gets the values in the column specified by the id supplied', () => {
      const board = [
        createBoardRow([1, 3, 9, 8, 2, 5, 4, 6, 7]),
        createBoardRow([2, 4, 1, 9, 3, 7, 8, 6, 5],1),
        createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
      ];
      expect(utils.getColumnValues(board,3)).toMatchObject([8,9,7])
    })
  })
  
  describe('getSquareValues',() => {
    it('gets the values in the square specified by the id supplied', () => {
      const board = [
        createBoardRow([1, 3, 9, 8, 2, 5, 4, 6, 7]),
        createBoardRow([2, 4, 1, 9, 3, 7, 8, 6, 5],1),
        createBoardRow([4, 5, 6, 7, 1, 8, 9, 2, 3],2),
      ];
      expect(utils.getSquareValues(board,{x: 0, y: 0})).toMatchObject([1,3,9,2,4,1,4,5,6])
    })
  })

  describe("generateBoard", () => {
    it("creates a random legal sudoku", () => {
      const board = utils.generateBoard();
      expect(utils.isSudokuValid(board)).toBe(true)
    });
  });

  describe('isSudokuValid',() => {
    it('verifies that illegal sudokus are illegal', () => {
      const board = [
        createBoardRow([5,8,3,1,9,6,2,4,7]),
        createBoardRow([7,2,6,8,3,4,9,5,1],1),
        createBoardRow([1,4,9,7,2,5,6,3,8],2),
        createBoardRow([4,5,8,2,7,3,1,9,6],3),
        createBoardRow([6,9,7,5,1,8,3,2,4],4),
        createBoardRow([2,3,1,4,6,9,8,7,5],5),
        createBoardRow([3,1,4,9,8,7,5,6,2],6),
        createBoardRow([8,6,5,3,4,2,7,1,9],7),
        createBoardRow([9,7,2,6,5,1,4,8,5],8),
      ];
      expect(utils.isSudokuValid(board)).toBe(false)
    })
  })
  describe('createDifficultyMap',() => {
    it('creates a map to track how many occurrences of a number should be displayed in the board', () => {
      const res = utils.createNumberDifficultyMap([2,4,6], VALID_NUMBERS)
      expect(Object.keys(res)).toMatchObject(["1","2","3"])
      expect(res[1].count).toBeLessThanOrEqual(2)
      expect(res[2].count).toBeLessThanOrEqual(4)
      expect(res[3].count).toBeLessThanOrEqual(6)
    })
  })
  describe('createGame',() => {
    const board = [
      createBoardRow([5,8,3,1,9,6,2,4,7]),
      createBoardRow([7,2,6,8,3,4,9,5,1],1),
      createBoardRow([1,4,9,7,2,5,6,3,8],2),
      createBoardRow([4,5,8,2,7,3,1,9,6],3),
      createBoardRow([6,9,7,5,1,8,3,2,4],4),
      createBoardRow([2,3,1,4,6,9,8,7,5],5),
      createBoardRow([3,1,4,9,8,7,5,6,2],6),
      createBoardRow([8,6,5,3,4,2,7,1,9],7),
      createBoardRow([9,7,2,6,5,1,4,8,3],8),
    ];
    it('creates a "EASY" difficulty game', () => {
      const numberDifficultyMap = utils.createNumberDifficultyMap(utils.difficulty.EASY, shuffle(VALID_NUMBERS))
      const difficulty = cloneDeep(numberDifficultyMap)
      const game = utils.createGame(board, numberDifficultyMap)
      const verifyDifficulty = [1,2,3,4,5,6,7,8,9].reduce((acc, cur) => {
        // @ts-ignore
        acc[cur] = { count: 0 }
        return acc
      }, {});
      [0,1,2,3,4,5,6,7,8].forEach(x => {
        [0,1,2,3,4,5,6,7,8].forEach(y => {
          const value = game[x][y];
          if (value.autogenerated) {
            // @ts-ignore
            verifyDifficulty[value.solution].count++
          }
        })
      })
      expect(verifyDifficulty).toMatchObject(difficulty)
    })
  })
  describe('getRelatedCells',() => {
    const board = [
      createBoardRow([5,8,3,1,9,6,2,4,7]),
      createBoardRow([7,2,6,8,3,4,9,5,1],1),
      createBoardRow([1,4,9,7,2,5,6,3,8],2),
      createBoardRow([4,5,8,2,7,3,1,9,6],3),
      createBoardRow([6,9,7,5,1,8,3,2,4],4),
      createBoardRow([2,3,1,4,6,9,8,7,5],5),
      createBoardRow([3,1,4,9,8,7,5,6,2],6),
      createBoardRow([8,6,5,3,4,2,7,1,9],7),
      createBoardRow([9,7,2,6,5,1,4,8,3],8),
    ];
    it('gets the related cells of a given cell by coordinate', () => {
      const expected = [
        // row
        utils.generateCell({x:5, y:0}, 2),
        utils.generateCell({x:5, y:1}, 3),
        utils.generateCell({x:5, y:2}, 1),
        utils.generateCell({x:5, y:3}, 4),
        utils.generateCell({x:5, y:4}, 6),
        utils.generateCell({x:5, y:5}, 9),
        utils.generateCell({x:5, y:6}, 8),
        utils.generateCell({x:5, y:7}, 7),
        utils.generateCell({x:5, y:8}, 5),
        // column minus duplicates
        utils.generateCell({x:0, y:5}, 6),
        utils.generateCell({x:1, y:5}, 4),
        utils.generateCell({x:2, y:5}, 5),
        utils.generateCell({x:3, y:5}, 3),
        utils.generateCell({x:4, y:5}, 8),
        utils.generateCell({x:6, y:5}, 7),
        utils.generateCell({x:7, y:5}, 2),
        utils.generateCell({x:8, y:5}, 1),
        // square minus duplicates
        utils.generateCell({x:3, y:3}, 2),
        utils.generateCell({x:3, y:4}, 7),
        utils.generateCell({x:4, y:3}, 5),
        utils.generateCell({x:4, y:4}, 1),
      ]
      expect(utils.getRelatedCells(board, {x:5, y: 5})).toMatchObject(expected)
    })
  })
  describe('countAutoGeneratedCells',() => {
    it('returns the number cells that have been auto generated in the board', () => {
      const numberDifficultyMap = {
        "1": { count: 4 },
        "2": { count: 2 },
      };
      expect(utils.countAutoGeneratedCells(numberDifficultyMap)).toBe(6)
    })
  })
  describe('navigateBoard',() => {
    const board = [
      createBoardRow([5,8,3,1,9,6,2,4,7]),
      createBoardRow([7,2,6,8,3,4,9,5,1],1),
      createBoardRow([1,4,9,7,2,5,6,3,8],2),
      createBoardRow([4,5,8,2,7,3,1,9,6],3),
      createBoardRow([6,9,7,5,1,8,3,2,4],4),
      createBoardRow([2,3,1,4,6,9,8,7,5],5),
      createBoardRow([3,1,4,9,8,7,5,6,2],6),
      createBoardRow([8,6,5,3,4,2,7,1,9],7),
      createBoardRow([9,7,2,6,5,1,4,8,3],8),
    ];
    it('returns the new coordinate in the board if left direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 0 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 1 });
    })
    it('returns the same coordinate in the board if left direction is issued and we have reached the left most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 8 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 8 });
    })
    it('returns the new coordinate in the board if right direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 4 }, Direction.RIGHT)
      ).toMatchObject({ x: 0, y: 3 });
    })
    it('returns the same coordinate in the board if right direction is issued and we have reached the right most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 0 }, Direction.RIGHT)
      ).toMatchObject({ x: 0, y: 0 });
    })
    it('returns the new coordinate in the board if up direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 2, y: 4 }, Direction.UP)
      ).toMatchObject({ x: 1, y: 4 });
    })
    it('returns the same coordinate in the board if up direction is issued and we have reached the up most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 0 }, Direction.UP)
      ).toMatchObject({ x: 0, y: 0 });
    })
    it('returns the new coordinate in the board if down direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 2, y: 4 }, Direction.DOWN)
      ).toMatchObject({ x: 3, y: 4 });
    })
    it('returns the same coordinate in the board if down direction is issued and we have reached the down most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 8, y: 0 }, Direction.DOWN)
      ).toMatchObject({ x: 8, y: 0 });
    })
    it('returns the start coordinate in the board if current position passed does not exist ', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 23 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 0 });
    })


  })
});
