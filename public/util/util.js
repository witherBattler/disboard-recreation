function ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open(method, url)
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response)
            } else {
                reject(xhr.status)
            }
        }
        xhr.onerror = () => {
            reject(xhr.status)
        }
        xhr.send(data)
    })
}