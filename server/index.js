const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const app = express();
dotenv.config();
const port = Number(process.env.PORT);

app.use(cors());
app.use(express.json());

function validateJWT(req) {
    const authHeader = req.headers['authorization'];

    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        return -1;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return verified.id;
    }
    catch (error) {
        return -1;
    }
}

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123",
    database: "datebase"
});

connection.connect((err) => {
    if (err) console.log(err);
    else console.log("Connected");
});

app.get('/authentication', (req, res) => {
    if (validateJWT(req) > 0) {
        return res.status(200).json({});
    }
    return res.status(400).json({});
});

app.post('/login', (req, res) => {
    console.log('Received login request:', req.body);
    let sql = "SELECT idU, password FROM user WHERE username = ?";
    connection.query(sql, [req.body.username], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }
        console.log(result);
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, valid) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({});
                }
                if (valid) {

                    let resultIdU = result[0].idU;

                    let sql = "SELECT idS FROM activeset WHERE idU = ?"
                    connection.query(sql, [resultIdU], (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({});
                        }

                        let sql = "SELECT * FROM `set` WHERE idS = ?"
                        connection.query(sql, [result[0].idS], (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({});
                            }

                            const token = jwt.sign({
                                id: result[0].idU,
                                username: req.body.username
                            }, process.env.JWT_SECRET_KEY);

                            return res.status(200).json({
                                id: resultIdU,
                                username: req.body.username,
                                activePreset: result[0],
                                jwt: token
                            });
                        });
                    });
                } else {
                    return res.status(400).json({ msg: "Password doesn't match" });
                }
            });
        }
        else {
            return res.status(400).json({ msg: "Username doesn't exist" });
        }
    });
});

