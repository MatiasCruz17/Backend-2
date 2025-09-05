import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'passport';

import './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import errorHandler from './middlewares/errorHandler.js';
import { json } from 'body-parser';
import passport from 'passport';

const app = express();

app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

mongoose.connect(MONGO_URI)
    .then(()=> {
        console.log('MongoDB conectado');
        app.listen(PORT, ()=> console.log(`Server en https://localhost:${PORT}`));
    })
    .catch(err => console.error('Error MongoDB:', err));