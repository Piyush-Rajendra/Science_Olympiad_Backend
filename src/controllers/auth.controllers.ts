import { NextFunction, Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from 'bcryptjs';
import signIn from "../functions/signJWT";
import  {Query} from "../../config/db.config";
import  {Connect} from "../../config/db.config";
import user from "../models/auth.model";
import IMySQLResult from "../models/result";

const NAMESPACE = "User";

const validateToken = (req:Request, res:Response, next:NextFunction) => {
   logging.info(NAMESPACE, "Token vlaidated, user has been authorized");

   return res.status(200).json({
    message: "User is Authorized"
   });
}

const register = (req:Request, res:Response, next:NextFunction) => {
  let{ username, password} = req.body;
  bcryptjs.hash(password, 10, (hashError, hash)=> {
    if(hashError)
      {
        return res.status(500).json({
          message: hashError.message,
          error: hashError
        })
      }

      let query = `INSERT into user(username, password) VALUES ("${username}", "${hash}")`;
      Connect()
      .then(connection=>{
          Query<IMySQLResult>(connection, query)
          .then((result)=>{
            logging.info(NAMESPACE, `User with id ${result} inserted.`)
          })
      } )
      .catch( error => {
        logging.error(NAMESPACE, error.message, error)
      })

  })
}
const login = (req:Request, res:Response, next:NextFunction) => {
   
}
const getAllusers = (req:Request, res:Response, next:NextFunction) => {
   
}

export default {
  validateToken, register, login ,getAllusers
};