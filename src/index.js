import  Express  from 'express';
import  { PORT } from "./config.js";
import  userRoutes from './routes/user.routes.js';
import  morgan from 'morgan';
import cors from 'cors';


const app = Express ();

app.use(cors());
app.use(morgan('dev'))
app.use(Express.json());
app.use(userRoutes);

app.listen(PORT);
console.log('Server on port', PORT);