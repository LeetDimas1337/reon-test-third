import path from 'node:path';
import { type amoID, type TokensData } from './types';
import fs from 'fs';
import { mainLogger } from './logger';

export const getTokenPath = (accountId: string | number): string => {
    return path.resolve('authclients', accountId + '_amo_token.json');
};

export const getUserURL = (subDomain: string): string => {
    return `https://${subDomain}.amocrm.ru/`;
};
export const getErrorMessage = (e: unknown): string => {
    return (e as Error).message;
};

export const readTokensData = async (accountId: amoID): Promise<TokensData> => {
    try {
        const content = fs.readFileSync(getTokenPath(accountId)).toString();
        return JSON.parse(content);
    } catch (e) {
        mainLogger.error(getErrorMessage(e));
        throw e;
    }
};
export const writeTokenData = (accountId: amoID, tokensData: TokensData): void => {
    fs.writeFileSync(getTokenPath(accountId), JSON.stringify(tokensData));
};

export const deleteTokenData = (accountId: amoID): void => {
    fs.unlinkSync(getTokenPath(accountId));
};
