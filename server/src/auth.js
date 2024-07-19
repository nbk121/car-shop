const bcrypt = require("bcrypt");

const spread = (list) => {
  console.log(list);
  const object = {};
  for (let i = 0; i < list.length; i++) {
    object[i + 1] = list[i];
  }
  return object;
};

const objToList = (list) => {
  const answer = [];
  for (let i = 0; i < list.length; i++) {
    answer.push(Object.values(list[i]));
  }

  return answer.flat();
};
// const spread=(...list)=>{
//     console.log(list[0])
//     const object={}
//     for(let i=0;i<list.length;i++){
//        for(let x=0;x<list[i].length;x++){
//         object[x+1]=list[i][x]
//        }
//     }
//     return object
// }

const signUp = (db) => async (req, res) => {
  const { name, surname, email, password, username,type } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.transaction((trx) => {
    trx("users")
      .insert({
        type,
        name,
        surname,
        email,
      })
      .returning("*")
      .then((user) => {
        if (user.length > 0) {
          trx("users_info")
            .insert({
              id: user[0].id,
              username,
              email: user[0].email,
              hash,
            })
            .returning("*")
            .then(([user2]) => {
              return res.json({ ...user[0], username: user2.username, id: user2.id });
            })
            .catch((err) => {
              res.status(500).json("username is already in use");
            });
        } else {
          res.status(400).json("problems in the server!");
        }
      })
      .catch((err) => {
        console.log(err)
        res.status(500).json("email is already in use");
      })
      .then(trx.commit)
      .catch((err) => trx.rollback);
  });
};

const logIn = (db) => async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("missing credentials");
  }

  db("users")
    .where({
      email,
    })
    .select("*")
    .returning("*")
    .then((logInEmail) => {
      db("users_info")
        .where({
          email: logInEmail[0].email,
        })
        .select("*")
        .returning("*")
        .then(async (userInfo) => {
          const isValidPassword = await bcrypt.compare(password, userInfo[0].hash);

          if (isValidPassword) {
           
                    return res.json({...logInEmail[0], username: userInfo[0].username });
              
          } else {
            return res.status(400).json("wrong password");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      return res.status(400).json("wrong email");
    });
};

module.exports = {
  signUp,
  logIn,
};
