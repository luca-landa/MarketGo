"use strict";

class Polygon {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.i = 1;
    }

    get area() {
        return this.i++;
    }

    set width(width) {
        this.width = width;
    }

    getArea() {
        return this.height * this.width;
    }
}

var x = new Polygon(1, 2);
console.log(x.area);
console.log(x.area);
console.log(x.getArea());