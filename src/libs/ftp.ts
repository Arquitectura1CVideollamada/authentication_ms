const ftp = require("basic-ftp")

module.exports.ftpupload=async function(file:string,fileftp:string) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            //host: "localhost",
            host: "host.docker.internal",
            user: "myuser",
            password: "mypass",
            secure: false
        })
        await client.uploadFrom(file, fileftp)
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

module.exports.ftpdownload=async function(file:string,fileftp:string) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            //host: "localhost",
            host: "host.docker.internal",
            user: "myuser",
            password: "mypass",
            secure: false
        })
        await client.downloadTo(file, fileftp)
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

module.exports.ftpremove=async function(fileftp:string) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            //host: "localhost",
            host: "host.docker.internal",
            user: "myuser",
            password: "mypass",
            secure: false
        })
        await client.remove(fileftp);
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}