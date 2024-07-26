# Battleship solitaire

[![CI - tests](https://github.com/lgrom/battleship-solitare/actions/workflows/jest.yml/badge.svg)](https://github.com/lgrom/battleship-solitare/actions/workflows/jest.yml)

TODO: 
- [X] functions to get surrounding ships
- [X] make it playable (left/right click functions)
- [X] add support for pre-existing ships
- [X] make setShip accept playtypes as well as ship objects
- [X] make graphical types auto-compute
- [X] add testing for pinned ships
- [ ] make an automatic solver
- [ ] make the styling automatically adjust for the width and heigh of the board
- [ ] make a solvable board generator with with options for difficulty and guess and check
- [ ] add styling to webpage
- [ ] make jsdoc more consistent (eg. dashes after param names, capitalization)
- [ ] add dev documentation

more specific things
- [ ] make position arrays start at 0 instead of 1
- [ ] name "uni/bi-directional" variables as "cardinal" and "orthognol" (or however it's spelled)
- [ ] store runs as 2 dimensional arrays where inner arrays = all indexes of squares in that run instead of just storing the start, end, and length of each run.
- [ ] add testing for execution time
- [X] for the countHorizontal/VerticalRuns functions you could update them to use indexes instead of position arrays. then instead of having an array of objects with length, start, and end properties, you just get the array's length, the first index, or the last index *
