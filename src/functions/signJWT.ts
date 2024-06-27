import  jwt  from "jsonwebtoken";
import config from "../../config/db.config";
import logging from "../config/logging";
import user from "../models/auth.model";


const NAMESPACE = 'Auth';

const signIn = (user:user, callback : (error: Error| null, token : string|null) => void): void => 
    {
        var timeSinchEpoch = new Date().getTime();
        var expirationTime = timeSinchEpoch + Number(config.dbConfig.token.expireTime) * 100000;
        var expirationTimeInSeconds = Math.floor(expirationTime / 1000);

        logging.info(NAMESPACE, `Attempting to sign token for ${user.username}` );

        try
        {
            jwt.sign({username:user.username}, 
                config.dbConfig.token.secret, 
                {
                    issuer : config.dbConfig.token.issuer, 
                    algorithm : 'HS256', 
                    expiresIn: expirationTimeInSeconds
                },
            (error, token) => {
                if(error){
                    callback(error,null)
                }
                else if (token)
                    {
                        callback(null, token)
                    }
            });
        }
        catch(error){
            if( error instanceof Error){
                logging.error(NAMESPACE, error.message, error)
            }
            else
            (
                console.log("Going good")
            )
        };
    }

    export default signIn;