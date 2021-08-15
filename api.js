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
    let queryManagers = `SELECT * FROM Management`;
    let queryGroups = `SELECT * FROM Groups`;
    let queryTeachers = `SELECT * FROM Teachers`;
    let querySchools = `SELECT * FROM School`;

    let dataManagment = await paul(queryManagers, res);
    let dataGroups = await paul(queryGroups, res);
    let dataTeachers = await paul(queryTeachers, res);
    let dataSchools = await paul(querySchools, res);

    let data ={
        "management": dataManagment,
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

app.post('/api/AddManagment', async (req, res)=>{
    let body = req.body;
    let query = `exec AddManagement '${body.name}','${body.adress}','${body.telephone}','${body.email}',
                 ${body.position},'${body.password}')`;

    let data = await paul(query, res);
});

app.post('/api/AddGroup', async (req, res)=>{
    let body = req.body;
    let query = `EXEC AddGroup '${body.name}'`;
                 
    let data = await paul(query, res);
});

app.post('/api/AddTeacher', async (req, res)=>{
    let body = req.body;
    let query = `EXEC AddTeacher '${body.name}','${body.adress}','${body.telephone}','${body.idGroup}'`;
                 
    let data = await paul(query, res);
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