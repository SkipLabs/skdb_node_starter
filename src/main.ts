import { SKDB } from "skdb";
import { createLocalDbConnectedTo, skdbDevServerDb } from "skdb-dev";

async function connectToDevServer(): Promise<SKDB> {
  const devServerDb = await skdbDevServerDb("example");
  await devServerDb.schema(`
CREATE TABLE example (
    id TEXT PRIMARY KEY,
    intCol INTEGER NOT NULL,
    floatCol FLOAT NOT NULL,
    skdb_access TEXT NOT NULL
);`);

  const localDb = await createLocalDbConnectedTo(devServerDb);

  await localDb.mirror({
    table: "example",
    expectedColumns:
      "(id TEXT PRIMARY KEY, intCol INTEGER NOT NULL, floatCol FLOAT NOT NULL, skdb_access TEXT NOT NULL)",
  });

  return localDb;
}

const skdb = await connectToDevServer();
const i = Math.round(Math.random() * 1000);
const f = Math.random();
await skdb.exec(
  "INSERT INTO example (intCol, floatCol, skdb_access) VALUES (@i, @f, 'read-write')",
  { i, f },
);

console.log(await skdb.exec("SELECT * FROM example"));

skdb.closeConnection();
