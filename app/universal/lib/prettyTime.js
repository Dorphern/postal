import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths'
import format from 'date-fns/format'

export const shortRelativeFormat = (date, to = new Date()) => {
  const daysAgo = differenceInCalendarDays(to, date)
  const monthsAgo = differenceInCalendarMonths(to, date)

  if (daysAgo === 0) {
    return format(date, 'HH:mm')
  } else if (daysAgo < 7) {
    return format(date, 'iii')
  } else if (monthsAgo <= 6) {
    return format(date, 'MMM d')
  } else {
    return format(date, 'MMM d, yyyy')
  }
}

export const relativeFormatWithTime = (date, to = new Date()) => {
  const daysAgo = differenceInCalendarDays(to, date)
  const monthsAgo = differenceInCalendarMonths(to, date)

  if (daysAgo === 0) {
    return format(date, 'HH:mm')
  } else if (daysAgo < 7) {
    return format(date, "iiii 'at' HH:mm")
  } else if (monthsAgo <= 6) {
    return format(date, "iiii, MMM d 'at' HH:mm")
  } else {
    return format(date, "iiii, MMM d, yyyy 'at' HH:mm")
  }
}
