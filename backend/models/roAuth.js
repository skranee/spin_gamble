import axios from "axios";

function getCSRFtoken(f){
    axios.post(`https://auth.roblox.com/`, {}, {}).then(
        res => {
          
            f(res.headers);

        }
    ).catch(err => 
    {
        f(err.response.headers["x-csrf-token"]);
    });
}

function getCSRFtokenV2(config, url, f){
    axios.post(url, {}, config).then(
        res => {
          
            f(res.headers);

        }
    ).catch(err => 
    {
        f(err.response.headers["x-csrf-token"]);
    });
}

export { getCSRFtoken, getCSRFtokenV2 }