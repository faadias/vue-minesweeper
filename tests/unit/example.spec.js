import { mount, shallowMount } from '@vue/test-utils'
import MineSweeper from '@/components/MineSweeper.vue'

const [rows, cols] = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1]
const mines = Math.floor(Math.sqrt(rows * cols))

describe(`MineSweeper.vue tests: ${rows} rows, ${cols} cols and ${mines} mines`, () => {
  it('should correctly calculate board size given props', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols },
    })
    expect(wrapper.vm.cellsCount).toBe(rows * cols)
  })

  it('should set mines quantity according to prop mines', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines },
    })
    expect(wrapper.vm.computedMines).toBe(mines)
  })

  it('should cap maximum mines to rows*cols', () => {
    let testMines = rows * cols + 1
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines: testMines },
    })
    expect(wrapper.vm.computedMines).not.toBe(testMines)
    expect(wrapper.vm.computedMines).toBe(rows * cols)
  })

  it('should build empty board if no mines are given', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines: 0 },
    })
    expect(wrapper.vm.cells.every((cell) => cell.value === 0)).toBe(true)
  })

  it('should win the game if mines === rows*cols', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines: rows * cols },
    })
    expect(wrapper.vm.cells.every((cell) => cell.flag)).toBe(true)
    expect(wrapper.vm.won).toBe(true)
    expect(wrapper.vm.ready).toBe(false)
    expect(wrapper.vm.mainButtonLabel).toBe('😎')
  })

  it('should corretly build board labels', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines },
    })
    expect(wrapper.vm.minesButtonLabel).toBe(`💣 ${mines}`)
    expect(wrapper.vm.flagsButtonLabel).toBe(`${mines} 🚩`)
    expect(wrapper.vm.mainButtonLabel).toBe('🙂')
  })

  it('should build cells in board correctly', () => {
    expect.extend({
      toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling
        if (pass) {
          return {
            message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
            pass: true,
          }
        } else {
          return {
            message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false,
          }
        }
      },
    })

    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines },
    })

    expect(wrapper.vm.cells.length).toBe(rows * cols)

    expect(wrapper.vm.cells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: expect.toBeWithinRange(-1, 8),
          index: expect.toBeWithinRange(0, rows * cols - 1),
          flag: false,
          open: false,
          active: false,
        }),
      ]),
    )

    expect(wrapper.vm.cells.filter((cell) => cell.value === -1).length).toBe(mines)

    const cellsAsMatrix = []
    for (let i = 0; i < rows * cols; i += cols) {
      cellsAsMatrix.push(wrapper.vm.cells.slice(i, i + cols))
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (cellsAsMatrix[i][j].value === -1) continue

        const neighbourMineCount = [
          [i - 1, j - 1],
          [i - 1, j],
          [i - 1, j + 1],
          [i, j - 1],
          [i, j + 1],
          [i + 1, j - 1],
          [i + 1, j],
          [i + 1, j + 1],
        ]
          .filter((index) => index[0] >= 0 && index[0] < rows && index[1] >= 0 && index[1] < cols)
          .map((index) => cellsAsMatrix[index[0]][index[1]])
          .filter((cell) => !!cell && cell.value === -1).length

        expect(cellsAsMatrix[i][j].value).toBe(neighbourMineCount)
      }
    }
  })

  it('should lose the game if a mine is pressed', () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines },
    })

    const cellWithMine = wrapper.vm.cells.find((cell) => cell.value === -1)
    wrapper.vm.probeCell(cellWithMine)

    expect(wrapper.vm.ready).toBe(false)
    expect(wrapper.vm.won).toBe(false)
    expect(wrapper.vm.mainButtonLabel).toBe('😵')
  })

  it('should activate cell if it is pressed', async () => {
    const wrapper = shallowMount(MineSweeper, {
      props: { rows, cols, mines },
    })

    await wrapper.vm.$nextTick()

    await wrapper.find('button.board__cell').trigger('mousedown', { button: 0 })

    expect(wrapper.vm.activeCells.length).toBe(1)
    expect(wrapper.vm.mainButtonLabel).toBe('😮')
  })
})
