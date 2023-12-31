import { Request } from 'express';

export type TokensData = {
    token_type: string
    expires_in: number
    access_token: string
    refresh_token: string
};

export type TypedRequestQuery<T> = Request<object, object, object, T>;

export type LoginReqQuery = {
    code: string
    referer: string
    client_id: string
    from_widget: string
};

export type LogoutReqQuery = {
    account_id: string
    client_id: string
};

export type AccessAMOQuery = {
    accountId: string
    subDomain: string
};

export type DecodedToken = {
    account_id: number
};

export enum authGrantTypes {
    REFRESH_TOKEN = 'refresh_token',
    GET_TOKEN = 'authorization_code'
}

export type amoID = string | number;
