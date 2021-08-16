const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const { json } = require('body-parser');

const app = express();
const port = 3000;

const connectionString = {
    user: 'sa',
    password: 'R0bertStrife',
    server: '66.175.236.212',
    port: 1433,
    database: 'AzielDiazDB',
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
}

app.use(express.json());
app.use(cors());

const pool = new sql.ConnectionPool(connectionString);
pool.on('error', err => {
    console.log(err);
})

//#region End Points
app.get('/api/GetAll', async (req, res) => {

    let dataManagement = await paul("SELECT * FROM Management", res);
    let dataGroups = await paul("SELECT * FROM Groups", res);
    let dataTeachers = await paul("SELECT * FROM Teachers", res);
    let dataSchools = await paul("SELECT * FROM School", res);

    let data = {
        "management": dataManagement,
        "groups": dataGroups,
        "teachers": dataTeachers,
        "schools": dataSchools
    }
    res.json(data);
});

//I wanted to do this as a GET but idk why it doesn't receive my parameters
app.post('/api/ValidateUsers', async (req, res) => {
    let body = req.body;
    let query = `SELECT * FROM management WHERE email = '${body.email}' and password = '${body.pass}'`;
    let data = await paul(query, res);

    res.json({ "data": data[0] ? "Welcome" : "Incorrect Data" })
});

app.post('/api/AddManagement', async (req, res) => {
    let body = req.body;
    let query = `exec AddManagement '${body.name}','${body.address}','${body.telephone}','${body.email}',${body.position},'${body.password}'`;

    let data = await paul(query, res);

    res.json(data.rowsAffected.length)
});

app.post('/api/AddGroup', async (req, res) => {
    let body = req.body;
    let query = `EXEC AddGroup '${body.name}'`;

    let data = await paul(query, res);

    res.json(data.rowsAffected.length)

});

app.post('/api/AddTeacher', async (req, res) => {
    let body = req.body;
    let query = `EXEC AddTeacher '${body.name}','${body.address}','${body.telephone}',${body.groupId}`;

    let data = await paul(query, res);

    res.json(data.rowsAffected.length)
});

app.post('/api/AddSchool', async (req, res) => {
    let body = req.body;
    let query = `EXEC AddSchool '${body.name}','${body.registerNumber}','${body.address}','${body.telephone}',${body.zone},'${body.director}'`;

    let data = await paul(query, res);

    res.json(data.rowsAffected.length)
});


app.delete('/api/DeleteManager:id', async (req, res) => {
    let body = req.params;
    let id = body.id;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id')
    let query = `DELETE FROM Management WHERE idManagement = ${id}`;

    let data = await paul(query, res);
    res.json("Succesfully Deleted ") + data.rowsAffected;
});

app.delete('/api/DeleteGroup:id', async (req, res) => {
    let body = req.params;
    let id = body.id;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id')
    let query = `DELETE FROM Groups WHERE idGroup = ${id}`;

    let data = await paul(query, res);
    res.json("Succesfully Deleted ") + data.rowsAffected;
});

app.delete('/api/DeleteTeacher:id', async (req, res) => {
    let body = req.params;
    let id = body.id;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id')
    let query = `DELETE FROM Teachers WHERE idTeacher = ${id}`;

    let data = await paul(query, res);
    res.json("Succesfully Deleted ") + data.rowsAffected;
});

app.delete('/api/DeleteSchool:id', async (req, res) => {
    let body = req.params;
    let id = body.id;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id')
    let query = `DELETE FROM Schools WHERE idSchools = ${id}`;

    let data = await paul(query, res);
    res.json("Succesfully Deleted ") + data.rowsAffected;
});

app.put('/api/UpdateManager:id', async (req, res) => {
    let header = req.params;
    let id = header.id;
    let body = req.body;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id');
    let query = `UPDATE Management SET name ='${body.name}', address = '${body.address}', telephone ='${body.telephone}', email ='${body.email}', position = ${body.position}, password ='${body.password}' WHERE idManagement = ${id}`;    
    let data = await paul(query, res);
    res.json("Succesfully Updated ") + data.rowsAffected;
});

app.put('/api/UpdateGroup:id', async (req, res) => {
    let header = req.params;
    let id = header.id;
    let body = req.body;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id');
    let query = `UPDATE Groups SET name ='${body.name}' WHERE idGroup = ${id}`;    
    let data = await paul(query, res);
    res.json("Succesfully Updated ") + data.rowsAffected;
});

app.put('/api/UpdateTeacher:id', async (req, res) => {
    let header = req.params;
    let id = header.id;
    let body = req.body;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id');
    let query = `UPDATE Teachers SET '${body.name}','${body.address}','${body.telephone}',${body.groupId} WHERE idTeacher = ${id}`;    
    let data = await paul(query, res);
    res.json("Succesfully Updated ") + data.rowsAffected;
});

app.put('/api/UpdateSchool:id', async (req, res) => {
    let header = req.params;
    let id = header.id;
    let body = req.body;
    if (isNaN(id) || id < 1 || !id)
        return res.json('invalid Id');
    let query = `UPDATE Management SET name ='${body.name}', address = '${body.address}', telephone ='${body.telephone}', email ='${body.email}', position = ${body.position}, password ='${body.password}' WHERE idManagement = ${id}`;    
    let data = await paul(query, res);
    res.json("Succesfully Updated ") + data.rowsAffected;
});
//#endregion

async function paul(req, res) {
    let query = req;
    let poolConnect = pool.connect();

    await poolConnect;
    try {
        const request = pool.request();
        const result = await request.query(query);
        console.table(result.recordset);
        if (result.recordset) {
            if (result.recordset.length > 0) {
                pool.close();
                return result.recordset;
            }
        }
        pool.close();
        return result;
    } catch (ex) {
        pool.close();
        console.error('An error ocurred in sql ', ex)
    }
}

app.listen(port, function () {
    console.log(`Api listening at port ${port}`);
});