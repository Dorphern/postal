import Random from 'random-seed'
import Convert from 'color-convert'

export const getAvatarColor = string => {
  const rand = Random.create(string)
  const hue = rand(360)

  return {
    backgroundLight: '#' + Convert.hsl.hex([hue, 46, 53]),
    backgroundDark: '#' + Convert.hsl.hex([hue, 46, 44]),
    foreground: '#' + Convert.hsl.hex([hue, 76, 93]),
  }
}
