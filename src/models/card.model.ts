import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Baseball', 'Football', 'Basketball', 'Hockey', 'Soccer', 'Wrestling', 'Racing', 'Multi-sport', 'MMA', 'Golf', 'Tennis', 'Boxing', 'Skateboarding', 'Skateing', 'Cycling', 'Olympics', 'Volleyball', 'Lacrosse', 'Cricket', 'Snowboarding'],
  },
  player: {
    type: String
  },
  set: {
    type: String
  },
  rarity: {
    type: String
  },
  price: {
    type: String
  },
  likesCount: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

const Card = mongoose.model('card', cardSchema);

export default Card;