const express = require('express');
const router = express.Router();
const { Book } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["id"]]}).then(function(books){
    res.render('books/index', { books: books, title: 'Library Books' });
  }).catch(function(err){
    res.sendStatus(500);
  });
});

router.get('/search', (req, res, next) => {
  let { term } = req.query;
  let { category } = req.query;
  
  // console.log(req.query.term, req.query.category);

  Book.findAll({ where: { [category]: { [Op.like]: `%${term}%` } }})
    .then(books => res.render('books/index', { books: books, title: 'Search Results' }))
    .catch((error) => {
      next(error);
      console.log(error.message);
      });
});

/* POST create book. */
router.post('/new', function(req, res, next) {
    Book.create(req.body).then(function(book) {
      res.redirect("/books");
    }).catch(function(err){
      if (err.name === "SequelizeValidationError") {
        res.render("books/new", {
          book: Book.build(req.body), 
          title: "New Book",
          errors: err.errors
        });
      } else {
        throw err;
      }
    }).catch(function(err){
      res.sendStatus(500);
    });
  });
  
  /* Create a new book form. */
  router.get('/new', function(req, res, next) {
      try {
          res.render("books/new", {book: Book.build(), title: "New Book"});
      } catch(err) {
        console.log(err.message)
      }
  });
  
  /* Delete book form. */
  router.get('/:id/delete', function(req, res, next){
    Book.findByPk(req.params.id).then(function(book) {
      if(book) {
        res.render('books/delete', {book: book, title: 'Delete Book'});
      } else {
        res.sendStatus(404);
      }
    }).catch(function(err){
      res.sendStatus(500);
    });
  });
  
  
  /* Update book */
  router.get("/:id", function(req, res, next){
    Book.findByPk(req.params.id).then(function(book){
      if (book) {
        res.render("books/update", {book: book, title: book.title});
      } else {
        res.sendStatus(404);
      }
    }).catch(function(err){
      res.sendStatus(500);
    });
  });
  
  /* PUT update book. */
  router.put('/:id', function(req, res, next){
    Book.findByPk(req.params.id).then(function(book) {
      if (book) {
        return book.update(req.body);
      } else {
        res.sendStatus(404);
      }
    }).then(function(book){
      res.redirect("/books");    
    }).catch(function(err){
      if (err.name === "SequelizeValidationError") {
        let book = Book.build(req.body);
        book.id = req.params.id;
  
        res.render("books/update", {
          book: book, 
          title: "Update Book",
          errors: err.errors
        });
      } else {
        throw err;
      }
    }).catch(function(err){
      res.sendStatus(500);
    });
  });
  
  /* DELETE individual book. */
  router.delete('/:id', function(req, res, next){
    Book.findByPk(req.params.id).then(function(book) {
      if (book) {
        return book.destroy();
      } else {
        res.sendStatus(404);
      }
    }).then(function(){
      res.redirect("/books");
    }).catch(function(err){
      res.sendStatus(500);
    });
  });

  // router.get('/search', (req, res) => {
  //   let { term } = req.query;
  //   let { category } = req.query;

  //   Book.findAll({ where: { [category]: { [Op.like]: `%${term}%` } } })
  //     .then(books => res.render('books/index', { books: books, title: 'Search Results' }))
  //     .catch(err => res.sendStatus(500));
  // });

module.exports = router;