const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const validator = require("express-validator");
const async = require("async");

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec((err, list_bookinstances) => {
      if (err) return next(err);
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No results.
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("bookinstance_detail", {
        title: "Copy: " + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, "title").exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
// Sanitize fields.
exports.bookinstance_create_post = [
  // Validate fields.
  validator
    .body("book", "Book must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator
    .body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator.body("status").trim().escape(),
  validator
    .body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .escape()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id).exec(function (err, bookinstance) {
    if (err) {
      return next(err);
    }
    if (bookinstance === null) {
      const err = new Error("Book copy not found");
      err.status = 404;
      console.log(bookinstance);
      return next(err);
    }

    // Successful, so render.
    res.render("bookinstance_delete", {
      title: "Delete Copy",
      book_instance: bookinstance,
    });
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  BookInstance.findById(req.body.bookinstanceid).exec((err, bookinstance) => {
    if (err) {
      return next(err);
    }
    BookInstance.findByIdAndRemove(
      req.body.bookinstanceid,
      function deleteBookInstance(err) {
        if (err) {
          return next(err);
        }
        res.redirect("/catalog/bookinstances");
      }
    );
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
  async.parallel(
    {
      book_instance: function (callback) {
        BookInstance.findById(req.params.id).populate("book").exec(callback);
      },
      books: function (callback) {
        Book.find({}, "title").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.bookinstance === null) {
        const err = new Error("Book instance not found");
        err.stats = 404;
        return next(err);
      }
      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance: results.book_instance,
        book_list: results.books,
      });
    }
  );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate fields.
  validator
    .body("book", "Book must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator
    .body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator.body("status").trim().escape(),
  validator
    .body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .escape()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance: bookinstance,
        errors: errors.array(),
      });
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (
        err,
        instance
      ) {
        if (err) {
          return next(err);
        }
        res.redirect(instance.url);
      });
    }
  },
];
