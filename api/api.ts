abstract class Api { 
    abstract AMO_TOKEN_PATH: string;
    abstract LIMIT: number;
    abstract ROOT_PATH: string;
    abstract ACCESS_TOKEN: string;
    abstract REFRESH_TOKEN: string;
    abstract SUB_DOMAIN: string;
    abstract CODE: string;
}

export abstract class UserApi extends Api{
    abstract CLIENT_ID: string;
}


export default Api; 