app.post('/register', (req, res) => {
    console.log('Received login request:', req.body);
    let sql = "SELECT idU FROM user WHERE username = ?";
    connection.query(sql, [req.body.username], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }
        if (result.length > 0) {
            console.log("error: vec postoji username za register");
            return res.status(400).json({});
        }

        bcrypt.genSalt(Number(process.env.SALT), (err, salt) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            bcrypt.hash(req.body.password, salt, (err, encryptedP) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({});
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({});
                    }

                    let sql = "INSERT INTO user (username, password) VALUES (?, ?)";
                    let values = [req.body.username, encryptedP];

                    connection.query(sql, values, (err) => {
                        if (err) {
                            console.log(err);
                            connection.rollback();
                            return res.status(500).json({});
                        }

                        let sql = "SELECT idU FROM user WHERE username = ?"
                        connection.query(sql, [req.body.username], (err, result) => {
                            if (err) {
                                console.log(err);
                                connection.rollback();
                                return res.status(500).json({});
                            }

                            let resultIdU = result[0].idU;
                            
                            let sql = "INSERT INTO `set` (name, idU) VALUES (?, ?)"
                            connection.query(sql, ["default", resultIdU], (err) => {
                                if (err) {
                                    console.log(err);
                                    connection.rollback();
                                    return res.status(500).json({});
                                }

                                let sql = "SELECT * FROM `set` WHERE idU = ?"
                                connection.query(sql, [resultIdU], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        connection.rollback();
                                        return res.status(500).json({});
                                    }

                                    let resultPreset = result[0];

                                    let sql = "INSERT INTO activeset (idS, idU) VALUES (?, ?)"
                                    connection.query(sql, [resultPreset.idS, resultIdU], (err) => {
                                        if (err) {
                                            console.log(err);
                                            connection.rollback();
                                            return res.status(500).json({});
                                        }

                                        connection.commit((err) => {
                                            if (err) {
                                                console.log(err);
                                                connection.rollback();
                                                return res.status(500).json({});
                                            }

                                            const token = jwt.sign({
                                                id: resultIdU,
                                                username: req.body.username
                                            }, process.env.JWT_SECRET_KEY);

                                            return res.status(200).json({
                                                id: resultIdU,
                                                username: req.body.username,
                                                activePreset: resultPreset,
                                                jwt: token
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

function validatePreset(res, idU, idS, operation) {
    console.log("idU: " + idU + ", idS: " + idS);
    let sql = "SELECT idS FROM `set` WHERE idS = ? AND idU = ?";
    connection.query(sql, [idS, idU], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }

        if (result.length > 0) {
            operation();
        }
        else {
            console.log("Undefined or wrong idS for the given credentials, returning...");
            return res.status(400).json({});
        }

    });
}

function validatePoolOperation(res, idU, idS, idD, operation) {
    let sql = "SELECT idS FROM `set` WHERE idS = ? AND idU = ?";
    connection.query(sql, [idS, idU], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }

        if (result.length > 0) {
            let sql = "SELECT idD FROM date WHERE idD = ?";
            connection.query(sql, [idD], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({});
                }

                if (result.length > 0) {
                    let sql = "SELECT idU FROM datelocal WHERE idDL = ?";
                    connection.query(sql, [idD], (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({});
                        }

                        if (result.length == 0 || result[0].idU == idU) {
                            operation();
                        }
                        else {
                            console.log("Undefined or wrong idD for given credentials, returning...");
                            return res.status(400).json({});
                        }
                    });
                }
                else {
                    console.log("Nonexistant idD, returning...");
                    return res.status(400).json({});
                }
            });
        }
        else {
            console.log("Undefined or wrong idS for the given credentials, returning...");
            return res.status(400).json({});
        }
    });
}

function deleteFromPool(res, idS, idD, activeTransaction, operation) {
    let sql = "SELECT idDS FROM dateset WHERE idD = ? AND idS = ?";
    connection.query(sql, [idD, idS], (err, result) => {
        if (err) {
            console.log(err);
            if (activeTransaction) connection.rollback();
            return res.status(500).json({});
        }

        if (result.length > 0) {
            let sql = "DELETE FROM dateset WHERE idDS = ?";
            connection.query(sql, [result[0].idDS], (err) => {
                if (err) {
                    console.log(err);
                    if (activeTransaction) connection.rollback();
                    return res.status(500).json({});
                }

                operation();
            });
        }
        else {
            console.log("Nonexistant connection for given idD and idS, returning...");
            if (activeTransaction) connection.rollback();
            return res.status(400).json({});
        }
    });
}

app.post('/deleteDateFromPool', (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }
    let idS = req.body.preset.idS;
    let idD = req.body.dateId;

    validatePoolOperation(res, idU, idS, idD, () => {
        return deleteFromPool(res, idS, idD, false, () => {
            return res.status(200).json({});
        }); 
    });
});

app.post('/addDateToPool', (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }
    let idS = req.body.preset.idS;
    let idD = req.body.dateId;

    validatePoolOperation(res, idU, idS, idD, () => {
        let sql = "SELECT idDS FROM dateset WHERE idD = ? AND idS = ?";
        connection.query(sql, [idD, idS], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            if (result.length == 0) {
                let sql = "INSERT INTO dateset (idD, idS) VALUES (?, ?)";
                connection.query(sql, [idD, idS], (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({});
                    }

                    return res.status(200).json({});
                });
            }
            else {
                console.log("Existant connection for given idD and idS, returning...");
                return res.status(400).json({});
            }
        });
    });
});

app.post("/getAllDates", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }
    let idS = req.body.preset.idS;

    // `
    //         SELECT idD, name, 
    //         MAX(CASE 
    //             WHEN dateset.idS = ? THEN dateset.idS 
    //             ELSE 0 
    //         END) AS idS
    //         FROM date
    //         LEFT JOIN datelocal ON (date.idD = datelocal.idDL)
    //         LEFT JOIN dateset USING (idD)
    //         WHERE idU = ? OR idU = ?
    //         GROUP BY idD`

    validatePreset(res, idU, idS, () => {
        let sql = `
            SELECT idD, name, MAX(CASE 
                WHEN idS = ? THEN idS 
                ELSE 0 
            END) AS idS
            FROM date
            LEFT JOIN datelocal ON (date.idD = datelocal.idDL)
            LEFT JOIN dateset USING (idD)
            WHERE idU IS NULL OR idU = ?
            GROUP BY idD`

        console.log("query execute");
        
        connection.query(sql, [idS, idU], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            console.log(result);

            resultList = [];
            for (let i = 0; i < result.length; i++) {
                resultList.push({ name: result[i].name, id: result[i].idD, isChecked: (result[i].idS ? true : false) });
            }

            return res.status(200).json({ arr: resultList });
        });
    });
});

app.post("/addPreset", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let sql = "INSERT INTO `set` (name, idU) VALUES (?, ?)";
    connection.query(sql, [req.body.name, idU], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }

        let idS = result.insertId;

        return res.status(200).json({ id: idS, name: req.body.name });
    });
});

app.post("/selectActivePreset", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let idS = req.body.presetId;

    validatePreset(res, idU, idS, () => {
        connection.beginTransaction((err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            let sql = "UPDATE activeset SET idS = ? WHERE idU = ?";
            connection.query(sql, [idS, idU], (err) => {
                if (err) {
                    console.log(err);
                    connection.rollback();
                    return res.status(500).json({});
                }

                let sql = "SELECT * FROM `set` WHERE idS = ?";
                connection.query(sql, [idS], (err, result) => {
                    if (err) {
                        console.log(err);
                        connection.rollback();
                        return res.status(500).json({});
                    }

                    connection.commit((err) => {
                        if (err) {
                            console.log(err);
                            connection.rollback();
                            return res.status(500).json({});
                        }

                        return res.status(200).json(result[0]);
                    });
                });
            });
        });
    });
});

