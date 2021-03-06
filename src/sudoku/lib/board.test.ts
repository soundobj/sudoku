import * as utils from './board'
import { createBoardRow } from './utils.test'
import { Direction } from './definitions'

describe('sudoku/boar',() => {
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
        utils.navigateBoard(board, { x: 0, y: 1 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 0 });
    })
    it('returns the opposite coordinate in the board if left direction is issued and we have reached the left most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 0 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 8 });
    })
    it('returns the new coordinate in the board if right direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 4 }, Direction.RIGHT)
      ).toMatchObject({ x: 0, y: 5 });
    })
    it('returns the opposite coordinate in the board if right direction is issued and we have reached the right most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 8 }, Direction.RIGHT)
      ).toMatchObject({ x: 0, y: 0 });
    })
    it('returns the new coordinate in the board if up direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 2, y: 4 }, Direction.UP)
      ).toMatchObject({ x: 1, y: 4 });
    })
    it('returns the opposite coordinate in the board if up direction is issued and we have reached the up most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 0 }, Direction.UP)
      ).toMatchObject({ x: 8, y: 0 });
    })
    it('returns the new coordinate in the board if down direction is issued', () => {
      expect(
        utils.navigateBoard(board, { x: 2, y: 4 }, Direction.DOWN)
      ).toMatchObject({ x: 3, y: 4 });
    })
    it('returns the opposite coordinate in the board if down direction is issued and we have reached the down most side of the board', () => {
      expect(
        utils.navigateBoard(board, { x: 8, y: 0 }, Direction.DOWN)
      ).toMatchObject({ x: 0, y: 0 });
    })
    it('returns the start coordinate in the board if current position passed does not exist ', () => {
      expect(
        utils.navigateBoard(board, { x: 0, y: 23 }, Direction.LEFT)
      ).toMatchObject({ x: 0, y: 0 });
    })
  })
  describe("nextLeftAvailable", () => {
    const board = [
      createBoardRow([0, 1, 2, 3, 4, 5, 6, 7, 8], 0, {
        0: true,
        1: true,
        2: false,
        3: false,
        4: false,
        5: true,
        6: true,
        7: false,
        8: true,
      }),
    ];
    board[0][3].value = 3;
    it("find the next available position towards the left, skipping two autogenerated cells", () => {
      expect(
        utils.nextLeftAvailable(board, { x: 0, y: 7 })
      ).toMatchObject({ x: 0, y: 4 });
    });
    it('find the next available position towards the left skipping any correctly inputed cells', () => {
      expect(
        utils.nextLeftAvailable(board, { x: 0, y: 4 })
      ).toMatchObject({ x: 0, y: 2 });
    })
    it('find the next available position towards the left skipping any autogenerated cells at the beginning of the row', () => {
      expect(
        utils.nextLeftAvailable(board, { x: 0, y: 2 })
      ).toMatchObject({ x: 0, y: 2 });
    })
  });
  describe("nexRightAvailable", () => {
    const board = [
      createBoardRow([1, 2, 3, 4, 5, 6, 7, 8, 9], 0, {
        0: true,
        1: true,
        5: true,
        6: true,
        8: true,
      }),
    ];
    board[0][3].value = 4;
    it("find the next available position towards the right, skipping any correctly inputed cells", () => {
      const currentPosition = { x: 0, y: 2 };
      expect(
        utils.nextRightAvailable(board, currentPosition)
      ).toMatchObject({ x: 0, y: 4 });
    });
    it('find the next available position towards the right skipping two autogenerated cells', () => {
      const currentPosition = { x: 0, y: 4 };
      expect(
        utils.nextRightAvailable(board, currentPosition)
      ).toMatchObject({ x: 0, y: 7 });
    })
    it('find the next available position towards the right skipping any autogenerated cells at the end of the row', () => {
      const currentPosition = { x: 0, y: 7 };
      expect(
        utils.nextRightAvailable(board, currentPosition)
      ).toMatchObject({ x: 0, y: 7 });
    })
  });
  describe('nextDownAvailable',() => {
    const board = [
      createBoardRow([1], 0, { 0: true }),
      createBoardRow([2], 1, { 0: false }),
      createBoardRow([3], 2, { 0: false }),
      createBoardRow([4], 3, { 0: false }),
      createBoardRow([5], 4, { 0: true }),
      createBoardRow([6], 5, { 0: true }),
      createBoardRow([7], 6, { 0: false }),
      createBoardRow([8], 7, { 0: false }),
      createBoardRow([9], 8, { 0: true }),
    ];
    board[3][0].value = 4
    it('find the next available position downwards, skipping any correctly inputed cells', () => {
      const currentPosition = { x: 2, y: 0 };
      expect(
        utils.nextDownAvailable(board, currentPosition)
      ).toMatchObject({ x: 6, y: 0 });
    })
    it('find the next available position downwards skipping any autogenerated cells at the end of the row', () => {
      const currentPosition = { x: 7, y: 0 };
      expect(
        utils.nextDownAvailable(board, currentPosition)
      ).toMatchObject({ x: 7, y: 0 });
    })
  })
  describe('nextUpAvailable',() => {
    const board = [
      createBoardRow([1], 0, { 0: true }),
      createBoardRow([2], 1, { 0: false }),
      createBoardRow([3], 2, { 0: false }),
      createBoardRow([4], 3, { 0: false }),
      createBoardRow([5], 4, { 0: true }),
      createBoardRow([6], 5, { 0: true }),
      createBoardRow([7], 6, { 0: false }),
      createBoardRow([8], 7, { 0: false }),
      createBoardRow([9], 8, { 0: true }),
    ];
    board[3][0].value = 4
    it('find the next available position downwards, skipping any correctly inputed cells', () => {
      const currentPosition = { x: 6, y: 0 };
      expect(
        utils.nextUpAvailable(board, currentPosition)
      ).toMatchObject({ x: 2, y: 0 });
    })
    it('find the next available position downwards skipping any autogenerated cells at the end of the row', () => {
      const currentPosition = { x: 1, y: 0 };
      expect(
        utils.nextUpAvailable(board, currentPosition)
      ).toMatchObject({ x: 1, y: 0 });
    })
  })
  describe('nextOverflowAvailable',() => {
    const board = [
      createBoardRow([0], 0, { 0: true }),
      createBoardRow([1], 1, { 0: false }),
      createBoardRow([2], 2, { 0: false }),
      createBoardRow([3], 3, { 0: false }),
      createBoardRow([4], 4, { 0: true }),
      createBoardRow([5], 5, { 0: true }),
      createBoardRow([6], 6, { 0: false }),
      createBoardRow([7], 7, { 0: false }),
      createBoardRow([8], 8, { 0: true }),
    ];
    board[3][0].value = 3
    it('finds the next free or incorrect cell in the row in the opposite side if there are not more available in the move direction', () => {
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 1, y: 0 }, Direction.UP)
      ).toMatchObject({ x: 7, y: 0 });
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 7, y: 0 }, Direction.UP)
      ).toMatchObject({ x: 6, y: 0 });
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 6, y: 0 }, Direction.UP)
      ).toMatchObject({ x: 2, y: 0 });
    })
    it('recurses towards the a new column if there are not any other available spaces in the current column', () => {
      const board = [
        createBoardRow([0, 0], 0, { 0: true, 1: true }),
        createBoardRow([1, 1], 1, { 0: true, 1: true }),
        createBoardRow([2, 2], 2, { 0: true, 1: true }),
        createBoardRow([3, 3], 3, { 0: false, 1: false }),
        createBoardRow([4, 4], 4, { 0: false, 1: true }),
        createBoardRow([5, 5], 5, { 0: false, 1: true }),
        createBoardRow([6, 6], 6, { 0: true, 1: true }),
        createBoardRow([7, 7], 7, { 0: true, 1: true }),
        createBoardRow([8, 8], 8, { 0: true, 1: true }),
      ];
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 3, y: 1 }, Direction.UP)
      ).toMatchObject({ x: 5, y: 0 });
    })
    it('recurses towards the new column far away if there are not any other available spaces in the current column or next column', () => {
      const board = [
        createBoardRow([0, 0, 0], 0, { 0: true, 1: true, 2: true }),
        createBoardRow([1, 1, 1], 1, { 0: true, 1: true, 2: true }),
        createBoardRow([2, 2, 2], 2, { 0: true, 1: true, 2: true }),
        createBoardRow([3, 3, 3], 3, { 0: true, 1: true, 2: true }),
        createBoardRow([4, 4, 4], 4, { 0: true, 1: false, 2: false }),
        createBoardRow([5, 5, 5], 5, { 0: true, 1: true, 2: false }),
        createBoardRow([6, 6, 6], 6, { 0: true, 1: true, 2: true }),
        createBoardRow([7, 7, 7], 7, { 0: true, 1: true, 2: true }),
        createBoardRow([8, 8, 8], 8, { 0: true, 1: true, 2: true }),
      ];
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 4, y: 1 }, Direction.UP)
      ).toMatchObject({ x: 5, y: 2 });
    })
    it('returns the same coordinate if the board is completely filled up apart from the current coordinate', () => {
      const board = [
        createBoardRow([0, 0, 0], 0, { 0: true, 1: true, 2: true }),
        createBoardRow([1, 1, 1], 1, { 0: true, 1: true, 2: true }),
        createBoardRow([2, 2, 2], 2, { 0: true, 1: true, 2: true }),
        createBoardRow([3, 3, 3], 3, { 0: true, 1: true, 2: true }),
        createBoardRow([4, 4, 4], 4, { 0: true, 1: false, 2: true }),
        createBoardRow([5, 5, 5], 5, { 0: true, 1: true, 2: true }),
        createBoardRow([6, 6, 6], 6, { 0: true, 1: true, 2: true }),
        createBoardRow([7, 7, 7], 7, { 0: true, 1: true, 2: true }),
        createBoardRow([8, 8, 8], 8, { 0: true, 1: true, 2: true }),
      ];
      expect(
        utils.navigateBoardNextAvailableOverflow(board, { x: 4, y: 1 }, Direction.UP)
      ).toMatchObject({ x: 4, y: 1 });
    })
  })
  describe('filterOutCellByCoordinate',() => {
    it('it filters out the items that have the same coordinate supplied', () => {
      const filterOutCoordinate = {x:0, y:0}
      const coordinates = [
        {coordinate: {x:1, y:0}},
        {coordinate: {x:0, y:2}},
        {coordinate: filterOutCoordinate}
      ]
      const curriedFilter = utils.filterOutCellByCoordinate(filterOutCoordinate)
      // @ts-ignore
      expect(coordinates.filter(curriedFilter)).toMatchObject([
        {coordinate: {x:1, y:0}},
        {coordinate: {x:0, y:2}}])
    })
  })
  describe('getBoardDimensions',() => {
    it('returns the x and y dimentsions of the board', () => {
      const board = [
        createBoardRow([0, 0, 0], 0, { 0: true, 1: true, 2: true }),
        createBoardRow([1, 1, 1], 1, { 0: true, 1: true, 2: true }),
        createBoardRow([2, 2, 2], 2, { 0: true, 1: true, 2: true }),
        createBoardRow([3, 3, 3], 3, { 0: true, 1: true, 2: true }),
        createBoardRow([4, 4, 4], 4, { 0: true, 1: false, 2: true }),
        createBoardRow([5, 5, 5], 5, { 0: true, 1: true, 2: true }),
        createBoardRow([6, 6, 6], 6, { 0: true, 1: true, 2: true }),
        createBoardRow([7, 7, 7], 7, { 0: true, 1: true, 2: true }),
        createBoardRow([8, 8, 8], 8, { 0: true, 1: true, 2: true }),
      ];
      expect(utils.getBoardDimensions(board)).toMatchObject({x:9, y:3})
    })
    it('returns the x and y dimentsions of the board empty y', () => {
      expect(utils.getBoardDimensions([[]])).toMatchObject({x:1, y:0})
    })
  })

})