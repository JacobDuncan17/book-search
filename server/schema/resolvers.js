const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    getUser: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate('savedBooks');
        return user;
      }
      throw new AuthenticationError('Not logged in');
    },
    getBook: async (parent, { bookId }) => {
      const book = await Book.findById(bookId);
      return book;
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    addBook: async (parent, { bookInput }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          context.user._id,
          { $push: { savedBooks: bookInput } },
          { new: true }
        );
        return user;
      }
      throw new AuthenticationError('Not logged in');
    },
  },
};

module.exports = resolvers;
