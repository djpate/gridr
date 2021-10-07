export type Coords = {
  width: number
  height: number
  top: number
  left: number
}

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];