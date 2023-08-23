import {Request} from 'express'

export type Token = {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token?: string;
}

export type TypedRequestQuery<T> = Request<object, object, object, T>;

export type LoginReqQuery = {
    code: string;
    referer: string;
    client_id: string;
    from_widget: string;
}

export type DecodedToken = {
    account_id: number
}