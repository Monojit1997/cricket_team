const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * 
    FROM cricket_team
    ORDER BY player_id`;
  const playersArray = await db.all(getPlayersQuery);
  const finalResults = playersArray.map((person) =>
    convertDbObjectToResponseObject(person)
  );
  response.send(finalResults);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayersQuery = `INSERT INTO
  cricket_team( player_id ,player_name, jersey_number, role)
  VALUES(${player_id},${playerName},${jerseyNumber},${role});`;
  const dbResponse = await db.run(addPlayersQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}`;
  const playersArray = await db.get(getPlayersQuery);
  const finalResults = convertDbObjectToResponseObject(playersArray);
  response.send(finalResults);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayersQuery = `UPDATE
        cricket_team
    SET
        player_name=${playerName},
        jersey_number=${jerseyNumber},
        role=${role}
    WHERE
        player_id=${playerId}`;
  const playersArray = await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `DELETE FROM cricket_team
    WHERE player_id=${playerId}`;
  const playersArray = await db.run(deletePlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
