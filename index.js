'use strict'

const decode = Symbol('decode')
const encode = Symbol('encode')

function parsePair (segment) {
  return segment.trim().split('=')
}

class SetCookie {
  constructor (input, options) {
    if (Array.isArray(input)) {
      return input.map(item => new SetCookie(item, options))
    }

    options = options || {}
    let data = null

    // Options
    this[decode] = options.decode || decodeURIComponent
    this[encode] = options.encode || encodeURIComponent

    // Convert strings to objects
    if (typeof input === 'string') {
      const segments = input.split(';').map(parsePair)
      const pair = segments.shift()

      if (pair.length < 2 || !pair[0] || !pair[1]) {
        throw new Error('Invalid key-value pair')
      }

      data = {
        key: this[decode](pair[0]),
        value: this[decode](pair[1]),
        expires: undefined,
        maxAge: undefined,
        domain: undefined,
        path: undefined,
        secure: undefined,
        httpOnly: undefined,
        sameSite: undefined,
      }

      for (let pair of segments) {
        switch (pair[0].toLowerCase()) {
          case 'expires':
            const expires = new Date(pair[1])
            if (isNaN(expires.getTime())) {
              throw new Error('Invalid Expires field')
            }
            data.expires = expires
            break

          case 'max-age':
            const maxAge = parseInt(pair[1], 10)
            if (isNaN(maxAge)) {
              throw new Error('Invalid Max-Age field')
            }
            data.maxAge = maxAge
            break

          case 'domain':
            if (!pair[1]) {
              throw new Error('Invalid Domain field')
            }
            data.domain = pair[1]
            break

          case 'path':
            if (!pair[1]) {
              throw new Error('Invalid Path field')
            }
            data.path = pair[1]
            break

          case 'secure':
            if (pair[1]) {
              throw new Error('Invalid Secure field')
            }
            data.secure = true
            break

          case 'httponly':
            if (pair[1]) {
              throw new Error('Invalid HttpOnly field')
            }
            data.httpOnly = true
            break

          case 'samesite':
            if (!pair[1]) {
              throw new Error('Invalid SameSite field')
            }
            data.sameSite = pair[1]
            break
        }
      }

    // Passthrough objects as-is
    } else if (typeof input === 'object') {
      data = input

      if (!data.key || typeof data.key !== 'string') {
        throw new Error('Invalid key')
      }
      if (!data.value || typeof data.value !== 'string') {
        throw new Error('Invalid value')
      }
    } else {
      throw new Error('Invalid input type')
    }

    this.key = data.key
    this.value = data.value
    this.expires = data.expires
    this.maxAge = data.maxAge
    this.domain = data.domain
    this.path = data.path
    this.secure = data.secure
    this.httpOnly = data.httpOnly
    this.sameSite = data.sameSite
  }

  toString () {
    const pairs = [
      `${this[encode](this.key)}=${this[encode](this.value)}`
    ]

    if (typeof this.expires !== 'undefined') {
      pairs.push(`Expires=${this.expires.toUTCString()}`)
    }

    if (typeof this.maxAge !== 'undefined') {
      pairs.push(`Max-Age=${this.maxAge}`)
    }

    if (typeof this.domain !== 'undefined') {
      pairs.push(`Domain=${this.domain}`)
    }

    if (typeof this.path !== 'undefined') {
      pairs.push(`Path=${this.path}`)
    }

    if (typeof this.secure !== 'undefined') {
      pairs.push('Secure')
    }

    if (typeof this.httpOnly !== 'undefined') {
      pairs.push('HttpOnly')
    }

    if (typeof this.sameSite !== 'undefined') {
      pairs.push(`SameSite=${this.sameSite}`)
    }

    return pairs.join('; ')
  }
}

module.exports = SetCookie 
