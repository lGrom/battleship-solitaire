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
- [ ] make the styling automatically adjust for the width and heigh of the board
- [ ] make position arrays start at 0 instead of 1
- [ ] make setPlayType not call setGraphical type and update test accordingly
- [ ] make isPlayType use a spread argument instead of an array for ships to compare
- [ ] rename graphicalTypeToRelativePosition to something shorter
- [ ] soft flood row/column when the user clicks the number
- [ ] allow for click + drag
- [ ] consider removing play type
- [X] make jsdoc more consistent (eg. dashes after param names, capitalization)
- [X] name "uni/bi-directional" variables as "cardinal" and "orthognol" (or however it's spelled)
- [X] store runs as 2 dimensional arrays where inner arrays = all indexes of squares in that run instead of just storing the start, end, and length of each run.
