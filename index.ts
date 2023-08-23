import express from "express";
import {mainLogger} from "./logger"
import config from "./config";
import AmoCRM from "./api/amo";
import {Authorization} from "./api/Authorization";
import {DecodedToken, LoginReqQuery, LogoutReqQuery, Token, TypedRequestQuery} from "./types";
import jwtDecode from "jwt-decode";
import path from "node:path";
import fs from "fs";
import axios from "axios";
import {AccountSettings} from "./types/accountSettings/accountSettings";
import querystring from "querystring";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const amo = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE)

const requestAccessToken = (authCode: string, subDomain: string): Promise<Token> => {
    return axios
        .post<Token>(getUserURL(subDomain) + 'oauth2/access_token', {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: config.REDIRECT_URI,
        })
        .then(res => res.data)
        .catch(err => err.message)
}

const getTokenPath = (accountId: string | number): string => {
    return path.resolve('authclients', accountId + '_amo_token.json')
}

const getUserURL = (subDomain: string): string => {
    return `https://${subDomain}.amocrm.ru/`
}

const getAccessToken = (accountId: string | number): string => {

    const content = fs.readFileSync(getTokenPath(accountId)).toString()

    const token: Token = JSON.parse(content)

    return token.access_token
}

amo.getAccessToken().then(() => {
    app.get("/login", async (req: TypedRequestQuery<LoginReqQuery>, res) => {
        try {

            mainLogger.debug("Запрос на установку получен");

            const {code, referer} = req.query;

            const [subDomain] = referer.split(".");

            const access = await requestAccessToken(code, subDomain)

            const {account_id: accountId}: DecodedToken = jwtDecode(access.access_token)

            fs.writeFileSync(getTokenPath(accountId), JSON.stringify(access))

            const account = await axios.get<AccountSettings>(getUserURL(subDomain) + 'api/v4/account', {
                headers: {
                    Authorization: `Bearer ${getAccessToken(accountId)}`,
                },
            }).then((res) => res.data)

            console.log(account)

            res.json({message: 'OK'})

        } catch (e: unknown) {

            mainLogger.error((e as Error).message)

            res.json({message: 'error'})
        }
    });

    app.get("/logout", async (req: TypedRequestQuery<LogoutReqQuery>, res) => {
        try {

            mainLogger.debug('Хук на логаут сработал')

            const {account_id: accountId} = req.query

            fs.unlinkSync(getTokenPath(accountId))

            res.json({message: 'OK'})

        } catch (e: unknown) {

            mainLogger.error((e as Error).message)

            res.json({message: 'Error'})

        }

    });

    app.listen(config.PORT, () => {
        mainLogger.debug('Server started on ', config.PORT)
    });
});



