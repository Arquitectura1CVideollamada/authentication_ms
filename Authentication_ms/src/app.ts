import express, { Application } from 'express';
import morgan from 'morgan';
import authRoutes from'./routes/auth';
const app: Application= express();

//setear el puerto
app.set('port',3000);

app.use(morgan('dev'));
app.use(express.json());
//routes
app.use('/auth',authRoutes);

export default app;