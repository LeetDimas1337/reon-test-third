import { amoID, authGrantTypes, TokensData } from './types';
import axios, { AxiosError } from 'axios';
import { getErrorMessage, getUserURL, readTokensData, writeTokenData } from './utils';
import config from './config';
import { mainLogger } from './logger';
import { OAUTH_URL, UNAUTHORIZED_STATUS_CODE } from './consts';

export const requestAccessToken = async (authCode: string, subDomain: string): Promise<TokensData> => {
    try {
        const { data } = await axios.post<TokensData>(getUserURL(subDomain) + OAUTH_URL, {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            grant_type: authGrantTypes.GET_TOKEN,
            code: authCode,
            redirect_uri: config.REDIRECT_URI
        });
        return data;
    } catch (e) {
        mainLogger.error(getErrorMessage(e));
        throw e;
    }
};

export const refreshToken = async (subDomain: string, accountId: amoID): Promise<TokensData> => {
    try {
        const tokensData = await readTokensData(accountId);

        const { data } = await axios.post<TokensData>(getUserURL(subDomain) + OAUTH_URL, {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            grant_type: authGrantTypes.REFRESH_TOKEN,
            refresh_token: tokensData.refresh_token,
            redirect_uri: config.REDIRECT_URI
        });
        return data;
    } catch (e) {
        mainLogger.error(getErrorMessage(e));
        throw e;
    }
};

export const checkAuth = async <T, D>(subDomain: string, accountId: amoID, request: (...args: T[]) => Promise<D>): Promise<D> => {
    try {
        return await request();
    } catch (e) {
        if ((e as AxiosError).response?.status === UNAUTHORIZED_STATUS_CODE) {
            mainLogger.debug('Token is invalid. Trying to refresh');
            const newTokenData = await refreshToken(subDomain, accountId);
            writeTokenData(accountId, newTokenData);
            return await request();
        }
        throw e;
    }
};
