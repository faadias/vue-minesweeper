<template>
  <div class="board" :style="cssVars">
    <header class="board__header">
      <button class="header__button header__button--bombs" @click="loseGame" title="End game">
        {{ minesButtonLabel }}
      </button>

      <button class="header__button header__button--start" @click="startGame" title="Restart game">
        {{ mainButtonLabel }}
      </button>

      <button class="header__button header__button--flags" @click="retrieveFlags" title="Remove flags">
        {{ flagsButtonLabel }}
      </button>
    </header>

    <section class="board__gamearea" :class="{ 'board__gamearea--ready': ready }">
      <button
        v-for="(cell, index) in cells"
        :key="`cell-${index}`"
        class="board__cell"
        :class="{
          'board__cell--open': cell.open,
          'board__cell--boom': cell.open && cell.value === -1 && cell.index === explosionIndex,
          'board__cell--active': !cell.open && cell.active,
        }"
        @click.left.exact="probeCell(cell)"
        @click.right.prevent="toggleCellFlag(cell)"
        @click.middle.prevent="probeAreaAroundCell(cell)"
        @click.ctrl.exact="probeAreaAroundCell(cell)"
        @mousedown.left.exact="activateCell(cell)"
        @mousedown.middle="activateCells(cell)"
        @mousedown.ctrl.exact="activateCells(cell)"
        :data-content="cell.value"
        :data-flag="cell.flag || undefined"
      >
        <span>{{ computedCellsContent[index] }}</span>
      </button>
    </section>
  </div>
</template>

<script>
const MINE = -1

export default {
  name: 'MineSweeper',
  props: {
    rows: {
      type: Number,
      default: 16,
      validator(value) {
        return value > 0
      },
    },
    cols: {
      type: Number,
      default: 16,
      validator(value) {
        return value > 0
      },
    },
    mines: {
      type: Number,
      default: 16,
    },
    zoom: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    cssVars() {
      return {
        '--cell-size': `calc(${this.zoom} * ${this.cellSize}`,
        '--board-width': `calc(${this.zoom} * ${this.cellSize} * ${this.cols})`,
      }
    },
    cellsCount() {
      return this.rows * this.cols
    },
    computedMines() {
      return Math.min(this.mines, this.cellsCount)
    },
    minesButtonLabel() {
      return `💣 ${this.computedMines}`
    },
    flagsButtonLabel() {
      return `${this.flags} 🚩`
    },
    mainButtonLabel() {
      if (this.won) {
        return '😎'
      }

      if (this.activeCells.length > 0) {
        return '😮'
      }

      return this.ready ? '🙂' : '😵'
    },
    computedCellsContent() {
      return this.cells.map((cell) => {
        if (!cell.open) {
          return cell.flag ? '🚩' : null
        }

        if (cell.value === MINE) {
          return '💣'
        }

        if (cell.flag) {
          return '❌'
        }

        return `${cell.value}`
      })
    },
  },
  watch: {
    cellsCount(newVal) {
      if (newVal > 0) {
        this.startGame()
      }
    },
    computedMines(newVal) {
      if (newVal > 0) {
        this.startGame()
      }
    },
  },
  data() {
    return {
      cells: [],
      activeCells: [],
      explosionIndex: null,
      ready: false,
      won: false,
      flags: 0,
      cellSize: '1.5rem',
    }
  },
  methods: {
    checkGameWon() {
      const gameWon = this.cells.filter((cell) => !cell.open).every((cell) => cell.value === MINE)
      if (gameWon) {
        this.endGame()
      }
    },
    toggleCellFlag(cell) {
      if (cell.open) {
        return
      }
      cell.flag = !cell.flag
      if (cell.flag) {
        this.flags--
      } else {
        this.flags++
      }
    },
    digCell(targetCell) {
      if (targetCell.flag) {
        return
      }

      targetCell.open = true

      if (targetCell.value === 0) {
        this.getNeighbourCells(targetCell.index)
          .filter((cell) => !cell.open)
          .forEach((cell) => this.digCell(cell))
      }
    },
    probeCell(targetCell) {
      if (targetCell.flag || targetCell.open) {
        return
      }

      if (targetCell.value === MINE) {
        this.endGame(targetCell)
        return
      }

      this.digCell(targetCell)
      this.checkGameWon()
    },
    probeAreaAroundCell(targetCell) {
      if (!targetCell.open) {
        return
      }

      const neighbourClosedCells = this.getNeighbourCells(targetCell.index).filter((cell) => !cell.open)

      const hasWrongFlaggedCell = neighbourClosedCells.some((cell) => cell.value !== MINE && cell.flag)

      const nonFlaggedMine = neighbourClosedCells.find((cell) => cell.value === MINE && !cell.flag)

      if (hasWrongFlaggedCell && nonFlaggedMine) {
        this.endGame(nonFlaggedMine)
        return
      }

      if (!nonFlaggedMine) {
        neighbourClosedCells.forEach((cell) => this.digCell(cell))

        this.checkGameWon()
      }
    },
    activateCell(targetCell) {
      if (targetCell.flag || targetCell.open) {
        return
      }

      targetCell.active = true
      this.activeCells.push(targetCell)
    },
    activateCells(targetCell) {
      this.getNeighbourCells(targetCell.index).forEach((cell) => this.activateCell(cell))
    },
    deactivateCells() {
      this.activeCells.forEach((cell) => (cell.active = false))
      this.activeCells = []
    },
    getNeighbourCellsIndexes(cellIndex) {
      const [cellRow, cellCol] = [Math.floor(cellIndex / this.cols), cellIndex % this.cols]

      const neighbourCellsIndexes = [-1, 0, 1]
        .map((dx) => cellRow + dx)
        .filter((row) => row >= 0 && row < this.rows)
        .map((row) =>
          [-1, 0, 1]
            .map((dy) => cellCol + dy)
            .filter((col) => col >= 0 && col < this.cols)
            .map((col) => row * this.cols + col),
        )
        .flat()

      return neighbourCellsIndexes
    },
    getNeighbourCells(cellIndex) {
      return this.getNeighbourCellsIndexes(cellIndex).map((index) => this.cells[index])
    },
    loseGame() {
      this.endGame(this.cells.find((cell) => cell.value === -1))
    },
    retrieveFlags() {
      if (this.flags === this.computedMines) {
        return
      }

      this.cells.forEach((cell) => (cell.flag = false))
      this.flags = this.computedMines
    },
    endGame(explosionCell) {
      const gameLost = !!explosionCell

      if (gameLost) {
        this.explosionIndex = explosionCell.index
        this.cells.forEach((cell) => (cell.open = true))
      } else {
        this.won = true
        this.flags = 0
        this.cells.forEach((cell) => {
          if (cell.value === MINE) {
            cell.flag = true
          } else {
            cell.open = true
          }
        })
      }

      this.ready = false
    },
    startGame() {
      this.won = false
      this.flags = this.computedMines
      this.cells = Array(this.cellsCount)
        .fill({
          value: null,
          index: null,
          flag: false,
          open: false,
          active: false,
        })
        .map((content, index) => ({
          ...content,
          value: index < this.computedMines ? MINE : 0,
        }))
        .sort(() => 0.5 - Math.random())
        .map((content, index, cellsArray) => {
          if (content.value === MINE) {
            return {
              ...content,
              index,
            }
          }
          const minedCells = this.getNeighbourCellsIndexes(index)
            .map((index) => cellsArray[index])
            .filter((cell) => cell.value === MINE)

          return {
            ...content,
            index,
            value: minedCells.length,
          }
        })

      this.ready = true
      this.checkGameWon()
    },
  },
  mounted() {
    document.addEventListener('mouseup', this.deactivateCells)
    this.startGame()
  },
  beforeUnmount() {
    document.removeEventListener('mouseup', this.deactivateCells)
  },
}
</script>

