import express,{Application,urlencoded,json} from 'express'
import connectMongo,{MongoStoreFactory} from 'connect-mongo'
import {createServer,Server} from 'http'
import session from 'express-session'
import passport from 'passport'
import socket from 'socket.io'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
import './lib/passport'

export class App {
    private MongoStore:MongoStoreFactory
    private app:Application
    private server:Server
    constructor(private port?:number){
        this.app = express()
        this.server = createServer(this.app)
        this.MongoStore = connectMongo(session)
        
        this.settings()
        this.middlewares()
        this.routes()
    }
    private settings():void{
        dotenv.config()
        this.app.set('port',this.port || process.env.PORT || 3000)
    }
    private middlewares():void{
        this.app.use(cors())
        this.app.use(morgan('dev'))
        this.app.use(json())
        this.app.use(urlencoded({extended:true}))
        this.app.use(express.static(`${__dirname}/public`))
        this.app.use(session({
            secret:'SECRET',
            resave:true,
            saveUninitialized:true,
            store:new this.MongoStore({
                url:process.env.URL_DB as string,
                autoReconnect:true
            })
        }))
        this.app.use(passport.initialize())
        this.app.use(passport.session())
    }
    private routes():void{

    }
    public async listen():Promise<void>{
        await this.server.listen(this.app.get('port'))
        console.log(`Listen ${this.app.get('port')}`)
    }
}