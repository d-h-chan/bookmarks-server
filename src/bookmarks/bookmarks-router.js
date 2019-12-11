const express = require('express')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const store = require('../store')


const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
  res
    .json(store);
  })
  .post(bodyParser, (req, res) => {
    /*{ id: uuid(),
    title: 'Thinkful',
    url: 'https://www.thinkful.com',
    description: 'Think outside the classroom',
    rating: 5 }*/

    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { title, url, description, rating } = req.body;
    
    if (!Number.isInteger(rating) || rating > 5 || rating < 0) {
      logger.error(`Invalid rating ${rating}`)
        return res.status(400).send(`Rating should be a number between 0 and 5 inclusive`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`${url} is not a valid URL`)
    }

    const bookmark = { id: uuid(), title, url, description, rating }

    store.bookmarks.push(bookmark)

    logger.info(`Bookmark with id ${bookmark.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
  })

  bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res) => {
    const { bookmark_id } = req.params

    const bookmark = store.bookmarks.find(c => c.id == bookmark_id)

    if (!bookmark) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    res.json(bookmark)
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params

    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    store.bookmarks.splice(bookmarkIndex, 1)

    logger.info(`Bookmark with id ${bookmark_id} deleted.`)
    res
      .status(204)
      .end()
  })

module.exports = bookmarksRouter