<style scoped lang="scss">
.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--board-width);
  margin: auto;
  user-select: none;
}

.board__header {
  display: flex;
  color: white;
  align-items: center;
  justify-content: space-between;
  background-color: darkblue;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  font-size: calc(var(--cell-size) * 0.75);
  min-width: calc(var(--cell-size) * 15);
  width: 100%;
}

.header__button {
  box-sizing: border-box;
  font-size: 1em;
  background-color: transparent;
  border: none;
  height: 2em;
  cursor: pointer;
  white-space: nowrap;
  color: white;
  flex: 0;
  padding-inline: 1rem;
}
.header__button:hover {
  opacity: 0.9;
}
.header__button:active {
  opacity: 0.6;
}

.header__button--bombs {
  width: 20%;
  text-align: left;
}
.header__button--flags {
  width: 20%;
  text-align: right;
}

.board__gamearea {
  display: flex;
  flex-wrap: wrap;
  pointer-events: none;
}
.board__gamearea--ready {
  pointer-events: all;
}

.board__cell {
  display: flex;
  width: var(--cell-size);
  height: var(--cell-size);
  background-color: #ccc;
  border: 2px outset #eee;
  box-sizing: border-box;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  font-family: monospace;
  font-weight: bold;
  font-size: calc(var(--cell-size) / 2);
}
.board__cell:not(.board__cell--open):hover {
  background-color: #ddd;
}

.board__cell--open {
  border: 1px dotted #bbb;
  color: black;
  cursor: default;
}

.board__cell--boom {
  background-color: red;
}

.board__cell--active {
  border-style: inset;
  background-color: #ddd;
}

$colors: transparent, blue, green, red, darkblue, maroon, darkcyan, purple, black;
@for $index from 1 through length($colors) {
  $color: nth($colors, $index);
  .board__cell--open[data-content='#{$index - 1}'] {
    color: $color;
  }
}
</style>