app.get("/getAllPresets", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let sql = "SELECT * FROM `set` WHERE idU = ?"
    connection.query(sql, [idU], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }

        resultList = [];
        for (let i = 0; i < result.length; i++) {
            resultList.push({ id: result[i].idS, name: result[i].name });
        }

        return res.status(200).json({ arr: resultList });
    });
});

app.post("/getCheckedDates", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let idS = req.body.preset.idS;
    console.log(idU + " " + idS);

    validatePreset(res, idU, idS, () => {
        let sql = "SELECT idD, name FROM date JOIN dateset USING (idD) WHERE idS = ?"
        connection.query(sql, [idS], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            resultList = [];
            for (let i = 0; i < result.length; i++) {
                resultList.push({ idDate: result[i].idD, name: result[i].name });
            }

            return res.status(200).json({ arr: resultList });
        });
    });
});

app.get("/getActiveDate", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }
    console.log("user id: " + idU);
    let sql = "SELECT idD, name FROM date JOIN activedate USING (idD) WHERE idU = ?"
    connection.query(sql, [idU], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }
        console.log("resenje: " + result);
        if (result.length > 0) {
            res.status(200).json({ idDate: result[0].idD, name: result[0].name });
        }
        else {
            res.status(200).json({ name: "null" });
        }
    });
});

function setActiveDate(res, idU, idD, activeTransaction, operation) {
    let sql = "SELECT idAD FROM activedate WHERE idU = ?"
    connection.query(sql, [idU], (err, result) => {
        if (err) {
            console.log(err);
            if (activeTransaction) connection.rollback();
            return res.status(500).json({});
        }

        let sql;
        if (result.length > 0) {
            sql = "UPDATE activedate SET idD = ? WHERE idAD = ?";
            connection.query(sql, [idD, result[0].idAD], (err) => {
                if (err) {
                    console.log(err);
                    if (activeTransaction) connection.rollback();
                    return res.status(500).json({});
                }
                return operation();
            });
        }
        else {
            sql = "INSERT INTO activedate (idU, idD) VALUES (?, ?)";
            connection.query(sql, [idU, idD], (err) => {
                if (err) {
                    console.log(err);
                    if (activeTransaction) connection.rollback();
                    return res.status(500).json({});
                }
                return operation();
            });
        }
    });
}

app.post("/setActiveDate", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let idD = req.body.date.idDate;
    let idS = req.body.preset.idS;

    validatePoolOperation(res, idU, idS, idD, () => {
        return setActiveDate(res, idU, idD, false, () => {
            return res.status(200).json({});
        });
    });
});

app.post("/setActiveDateAndDeleteFromPool", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    let idD = req.body.date.idDate;
    let idS = req.body.preset.idS;

    validatePoolOperation(res, idU, idS, idD, () => {
        connection.beginTransaction((err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({});
            }

            return setActiveDate(res, idU, idD, true, () => {
                return deleteFromPool(res, idS, idD, true, () => {
                    connection.commit((err) => {
                        if (err) {
                            console.log(err);
                            connection.rollback();
                            return res.status(500).json({});
                        }

                        return res.status(200).json({});
                    });
                }); 
            });
        })
    });
});

app.post("/addDateLocal", (req, res) => {
    let idU = validateJWT(req);
    if (idU < 0) {
        console.log("Undefined or wrong credentials, returning...");
        return res.status(400).json({});
    }

    connection.beginTransaction((err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({});
        }

        let sql = "INSERT INTO date (name) VALUES (?)"
        connection.query(sql, [req.body.name], (err, result) => {
            if (err) {
                console.log(err);
                connection.rollback();
                return res.status(500).json({});
            }

            let idD = result.insertId;

            let sql = "INSERT INTO datelocal (idDL, idU) VALUES (?, ?)"
            connection.query(sql, [idD, idU], (err) => {
                if (err) {
                    console.log(err);
                    connection.rollback();
                    return res.status(500).json({});
                }

                connection.commit((err) => {
                    if (err) {
                        console.log(err);
                        connection.rollback();
                        return res.status(500).json({});
                    }

                    return res.status(200).json({name: req.body.name, id: idD, isChecked: false});
                });
            });
        });
    });
    
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});