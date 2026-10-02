import "server-only";

import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type DogRecord = {
  id: number;
  name: string;
  age: number;
  race: string;
  health: string;
  details: string;
};

type DogData = Omit<DogRecord, "id">;

const database = new Database(join(process.cwd(), "dogs.sqlite"));
const jsonPath = join(process.cwd(), "dogs.json");

database.exec(`
  CREATE TABLE IF NOT EXISTS dogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    age INTEGER NOT NULL CHECK (age >= 0),
    race TEXT NOT NULL,
    health TEXT NOT NULL,
    details TEXT NOT NULL
  )
`);

if (
  database.prepare("SELECT COUNT(*) AS count FROM dogs").get() &&
  (
    database.prepare("SELECT COUNT(*) AS count FROM dogs").get() as {
      count: number;
    }
  ).count === 0
) {
  const initialDogs = JSON.parse(readFileSync(jsonPath, "utf8")) as DogData[];
  const seedDog = database.prepare(
    "INSERT INTO dogs (name, age, race, health, details) VALUES (@name, @age, @race, @health, @details)",
  );
  const seed = database.transaction((dogs: DogData[]) => {
    for (const dog of dogs) seedDog.run(dog);
  });
  seed(initialDogs);
}

const selectDogs = database.prepare(
  "SELECT id, name, age, race, health, details FROM dogs ORDER BY id ASC",
);

function writeJsonFromDatabase() {
  const dogs = selectDogs.all() as DogRecord[];
  const jsonDogs: DogData[] = dogs.map(
    ({ name, age, race, health, details }) => ({
      name,
      age,
      race,
      health,
      details,
    }),
  );
  const tempPath = `${jsonPath}.${randomUUID()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(jsonDogs, null, 2)}\n`, "utf8");
  renameSync(tempPath, jsonPath);
}

export function getDogs(): DogRecord[] {
  return selectDogs.all() as DogRecord[];
}

export function addDogToDirectory(dog: DogData): boolean {
  const insertDog = database.prepare(
    "INSERT OR IGNORE INTO dogs (name, age, race, health, details) VALUES (@name, @age, @race, @health, @details)",
  );
  return database.transaction((record: DogData) => {
    const result = insertDog.run(record);
    if (result.changes === 0) return false;
    writeJsonFromDatabase();
    return true;
  })(dog);
}

export function removeDogFromDirectory(id: number): boolean {
  const deleteDog = database.prepare("DELETE FROM dogs WHERE id = ?");
  return database.transaction((dogId: number) => {
    const result = deleteDog.run(dogId);
    if (result.changes === 0) return false;
    writeJsonFromDatabase();
    return true;
  })(id);
}
