# Battleship solitaire

[![CI - tests](https://github.com/lgrom/battleship-solitare/actions/workflows/jest.yml/badge.svg)](https://github.com/lgrom/battleship-solitare/actions/workflows/jest.yml) [![Eslint](https://github.com/lgrom/battleship-solitare/actions/workflows/eslint.yml/badge.svg)](https://github.com/lgrom/battleship-solitare/actions/workflows/eslint.yml)

TODO: 
- [X] functions to get surrounding ships
- [X] make it playable (left/right click functions)
- [X] add support for pre-existing ships
- [X] make setShip accept playtypes as well as ship objects
- [X] make graphical types auto-compute
- [X] add testing for pinned ships
- [X] make an automatic solver
- [ ] add styling to webpage
- [ ] make a solvable board generator with with options for difficulty and guess and check
- [ ] add dev documentation
- [ ] rename functions to be more consistent and concise
- [ ] improve overall code consistency

more specific things
- [X] make the styling automatically adjust for the width and height of the board
- [X] make position arrays start at 0 instead of 1
- [ ] ~~make setPlayType not call setGraphical type and update test accordingly~~
- [ ] ~~make isPlayType use a spread argument instead of an array for ships to compare~~
- [ ] rename graphicalTypeToRelativePosition to something shorter
- [X] soft flood row/column when the user clicks the number
- [ ] allow for click + drag
- [ ] ~~consider removing play type~~
- [X] make jsdoc more consistent (eg. dashes after param names, capitalization)
- [X] name "uni/bi-directional" variables as "cardinal" and "orthognol" (or however it's spelled)
- [X] store runs as 2 dimensional arrays where inner arrays = all indexes of squares in that run instead of just storing the start, end, and length of each run.

end goal:
- hard mode
  - history + checkpoints
- game sharing
  - convert state from and to base64 representation
- auto-generation
- auto-solving
  - hard mode/speculative solving
- board editor

development timeline:
- board editor
- game sharing
- auto-generation (easy mode)
- hard mode
- auto-solving (hard mode)
- auto-generation (hard mode)
- COMPLETE STYLING OVERHAUL + NEXT.JS

board editor:
- function to export/import board state from base64
- seperate react component (based on board)


### Specification for Base64 Exports
Supports up to a 256x256 board.
Specification:

width, 1B
height, 1B
column counts, ceil(log base 2 width)b * width
row counts, ceil(log base 2 height)b * height

runs:
  x = max(ceil(log base 2 width), ceil(log base 2 height))
  header, xb (number of entries)
  size, xb: count, 1B

boardstate:
  ship: 5b
    pinned: 1b
    type: 4b
  if pinned && type === 1111 or 1110
    repeat unknown (1111) or water (1110) for parseInt(ceil(log base 2 width*height))