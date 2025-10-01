import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';

import './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import errorHandler from './middlewares/errorHandler.js';
import productsRouter from './routes/products.router.js';

const app = express();

app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

app.use(errorHandler);