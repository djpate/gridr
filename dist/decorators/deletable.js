export const deletable = (widget) => {
    Array.from(widget.element.getElementsByClassName('closeHandle')).forEach((handler) => {
        handler.addEventListener('click', () => {
            widget.delete();
        });
    });
};
//# sourceMappingURL=deletable.js.map