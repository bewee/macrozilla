window.loadPage = function(page) {
    return new Promise((resolve, reject) => {
        fetch(page)
        .then((res) => {
            if (!res.ok) {
            throw Error(res.statusText);
            }
            return res.text();
        })
        .then((text) => {
            resolve(text);
        })
        .catch((err) => {
            reject(err);
        });
    });
};