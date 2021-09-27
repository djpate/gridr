import { Widget } from "../widget"

export const deletable = (widget: Widget): void => {
  Array.from(widget.element.getElementsByClassName('closeHandle')).forEach((handler: HTMLElement) => {
    handler.addEventListener('click', () => {
      widget.delete()
    })
  })
}