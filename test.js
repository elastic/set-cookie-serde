'use strict'

const SetCookie = require('./')

const tap = require('tap')

function datesMatch (a, b) {
  if (!(a instanceof Date)) return false
  if (!(b instanceof Date)) return false
  return a.toUTCString() === b.toUTCString()
}

function compare (t, cookie, data) {
  for (let key of Object.keys(cookie)) {
    if (key === 'expires' && typeof data.expires !== 'undefined') {
      t.ok(datesMatch(cookie[key], data[key]), `${key} date matches`)
    } else {
      t.equal(cookie[key], data[key], `${key} is ${data[key]}`)
    }
  }
}

function makeTest (t, test) {
  t.test(test.name, t => {
    t.test(`object form: ${JSON.stringify(test.data)}`, t => {
      const cookie = new SetCookie(test.data)
      compare(t, cookie, test.data)
      t.end()
    })

    t.test(`string form: "${test.string}"`, t => {
      const cookie = new SetCookie(test.string)
      compare(t, cookie, test.data)
      t.end()
    })

    t.test('to string', t => {
      const cookie = new SetCookie(test.data)
      t.equal(`${cookie}`, test.string, `string form is "${test.string}"`)
      t.end()
    })

    t.test('to json', t => {
      const cookie = new SetCookie(test.data)
      const data = JSON.stringify(test.data)
      t.equal(`${JSON.stringify(cookie)}`, data, `json form is "${data}"`)
      t.end()
    })

    t.end()
  })
}

const tests = [
  {
    name: 'basic key/value pair',
    string: 'foo=bar',
    data: {
      key: 'foo',
      value: 'bar'
    }
  },
  {
    name: 'boolean directives',
    string: 'foo=bar; Secure; HttpOnly',
    data: {
      key: 'foo',
      value: 'bar',
      secure: true,
      httpOnly: true
    }
  },
  {
    name: 'number directives',
    string: 'foo=bar; Max-Age=100',
    data: {
      key: 'foo',
      value: 'bar',
      maxAge: 100
    }
  },
  {
    name: 'string directives',
    string: 'foo=bar; Domain=example.com; Path=/; SameSite=Strict',
    data: {
      key: 'foo',
      value: 'bar',
      domain: 'example.com',
      path: '/',
      sameSite: 'Strict'
    }
  },
  {
    name: 'date directives',
    string: 'foo=bar; Expires=Wed, 21 Oct 2015 07:28:00 GMT',
    data: {
      key: 'foo',
      value: 'bar',
      expires: new Date('Wed, 21 Oct 2015 07:28:00 GMT')
    }
  }
]

tests.map(test => makeTest(tap, test))

tap.test('arrays', t => {
  const cookies = new SetCookie([
    'foo=bar',
    'baz=buz'
  ])

  t.ok(Array.isArray(cookies), 'is an array')
  t.equal(cookies.length, 2, 'has two items')

  t.comment('first item')
  compare(t, cookies[0], {
    key: 'foo',
    value: 'bar'
  })

  t.comment('second item')
  compare(t, cookies[1], {
    key: 'baz',
    value: 'buz'
  })

  t.end()
})

tap.test('validation', t => {
  t.throws(
    () => new SetCookie(1),
    /^Invalid input type$/,
    'invalid input type'
  )

  t.throws(
    () => new SetCookie({ value: 'bar' }),
    /^Invalid key$/,
    'invalid key'
  )

  t.throws(
    () => new SetCookie({ key: 'foo' }),
    /^Invalid value$/,
    'invalid value'
  )

  t.throws(
    () => new SetCookie(''),
    /^Invalid key-value pair$/,
    'empty key-value string'
  )

  t.throws(
    () => new SetCookie('='),
    /^Invalid key-value pair$/,
    'empty key and value'
  )

  t.throws(
    () => new SetCookie('=bar'),
    /^Invalid key-value pair$/,
    'empty key'
  )

  t.throws(
    () => new SetCookie('foo='),
    /^Invalid key-value pair$/,
    'empty value'
  )

  t.throws(
    () => new SetCookie('foo=bar; Expires=wrong'),
    /^Invalid Expires field$/,
    'invalid Expires field'
  )

  t.throws(
    () => new SetCookie('foo=bar; Max-Age=wrong'),
    /^Invalid Max-Age field$/,
    'invalid Max-Age field'
  )

  t.throws(
    () => new SetCookie('foo=bar; Domain='),
    /^Invalid Domain field$/,
    'invalid Domain field'
  )

  t.throws(
    () => new SetCookie('foo=bar; Path='),
    /^Invalid Path field$/,
    'invalid Path field'
  )

  t.throws(
    () => new SetCookie('foo=bar; Secure=wrong'),
    /^Invalid Secure field$/,
    'invalid Secure field'
  )

  t.throws(
    () => new SetCookie('foo=bar; HttpOnly=wrong'),
    /^Invalid HttpOnly field$/,
    'invalid HttpOnly field'
  )

  t.throws(
    () => new SetCookie('foo=bar; SameSite='),
    /^Invalid SameSite field$/,
    'invalid SameSite field'
  )

  t.end()
})
