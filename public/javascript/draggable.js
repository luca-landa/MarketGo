"use strict";

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.target.classList.add('dragging');
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
}

function dragEnter(event) {
    event.preventDefault();
    console.log('dragenter triggered');
}