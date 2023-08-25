import express from 'express';
import { mainLogger } from './logger';
import config from './config';
import {
    DecodedToken,
    AccessAMOQuery,
    LoginReqQuery,
    LogoutReqQuery,
    TypedRequestQuery
} from './types';
import jwtDecode from 'jwt-decode';
import fs from 'fs';
import axios from 'axios';
import { getTokenPath, getUserURL, getErrorMessage, readTokensData, writeTokenData, deleteTokenData } from './utils';
import { AccountSettings } from './types/accountSettings/accountSettings';
import { checkAuth, requestAccessToken } from './Authorization';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(config.PORT, () => {
    mainLogger.debug('Server started on ', config.PORT);
});

app.get('/login', async (req: TypedRequestQuery<LoginReqQuery>, res) => {
    try {
        mainLogger.debug('Installation request received');

        const { code, referer } = req.query;

        const [subDomain] = referer.split('.');

        const tokensData = await requestAccessToken(code, subDomain);

        const { account_id: accountId }: DecodedToken = jwtDecode(tokensData.access_token);

        writeTokenData(accountId, tokensData);

        mainLogger.debug('Access token successfully recorded');

        res.json({ message: 'OK' });
    } catch (e: unknown) {
        mainLogger.error(getErrorMessage(e));
        res.json({ message: 'error' });
    }
});
app.get('/logout', (req: TypedRequestQuery<LogoutReqQuery>, res) => {
    try {
        mainLogger.debug('Deletion hook received');

        const { account_id: accountId } = req.query;

        deleteTokenData(accountId);

        res.json({ message: 'OK' });
    } catch (e: unknown) {
        mainLogger.error(getErrorMessage(e));
        res.json({ message: 'Error' });
    }
});

app.get('/get-account-data', async (req: TypedRequestQuery<AccessAMOQuery>, res) => {
    try {
        const { accountId, subDomain } = req.query;

        const response = await checkAuth(subDomain, accountId, async () => {
            return await axios.get<AccountSettings>(getUserURL(subDomain) + 'api/v4/account', {
                headers: {
                    Authorization: `Bearer ${(await readTokensData(accountId)).access_token}`
                }
            });
        });

        return res.json(response.data);
    } catch (e) {
        mainLogger.error(getErrorMessage(e));
        res.status(400).json({ message: 'You are unauthorized' });
    }
});
