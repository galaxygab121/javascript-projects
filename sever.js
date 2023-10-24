const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/recommendation_db', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define MongoDB schemas and models for User, Rating, Feedback, and Recommendations here.
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    password: String,
}));

const Recommendation = mongoose.model('Recommendation', new mongoose.Schema({
    title: String,
    genre: String,
}));

// User Registration Route
app.post('/users/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login Route
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            // Generate and send a token for authentication (e.g., using JWT).
            // You should implement secure authentication here.
            res.status(200).json({ token: 'your-generated-token' });
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Rating Submission Route
app.post('/ratings/submit', async (req, res) => {
    const { userId, movieId, rating } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const newRating = new Rating({ user: user, movieId, rating });
        await newRating.save();
        
        res.status(201).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Rating submission failed' });
    }
});

// Feedback Submission Route
app.post('/feedback/submit', async (req, res) => {
    const { userId, feedbackText } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const newFeedback = new Feedback({ user: user, feedbackText });
        await newFeedback.save();
        
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Feedback submission failed' });
    }
});

// Recommendations Retrieval Route
app.get('/recommendations', async (req, res) => {
    const { userId, bookPreferences, moviePreferences } = req.query;

    try {
        // Sample dataset of books and movies
        const books = [
            { title: 'Harry Potter', genre: 'Fantasy' },
            { title: 'Percy Jackson', genre: 'Fantasy' },
            { title: 'DC Comics', genre: 'Superhero' },
        ];

        const movies = [
            { title: 'Fast and Furious', genre: 'Action' },
            { title: 'Insidious', genre: 'Horror' },
            { title: 'Barbie Movie', genre: 'Animation' },
        ];

        // Sample user ratings (this could come from your database)
        const userRatings = [
            { userId, item: 'Harry Potter', rating: 4 },
            { userId, item: 'Fast and Furious', rating: 5 },
        ];

        // Filter recommendations based on user preferences
        const recommendedBooks = books.filter((book) => bookPreferences.includes(book.genre));
        const recommendedMovies = movies.filter((movie) => moviePreferences.includes(movie.genre));

        // Sort recommendations based on user ratings (example: top-rated first)
        recommendedBooks.sort((a, b) => {
            const ratingA = userRatings.find((r) => r.item === a.title);
            const ratingB = userRatings.find((r) => r.item === b.title);
            if (ratingA && ratingB) {
                return ratingB.rating - ratingA.rating;
            }
            return 0;
        });

        recommendedMovies.sort((a, b) => {
            const ratingA = userRatings.find((r) => r.item === a.title);
            const ratingB = userRatings.find((r) => r.item === b.title);
            if (ratingA && ratingB) {
                return ratingB.rating - ratingA.rating;
            }
            return 0;
        });

        res.status(200).json({ recommendedBooks, recommendedMovies });
    } catch (error) {
        res.status(500).json({ error: 'Recommendations retrieval failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
