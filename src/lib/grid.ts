import { Coords } from "@/components/types"

// prevents the widget boundaries to leave the allowed grid
export const constrainedInGrid = (coords: Coords, gridWidth: number): Coords => {
  return {
    height: coords.height,
    width: coords.width,
    top: Math.max(0, coords.top),
    left: Math.min(gridWidth - coords.width, Math.max(0, coords.left))
  }
}

export const getCoordsForElement = (element: HTMLElement): Coords => {
  return {
    height: parseInt(element.style.height),
    width: parseInt(element.style.width),
    top: parseInt(element.style.top),
    left: parseInt(element.style.left)
  }
}
