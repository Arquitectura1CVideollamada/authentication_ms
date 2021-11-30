import express, { Application } from 'express';
import morgan from 'morgan';
import authRoutes from'./routes/auth';
import cors from 'cors';
import path from 'path';
const app: Application= express();

//setear el puerto
app.set('port',3000);

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
//routes
app.use('/auth',authRoutes);


app.use('/upload',express.static(path.resolve('upload')));
export default app;