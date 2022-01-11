import dotenv from'dotenv';
dotenv.config();
dotenv.config({ path:'../env' });
import app from './app';
import './database';
function main(){
    const host=process.env.HOST||'0.0.0.0';
    const port=process.env.PORT||3000;
    app.listen(Number(port),host,()=>{
        console.log('servidor funcionando')
    });
    console.log(app.get('port'));
}

main();
