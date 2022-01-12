import dotenv from'dotenv';
dotenv.config();
dotenv.config({ path:'../env' });
import app from './app';
import './database';
function main(){
    var host=process.env.HOST ||'0.0.0.0';
    app.listen(app.get('port'),()=>{
        console.log('servidor funcionando')
    });
    console.log(app.get('port'));
}

main();
