import { PLAY_TYPES } from "./Ship";

class BoardState {
    dimensions = [5, 5];
    state;

    constructor (dimensions) {
        this.dimensions = dimensions;
        this.state = new Array.fill(dimensions[0] * dimensions[1]).fill(new Ship(Ship.PLAY_TYPES.UNKOWN))
    }
}