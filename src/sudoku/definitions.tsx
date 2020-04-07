export enum MoveTypes {
  CANDIDATE = "CANDIDATE",
  NUMBER = "NUMBER"
}

export enum GameLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT"
}

export const ALLOWED_MISTAKES = 3
export const BOARD_SIZE = 81
export const VALID_NUMBERS = [1,2,3,4,5,6,7,8,9]

export interface Move {
  coordinate: Coordinate
  value: number
  type: MoveTypes
}

export interface Cell {
  autogenerated: boolean;
  value?: number;
  solution: number;
  coordinate: Coordinate;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface NumberDifficulty {
  [key: number]: {count: number}
}
