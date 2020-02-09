const express = require('express')
const path = require('path')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { user_name, password, full_name, nickname } = req.body
		const regUser = { user_name, password, full_name }

		for (const [key, value] of Object.entries(regUser)) {
			if (value == null) {
				return res.status(400).json({
					error: `Missing '${key}' in request body`
				})
			}
		}

		const passwordError = UsersService.validatePassword(password)
		const userNameError = UsersService.validateUserName(user_name)

		if (passwordError) {
			return res.status(400).json({ error: passwordError })
		}

		if (userNameError) {
			return res.status(400).json({ error: userNameError })
		}

		UsersService.hasUserWithUserName(
			req.app.get('db'),
			user_name
		)
			.then(hasUserWithUserName => {
				if (hasUserWithUserName) {
					return res.status(400).json({ error: 'Username already taken' })
				}

				return UsersService.hashPassword(password)
					.then(hashedPassword => {
						const newUser = {
							user_name,
							password: hashedPassword,
							full_name,
							nickname,
							date_created: 'now()'
						}
		
						return UsersService.insertUser(
							req.app.get('db'),
							newUser
						)
							.then(user => {
								res.status(201)
									.location(path.posix.join(req.originalUrl, `${user.id}`))
									.json(UsersService.serializeUser(user))
							})
					})
			})
			.catch(next)
  })

module.exports = usersRouter