import express from "express";
import {mainLogger} from "./logger"
import config from "./config";
import AmoCRM from "./api/amo";
import {Authorization} from "./api/Authorization";
import {DecodedToken, LoginReqQuery, TypedRequestQuery} from "./types";
import jwtDecode from "jwt-decode";
import path from "node:path";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const amo = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE)

const getTokenPath = (accountId: string | number): string => {
    return path.resolve('authclients', accountId + '_amo_token.json')
}
amo.getAccessToken().then(() => {
    app.get("/login", async (req: TypedRequestQuery<LoginReqQuery>) => {

        const authCode = String(req.query.code);
        const [subDomain] = String(req.query.referer).split(".");
        mainLogger.debug("Запрос на установку получен");
        const api = new Authorization(subDomain, authCode);

        const access = await api.requestAccessToken()

        const {account_id}: DecodedToken = jwtDecode(access.access_token)

        fs.writeFileSync(getTokenPath(account_id), JSON.stringify(access))

        // await api.getAccessToken()
        //     .then(() => mainLogger.debug(`Авторизация при установке виджета для ${subDomain} прошла успешно`))
        //     .catch((err: any) => mainLogger.debug("Ошибка авторизации при установке виджета ", subDomain, err));
    });

    app.get("/logout", async (req, res) => {


        mainLogger.debug("Отработал хук на отключение интеграции")
        console.log(req.headers);
        console.log(req.body);
        console.log(req.query)
    })

    app.listen(config.PORT, () => {
        mainLogger.debug('Server started on ', config.PORT)
    })
})



