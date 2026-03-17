const mongoose = require('mongoose');

const analysSchema = new mongoose.Schema({
    basicStats: {
        total: Number,
        completed: Number,
        pending: Number,
        completionPercentage: Number
    },

    progressScore: {
        score: Number,
        completionComponent: Number,
        streakComponent: Number,
        consistencyComponent: Number,
        consistencyRate: Number
    },

    dailyTreads: [
        {
            date: String,
            label: String,
            count: Number
        }
    ],

    weeklyTreads: [
        {
            weekStart: String,
            label: String,
            count: Number
        }
    ],

    improveTread: {
        trend: String,
        message: String,
        icon: String
    },
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('analys', analysSchema);