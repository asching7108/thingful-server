const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])[\S]+/
const REGEX_NO_SPACES = /^\S*$/

const UsersService = {
	hasUserWithUserName(db, user_name) {
		return db('thingful_users')
			.where({ user_name })
			.first()
			.then(user => !!user)
	},

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters'
		}
		if (password.startsWith(' ') || password.endsWith(' ')) {
			return 'Password must not start or end with empty spaces'
		}
		if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
			return 'Password must contain 1 upper case, lower case, number and special character'
		}
		return null
	},

	validateUserName(user_name) {
		if (!REGEX_NO_SPACES.test(user_name)) {
			return 'Username must not contain spaces'
		}
	},

	insertUser(db, newUser) {
		return db
			.insert(newUser)
			.into('thingful_users')
			.returning('*')
			.then(([user]) => user)
	},

	hashPassword(password) {
		return bcrypt.hash(password, 12)
	},
	
	serializeUser(user) {
		return {
			id: user.id,
			user_name: xss(user.user_name),
			full_name: xss(user.full_name),
			nickname: xss(user.nickname),
			date_created: new Date(user.date_created)
		}
	},
}

module.exports = UsersService